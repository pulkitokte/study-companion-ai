// spacedRepetition.js — Pure spaced repetition engine.
// No React. No UI. Fully testable.
// Phase 31

// ─── REVISION INTERVALS (days) ────────────────────────────────────────────────

export const REVISION_INTERVALS = [1, 3, 7, 15, 30];
export const MAX_LEVEL = REVISION_INTERVALS.length; // 5

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Return today's date as YYYY-MM-DD string (local time).
 */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Parse a YYYY-MM-DD string to a midnight local Date.
 * Safe — returns null on invalid input.
 */
export function parseDate(str) {
  if (!str || typeof str !== "string") return null;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Add `days` calendar days to a YYYY-MM-DD string.
 * Returns a new YYYY-MM-DD string.
 */
export function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Whole days between two YYYY-MM-DD strings.
 * Positive = b is after a.
 */
export function daysBetween(aStr, bStr) {
  const a = parseDate(aStr);
  const b = parseDate(bStr);
  if (!a || !b) return 0;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// ─── CORE FUNCTIONS ───────────────────────────────────────────────────────────

/**
 * Build an initial revisionMeta object when a topic is first completed.
 * Level starts at 0 (no revision done yet).
 * nextRevisionDate is set to today + REVISION_INTERVALS[0] (1 day).
 */
export function buildInitialRevisionMeta(completedAtStr = null) {
  const base = completedAtStr ? completedAtStr.slice(0, 10) : todayStr();

  return {
    level: 0,
    nextRevisionDate: addDays(base, REVISION_INTERVALS[0]),
    lastRevisionDate: base,
    totalRevisions: 0,
    overdueDays: 0,
  };
}

/**
 * Advance revisionMeta by one successful revision.
 * - Increments level (capped at MAX_LEVEL).
 * - Calculates next revision date from today using the next interval.
 * - If already at MAX_LEVEL, nextRevisionDate is null (fully mastered).
 *
 * Returns a new revisionMeta object.
 */
export function advanceRevision(meta) {
  const today = todayStr();
  const currentLevel = meta?.level ?? 0;
  const newLevel = Math.min(currentLevel + 1, MAX_LEVEL);
  const interval = REVISION_INTERVALS[newLevel] ?? null;

  return {
    level: newLevel,
    nextRevisionDate: interval ? addDays(today, interval) : null,
    lastRevisionDate: today,
    totalRevisions: (meta?.totalRevisions ?? 0) + 1,
    overdueDays: 0,
  };
}

/**
 * Compute live overdueDays for a revisionMeta object.
 * Positive = overdue. 0 = due today or not yet due. Null if no date set.
 */
export function computeOverdueDays(meta) {
  if (!meta?.nextRevisionDate) return 0;
  const today = todayStr();
  const diff = daysBetween(meta.nextRevisionDate, today); // positive = overdue
  return Math.max(0, diff);
}

/**
 * Return true if this topic is due for revision today or is overdue.
 */
export function isDueToday(meta) {
  if (!meta?.nextRevisionDate) return false;
  const today = todayStr();
  return meta.nextRevisionDate <= today;
}

/**
 * Return true if topic is overdue (nextRevisionDate is before today).
 */
export function isOverdue(meta) {
  if (!meta?.nextRevisionDate) return false;
  const today = todayStr();
  return meta.nextRevisionDate < today;
}

/**
 * Compute a priority score for sorting the revision queue.
 * Higher = more urgent.
 * Factors: overdueDays (weighted high) + low revision level (newer = higher priority).
 */
export function computePriorityScore(meta) {
  if (!meta) return 0;
  const overdue = computeOverdueDays(meta);
  const levelFactor = Math.max(0, MAX_LEVEL - (meta.level ?? 0));
  return overdue * 10 + levelFactor;
}

/**
 * Given a full list of topic progress entries (with revisionMeta),
 * return the ones that are due today or overdue, sorted by priority.
 *
 * Each entry in the input array should be:
 * {
 *   examId, subjectId, topicId,
 *   topic: { label, xp, difficulty },
 *   subject: { label, color, emoji },
 *   progress: { status, revisionMeta, ... }
 * }
 */
export function buildRevisionQueue(entries) {
  return entries
    .filter((e) => {
      const meta = e.progress?.revisionMeta;
      return meta && isDueToday(meta);
    })
    .map((e) => ({
      ...e,
      overdueDays: computeOverdueDays(e.progress?.revisionMeta),
      priorityScore: computePriorityScore(e.progress?.revisionMeta),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Produce a human-readable label for a revision level.
 */
export function levelLabel(level) {
  const labels = [
    "New",
    "1st Revision",
    "2nd Revision",
    "3rd Revision",
    "4th Revision",
    "Mastered ✨",
  ];
  return labels[Math.min(level, MAX_LEVEL)] ?? "Mastered ✨";
}

/**
 * Return the next interval in days for a given level,
 * or null if fully mastered.
 */
export function nextIntervalDays(level) {
  const next = REVISION_INTERVALS[level];
  return next ?? null;
}

/**
 * Summarise revision stats across all topic entries.
 * Returns: { dueToday, overdue, upcomingThisWeek, completed }
 */
export function revisionSummary(entries) {
  const today = todayStr();
  const weekLater = addDays(today, 7);

  let dueToday = 0;
  let overdue = 0;
  let upcomingThisWeek = 0;
  let completed = 0;

  entries.forEach((e) => {
    const meta = e.progress?.revisionMeta;
    if (!meta?.nextRevisionDate) return;

    if (meta.nextRevisionDate < today) {
      overdue++;
      dueToday++;
    } else if (meta.nextRevisionDate === today) {
      dueToday++;
    } else if (meta.nextRevisionDate <= weekLater) {
      upcomingThisWeek++;
    }

    if (meta.level >= MAX_LEVEL) completed++;
  });

  return { dueToday, overdue, upcomingThisWeek, completed };
}
