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
 *   activityLog      syllabusService.getActivityLog(500)
 *
 * Phase 36 Batch C: the overdue/due-today interpretation of revisionQueue
 * previously computed inline in buildDashboardMission (two separate
 * .filter(i => i.isOverdue)) went through the shared revisionIntelligence
 * module before this function's removal, so that classification logic no
 * longer lived here duplicated.
 *
 * Phase 37 Batch E.2: CommandCenter migrated its primary "what should I
 * study now?" mission decision to useStudyPlan(examId) / studyPlanEngine,
 * which orchestrates studyRecommendationEngine + recommendationPrioritization
 * (the canonical priority authority per the Phase 37 architecture freeze).
 *
 * Phase 37 Batch E.3 — Legacy Dashboard Mission Cleanup:
 *   buildDashboardMission() has been REMOVED after a conservative audit
 *   confirmed zero remaining callers across every file transferred
 *   throughout this project's session history — its sole call site was
 *   CommandCenter.jsx, which no longer imports or calls it as of the
 *   Batch E.2 migration. Its exclusive fallback constant (FALLBACK) was
 *   removed alongside it. buildTodayProgress() and buildFocusScore()
 *   remain fully intact, unchanged, and continue to power the Dashboard
 *   Command Center's Today Progress and Focus Meter cards — every helper
 *   and constant they depend on (_todayLocalStr, _timestampToLocalDate,
 *   _clamp, _todayEntries, MS_PER_DAY, TODAY_XP_GOAL, the FOCUS_WEIGHT_*
 *   constants) is preserved exactly as it was, since none of them were
 *   exclusive to the removed function.
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
  buildTodayProgress,
  buildFocusScore,
};
