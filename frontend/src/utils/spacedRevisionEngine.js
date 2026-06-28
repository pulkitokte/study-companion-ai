/**
 * spacedRevisionEngine.js
 *
 * Pure spaced-repetition algorithm for Phase 31 — Smart Revision Scheduler.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No localStorage access (caller passes data in, receives data back)
 *   - No side effects
 *   - All functions: same input → same output (unit-testable)
 *
 * REVISION LEVELS & INTERVALS:
 *   Level 0 → topic not yet scheduled (just completed for the first time)
 *   Level 1 → next revision in  1 day
 *   Level 2 → next revision in  3 days
 *   Level 3 → next revision in  7 days
 *   Level 4 → next revision in 15 days
 *   Level 5 → next revision in 30 days
 *   Level 6+ → fully graduated; no further auto-scheduling
 *
 * PRIORITY ALGORITHM (higher = more urgent):
 *   score = (overdueDays × 10) + (difficultyWeight × 5) + daysSinceLastRevision
 *   difficulty weights: easy = 1, medium = 2, hard = 3
 */

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const REVISION_INTERVALS = [0, 1, 3, 7, 15, 30]; // index === level
const MAX_LEVEL = 5;
const MS_PER_DAY = 86_400_000;

const DIFFICULTY_WEIGHT = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

/** Returns today's local date as YYYY-MM-DD string */
function _todayStr() {
  const d = new Date();
  return _localDateStr(d);
}

/** Converts a Date object to local YYYY-MM-DD */
function _localDateStr(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Add `days` calendar days to a local date string.
 * Returns a new local YYYY-MM-DD string.
 */
function _addDays(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const result = new Date(y, m - 1, d + days);
  return _localDateStr(result);
}

/**
 * Signed difference in calendar days: dateA − dateB.
 * Positive → dateA is later; Negative → dateA is earlier.
 */
function _daysDiff(dateStrA, dateStrB) {
  try {
    const [ay, am, ad] = dateStrA.split("-").map(Number);
    const [by, bm, bd] = dateStrB.split("-").map(Number);
    const a = new Date(ay, am - 1, ad).getTime();
    const b = new Date(by, bm - 1, bd).getTime();
    return Math.round((a - b) / MS_PER_DAY);
  } catch {
    return 0;
  }
}

/**
 * Returns a safe revisionMeta object — defaults every field so consumers
 * never need to null-check individual fields.
 */
function _safeRevisionMeta(raw) {
  return {
    level: raw?.level ?? 0,
    nextRevisionDate: raw?.nextRevisionDate ?? null,
    lastRevisionDate: raw?.lastRevisionDate ?? null,
    totalRevisions: raw?.totalRevisions ?? 0,
    overdueDays: raw?.overdueDays ?? 0,
    priorityScore: raw?.priorityScore ?? 0,
    scheduleHistory: Array.isArray(raw?.scheduleHistory)
      ? raw.scheduleHistory
      : [],
  };
}

/**
 * Recalculates overdueDays and priorityScore on a revisionMeta object.
 * Mutates and returns the object (internal use only).
 */
function _refreshDerivedFields(meta, difficulty, today) {
  const t = today ?? _todayStr();

  if (meta.nextRevisionDate) {
    const diff = _daysDiff(t, meta.nextRevisionDate);
    meta.overdueDays = diff > 0 ? diff : 0;
  } else {
    meta.overdueDays = 0;
  }

  const daysSinceLastRevision = meta.lastRevisionDate
    ? Math.max(0, _daysDiff(t, meta.lastRevisionDate))
    : 0;

  const diffWeight = DIFFICULTY_WEIGHT[difficulty] ?? DIFFICULTY_WEIGHT.medium;
  meta.priorityScore = Math.round(
    meta.overdueDays * 10 + diffWeight * 5 + daysSinceLastRevision,
  );

  return meta;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * scheduleNextRevision
 *
 * Given a topic's current progress object, returns a new `revisionMeta`
 * object with the next revision date scheduled according to the spaced
 * repetition interval table.
 *
 * Call this when a topic is first completed, then again after each revision.
 *
 * @param {object} topicProgress  — topic progress entry from syllabusService
 *                                  { status, completedAt, revisionMeta, ... }
 * @param {string} difficulty     — 'easy' | 'medium' | 'hard'
 * @param {string} [today]        — override today's date (for testing)
 * @returns {object}              updatedRevisionMeta
 */
export function scheduleNextRevision(
  topicProgress,
  difficulty = "medium",
  today = null,
) {
  try {
    const t = today ?? _todayStr();
    const meta = _safeRevisionMeta(topicProgress?.revisionMeta);

    // Advance level (capped at MAX_LEVEL)
    const nextLevel = Math.min(meta.level + 1, MAX_LEVEL);
    const interval =
      REVISION_INTERVALS[nextLevel] ?? REVISION_INTERVALS[MAX_LEVEL];

    const updated = {
      ...meta,
      level: nextLevel,
      nextRevisionDate: _addDays(t, interval),
      lastRevisionDate: t,
      totalRevisions: meta.totalRevisions + 1,
      scheduleHistory: [...meta.scheduleHistory, t].slice(-20), // keep last 20
    };

    return _refreshDerivedFields(updated, difficulty, t);
  } catch {
    return _safeRevisionMeta(null);
  }
}

/**
 * calculateRevisionPriority
 *
 * Returns a single numeric priority score for a topic.
 * Higher = more urgent.
 *
 * Formula: (overdueDays × 10) + (difficultyWeight × 5) + daysSinceLastRevision
 *
 * @param {object} topicProgress  — topic progress entry
 * @param {string} difficulty     — 'easy' | 'medium' | 'hard'
 * @param {string} [today]        — override for testing
 * @returns {number}              priority score ≥ 0
 */
export function calculateRevisionPriority(
  topicProgress,
  difficulty = "medium",
  today = null,
) {
  try {
    const t = today ?? _todayStr();
    const meta = _safeRevisionMeta(topicProgress?.revisionMeta);

    const overdueDays = meta.nextRevisionDate
      ? Math.max(0, _daysDiff(t, meta.nextRevisionDate))
      : 0;

    const daysSinceLast = meta.lastRevisionDate
      ? Math.max(0, _daysDiff(t, meta.lastRevisionDate))
      : 0;

    const diffWeight =
      DIFFICULTY_WEIGHT[difficulty] ?? DIFFICULTY_WEIGHT.medium;

    return Math.round(overdueDays * 10 + diffWeight * 5 + daysSinceLast);
  } catch {
    return 0;
  }
}

/**
 * getDueRevisions
 *
 * Filters all topic progress entries to those whose nextRevisionDate
 * is on or before today (due OR overdue). Includes topics at any revision level.
 *
 * @param {Array}  allTopics  — array of enriched topic objects:
 *                              [{ examId, subjectId, topicId, topicDef, progress }]
 * @param {string} [today]   — override for testing
 * @returns {Array}           filtered + enriched subset, unsorted
 */
export function getDueRevisions(allTopics, today = null) {
  try {
    const t = today ?? _todayStr();
    if (!Array.isArray(allTopics)) return [];

    return allTopics.filter((item) => {
      const meta = _safeRevisionMeta(item?.progress?.revisionMeta);
      if (!meta.nextRevisionDate) return false;
      if (meta.level > MAX_LEVEL) return false; // graduated
      return _daysDiff(t, meta.nextRevisionDate) >= 0; // today or past-due
    });
  } catch {
    return [];
  }
}

/**
 * getOverdueRevisions
 *
 * Returns only topics that are STRICTLY overdue (nextRevisionDate < today,
 * meaning at least 1 full calendar day past due).
 *
 * @param {Array}  allTopics  — same shape as getDueRevisions input
 * @param {string} [today]
 * @returns {Array}
 */
export function getOverdueRevisions(allTopics, today = null) {
  try {
    const t = today ?? _todayStr();
    if (!Array.isArray(allTopics)) return [];

    return allTopics.filter((item) => {
      const meta = _safeRevisionMeta(item?.progress?.revisionMeta);
      if (!meta.nextRevisionDate) return false;
      if (meta.level > MAX_LEVEL) return false;
      return _daysDiff(t, meta.nextRevisionDate) > 0; // strictly past-due
    });
  } catch {
    return [];
  }
}

/**
 * markRevisionCompleted
 *
 * Returns an updated revisionMeta after a user performs a revision action.
 * Alias of scheduleNextRevision — kept separate so calling code is semantic.
 *
 * @param {object} topicProgress  — current progress entry
 * @param {string} difficulty     — 'easy' | 'medium' | 'hard'
 * @param {string} [today]
 * @returns {object}              updatedRevisionMeta
 */
export function markRevisionCompleted(
  topicProgress,
  difficulty = "medium",
  today = null,
) {
  return scheduleNextRevision(topicProgress, difficulty, today);
}

/**
 * buildTodayRevisionQueue
 *
 * Constructs the full prioritised revision queue for the active exam.
 *
 * Caller must pass all required data — this function makes zero service calls.
 *
 * @param {Array}  subjectData    — syllabusService.getAllSubjectProgress(examId)
 *                                  (each item has .topics[] from syllabusData)
 * @param {object} progressData   — syllabusService.getSyllabusData() raw object
 * @param {string} examId         — 'upsc' | 'ssc_cgl' | 'banking_po'
 * @param {string} [today]        — override for testing
 *
 * @returns {Array} Queue items sorted by priorityScore DESC:
 *   [{
 *     examId, subjectId, topicId, topicName,
 *     subjectLabel, subjectEmoji, subjectColor,
 *     difficulty, xp,
 *     revisionLevel, overdueDays, priorityScore, nextRevisionDate,
 *     progress,       ← full progress entry for action buttons
 *     isOverdue,
 *     isGraduated,    ← level > MAX_LEVEL
 *   }]
 */
export function buildTodayRevisionQueue(
  subjectData,
  progressData,
  examId,
  today = null,
) {
  try {
    const t = today ?? _todayStr();
    if (!Array.isArray(subjectData) || !examId) return [];

    const queue = [];
    const seenKeys = new Set();

    subjectData.forEach((subject) => {
      if (!subject || !Array.isArray(subject.topics)) return;

      subject.topics.forEach((topicDef) => {
        if (!topicDef?.id) return;

        const key = `${subject.id}::${topicDef.id}`;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);

        // Read progress from raw storage (has revisionMeta + timestamps)
        const progress =
          progressData?.exams?.[examId]?.subjects?.[subject.id]?.topics?.[
            topicDef.id
          ] ?? null;

        // Only topics that have been started and have revisionMeta scheduled
        if (!progress) return;

        const meta = _safeRevisionMeta(progress.revisionMeta);
        if (!meta.nextRevisionDate) return;

        // Compute derived fields fresh against today
        const freshMeta = _refreshDerivedFields(
          { ...meta },
          topicDef.difficulty,
          t,
        );

        // Include only topics that are due today or overdue
        const daysPastDue = _daysDiff(t, meta.nextRevisionDate);
        if (daysPastDue < 0) return; // not yet due

        const isOverdue = daysPastDue > 0;
        const isGraduated = freshMeta.level > MAX_LEVEL;

        queue.push({
          examId,
          subjectId: subject.id,
          topicId: topicDef.id,
          topicName: topicDef.label,
          subjectLabel: subject.label ?? "",
          subjectEmoji: subject.emoji ?? "📚",
          subjectColor: subject.color ?? "#7C6FFF",
          difficulty: topicDef.difficulty ?? "medium",
          xp: topicDef.xp ?? 0,
          revisionLevel: freshMeta.level,
          overdueDays: freshMeta.overdueDays,
          priorityScore: freshMeta.priorityScore,
          nextRevisionDate: freshMeta.nextRevisionDate,
          progress,
          isOverdue,
          isGraduated,
        });
      });
    });

    // Sort highest priority first
    return queue.sort((a, b) => b.priorityScore - a.priorityScore);
  } catch {
    return [];
  }
}

/**
 * getRevisionStats
 *
 * Derives summary statistics across all topics in all exams.
 * Useful for AI coach recommendations and dashboard widgets.
 *
 * @param {Array}  subjectData   — getAllSubjectProgress() for ONE exam
 * @param {object} progressData  — getSyllabusData() raw object
 * @param {string} examId
 * @param {string} [today]
 * @returns {{
 *   totalScheduled,   number of topics that have a revision date
 *   dueToday,         number due today (including overdue)
 *   overdueCount,     number strictly overdue
 *   graduatedCount,   number that have completed all 5 revisions
 *   nextDueDate,      ISO string of the soonest upcoming revision date (or null)
 * }}
 */
export function getRevisionStats(
  subjectData,
  progressData,
  examId,
  today = null,
) {
  const EMPTY = {
    totalScheduled: 0,
    dueToday: 0,
    overdueCount: 0,
    graduatedCount: 0,
    nextDueDate: null,
  };

  try {
    const t = today ?? _todayStr();
    if (!Array.isArray(subjectData) || !examId) return EMPTY;

    let totalScheduled = 0;
    let dueToday = 0;
    let overdueCount = 0;
    let graduatedCount = 0;
    let soonestDate = null;

    subjectData.forEach((subject) => {
      if (!subject || !Array.isArray(subject.topics)) return;

      subject.topics.forEach((topicDef) => {
        if (!topicDef?.id) return;

        const progress =
          progressData?.exams?.[examId]?.subjects?.[subject.id]?.topics?.[
            topicDef.id
          ] ?? null;
        if (!progress) return;

        const meta = _safeRevisionMeta(progress.revisionMeta);
        if (!meta.nextRevisionDate) return;

        totalScheduled++;

        if (meta.level > MAX_LEVEL) {
          graduatedCount++;
          return;
        }

        const daysPast = _daysDiff(t, meta.nextRevisionDate);

        if (daysPast >= 0) dueToday++;
        if (daysPast > 0) overdueCount++;

        if (daysPast < 0) {
          // upcoming — track soonest
          if (!soonestDate || meta.nextRevisionDate < soonestDate) {
            soonestDate = meta.nextRevisionDate;
          }
        }
      });
    });

    return {
      totalScheduled,
      dueToday,
      overdueCount,
      graduatedCount,
      nextDueDate: soonestDate,
    };
  } catch {
    return EMPTY;
  }
}

// ─── EXPORTS (named + default) ────────────────────────────────────────────────

export default {
  scheduleNextRevision,
  calculateRevisionPriority,
  getDueRevisions,
  getOverdueRevisions,
  markRevisionCompleted,
  buildTodayRevisionQueue,
  getRevisionStats,
  REVISION_INTERVALS,
  MAX_LEVEL,
};
