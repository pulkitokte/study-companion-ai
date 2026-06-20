/**
 * syllabusAnalytics.js
 *
 * Pure data transformation utilities for the Syllabus Analytics Dashboard.
 *
 * Rules enforced:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All functions: same input → same output
 *
 * Each function accepts raw data already fetched by the caller and returns
 * a chart-ready structure consumable directly by recharts components.
 */

// ─── STATUS COLOR MAP ─────────────────────────────────────────────────────────
// Matches the STATUS_CONFIG palette used in TopicPanel.jsx.

const STATUS_COLORS = {
  not_started: "rgba(255,255,255,0.12)",
  in_progress: "#FFB347",
  completed: "#00FFC8",
  revision_needed: "#FF6B2B",
  revised: "#7C6FFF",
  mastered: "#FFD700",
};

// ─── TOPIC-LEVEL ACTION SET ───────────────────────────────────────────────────
// Only these activityLog actions represent a single topic being worked on.
// Milestone actions (subject_completed, exam_half_complete, etc.) are excluded
// from counts so they don't inflate daily topic totals.

const TOPIC_ACTIONS = new Set([
  "topic_completed",
  "topic_revised",
  "topic_mastered",
  "topic_revision_needed",
]);

// ─── SHORT LABEL OVERRIDES ────────────────────────────────────────────────────
// Subject IDs that need a custom short name for chart axis display.

const SHORT_LABEL_MAP = {
  science_tech: "Sci & Tech",
  current_affairs: "Curr. Affairs",
  general_knowledge: "General KG",
  banking_awareness: "Banking",
  general_awareness: "Gen. Awareness",
};

// ─── DATE UTILITIES ───────────────────────────────────────────────────────────
// All helpers use LOCAL calendar time to avoid UTC midnight boundary
// mismatches (e.g. a user studying at 11 pm showing as the next UTC day).

function localDateStr(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Convert an ISO timestamp string to a local YYYY-MM-DD string. */
function timestampToLocalDate(ts) {
  try {
    return localDateStr(new Date(ts));
  } catch {
    return null;
  }
}

/** "Jan 3", "Feb 14", etc. using local date components. */
function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "Mon", "Tue", etc. */
function formatWeekday(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

/** Date string N local calendar days before today. */
function daysAgoStr(today, n) {
  const d = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - n,
  );
  return localDateStr(d);
}

// ─── LABEL HELPER ─────────────────────────────────────────────────────────────

function toShortLabel(id) {
  if (SHORT_LABEL_MAP[id]) return SHORT_LABEL_MAP[id];
  // Convert snake_case → Title Case
  return id
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED TRANSFORM FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildSubjectBars
 *
 * Transforms the output of syllabusService.getAllSubjectProgress(examId)
 * into a recharts-ready array for the horizontal bar chart.
 *
 * Sorted by completion percentage descending so the most-complete subjects
 * appear at the top of the chart.
 *
 * recharts-keyed fields (PascalCase) are included for direct use as
 * <Bar dataKey="Mastered" /> etc. in a stacked BarChart.
 *
 * @param  {Array}  subjectData  - getAllSubjectProgress() result
 * @returns {Array}
 */
export function buildSubjectBars(subjectData) {
  if (!Array.isArray(subjectData) || subjectData.length === 0) return [];

  return [...subjectData]
    .map((subject) => {
      const p = subject.progress ?? {};
      return {
        // Identity
        id: subject.id,
        name: toShortLabel(subject.id),
        fullName: subject.label ?? subject.id,
        emoji: subject.emoji ?? "📚",
        color: subject.color ?? "#7C6FFF",
        // Raw counts
        total: p.total ?? 0,
        done: p.done ?? 0,
        notStarted: p.notStarted ?? 0,
        inProgress: p.inProgress ?? 0,
        completed: p.completed ?? 0,
        revisionNeeded: p.revisionNeeded ?? 0,
        revised: p.revised ?? 0,
        mastered: p.mastered ?? 0,
        pct: p.pct ?? 0,
        xpEarned: p.xpEarned ?? 0,
        maxXP: p.maxXP ?? 0,
        // PascalCase keys for recharts <Bar dataKey="..." />
        Mastered: p.mastered ?? 0,
        Revised: p.revised ?? 0,
        Completed: p.completed ?? 0,
        "Review Needed": p.revisionNeeded ?? 0,
        "Not Started": p.notStarted ?? 0,
      };
    })
    .sort((a, b) => b.pct - a.pct);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildStatusSlices
 *
 * Transforms the output of syllabusService.getExamProgress(examId) into
 * an array of slices for a recharts PieChart (used as a donut by setting
 * innerRadius on the Pie component).
 *
 * Zero-value statuses are excluded so they don't appear as invisible slivers.
 * If all counts are zero (fresh user), returns a single placeholder slice so
 * the donut renders a grey ring rather than an empty chart.
 *
 * @param  {object} examProgress - getExamProgress() result
 * @returns {Array}  [{ name, value, color }, ...]
 */
export function buildStatusSlices(examProgress) {
  if (!examProgress || typeof examProgress !== "object") {
    return [
      { name: "Not Started", value: 1, color: STATUS_COLORS.not_started },
    ];
  }

  const candidates = [
    {
      name: "Not Started",
      value: examProgress.notStarted ?? 0,
      color: STATUS_COLORS.not_started,
    },
    {
      name: "In Progress",
      value: examProgress.inProgress ?? 0,
      color: STATUS_COLORS.in_progress,
    },
    {
      name: "Completed",
      value: examProgress.completed ?? 0,
      color: STATUS_COLORS.completed,
    },
    {
      name: "Review Needed",
      value: examProgress.revisionNeeded ?? 0,
      color: STATUS_COLORS.revision_needed,
    },
    {
      name: "Revised",
      value: examProgress.revised ?? 0,
      color: STATUS_COLORS.revised,
    },
    {
      name: "Mastered",
      value: examProgress.mastered ?? 0,
      color: STATUS_COLORS.mastered,
    },
  ];

  const slices = candidates.filter((s) => s.value > 0);

  return slices.length > 0
    ? slices
    : [{ name: "Not Started", value: 1, color: STATUS_COLORS.not_started }];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildWeeklyActivity
 *
 * Transforms the output of syllabusService.getActivityLog(90) into a
 * 14-day time-series array for a recharts AreaChart.
 *
 * - Uses LOCAL calendar dates throughout (no UTC shift).
 * - Only TOPIC_ACTIONS are counted; milestone events are excluded.
 * - Always returns exactly 14 entries (days with no activity have topics: 0).
 * - Entries are ordered oldest → newest (left to right on chart).
 *
 * @param  {Array}  activityLog - getActivityLog(90) result
 * @returns {Array} 14 entries: [{ date, label, dayLabel, topics, xp }, ...]
 */
export function buildWeeklyActivity(activityLog) {
  const log = Array.isArray(activityLog) ? activityLog : [];

  // Group topic-level actions by local calendar date
  const byDate = {};
  log.forEach((entry) => {
    if (!TOPIC_ACTIONS.has(entry.action)) return;
    const dateStr = timestampToLocalDate(entry.timestamp);
    if (!dateStr) return;
    if (!byDate[dateStr]) byDate[dateStr] = { topics: 0, xp: 0 };
    byDate[dateStr].topics += 1;
    byDate[dateStr].xp += entry.xp ?? 0;
  });

  // Build 14-day window ending today (local calendar, oldest first)
  const result = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    const dateStr = localDateStr(d);
    const data = byDate[dateStr] ?? { topics: 0, xp: 0 };

    result.push({
      date: dateStr,
      label: formatShortDate(dateStr),
      dayLabel: formatWeekday(dateStr),
      topics: data.topics,
      xp: data.xp,
    });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildXPMetrics
 *
 * Derives aggregate statistics for the XP stat card row from the exam
 * progress object and the activity log.
 *
 * Time windows:
 *   - This week:  last 7 local calendar days (topics + XP)
 *   - Last 30:    last 30 local calendar days (best day, avg, active days)
 *
 * @param  {object} examProgress - getExamProgress() result
 * @param  {Array}  activityLog  - getActivityLog(90) result
 * @returns {object} Flat metrics object for rendering stat cards
 */
export function buildXPMetrics(examProgress, activityLog) {
  const progress = examProgress ?? {};
  const log = Array.isArray(activityLog) ? activityLog : [];
  const today = new Date();

  const weekAgo = daysAgoStr(today, 7);
  const thirtyAgo = daysAgoStr(today, 30);

  // ── This-week totals ──────────────────────────────────────────────────────
  const weekEntries = log.filter((e) => {
    if (!TOPIC_ACTIONS.has(e.action)) return false;
    const d = timestampToLocalDate(e.timestamp);
    return d !== null && d >= weekAgo;
  });

  const xpThisWeek = weekEntries.reduce((s, e) => s + (e.xp ?? 0), 0);
  const topicsThisWeek = weekEntries.length;

  // ── Last-30-days: group by date ───────────────────────────────────────────
  const byDate30 = {};

  log.forEach((e) => {
    if (!TOPIC_ACTIONS.has(e.action)) return;
    const dateStr = timestampToLocalDate(e.timestamp);
    if (!dateStr || dateStr < thirtyAgo) return;
    if (!byDate30[dateStr])
      byDate30[dateStr] = { date: dateStr, topics: 0, xp: 0 };
    byDate30[dateStr].topics += 1;
    byDate30[dateStr].xp += e.xp ?? 0;
  });

  const activeDayList = Object.values(byDate30);
  const daysActive = activeDayList.length;
  const topicsIn30 = activeDayList.reduce((s, d) => s + d.topics, 0);

  const avgTopicsPerDay =
    daysActive > 0 ? parseFloat((topicsIn30 / daysActive).toFixed(1)) : 0;

  // Best day (most topics) in last 30 days
  let bestDay = null;
  if (activeDayList.length > 0) {
    const sorted = [...activeDayList].sort((a, b) => b.topics - a.topics);
    const best = sorted[0];
    bestDay = {
      date: best.date,
      label: formatShortDate(best.date),
      topics: best.topics,
      xp: best.xp,
    };
  }

  return {
    // XP
    totalXP: progress.xpEarned ?? 0,
    maxXP: progress.maxXP ?? 0,
    xpThisWeek,
    // Topic counts
    topicsThisWeek,
    avgTopicsPerDay,
    bestDay,
    // Exam status breakdown
    masteredCount: progress.mastered ?? 0,
    revisedCount: progress.revised ?? 0,
    completedCount: progress.completed ?? 0,
    totalDone: progress.done ?? 0,
    totalTopics: progress.total ?? 0,
    examPct: progress.pct ?? 0,
    // Consistency
    daysActive,
  };
}
