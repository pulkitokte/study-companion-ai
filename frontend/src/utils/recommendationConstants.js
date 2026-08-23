/**
 * recommendationConstants.js
 *
 * Phase 37 Batch E.1 Hotfix — Circular Dependency Resolution.
 *
 * Dependency-neutral leaf module holding the foundational constants
 * shared by studyRecommendationEngine.js and recommendationPrioritization.js.
 *
 * ROOT CAUSE THIS FILE FIXES:
 *   studyRecommendationEngine.js imports prioritizeRecommendations from
 *   recommendationPrioritization.js, while recommendationPrioritization.js
 *   (as of Phase 37 Batch E.1) imported PRIORITY/REC_TYPE back from
 *   studyRecommendationEngine.js — a two-file circular import. Because
 *   recommendationPrioritization.js used those constants inside top-level
 *   object-literal initializers (TIER_BASE_SCORE, TYPE_PRECEDENCE_BONUS),
 *   evaluation order could reach that code before studyRecommendationEngine.js
 *   had finished initializing its own exports, producing
 *   "ReferenceError: Cannot access 'PRIORITY' before initialization".
 *
 * FIX: both PRIORITY and REC_TYPE (plus PRIORITY_COLORS/PRIORITY_LABELS,
 * which travel with them) now live here, in a module that imports NOTHING
 * — not studyRecommendationEngine.js, not recommendationPrioritization.js,
 * not React, not services, not hooks, not storage. Both consumer modules
 * import from this leaf instead of from each other, eliminating the cycle.
 *
 * studyRecommendationEngine.js continues to re-export these constants for
 * full backward compatibility with any existing consumer that imports
 * PRIORITY / REC_TYPE / PRIORITY_COLORS / PRIORITY_LABELS from it directly.
 */

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

export default {
  PRIORITY,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  REC_TYPE,
};
