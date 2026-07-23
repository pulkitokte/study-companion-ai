/**
 * studyRecommendationEngine.js
 *
 * Pure adaptive recommendation engine — Phase 33.
 * Analyses syllabus progress, revision schedule, activity history,
 * knowledge gaps and quiz performance to generate prioritised
 * daily study recommendations.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All inputs passed by caller
 *
 * Phase 36 Batch C: the overdue/due-today interpretation of revisionQueue
 * previously computed inline here (two separate .filter(i => i.isOverdue))
 * now goes through the shared revisionIntelligence module, so this file
 * no longer duplicates that classification logic. No behavioural change —
 * same counts, same messages, same priority levels.
 *
 * Phase 36 Batch D: final ordering of the deduplicated recommendation
 * list now goes through the shared recommendationPrioritization module
 * instead of a static priority-tier + title sort computed inline. Tier
 * ordering (CRITICAL → HIGH → MEDIUM → POSITIVE) is preserved exactly —
 * the shared module only adds deterministic secondary signals to break
 * ties within a tier. Recommendation generation (types, messages,
 * priority assignment) is completely unchanged.
 */

import { getOverdueCount, getDueTodayCount } from "./revisionIntelligence.js";
import { prioritizeRecommendations } from "./recommendationPrioritization.js";

// ─── PRIORITY LEVELS ──────────────────────────────────────────────────────────

export const PRIORITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  POSITIVE: "POSITIVE",
};

export const PRIORITY_COLORS = {
  [PRIORITY.CRITICAL]: "#FF4D6D",
  [PRIORITY.HIGH]: "#FF8C42",
  [PRIORITY.MEDIUM]: "#FFD166",
  [PRIORITY.POSITIVE]: "#00FFC8",
};

export const PRIORITY_LABELS = {
  [PRIORITY.CRITICAL]: "Critical",
  [PRIORITY.HIGH]: "High Priority",
  [PRIORITY.MEDIUM]: "Medium Priority",
  [PRIORITY.POSITIVE]: "Positive Insight",
};

// ─── RECOMMENDATION TYPES ─────────────────────────────────────────────────────

export const REC_TYPE = {
  REVISION_DUE: "REVISION_DUE",
  HIGH_RISK_SUBJECT: "HIGH_RISK_SUBJECT",
  NEGLECTED_SUBJECT: "NEGLECTED_SUBJECT",
  LOW_COMPLETION: "LOW_COMPLETION",
  MOMENTUM: "MOMENTUM",
};

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

function _makeId(type, subjectId) {
  return `${type}__${subjectId ?? "global"}__${Date.now()}`;
}

/** Returns the most recent activity timestamp for a given subject id. */
function _lastActivityForSubject(activityLog, subjectId) {
  if (!Array.isArray(activityLog) || !subjectId) return null;
  for (const entry of activityLog) {
    if (entry.subject === subjectId || entry.subjectId === subjectId) {
      try {
        return new Date(entry.timestamp);
      } catch {
        continue;
      }
    }
  }
  return null;
}

/** Calendar days between two Date objects (always positive). */
function _daysBetween(dateA, dateB) {
  const MS = 86_400_000;
  return Math.abs(Math.round((dateA.getTime() - dateB.getTime()) / MS));
}

// ─── GENERATORS ───────────────────────────────────────────────────────────────

/**
 * 1. REVISION_DUE
 * Fired when the today-revision queue has overdue items.
 * Aggregated into ONE critical recommendation (not one per topic).
 *
 * Phase 36 Batch C: overdue/due-today counts now come from the shared
 * revisionIntelligence module instead of being filtered inline.
 */
function _genRevisionDue(revisionQueue) {
  try {
    if (!Array.isArray(revisionQueue) || revisionQueue.length === 0) return [];

    const overdueCount = getOverdueCount(revisionQueue);
    const dueTodayCount = getDueTodayCount(revisionQueue);

    const recs = [];

    if (overdueCount > 0) {
      recs.push({
        id: _makeId(REC_TYPE.REVISION_DUE, "overdue"),
        type: REC_TYPE.REVISION_DUE,
        title: `${overdueCount} Overdue Revision${overdueCount > 1 ? "s" : ""}`,
        message: `${overdueCount} topic${overdueCount > 1 ? "s are" : " is"} past their scheduled revision date. Clear these immediately before learning anything new — overdue reviews erode retention fast.`,
        priority: PRIORITY.CRITICAL,
        subjectId: null,
        subjectLabel: null,
        color: PRIORITY_COLORS[PRIORITY.CRITICAL],
        icon: "🔥",
        actionLabel: "Revise Now",
        actionPath: "/syllabus",
      });
    }

    if (dueTodayCount > 0) {
      recs.push({
        id: _makeId(REC_TYPE.REVISION_DUE, "due-today"),
        type: REC_TYPE.REVISION_DUE,
        title: `${dueTodayCount} Revision${dueTodayCount > 1 ? "s" : ""} Scheduled Today`,
        message: `${dueTodayCount} topic${dueTodayCount > 1 ? "s are" : " is"} due for spaced-repetition review today. Completing them advances retention and earns revision XP.`,
        priority: PRIORITY.HIGH,
        subjectId: null,
        subjectLabel: null,
        color: PRIORITY_COLORS[PRIORITY.HIGH],
        icon: "📅",
        actionLabel: "Today's Revisions",
        actionPath: "/syllabus",
      });
    }

    return recs;
  } catch {
    return [];
  }
}

/**
 * 2. HIGH_RISK_SUBJECT
 * From gap analysis — subjects with high-risk classification.
 * Generates one rec per high-risk subject (cap at 2).
 */
function _genHighRiskSubject(gapItems) {
  try {
    if (!Array.isArray(gapItems)) return [];

    return gapItems
      .filter((g) => g.riskLevel === "high")
      .slice(0, 2)
      .map((g) => ({
        id: _makeId(REC_TYPE.HIGH_RISK_SUBJECT, g.id),
        type: REC_TYPE.HIGH_RISK_SUBJECT,
        title: `Knowledge Gap: ${g.subject}`,
        message: `You have completed ${g.completionPct}% of ${g.subject} but quiz accuracy is only ${g.quizAccuracy}%. This gap suggests surface-level coverage. Revise this subject before moving to new topics.`,
        priority: PRIORITY.HIGH,
        subjectId: g.id,
        subjectLabel: g.subject,
        color: g.color ?? PRIORITY_COLORS[PRIORITY.HIGH],
        icon: g.emoji ?? "⚠️",
        actionLabel: "Revise Subject",
        actionPath: "/syllabus",
      }));
  } catch {
    return [];
  }
}

/**
 * 3. NEGLECTED_SUBJECT
 * Fires when a subject has been started but has had no activity
 * for 7+ days. Cap at 2 recommendations.
 */
function _genNeglectedSubject(subjectProgress, activityLog) {
  try {
    if (!Array.isArray(subjectProgress)) return [];

    const now = new Date();
    const recs = [];

    for (const subject of subjectProgress) {
      const done = subject.progress?.done ?? 0;
      if (done === 0) continue; // not started — different recommendation

      const lastActivity = _lastActivityForSubject(activityLog, subject.id);
      if (!lastActivity) continue;

      const daysSince = _daysBetween(now, lastActivity);
      if (daysSince < 7) continue;

      recs.push({
        id: _makeId(REC_TYPE.NEGLECTED_SUBJECT, subject.id),
        type: REC_TYPE.NEGLECTED_SUBJECT,
        title: `${subject.label} Needs Attention`,
        message: `You haven't studied ${subject.label} for ${daysSince} day${daysSince !== 1 ? "s" : ""}. Gaps between sessions allow knowledge to decay. Even 2–3 topics today will rebuild momentum.`,
        priority: PRIORITY.HIGH,
        subjectId: subject.id,
        subjectLabel: subject.label,
        color: subject.color ?? PRIORITY_COLORS[PRIORITY.HIGH],
        icon: subject.emoji ?? "📖",
        actionLabel: "Continue Subject",
        actionPath: "/syllabus",
      });

      if (recs.length >= 2) break;
    }

    return recs;
  } catch {
    return [];
  }
}

/**
 * 4. LOW_COMPLETION
 * Subject completion below 30% with some progress (at least 1 topic done).
 * Cap at 2 recommendations. Not fired for subjects with 0 done.
 */
function _genLowCompletion(subjectProgress) {
  try {
    if (!Array.isArray(subjectProgress)) return [];

    return subjectProgress
      .filter((s) => {
        const pct = s.progress?.pct ?? 0;
        const done = s.progress?.done ?? 0;
        return done > 0 && pct < 30;
      })
      .sort((a, b) => (a.progress?.pct ?? 0) - (b.progress?.pct ?? 0))
      .slice(0, 2)
      .map((s) => {
        const pct = s.progress?.pct ?? 0;
        const remaining = (s.progress?.total ?? 0) - (s.progress?.done ?? 0);
        return {
          id: _makeId(REC_TYPE.LOW_COMPLETION, s.id),
          type: REC_TYPE.LOW_COMPLETION,
          title: `Low Coverage: ${s.label}`,
          message: `${s.label} is only ${pct}% complete with ${remaining} topic${remaining !== 1 ? "s" : ""} remaining. Consistent daily progress — even 2 topics — will close this gap steadily.`,
          priority: PRIORITY.MEDIUM,
          subjectId: s.id,
          subjectLabel: s.label,
          color: s.color ?? PRIORITY_COLORS[PRIORITY.MEDIUM],
          icon: s.emoji ?? "📚",
          actionLabel: "Continue Subject",
          actionPath: "/syllabus",
        };
      });
  } catch {
    return [];
  }
}

/**
 * 5. MOMENTUM
 * Positive recommendation for strong performers.
 * Subjects with completion ≥ 60% AND quiz accuracy ≥ 75% (if quiz data exists).
 * Cap at 2 recommendations.
 */
function _genMomentum(subjectProgress, gapItems) {
  try {
    if (!Array.isArray(subjectProgress)) return [];

    // Build a quick lookup for gap accuracy by subject id
    const gapMap = {};
    if (Array.isArray(gapItems)) {
      gapItems.forEach((g) => {
        gapMap[g.id] = g;
      });
    }

    return subjectProgress
      .filter((s) => {
        const pct = s.progress?.pct ?? 0;
        if (pct < 60) return false;

        const gapEntry = gapMap[s.id];
        // If quiz data exists, require ≥75% accuracy for momentum
        if (gapEntry?.hasQuizData) {
          return gapEntry.quizAccuracy >= 75;
        }
        // No quiz data — completion alone is momentum if ≥70%
        return pct >= 70;
      })
      .sort((a, b) => {
        const aPct = a.progress?.pct ?? 0;
        const bPct = b.progress?.pct ?? 0;
        const aAcc = gapMap[a.id]?.quizAccuracy ?? 0;
        const bAcc = gapMap[b.id]?.quizAccuracy ?? 0;
        // Sort by combined score descending
        return bPct + bAcc - (aPct + aAcc);
      })
      .slice(0, 2)
      .map((s) => {
        const pct = s.progress?.pct ?? 0;
        const gapEntry = gapMap[s.id];
        const accStr = gapEntry?.hasQuizData
          ? ` and ${gapEntry.quizAccuracy}% quiz accuracy`
          : "";

        return {
          id: _makeId(REC_TYPE.MOMENTUM, s.id),
          type: REC_TYPE.MOMENTUM,
          title: `Strong Performance: ${s.label}`,
          message: `Excellent work in ${s.label}${accStr} with ${pct}% completion. Keep the momentum going — periodic revision will lock in long-term retention.`,
          priority: PRIORITY.POSITIVE,
          subjectId: s.id,
          subjectLabel: s.label,
          color: s.color ?? PRIORITY_COLORS[PRIORITY.POSITIVE],
          icon: s.emoji ?? "⭐",
          actionLabel: "Keep Momentum",
          actionPath: "/syllabus",
        };
      });
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * generateRecommendations
 *
 * Main entry point. Runs all generators, deduplicates, and returns a
 * deterministically ranked recommendation list.
 *
 * Phase 36 Batch D: final ordering now goes through
 * recommendationPrioritization.prioritizeRecommendations(), which
 * preserves the exact CRITICAL → HIGH → MEDIUM → POSITIVE tier ordering
 * this function always produced, while adding deterministic secondary
 * signals (revision urgency, subject completion, neglect duration) to
 * break ties within a tier more intelligently than a plain title sort.
 *
 * @param {object} inputs
 *   {
 *     subjectProgress  {Array}   syllabusService.getAllSubjectProgress(examId)
 *     examProgress     {object}  syllabusService.getExamProgress(examId)
 *     activityLog      {Array}   syllabusService.getActivityLog(500)
 *     quizHistory      {Array}   getQuizHistory()
 *     revisionQueue    {Array}   syllabusService.getTodayRevisionQueue(examId)
 *     gapItems         {Array}   analyzeKnowledgeGaps() output
 *   }
 * @returns {Array} sorted recommendation objects
 */
export function generateRecommendations({
  subjectProgress = [],
  examProgress = null,
  activityLog = [],
  quizHistory = [],
  revisionQueue = [],
  gapItems = [],
} = {}) {
  try {
    const all = [
      ..._genRevisionDue(revisionQueue),
      ..._genHighRiskSubject(gapItems),
      ..._genNeglectedSubject(subjectProgress, activityLog),
      ..._genLowCompletion(subjectProgress),
      ..._genMomentum(subjectProgress, gapItems),
    ];

    // Deduplicate by subjectId+type (keep first / highest priority occurrence)
    const seen = new Set();
    const deduped = all.filter((rec) => {
      const key = `${rec.type}__${rec.subjectId ?? "global"}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Phase 36 Batch D: deterministic ranking via the shared prioritization
    // layer, replacing the previous inline PRIORITY_SORT_ORDER + title sort.
    return prioritizeRecommendations(deduped, {
      subjectProgress,
      activityLog,
      revisionQueue,
    });
  } catch {
    return [];
  }
}

/**
 * buildRecommendationSummary
 *
 * Derives aggregate counts for the summary stat cards.
 *
 * @param {Array} recommendations  output of generateRecommendations()
 * @returns {{
 *   criticalCount,
 *   highCount,
 *   mediumCount,
 *   positiveCount,
 *   totalCount,
 * }}
 */
export function buildRecommendationSummary(recommendations) {
  const EMPTY = {
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    positiveCount: 0,
    totalCount: 0,
  };

  try {
    if (!Array.isArray(recommendations) || recommendations.length === 0)
      return EMPTY;

    const counts = { ...EMPTY, totalCount: recommendations.length };

    recommendations.forEach((rec) => {
      switch (rec.priority) {
        case PRIORITY.CRITICAL:
          counts.criticalCount++;
          break;
        case PRIORITY.HIGH:
          counts.highCount++;
          break;
        case PRIORITY.MEDIUM:
          counts.mediumCount++;
          break;
        case PRIORITY.POSITIVE:
          counts.positiveCount++;
          break;
      }
    });

    return counts;
  } catch {
    return EMPTY;
  }
}

export default {
  generateRecommendations,
  buildRecommendationSummary,
  PRIORITY,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  REC_TYPE,
};
