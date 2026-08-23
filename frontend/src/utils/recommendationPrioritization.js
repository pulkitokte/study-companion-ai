/**
 * recommendationPrioritization.js
 *
 * Phase 36 Batch D — Intelligent Recommendation Prioritization.
 *
 * Single, reusable deterministic ranking layer for recommendation objects
 * produced by studyRecommendationEngine.generateRecommendations(). Prior
 * to this batch, ordering was purely a static priority-tier sort
 * (CRITICAL → HIGH → MEDIUM → POSITIVE, tie-broken alphabetically by
 * title). This module keeps that tier ordering as the dominant signal
 * (so there is no behavioural regression) but adds secondary, deterministic
 * scoring within/near tiers using signals that already exist in the data
 * each recommendation was generated from — revision urgency, subject
 * completion, and neglect duration — so recommendations that are more
 * urgent within the same tier surface first.
 *
 * Phase 37 Batch E — Priority Authority Reconciliation:
 *   During the first Command Center migration to the Unified Study Plan
 *   (studyPlanEngine.js / useStudyPlan.js), a genuine ordering conflict
 *   was discovered between this module's HIGH-tier secondary scoring and
 *   the legacy dashboardMissionEngine ladder, which always placed
 *   due-today revisions ahead of ordinary HIGH-tier diagnostic
 *   recommendations (HIGH_RISK_SUBJECT, NEGLECTED_SUBJECT). A single
 *   due-today revision item could previously be outranked within the
 *   HIGH tier by a sufficiently neglected subject, contradicting that
 *   established precedent.
 *
 *   This module is the canonical, single source of recommendation
 *   priority — per Phase 37's architecture freeze, the resolution lives
 *   here (not in CommandCenter, useStudyPlan, or studyPlanEngine).
 *
 *   Resolution: revision-derived recommendation types now receive an
 *   explicit, bounded type-precedence bonus within their own priority
 *   tier (see TYPE_PRECEDENCE_BONUS below), formalizing the precedence
 *   revision urgency already had in the legacy dashboardMissionEngine
 *   ladder and in generateRecommendations()'s generator ordering
 *   (_genRevisionDue runs first). The bonus is strictly smaller than the
 *   gap between adjacent tiers, so it can only ever reorder items WITHIN
 *   a tier — it can never let a HIGH-tier item outrank a CRITICAL-tier
 *   item, or a MEDIUM-tier item outrank a HIGH-tier item. Tier ordering
 *   itself (CRITICAL → HIGH → MEDIUM → POSITIVE) is unchanged, and
 *   overdue revisions (already CRITICAL) already unconditionally
 *   outranked every HIGH-tier item before this change — no adjustment
 *   was needed or made for that case.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service calls, no localStorage access, no side effects
 *   - No randomness — every input produces the same output every time
 *   - No new data sources — only reuses subjectProgress, activityLog,
 *     and the revision queue/urgency already computed by
 *     revisionIntelligence.js (Phase 36 Batch C)
 *   - Never throws — all functions are fully defensive
 *   - Recommendation objects are returned unchanged (same shape) — only
 *     their order changes. Fully compatible with existing consumers
 *     (RecommendationView, dashboardMissionEngine's `.find(...)` lookups,
 *     and studyPlanEngine's item mapping).
 *
 * FUTURE-COMPATIBILITY:
 *   A future AI ranking engine only needs to replace
 *   `getRecommendationScore` (or swap `prioritizeRecommendations`
 *   entirely) — every current consumer already calls through this one
 *   module rather than sorting independently.
 */

import { REC_TYPE, PRIORITY } from "./studyRecommendationEngine.js";
import { getOverdueCount, getDueTodayCount } from "./revisionIntelligence.js";

// ─── TIER BASE SCORES ─────────────────────────────────────────────────────────
// Large gaps between tiers so priority level always dominates ordering —
// the secondary signals below can only ever reorder items WITHIN a tier,
// never cause a lower-tier recommendation to outrank a higher-tier one.
const TIER_BASE_SCORE = {
  [PRIORITY.CRITICAL]: 1000,
  [PRIORITY.HIGH]: 750,
  [PRIORITY.MEDIUM]: 500,
  [PRIORITY.POSITIVE]: 100,
};

// ─── TYPE PRECEDENCE BONUS (Phase 37 Batch E) ────────────────────────────────
// Formalizes revision urgency's existing precedence (already established
// by dashboardMissionEngine's legacy ladder and by _genRevisionDue running
// first in generateRecommendations()) as an explicit, bounded score
// component. Only REVISION_DUE currently carries a precedence bonus, since
// it is the only recommendation type with a documented existing precedent
// for outranking ordinary diagnostic recommendations within the same tier.
//
// Bound justification: within the HIGH tier, the largest possible bonus
// from any OTHER type's own signal is NEGLECTED_SUBJECT's neglect bonus,
// capped at 40 (see _neglectBonus). TYPE_PRECEDENCE_BONUS.REVISION_DUE is
// set to 50 — strictly greater than that maximum — so a REVISION_DUE item
// always outranks any other HIGH-tier item regardless of how large that
// other item's own signal happens to be, while the combined maximum for a
// HIGH-tier REVISION_DUE item (750 base + 50 precedence + 60 urgency = 860)
// remains well below the CRITICAL tier floor (1000), so tier separation is
// never crossed.
const TYPE_PRECEDENCE_BONUS = {
  [REC_TYPE.REVISION_DUE]: 50,
};

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

function _clampScore(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

/** Finds the subjectProgress entry matching a recommendation's subjectId. */
function _findSubject(subjectProgress, subjectId) {
  if (!Array.isArray(subjectProgress) || !subjectId) return null;
  return subjectProgress.find((s) => s.id === subjectId) ?? null;
}

/**
 * Days since the most recent activityLog entry for a given subject.
 * Simple recency calculation (not scheduling logic) — mirrors the intent
 * of studyRecommendationEngine's internal neglect check without importing
 * its unexported private helper.
 */
function _daysSinceSubjectActivity(activityLog, subjectId) {
  if (!Array.isArray(activityLog) || !subjectId) return 0;
  for (const entry of activityLog) {
    if (entry.subject === subjectId || entry.subjectId === subjectId) {
      try {
        const last = new Date(entry.timestamp);
        if (isNaN(last.getTime())) continue;
        const days = Math.round(
          Math.abs(Date.now() - last.getTime()) / 86_400_000,
        );
        return days;
      } catch {
        continue;
      }
    }
  }
  return 0;
}

/**
 * Type precedence bonus (Phase 37 Batch E). Applies uniformly whenever a
 * recommendation's type has a documented precedence entry — currently
 * only REVISION_DUE. Deterministic and independent of tier, so it
 * composes safely with TIER_BASE_SCORE and every other signal below.
 */
function _typePrecedenceBonus(rec) {
  return TYPE_PRECEDENCE_BONUS[rec?.type] ?? 0;
}

/**
 * Revision urgency bonus — only applies to REVISION_DUE recommendations.
 * Scales with how many topics are overdue/due-today so, e.g., "12
 * overdue revisions" naturally outranks "1 overdue revision" even though
 * both sit in the CRITICAL tier. Reuses revisionIntelligence's counters —
 * no urgency math is recomputed here.
 */
function _revisionUrgencyBonus(rec, revisionQueue) {
  if (rec.type !== REC_TYPE.REVISION_DUE) return 0;
  try {
    if (rec.priority === PRIORITY.CRITICAL) {
      return _clampScore(getOverdueCount(revisionQueue) * 5, 0, 100);
    }
    if (rec.priority === PRIORITY.HIGH) {
      return _clampScore(getDueTodayCount(revisionQueue) * 3, 0, 60);
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Subject-completion signal. For risk/low-completion recommendations,
 * a lower completion percentage nudges the score up (more urgent gap).
 * For momentum (positive) recommendations, a higher percentage nudges
 * the score up slightly (stronger positive signal), staying within the
 * POSITIVE tier's own score range.
 */
function _subjectCompletionBonus(rec, subjectProgress) {
  const subject = _findSubject(subjectProgress, rec.subjectId);
  if (!subject) return 0;
  const pct = subject.progress?.pct ?? 0;

  try {
    if (
      rec.type === REC_TYPE.HIGH_RISK_SUBJECT ||
      rec.type === REC_TYPE.LOW_COMPLETION
    ) {
      return _clampScore((100 - pct) * 0.3, 0, 30);
    }
    if (rec.type === REC_TYPE.MOMENTUM) {
      return _clampScore(pct * 0.1, 0, 10);
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Neglect-duration signal. Only applies to NEGLECTED_SUBJECT
 * recommendations — the longer a started subject has gone untouched,
 * the more urgent the nudge, within that tier.
 */
function _neglectBonus(rec, activityLog) {
  if (rec.type !== REC_TYPE.NEGLECTED_SUBJECT) return 0;
  try {
    const days = _daysSinceSubjectActivity(activityLog, rec.subjectId);
    return _clampScore(days * 2, 0, 40);
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getRecommendationScore
 *
 * Returns a single deterministic numeric score for one recommendation.
 * Higher = more important. Tier (rec.priority) is always the dominant
 * factor; the type-precedence bonus and additional signals only fine-tune
 * ordering within a tier.
 *
 * @param {object} rec      a single recommendation object from
 *                          studyRecommendationEngine.generateRecommendations()
 * @param {object} context
 *   {
 *     subjectProgress {Array}  syllabusService.getAllSubjectProgress(examId)
 *     activityLog     {Array}  syllabusService.getActivityLog(500)
 *     revisionQueue   {Array}  syllabusService.getTodayRevisionQueue(examId)
 *   }
 * @returns {number}
 */
export function getRecommendationScore(rec, context = {}) {
  try {
    if (!rec || typeof rec !== "object") return 0;

    const {
      subjectProgress = [],
      activityLog = [],
      revisionQueue = [],
    } = context;

    const base = TIER_BASE_SCORE[rec.priority] ?? 0;
    const typePrecedence = _typePrecedenceBonus(rec);
    const revisionBonus = _revisionUrgencyBonus(rec, revisionQueue);
    const subjectBonus = _subjectCompletionBonus(rec, subjectProgress);
    const neglect = _neglectBonus(rec, activityLog);

    return base + typePrecedence + revisionBonus + subjectBonus + neglect;
  } catch {
    return TIER_BASE_SCORE[rec?.priority] ?? 0;
  }
}

/**
 * prioritizeRecommendations
 *
 * Sorts a recommendation list using getRecommendationScore, with fully
 * deterministic tie-breaking (score desc → title alphabetical → id
 * alphabetical), so identical inputs always produce identical output.
 * Does not mutate the input array or any recommendation object.
 *
 * @param {Array}  recommendations  studyRecommendationEngine.generateRecommendations() output
 * @param {object} context          same shape as getRecommendationScore's context param
 * @returns {Array} new sorted array
 */
export function prioritizeRecommendations(recommendations, context = {}) {
  try {
    if (!Array.isArray(recommendations)) return [];

    return [...recommendations].sort((a, b) => {
      const scoreDiff =
        getRecommendationScore(b, context) - getRecommendationScore(a, context);
      if (scoreDiff !== 0) return scoreDiff;

      const titleDiff = (a.title ?? "").localeCompare(b.title ?? "");
      if (titleDiff !== 0) return titleDiff;

      return (a.id ?? "").localeCompare(b.id ?? "");
    });
  } catch {
    return Array.isArray(recommendations) ? recommendations : [];
  }
}

export default {
  getRecommendationScore,
  prioritizeRecommendations,
};
