/**
 * revisionIntelligence.js
 *
 * Phase 36 Batch C — Unified Revision Intelligence.
 *
 * Single, shared interpretation layer over the revision queue/stats
 * already produced by the spaced-repetition engine (via
 * syllabusService.getTodayRevisionQueue() / getRevisionStats(), and the
 * useRevisionQueue hook, from Phase 36 Batch A/B). This module performs
 * NO scheduling calculations of its own — it only reads the `isOverdue`
 * flag already present on each queue item
 * (spacedRevisionEngine.buildTodayRevisionQueue) and the aggregate
 * fields already present on revisionStats
 * (spacedRevisionEngine.getRevisionStats), and normalizes them into one
 * shape multiple consumers (dashboard mission, recommendations,
 * revision view, and any future AI ranking) can share instead of each
 * independently re-deriving urgency, priority, or empty-state.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - Never throws — all functions are fully defensive
 *   - Does NOT recompute scheduling, due dates, or priority scores —
 *     those remain exclusively owned by spacedRevisionEngine.
 */

// ─── URGENCY LEVELS ───────────────────────────────────────────────────────────

export const REVISION_URGENCY = {
  CRITICAL: "critical", // one or more overdue items
  HIGH: "high", // no overdue, but items due today
  NONE: "none", // nothing due right now
};

export const REVISION_URGENCY_META = {
  [REVISION_URGENCY.CRITICAL]: {
    label: "Overdue",
    emoji: "🔥",
    color: "#FF4D6D",
  },
  [REVISION_URGENCY.HIGH]: {
    label: "Due Today",
    emoji: "📅",
    color: "#FF8C42",
  },
  [REVISION_URGENCY.NONE]: {
    label: "Clear",
    emoji: "🎉",
    color: "#00FFC8",
  },
};

// ─── QUEUE HEALTH ─────────────────────────────────────────────────────────────

export const QUEUE_HEALTH = {
  NOT_STARTED: "not-started", // nothing has ever been scheduled
  CLEAR: "clear", // schedule exists, nothing due right now
  ATTENTION: "attention", // items due today, none overdue
  CRITICAL: "critical", // one or more items overdue
};

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

function _safeArray(queue) {
  return Array.isArray(queue) ? queue : [];
}

function _safeStats(stats) {
  return stats && typeof stats === "object"
    ? stats
    : {
        totalScheduled: 0,
        dueToday: 0,
        overdueCount: 0,
        graduatedCount: 0,
        nextDueDate: null,
      };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: COUNTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getOverdueCount
 *
 * Counts queue items whose isOverdue flag (already set by
 * spacedRevisionEngine.buildTodayRevisionQueue) is true.
 * This is the same filter logic that previously lived duplicated inside
 * dashboardMissionEngine.buildDashboardMission and
 * studyRecommendationEngine._genRevisionDue.
 *
 * @param {Array} queue  syllabusService.getTodayRevisionQueue() result
 * @returns {number}
 */
export function getOverdueCount(queue) {
  try {
    return _safeArray(queue).filter((item) => item?.isOverdue === true).length;
  } catch {
    return 0;
  }
}

/**
 * getDueTodayCount
 *
 * Counts queue items due today but NOT overdue (isOverdue === false).
 * Same filter logic previously duplicated in the same two consumers
 * listed above.
 *
 * @param {Array} queue  syllabusService.getTodayRevisionQueue() result
 * @returns {number}
 */
export function getDueTodayCount(queue) {
  try {
    return _safeArray(queue).filter((item) => item?.isOverdue === false).length;
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: URGENCY / HEALTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getRevisionUrgencyLevel
 *
 * Single shared urgency classification, derived purely from queue counts:
 *   overdue > 0          → CRITICAL
 *   dueToday > 0 only    → HIGH
 *   nothing due          → NONE
 *
 * @param {Array} queue
 * @returns {string} one of REVISION_URGENCY.*
 */
export function getRevisionUrgencyLevel(queue) {
  try {
    if (getOverdueCount(queue) > 0) return REVISION_URGENCY.CRITICAL;
    if (getDueTodayCount(queue) > 0) return REVISION_URGENCY.HIGH;
    return REVISION_URGENCY.NONE;
  } catch {
    return REVISION_URGENCY.NONE;
  }
}

/**
 * getQueueHealth
 *
 * Broader health classification that also accounts for whether any
 * topic has ever been scheduled at all (via revisionStats.totalScheduled),
 * distinguishing "nothing scheduled yet" from "schedule exists and is
 * currently clear".
 *
 * @param {Array}       queue
 * @param {object|null} stats  syllabusService.getRevisionStats() result; optional
 * @returns {string} one of QUEUE_HEALTH.*
 */
export function getQueueHealth(queue, stats = null) {
  try {
    const s = _safeStats(stats);
    if ((s.totalScheduled ?? 0) === 0) return QUEUE_HEALTH.NOT_STARTED;

    const urgency = getRevisionUrgencyLevel(queue);
    if (urgency === REVISION_URGENCY.CRITICAL) return QUEUE_HEALTH.CRITICAL;
    if (urgency === REVISION_URGENCY.HIGH) return QUEUE_HEALTH.ATTENTION;
    return QUEUE_HEALTH.CLEAR;
  } catch {
    return QUEUE_HEALTH.NOT_STARTED;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getRevisionEmptyState
 *
 * Returns which (if any) empty-state applies, so consumers render the
 * correct copy without re-deriving the same booleans independently.
 *
 * @param {Array}       queue
 * @param {object|null} stats  syllabusService.getRevisionStats() result; optional
 * @returns {'no-schedule' | 'no-due-today' | null}
 *   'no-schedule'   — no topic has ever entered the spaced-repetition
 *                     schedule (revisionStats.totalScheduled === 0)
 *   'no-due-today'  — a schedule exists but nothing is due right now
 *   null            — queue has items due (not empty)
 */
export function getRevisionEmptyState(queue, stats = null) {
  try {
    const s = _safeStats(stats);
    if ((s.totalScheduled ?? 0) === 0) return "no-schedule";
    if (_safeArray(queue).length === 0) return "no-due-today";
    return null;
  } catch {
    return "no-schedule";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: DATE FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * formatNextRevisionDate
 *
 * Single shared formatter for revisionStats.nextDueDate (a local
 * "YYYY-MM-DD" date string produced by spacedRevisionEngine), replacing
 * the duplicated toLocaleDateString() calls that previously lived inline
 * in RevisionView (one short-format label, one long-format sentence).
 *
 * @param {string|null}     nextDueDate  e.g. "2026-07-25"
 * @param {'short'|'full'}  style        'short' → "Jul 25"; 'full' → "Saturday, July 25"
 * @returns {string}  formatted label, or an em dash placeholder if absent/invalid
 */
export function formatNextRevisionDate(nextDueDate, style = "short") {
  try {
    if (!nextDueDate) return "—";
    const d = new Date(`${nextDueDate}T00:00:00`);
    if (isNaN(d.getTime())) return "—";

    if (style === "full") {
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: UNIFIED SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildRevisionSummary
 *
 * The single, normalized interpretation of the revision queue + stats.
 * Any consumer that needs overdue/due-today counts, urgency level,
 * queue health, empty-state, or a formatted next-due date should call
 * this instead of re-deriving them independently — so a future change
 * (e.g. AI-ranked urgency) only requires editing this one module.
 *
 * @param {Array}       queue  syllabusService.getTodayRevisionQueue() result
 *                              (same shape returned by useRevisionQueue().queue)
 * @param {object|null} stats  syllabusService.getRevisionStats() result
 *                              (same shape returned by useRevisionQueue().stats);
 *                              optional — omitting it degrades gracefully to
 *                              queue-only counts and NOT_STARTED health.
 * @returns {{
 *   overdueCount:           number,
 *   dueTodayCount:          number,
 *   totalDueCount:          number,        overdueCount + dueTodayCount
 *   totalScheduled:         number,        from stats (0 if stats omitted)
 *   graduatedCount:         number,        from stats (0 if stats omitted)
 *   nextRevisionDate:       string|null,   raw "YYYY-MM-DD" from stats
 *   nextRevisionDateLabel:  string,        formatted short label ("Jul 25" / "—")
 *   nextRevisionDateFull:   string,        formatted long label ("Saturday, July 25" / "—")
 *   urgencyLevel:           string,        REVISION_URGENCY.*
 *   urgencyMeta:            object,        REVISION_URGENCY_META[urgencyLevel]
 *   queueHealth:            string,        QUEUE_HEALTH.*
 *   emptyState:             string|null,   'no-schedule' | 'no-due-today' | null
 *   isEmpty:                boolean,       true when emptyState !== null
 * }}
 */
export function buildRevisionSummary(queue, stats = null) {
  try {
    const q = _safeArray(queue);
    const s = _safeStats(stats);

    const overdueCount = getOverdueCount(q);
    const dueTodayCount = getDueTodayCount(q);
    const urgencyLevel = getRevisionUrgencyLevel(q);
    const emptyState = getRevisionEmptyState(q, s);

    return {
      overdueCount,
      dueTodayCount,
      totalDueCount: overdueCount + dueTodayCount,
      totalScheduled: s.totalScheduled ?? 0,
      graduatedCount: s.graduatedCount ?? 0,
      nextRevisionDate: s.nextDueDate ?? null,
      nextRevisionDateLabel: formatNextRevisionDate(s.nextDueDate, "short"),
      nextRevisionDateFull: formatNextRevisionDate(s.nextDueDate, "full"),
      urgencyLevel,
      urgencyMeta: REVISION_URGENCY_META[urgencyLevel],
      queueHealth: getQueueHealth(q, s),
      emptyState,
      isEmpty: emptyState !== null,
    };
  } catch {
    return {
      overdueCount: 0,
      dueTodayCount: 0,
      totalDueCount: 0,
      totalScheduled: 0,
      graduatedCount: 0,
      nextRevisionDate: null,
      nextRevisionDateLabel: "—",
      nextRevisionDateFull: "—",
      urgencyLevel: REVISION_URGENCY.NONE,
      urgencyMeta: REVISION_URGENCY_META[REVISION_URGENCY.NONE],
      queueHealth: QUEUE_HEALTH.NOT_STARTED,
      emptyState: "no-schedule",
      isEmpty: true,
    };
  }
}

export default {
  REVISION_URGENCY,
  REVISION_URGENCY_META,
  QUEUE_HEALTH,
  getOverdueCount,
  getDueTodayCount,
  getRevisionUrgencyLevel,
  getQueueHealth,
  getRevisionEmptyState,
  formatNextRevisionDate,
  buildRevisionSummary,
};
