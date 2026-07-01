/**
 * dashboardMissionEngine.js
 *
 * Pure utility functions for the Phase 34 Dashboard Command Center.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All inputs passed by caller
 *
 * DATA SOURCES (all passed as arguments by the caller):
 *   revisionQueue    syllabusService.getTodayRevisionQueue(examId)
 *   recommendations  generateRecommendations({...})
 *   subjectProgress  syllabusService.getAllSubjectProgress(examId)
 *   examProgress     syllabusService.getExamProgress(examId)
 *   activityLog      syllabusService.getActivityLog(500)
 */

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TODAY_XP_GOAL = 100; // daily XP target for progress bar
const MS_PER_DAY = 86_400_000;

// Focus score weights (must sum to 1.0)
const FOCUS_WEIGHT_XP = 0.35;
const FOCUS_WEIGHT_TOPICS = 0.3;
const FOCUS_WEIGHT_REVISIONS = 0.2;
const FOCUS_WEIGHT_CONSISTENCY = 0.15;

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

function _todayLocalStr() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function _timestampToLocalDate(ts) {
  try {
    const d = new Date(ts);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  } catch {
    return null;
  }
}

function _clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

/** Returns only activityLog entries that occurred today (local calendar). */
function _todayEntries(activityLog) {
  if (!Array.isArray(activityLog)) return [];
  const today = _todayLocalStr();
  return activityLog.filter(
    (e) => _timestampToLocalDate(e.timestamp) === today,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: buildDashboardMission
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildDashboardMission
 *
 * Returns a SINGLE mission object — the single most important action
 * the user should take right now.
 *
 * Priority ladder (highest → lowest):
 *   1. Overdue revisions
 *   2. Due-today revisions
 *   3. Critical recommendation (priority === 'CRITICAL')
 *   4. High recommendation (priority === 'HIGH')
 *   5. Continue weakest subject (lowest completion pct, has progress)
 *   6. Continue current syllabus (next untouched subject)
 *
 * @param {object} inputs
 *   {
 *     revisionQueue    {Array}  syllabusService.getTodayRevisionQueue()
 *     recommendations  {Array}  generateRecommendations() output
 *     subjectProgress  {Array}  getAllSubjectProgress()
 *     examProgress     {object} getExamProgress()
 *   }
 * @returns {object} mission:
 *   {
 *     emoji, title, explanation, ctaLabel,
 *     actionPath, actionTab,
 *     urgencyLevel,   // 'critical' | 'high' | 'medium' | 'positive'
 *     color,
 *   }
 */
export function buildDashboardMission({
  revisionQueue = [],
  recommendations = [],
  subjectProgress = [],
  examProgress = null,
} = {}) {
  const FALLBACK = {
    emoji: "📘",
    title: "Start Your Study Session",
    explanation: "Open your syllabus and mark the first topic for today.",
    ctaLabel: "Open Syllabus",
    actionPath: "/syllabus",
    actionTab: "overview",
    urgencyLevel: "medium",
    color: "#7C6FFF",
  };

  try {
    // ── 1. Overdue revisions ────────────────────────────────────────────────
    const overdue = Array.isArray(revisionQueue)
      ? revisionQueue.filter((i) => i.isOverdue === true)
      : [];

    if (overdue.length > 0) {
      return {
        emoji: "🔥",
        title: `Clear ${overdue.length} Overdue Revision${overdue.length > 1 ? "s" : ""}`,
        explanation: `${overdue.length} topic${overdue.length > 1 ? "s are" : " is"} past the scheduled revision date. Reviewing now preserves long-term retention.`,
        ctaLabel: "Start Revision",
        actionPath: "/syllabus",
        actionTab: "revision",
        urgencyLevel: "critical",
        color: "#FF4D6D",
      };
    }

    // ── 2. Due-today revisions ──────────────────────────────────────────────
    const dueToday = Array.isArray(revisionQueue)
      ? revisionQueue.filter((i) => i.isOverdue === false)
      : [];

    if (dueToday.length > 0) {
      return {
        emoji: "📅",
        title: `Finish Today's ${dueToday.length} Revision${dueToday.length > 1 ? "s" : ""}`,
        explanation: `${dueToday.length} spaced-repetition revision${dueToday.length > 1 ? "s are" : " is"} scheduled for today. Completing them advances each topic's retention level.`,
        ctaLabel: "Today's Revisions",
        actionPath: "/syllabus",
        actionTab: "revision",
        urgencyLevel: "high",
        color: "#FF8C42",
      };
    }

    // ── 3. Critical recommendation ─────────────────────────────────────────
    if (Array.isArray(recommendations)) {
      const critical = recommendations.find((r) => r.priority === "CRITICAL");
      if (critical) {
        return {
          emoji: critical.icon ?? "⚠️",
          title: critical.title,
          explanation: critical.message,
          ctaLabel: critical.actionLabel ?? "Take Action",
          actionPath: critical.actionPath ?? "/syllabus",
          actionTab: "recommendations",
          urgencyLevel: "critical",
          color: "#FF4D6D",
        };
      }

      // ── 4. High recommendation ─────────────────────────────────────────────
      const high = recommendations.find((r) => r.priority === "HIGH");
      if (high) {
        return {
          emoji: high.icon ?? "⚠️",
          title: high.title,
          explanation: high.message,
          ctaLabel: high.actionLabel ?? "Address Now",
          actionPath: high.actionPath ?? "/syllabus",
          actionTab: "recommendations",
          urgencyLevel: "high",
          color: "#FF8C42",
        };
      }
    }

    // ── 5. Continue weakest subject ────────────────────────────────────────
    if (Array.isArray(subjectProgress)) {
      const started = subjectProgress
        .filter(
          (s) => (s.progress?.done ?? 0) > 0 && (s.progress?.pct ?? 0) < 100,
        )
        .sort((a, b) => (a.progress?.pct ?? 0) - (b.progress?.pct ?? 0));

      if (started.length > 0) {
        const weakest = started[0];
        return {
          emoji: weakest.emoji ?? "📘",
          title: `Improve ${weakest.label}`,
          explanation: `${weakest.label} is ${weakest.progress?.pct ?? 0}% complete. Consistent daily effort here will close the gap steadily.`,
          ctaLabel: "Continue Subject",
          actionPath: "/syllabus",
          actionTab: "overview",
          urgencyLevel: "medium",
          color: weakest.color ?? "#7C6FFF",
        };
      }

      // ── 6. Continue current syllabus (untouched subjects) ─────────────────
      const untouched = subjectProgress.find(
        (s) => (s.progress?.done ?? 0) === 0,
      );
      if (untouched) {
        return {
          emoji: untouched.emoji ?? "📘",
          title: `Start ${untouched.label}`,
          explanation: `You haven't begun ${untouched.label} yet. Marking even one topic done activates tracking and revision scheduling.`,
          ctaLabel: "Open Syllabus",
          actionPath: "/syllabus",
          actionTab: "overview",
          urgencyLevel: "medium",
          color: untouched.color ?? "#7C6FFF",
        };
      }
    }

    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: buildTodayProgress
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildTodayProgress
 *
 * Derives all of today's study metrics from the activity log.
 *
 * @param {Array} activityLog  syllabusService.getActivityLog(500)
 * @returns {object}
 *   {
 *     todayXP,
 *     todayTopicsCompleted,
 *     todayRevisions,
 *     todayMastered,
 *     xpGoal,
 *     xpPct,             0–100
 *     hasAnyActivity,
 *   }
 */
export function buildTodayProgress(activityLog = []) {
  const EMPTY = {
    todayXP: 0,
    todayTopicsCompleted: 0,
    todayRevisions: 0,
    todayMastered: 0,
    xpGoal: TODAY_XP_GOAL,
    xpPct: 0,
    hasAnyActivity: false,
  };

  try {
    const entries = _todayEntries(activityLog);
    if (entries.length === 0) return EMPTY;

    let todayXP = 0;
    let todayTopicsCompleted = 0;
    let todayRevisions = 0;
    let todayMastered = 0;

    entries.forEach((e) => {
      todayXP += e.xp ?? 0;

      switch (e.action) {
        case "topic_completed":
          todayTopicsCompleted++;
          break;
        case "topic_revised":
          todayRevisions++;
          break;
        case "topic_mastered":
          todayMastered++;
          todayTopicsCompleted++;
          break;
        // milestone bonuses contribute to XP only — not topic counts
      }
    });

    const xpPct = _clamp(Math.round((todayXP / TODAY_XP_GOAL) * 100));

    return {
      todayXP,
      todayTopicsCompleted,
      todayRevisions,
      todayMastered,
      xpGoal: TODAY_XP_GOAL,
      xpPct,
      hasAnyActivity: true,
    };
  } catch {
    return EMPTY;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED: buildFocusScore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildFocusScore
 *
 * Computes a 0–100 focus score for today from four weighted components:
 *
 *   XP progress        35%  — how far toward today's XP goal
 *   Topics completed   30%  — scaled to a target of 5 topics/day
 *   Revisions done     20%  — scaled to pending revision count (min 1)
 *   Consistency        15%  — whether any activity happened in last 3 days
 *
 * @param {object} todayProgress  output of buildTodayProgress()
 * @param {Array}  activityLog    syllabusService.getActivityLog(500)
 * @param {number} pendingRevisionCount  revisionQueue.length
 * @returns {object}
 *   {
 *     score,    0–100
 *     label,    'Poor' | 'Average' | 'Good' | 'Excellent'
 *     color,
 *     components: { xp, topics, revisions, consistency }
 *   }
 */
export function buildFocusScore(
  todayProgress = {},
  activityLog = [],
  pendingRevisionCount = 0,
) {
  try {
    const TOPIC_TARGET = 5; // daily topics target for full score on that component
    const CONSISTENCY_DAYS = 3; // days to look back for consistency check

    // Component 1 — XP progress (0–100 scaled)
    const xpComponent = _clamp(todayProgress.xpPct ?? 0);

    // Component 2 — Topics completed (0–100 scaled to TOPIC_TARGET)
    const topicsCompleted = todayProgress.todayTopicsCompleted ?? 0;
    const topicComponent = _clamp(
      Math.round((topicsCompleted / TOPIC_TARGET) * 100),
    );

    // Component 3 — Revisions cleared (0–100)
    // If no revisions were pending, component defaults to 100 (nothing to do)
    const revisionsCompleted = todayProgress.todayRevisions ?? 0;
    let revisionComponent;
    if (pendingRevisionCount <= 0) {
      revisionComponent = 100; // no revisions due = full marks
    } else {
      const totalDue = pendingRevisionCount + revisionsCompleted;
      revisionComponent = _clamp(
        Math.round((revisionsCompleted / totalDue) * 100),
      );
    }

    // Component 4 — Consistency: was there activity in the last CONSISTENCY_DAYS?
    const today = new Date();
    const cutoff = new Date(today.getTime() - CONSISTENCY_DAYS * MS_PER_DAY);
    const consistent =
      Array.isArray(activityLog) &&
      activityLog.some((e) => {
        try {
          return new Date(e.timestamp) >= cutoff;
        } catch {
          return false;
        }
      });
    const consistencyComponent = consistent ? 100 : 0;

    // Weighted composite
    const raw =
      xpComponent * FOCUS_WEIGHT_XP +
      topicComponent * FOCUS_WEIGHT_TOPICS +
      revisionComponent * FOCUS_WEIGHT_REVISIONS +
      consistencyComponent * FOCUS_WEIGHT_CONSISTENCY;

    const score = Math.round(_clamp(raw));

    // Label + colour
    let label, color;
    if (score >= 80) {
      label = "Excellent";
      color = "#00FFC8";
    } else if (score >= 60) {
      label = "Good";
      color = "#7C6FFF";
    } else if (score >= 35) {
      label = "Average";
      color = "#FFB347";
    } else {
      label = "Poor";
      color = "#FF6B2B";
    }

    return {
      score,
      label,
      color,
      components: {
        xp: xpComponent,
        topics: topicComponent,
        revisions: revisionComponent,
        consistency: consistencyComponent,
      },
    };
  } catch {
    return {
      score: 0,
      label: "Poor",
      color: "#FF6B2B",
      components: { xp: 0, topics: 0, revisions: 0, consistency: 0 },
    };
  }
}

export default {
  buildDashboardMission,
  buildTodayProgress,
  buildFocusScore,
};
