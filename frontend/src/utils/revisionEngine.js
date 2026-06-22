/**
 * revisionEngine.js
 *
 * Pure revision scheduling algorithm for Phase 25 — Smart Revision System.
 *
 * Enforced constraints:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All functions: same input → same output (unit-testable)
 *
 * Data sources (passed by caller, never fetched here):
 *   topicDef.difficulty   — syllabusData.js (static)
 *   progress.status       — syllabusService storage object
 *   progress.completedAt  — syllabusService storage object
 *   progress.revisedAt    — syllabusService storage object
 *   progress.masteredAt   — syllabusService storage object
 */

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;

/**
 * Days after the last action before a topic becomes due for revision.
 * revision_needed is 0: it is immediately due regardless of timestamps.
 */
const REVISION_INTERVALS = {
  revision_needed: 0,
  completed: 7,
  revised: 14,
  mastered: 30,
};

/**
 * Statuses that are never eligible for revision queuing.
 */
const INELIGIBLE = new Set(["not_started", "in_progress"]);

/**
 * Score bonuses per difficulty — from roadmap spec.
 */
const DIFFICULTY_BONUS = {
  easy: 0,
  medium: 10,
  hard: 20,
};

/**
 * Score bonuses per status — from roadmap spec.
 * Negative for mastered intentionally deprioritises reinforcement check-ins.
 */
const STATUS_BONUS = {
  revision_needed: 30,
  completed: 0,
  revised: 5,
  mastered: -10,
};

/**
 * Categorisation thresholds (days past due).
 * > 2 days past due    → overdue
 * 0–2 days past due    → due today
 * 1–7 days until due   → upcoming
 */
const OVERDUE_THRESHOLD_DAYS = 2;
const UPCOMING_WINDOW_DAYS = 7;

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

/**
 * Returns the relevant "last action" timestamp for a topic status.
 * revision_needed uses completedAt because no separate flaggedAt exists —
 * the topic was completed, then flagged, so completedAt is the most
 * meaningful anchor for calculating urgency.
 */
function _referenceDate(progress) {
  try {
    switch (progress.status) {
      case "revision_needed":
      case "completed":
        return progress.completedAt ? new Date(progress.completedAt) : null;
      case "revised":
        return progress.revisedAt ? new Date(progress.revisedAt) : null;
      case "mastered":
        return progress.masteredAt ? new Date(progress.masteredAt) : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Signed day difference: positive means dateA is later than dateB.
 * (daysDiff(now, dueDate) > 0) means topic is past due.
 */
function _daysDiff(dateA, dateB) {
  return (dateA.getTime() - dateB.getTime()) / MS_PER_DAY;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getNextRevisionDate
 *
 * Returns the Date when this topic is next due for revision,
 * or null if the topic is not eligible.
 *
 * Revision due dates:
 *   revision_needed → completedAt (already overdue by definition;
 *                     falls back to epoch so it is always past due)
 *   completed       → completedAt  + 7 days
 *   revised         → revisedAt    + 14 days
 *   mastered        → masteredAt   + 30 days
 *   not_started
 *   in_progress     → null (not eligible)
 *
 * @param  {object} progress — topic progress entry from syllabusService storage
 * @returns {Date|null}
 */
export function getNextRevisionDate(progress) {
  try {
    if (!progress || typeof progress !== "object") return null;

    const { status } = progress;
    if (!status || INELIGIBLE.has(status)) return null;

    const interval = REVISION_INTERVALS[status];
    if (interval === undefined) return null;

    // revision_needed: always immediately due.
    // Use completedAt as the due date so daysPastDue reflects true urgency.
    // Fall back to epoch (Jan 1 1970) if no timestamp is stored, ensuring
    // it always appears at the top of the overdue list.
    if (status === "revision_needed") {
      const ref = _referenceDate(progress);
      return ref ?? new Date(0);
    }

    const ref = _referenceDate(progress);
    if (!ref || isNaN(ref.getTime())) return null;

    const due = new Date(ref.getTime());
    due.setDate(due.getDate() + interval);
    return due;
  } catch {
    return null;
  }
}

/**
 * isDueForRevision
 *
 * Returns true if the topic's revision due date has arrived or passed.
 *
 * @param  {object} progress — topic progress object
 * @param  {Date}   now      — current date; defaults to Date.now() (injectable for tests)
 * @returns {boolean}
 */
export function isDueForRevision(progress, now = new Date()) {
  try {
    const dueDate = getNextRevisionDate(progress);
    if (!dueDate) return false;
    return dueDate.getTime() <= now.getTime();
  } catch {
    return false;
  }
}

/**
 * getRevisionScore
 *
 * Returns a composite priority score in the range [0, 100].
 * Higher score = more urgently needs revision.
 * Returns 0 for any topic that is not yet due.
 *
 * Score formula (from roadmap spec):
 *   overduePoints   = min(daysPastDue × 8, 50)   max contribution: 50
 *   difficultyBonus = easy:0 · medium:10 · hard:20
 *   statusBonus     = revision_needed:30 · completed:0 · revised:5 · mastered:−10
 *   score           = clamp(overduePoints + difficultyBonus + statusBonus, 0, 100)
 *
 * @param  {object} topicDef  — static topic definition  { id, label, difficulty, xp }
 * @param  {object} progress  — topic progress object
 * @param  {Date}   now       — current date (injectable for tests)
 * @returns {number} integer 0–100
 */
export function getRevisionScore(topicDef, progress, now = new Date()) {
  try {
    if (!topicDef || !progress) return 0;

    const dueDate = getNextRevisionDate(progress);
    if (!dueDate) return 0;

    const daysPastDue = _daysDiff(now, dueDate);
    if (daysPastDue < 0) return 0; // not yet due

    const overduePoints = Math.min(daysPastDue * 8, 50);
    const difficultyBonus = DIFFICULTY_BONUS[topicDef.difficulty] ?? 0;
    const statusBonus = STATUS_BONUS[progress.status] ?? 0;

    const raw = overduePoints + difficultyBonus + statusBonus;
    return Math.max(0, Math.min(100, Math.round(raw)));
  } catch {
    return 0;
  }
}

/**
 * buildRevisionQueue
 *
 * Iterates every topic in every subject of the active exam, scores each one,
 * and returns a categorised, sorted revision queue.
 *
 * PARAMETERS:
 *   subjects      {Array}  syllabusService.getAllSubjectProgress(examId)
 *                          Each item must contain a `topics` array of topic defs.
 *   progressData  {object} syllabusService.getSyllabusData()
 *                          Raw storage object — provides per-topic progress timestamps.
 *                          ⚠ This is a plain JS object, not a service call.
 *   examId        {string} Active exam id ('upsc' | 'ssc_cgl' | 'banking_po')
 *   now           {Date}   Current date (injectable for tests; defaults to new Date())
 *
 * NOTE ON SIGNATURE:
 *   The roadmap specified buildRevisionQueue(subjects, examId, now).
 *   `progressData` was added as the second parameter because per-topic
 *   completedAt / revisedAt / masteredAt timestamps are not included in
 *   the `subjects` array and cannot be derived without the raw storage object.
 *
 * RETURN SHAPE:
 *   {
 *     overdue:      Item[]   score > 0 AND daysPastDue > 2; sorted by score desc
 *     dueToday:     Item[]   score > 0 AND daysPastDue ≤ 2; sorted by score desc
 *     upcoming:     Item[]   not yet due but within 7 days; sorted by dueDate asc
 *     totalDue:     number   overdue.length + dueToday.length
 *     totalOverdue: number   overdue.length
 *   }
 *
 * Each Item:
 *   {
 *     examId, subjectId, topicId,
 *     topic:       { id, label, difficulty, xp }
 *     subject:     { id, label, emoji, color }
 *     progress:    { status, completedAt, revisedAt, masteredAt, xpEarned }
 *     score:       number (0–100)
 *     daysPastDue: number (positive = overdue, negative = upcoming)
 *     dueDate:     Date
 *   }
 *
 * @param  {Array}  subjects
 * @param  {object} progressData
 * @param  {string} examId
 * @param  {Date}   now
 * @returns {{ overdue, dueToday, upcoming, totalDue, totalOverdue }}
 */
export function buildRevisionQueue(
  subjects,
  progressData,
  examId,
  now = new Date(),
) {
  const EMPTY = {
    overdue: [],
    dueToday: [],
    upcoming: [],
    totalDue: 0,
    totalOverdue: 0,
  };

  try {
    if (!Array.isArray(subjects) || subjects.length === 0) return EMPTY;
    if (!examId || typeof examId !== "string") return EMPTY;

    const overdue = [];
    const dueToday = [];
    const upcoming = [];
    const seen = new Set(); // guard against duplicate (subjectId::topicId) pairs

    subjects.forEach((subject) => {
      if (!subject || !Array.isArray(subject.topics)) return;

      const subjectMeta = {
        id: subject.id ?? "",
        label: subject.label ?? "",
        emoji: subject.emoji ?? "📚",
        color: subject.color ?? "#7C6FFF",
      };

      subject.topics.forEach((topicDef) => {
        if (!topicDef || !topicDef.id) return;

        const key = `${subject.id}::${topicDef.id}`;
        if (seen.has(key)) return;
        seen.add(key);

        // Read individual topic progress from raw storage.
        // Absent entry = topic is not_started → null → skip below.
        const progress =
          progressData?.exams?.[examId]?.subjects?.[subject.id]?.topics?.[
            topicDef.id
          ] ?? null;

        // No progress entry → topic has never been touched → not eligible
        if (!progress) return;

        // Ineligible statuses → skip without scoring
        if (INELIGIBLE.has(progress.status)) return;

        const dueDate = getNextRevisionDate(progress);
        if (!dueDate) return;

        const daysPastDue = _daysDiff(now, dueDate);
        const score = getRevisionScore(topicDef, progress, now);

        const item = {
          examId,
          subjectId: subject.id,
          topicId: topicDef.id,
          topic: topicDef,
          subject: subjectMeta,
          progress,
          score,
          daysPastDue,
          dueDate,
        };

        if (score > 0) {
          // Topic is past due — categorise by how overdue it is
          if (daysPastDue > OVERDUE_THRESHOLD_DAYS) {
            overdue.push(item);
          } else {
            dueToday.push(item);
          }
        } else if (daysPastDue < 0 && daysPastDue >= -UPCOMING_WINDOW_DAYS) {
          // Topic is not yet due but is approaching within the upcoming window
          upcoming.push(item);
        }
        // Topics due in > 7 days are not surfaced to avoid overwhelming the queue
      });
    });

    // Overdue + dueToday: highest urgency first
    overdue.sort((a, b) => b.score - a.score);
    dueToday.sort((a, b) => b.score - a.score);

    // Upcoming: soonest due date first
    upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return {
      overdue,
      dueToday,
      upcoming,
      totalDue: overdue.length + dueToday.length,
      totalOverdue: overdue.length,
    };
  } catch {
    return EMPTY;
  }
}
