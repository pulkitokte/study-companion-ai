// examPlanner.js — Pure utility functions for exam countdown & daily target system.
// No React. No UI. Pure/testable.
// Phase 30

import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";

const DEADLINES_NAMESPACE = "examDeadlines";

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

function _readDeadlines() {
  try {
    return StorageAdapter.get(DEADLINES_NAMESPACE) ?? {};
  } catch {
    return {};
  }
}

function _writeDeadlines(data) {
  try {
    StorageAdapter.set(DEADLINES_NAMESPACE, data);
  } catch {
    // silent — storage unavailable
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Get the saved exam date string (YYYY-MM-DD) for an exam.
 * Returns null if not set.
 */
export function getExamDeadline(examId) {
  if (!examId) return null;
  const deadlines = _readDeadlines();
  return deadlines[examId] ?? null;
}

/**
 * Save an exam date string (YYYY-MM-DD) for an exam.
 * Pass null or empty string to clear.
 */
export function setExamDeadline(examId, date) {
  if (!examId) return { ok: false, error: "examId required" };

  const deadlines = _readDeadlines();

  if (!date) {
    delete deadlines[examId];
  } else {
    // Validate format
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid date format. Use YYYY-MM-DD." };
    }
    deadlines[examId] = date;
  }

  _writeDeadlines(deadlines);
  return { ok: true };
}

/**
 * Get whole days remaining until the exam deadline.
 * Returns null if no deadline set.
 * Returns 0 if today is the exam day.
 * Returns negative numbers if the deadline has passed.
 */
export function getDaysRemaining(examId) {
  const deadline = getExamDeadline(examId);
  if (!deadline) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDate = new Date(deadline + "T00:00:00");
  const examDay = new Date(
    examDate.getFullYear(),
    examDate.getMonth(),
    examDate.getDate(),
  );

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((examDay - today) / msPerDay);
}

/**
 * Calculate how many topics per day a student needs to complete.
 *
 * examProgress: result of syllabusService.getExamProgress(examId)
 *   expects: { total, done }
 *
 * Returns:
 *   {
 *     topicsRemaining: number,
 *     daysRemaining: number | null,
 *     topicsPerDay: number | null,   // null if no deadline
 *     isAhead: boolean,              // already completed more than needed by today
 *   }
 */
export function getDailyTarget(examProgress, examId) {
  const total = examProgress?.total ?? 0;
  const done = examProgress?.done ?? 0;
  const topicsRemaining = Math.max(0, total - done);

  const daysRemaining = getDaysRemaining(examId);

  if (daysRemaining === null) {
    return {
      topicsRemaining,
      daysRemaining: null,
      topicsPerDay: null,
      isAhead: false,
    };
  }

  if (daysRemaining <= 0) {
    return {
      topicsRemaining,
      daysRemaining,
      topicsPerDay: topicsRemaining > 0 ? Infinity : 0,
      isAhead: topicsRemaining === 0,
    };
  }

  const topicsPerDay =
    topicsRemaining === 0 ? 0 : topicsRemaining / daysRemaining;

  // "Ahead" if they've already done enough to coast to exam day at 0 topics/day
  const isAhead = topicsRemaining === 0;

  return {
    topicsRemaining,
    daysRemaining,
    topicsPerDay: Math.ceil(topicsPerDay * 10) / 10, // 1 decimal place
    isAhead,
  };
}

/**
 * Determine countdown status label and severity.
 *
 * Returns one of:
 *   { status: "on_track",  label: "🟢 On Track",        color: "#00FFC8" }
 *   { status: "tight",     label: "🟡 Tight Schedule",  color: "#FFB347" }
 *   { status: "behind",    label: "🔴 Behind Schedule", color: "#FF6B2B" }
 *   { status: "complete",  label: "✅ Syllabus Done!",  color: "#FFD700" }
 *   { status: "expired",   label: "⏰ Exam Passed",     color: "rgba(255,255,255,0.30)" }
 *   { status: "no_date",   label: "No date set",        color: "rgba(255,255,255,0.25)" }
 *
 * Thresholds:
 *   topicsPerDay === 0 && daysRemaining > 0  → complete
 *   daysRemaining < 0                        → expired
 *   daysRemaining === null                   → no_date
 *   topicsPerDay <= 5                        → on_track
 *   topicsPerDay <= 10                       → tight
 *   topicsPerDay > 10                        → behind
 */
export function getCountdownStatus(daysRemaining, dailyTarget) {
  if (daysRemaining === null) {
    return {
      status: "no_date",
      label: "No date set",
      color: "rgba(255,255,255,0.25)",
    };
  }

  if (daysRemaining < 0) {
    return {
      status: "expired",
      label: "⏰ Exam Passed",
      color: "rgba(255,255,255,0.30)",
    };
  }

  const topicsPerDay = dailyTarget?.topicsPerDay ?? null;
  const topicsRemaining = dailyTarget?.topicsRemaining ?? 0;

  if (topicsRemaining === 0) {
    return { status: "complete", label: "✅ Syllabus Done!", color: "#FFD700" };
  }

  if (topicsPerDay === null) {
    return {
      status: "no_date",
      label: "No date set",
      color: "rgba(255,255,255,0.25)",
    };
  }

  if (
    topicsPerDay === Infinity ||
    (daysRemaining === 0 && topicsRemaining > 0)
  ) {
    return { status: "behind", label: "🔴 Behind Schedule", color: "#FF6B2B" };
  }

  if (topicsPerDay <= 5) {
    return { status: "on_track", label: "🟢 On Track", color: "#00FFC8" };
  }

  if (topicsPerDay <= 10) {
    return { status: "tight", label: "🟡 Tight Schedule", color: "#FFB347" };
  }

  return { status: "behind", label: "🔴 Behind Schedule", color: "#FF6B2B" };
}
