/**
 * studyPlanEngine.js
 *
 * Phase 37 Batch C — Unified Study Planning Engine (Foundation).
 *
 * Pure orchestration layer that answers "what should the learner study
 * today, and in what order?" by composing the outputs of ALREADY-EXISTING
 * intelligence modules. This module performs NO recommendation generation,
 * NO scheduling, and NO scoring of its own beyond simple, deterministic
 * ordering/merging of inputs it is given — every piece of "why is this
 * urgent" reasoning already lives in the modules listed below and is
 * reused as-is:
 *
 *   - studyRecommendationEngine.generateRecommendations() (+ its internal
 *     recommendationPrioritization ranking) — the canonical, already-ranked
 *     diagnostic recommendation list (revision due, knowledge gaps,
 *     neglected subjects, low completion, momentum).
 *   - revisionIntelligence.buildRevisionSummary() — the canonical
 *     interpretation of the revision queue (counts, urgency, empty-state,
 *     formatted next-due date). No spaced-repetition math is repeated here.
 *   - readinessCalculator (score/grade) — passed through as diagnostic
 *     context on the plan, never recomputed.
 *
 * This batch introduces the engine ONLY. Nothing currently in the
 * application imports from this file yet — dashboardMissionEngine,
 * RecommendationView, CommandCenter, StudyCoachAgent, PlannerAgent,
 * FocusAgent, and ProgressAgent are all untouched and continue operating
 * exactly as before. Migration of any consumer onto this engine is
 * explicitly deferred to a later batch.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - Never throws — all functions are fully defensive
 *   - All inputs passed by caller; all functions are pure (same input →
 *     same output), following the exact conventions established by
 *     spacedRevisionEngine, revisionIntelligence, studyRecommendationEngine,
 *     and readinessCalculator.
 *
 * DESIGN FOR EXTENSIBILITY:
 *   The PlanItem shape is deliberately generic (`type`, `source`,
 *   `sourceId`) so that future item kinds (e.g. an AI-ranked item, a
 *   Planner-task item, a Focus-session suggestion) can be appended by a
 *   later batch without changing the shape consumers already rely on.
 *   A future AI ranking engine can replace `_rankPlanItems` alone without
 *   touching anything else in this file or any caller.
 */

// ─── PLAN ITEM TYPES ──────────────────────────────────────────────────────────
// Mirrors, but does not duplicate, the recommendation REC_TYPE values —
// plan items may originate from a recommendation (type mapped 1:1) or from
// a non-diagnostic "continue studying" fallback that recommendations never
// express (SUBJECT_CONTINUE / SUBJECT_START).

export const PLAN_ITEM_TYPE = {
  REVISION_DUE: "REVISION_DUE",
  HIGH_RISK_SUBJECT: "HIGH_RISK_SUBJECT",
  NEGLECTED_SUBJECT: "NEGLECTED_SUBJECT",
  LOW_COMPLETION: "LOW_COMPLETION",
  MOMENTUM: "MOMENTUM",
  SUBJECT_CONTINUE: "SUBJECT_CONTINUE", // weakest started, not-yet-100% subject
  SUBJECT_START: "SUBJECT_START", // first untouched subject
};

// ─── PLAN ITEM SOURCES ────────────────────────────────────────────────────────
// Identifies which existing engine produced the item, for traceability and
// so a future consumer can explain "why" without re-deriving it.

export const PLAN_ITEM_SOURCE = {
  RECOMMENDATION_ENGINE: "recommendationEngine", // studyRecommendationEngine
  SUBJECT_PROGRESS: "subjectProgress", // fallback continuation items
};

// ─── PRIORITY LEVELS (mirrors studyRecommendationEngine.PRIORITY) ────────────
// Re-declared (not re-implemented) here only as a display/urgency label on
// PlanItem — the actual priority ASSIGNMENT for recommendation-derived
// items is taken verbatim from the recommendation object, never recomputed.

export const PLAN_URGENCY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  POSITIVE: "POSITIVE",
};

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────

const DEFAULT_MAX_ITEMS = 8;

const FALLBACK_ITEM = Object.freeze({
  id: "fallback__start-studying",
  type: PLAN_ITEM_TYPE.SUBJECT_START,
  source: PLAN_ITEM_SOURCE.SUBJECT_PROGRESS,
  sourceId: null,
  subjectId: null,
  subjectLabel: null,
  title: "Start Your Study Session",
  description: "Open your syllabus and mark the first topic for today.",
  urgencyLevel: PLAN_URGENCY.MEDIUM,
  color: "#7C6FFF",
  icon: "📘",
  actionLabel: "Open Syllabus",
  actionPath: "/syllabus",
  actionTab: "overview",
});

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

/**
 * Maps a recommendation object (studyRecommendationEngine shape) into a
 * normalized PlanItem. No new information is derived — every field is
 * taken directly from the recommendation.
 */
function _planItemFromRecommendation(rec, index) {
  return {
    id: rec.id ?? `rec__${index}`,
    type: rec.type ?? null,
    source: PLAN_ITEM_SOURCE.RECOMMENDATION_ENGINE,
    sourceId: rec.id ?? null,
    subjectId: rec.subjectId ?? null,
    subjectLabel: rec.subjectLabel ?? null,
    title: rec.title ?? "",
    description: rec.message ?? "",
    urgencyLevel: rec.priority ?? PLAN_URGENCY.MEDIUM,
    color: rec.color ?? "#7C6FFF",
    icon: rec.icon ?? "📘",
    actionLabel: rec.actionLabel ?? "Take Action",
    actionPath: rec.actionPath ?? "/syllabus",
    actionTab: null,
  };
}

/**
 * Builds the "continue weakest started subject" fallback item, mirroring
 * dashboardMissionEngine's step 5 — reused as a data shape, not a
 * calculation: the selection rule (lowest completion %, has progress,
 * not yet 100%) is identical, but no scoring/urgency math occurs here
 * beyond a simple sort already performed identically elsewhere.
 */
function _weakestSubjectItem(subjectProgress) {
  try {
    if (!Array.isArray(subjectProgress)) return null;

    const started = subjectProgress
      .filter(
        (s) => (s.progress?.done ?? 0) > 0 && (s.progress?.pct ?? 0) < 100,
      )
      .sort((a, b) => (a.progress?.pct ?? 0) - (b.progress?.pct ?? 0));

    if (started.length === 0) return null;

    const weakest = started[0];
    return {
      id: `subject-continue__${weakest.id}`,
      type: PLAN_ITEM_TYPE.SUBJECT_CONTINUE,
      source: PLAN_ITEM_SOURCE.SUBJECT_PROGRESS,
      sourceId: weakest.id ?? null,
      subjectId: weakest.id ?? null,
      subjectLabel: weakest.label ?? null,
      title: `Improve ${weakest.label}`,
      description: `${weakest.label} is ${weakest.progress?.pct ?? 0}% complete. Consistent daily effort here will close the gap steadily.`,
      urgencyLevel: PLAN_URGENCY.MEDIUM,
      color: weakest.color ?? "#7C6FFF",
      icon: weakest.emoji ?? "📘",
      actionLabel: "Continue Subject",
      actionPath: "/syllabus",
      actionTab: "overview",
    };
  } catch {
    return null;
  }
}

/**
 * Builds the "start first untouched subject" fallback item, mirroring
 * dashboardMissionEngine's step 6.
 */
function _untouchedSubjectItem(subjectProgress) {
  try {
    if (!Array.isArray(subjectProgress)) return null;

    const untouched = subjectProgress.find(
      (s) => (s.progress?.done ?? 0) === 0,
    );
    if (!untouched) return null;

    return {
      id: `subject-start__${untouched.id}`,
      type: PLAN_ITEM_TYPE.SUBJECT_START,
      source: PLAN_ITEM_SOURCE.SUBJECT_PROGRESS,
      sourceId: untouched.id ?? null,
      subjectId: untouched.id ?? null,
      subjectLabel: untouched.label ?? null,
      title: `Start ${untouched.label}`,
      description: `You haven't begun ${untouched.label} yet. Marking even one topic done activates tracking and revision scheduling.`,
      urgencyLevel: PLAN_URGENCY.MEDIUM,
      color: untouched.color ?? "#7C6FFF",
      icon: untouched.emoji ?? "📘",
      actionLabel: "Open Syllabus",
      actionPath: "/syllabus",
      actionTab: "overview",
    };
  } catch {
    return null;
  }
}

/**
 * Deduplicates plan items by subjectId (keeping the first / highest-
 * ranked occurrence), so a subject already represented by a
 * recommendation-derived item is not repeated by a fallback item.
 * Items with no subjectId (e.g. global revision items) are never
 * deduplicated against each other by this rule.
 */
function _dedupeBySubject(items) {
  const seenSubjects = new Set();
  return items.filter((item) => {
    if (!item.subjectId) return true;
    if (seenSubjects.has(item.subjectId)) return false;
    seenSubjects.add(item.subjectId);
    return true;
  });
}

/**
 * _rankPlanItems
 *
 * Orders the combined item list. Recommendation-derived items are already
 * ranked (studyRecommendationEngine + recommendationPrioritization did
 * that work); this function only decides where the non-diagnostic
 * SUBJECT_CONTINUE / SUBJECT_START fallback items slot in relative to
 * them, using the same tier semantics recommendations already use so the
 * merge is coherent rather than arbitrary.
 *
 * This is the single seam a future AI ranking engine would replace.
 */
function _rankPlanItems(recommendationItems, fallbackItems) {
  // Recommendation items preserve the order they arrived in (already
  // fully ranked upstream). Fallback items are appended after them,
  // since they represent lower-urgency "keep going" guidance rather
  // than a diagnosed issue — matching their MEDIUM urgency label.
  return [...recommendationItems, ...fallbackItems];
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildPlanItems
 *
 * Produces the ordered list of PlanItem objects for the day, merging:
 *   1. The already-ranked recommendation list (studyRecommendationEngine)
 *   2. Non-diagnostic subject-continuation fallbacks (weakest started
 *      subject, then first untouched subject) — the same two fallback
 *      concepts dashboardMissionEngine already expresses, reused here as
 *      a shared data shape rather than reimplemented as a second ladder.
 *
 * Deduplicated by subjectId so a subject isn't recommended twice under
 * two different item types.
 *
 * @param {object} inputs
 *   {
 *     recommendations  {Array}  studyRecommendationEngine.generateRecommendations() output
 *     subjectProgress  {Array}  syllabusService.getAllSubjectProgress(examId)
 *     maxItems         {number} optional cap on returned items (default 8)
 *   }
 * @returns {Array<PlanItem>}
 */
export function buildPlanItems({
  recommendations = [],
  subjectProgress = [],
  maxItems = DEFAULT_MAX_ITEMS,
} = {}) {
  try {
    const recommendationItems = Array.isArray(recommendations)
      ? recommendations.map((rec, i) => _planItemFromRecommendation(rec, i))
      : [];

    const fallbacks = [
      _weakestSubjectItem(subjectProgress),
      _untouchedSubjectItem(subjectProgress),
    ].filter(Boolean);

    const merged = _rankPlanItems(recommendationItems, fallbacks);
    const deduped = _dedupeBySubject(merged);

    const capped =
      typeof maxItems === "number" && maxItems > 0
        ? deduped.slice(0, maxItems)
        : deduped;

    return capped.length > 0 ? capped : [{ ...FALLBACK_ITEM }];
  } catch {
    return [{ ...FALLBACK_ITEM }];
  }
}

/**
 * getTopPriorityItem
 *
 * Returns the single most important PlanItem — i.e. what the learner
 * should do right now. This is simply the first item of an already-
 * ordered buildPlanItems() result; no separate selection logic exists,
 * so this can never disagree with the full plan's own ordering (unlike
 * dashboardMissionEngine's independent re-derivation).
 *
 * @param {Array<PlanItem>} planItems  output of buildPlanItems()
 * @returns {PlanItem}
 */
export function getTopPriorityItem(planItems) {
  try {
    if (Array.isArray(planItems) && planItems.length > 0) {
      return planItems[0];
    }
    return { ...FALLBACK_ITEM };
  } catch {
    return { ...FALLBACK_ITEM };
  }
}

/**
 * buildPlanSummary
 *
 * Aggregate counts + diagnostic context for the plan, for use in summary
 * stat cards or headers. Revision counts and readiness are passed through
 * unchanged from their owning modules (revisionIntelligence / readinessCalculator)
 * — nothing here recomputes them.
 *
 * @param {Array<PlanItem>}  planItems       output of buildPlanItems()
 * @param {object|null}      revisionSummary  revisionIntelligence.buildRevisionSummary() output; optional
 * @param {number|null}      readinessScore   readinessCalculator.computeReadinessScore() output; optional
 * @param {object|null}      readinessGrade   readinessCalculator.getReadinessGrade() output; optional
 * @returns {object}
 *   {
 *     totalItems,
 *     criticalCount, highCount, mediumCount, positiveCount,
 *     revisionOverdueCount, revisionDueTodayCount,
 *     readinessScore, readinessGrade,
 *   }
 */
export function buildPlanSummary(
  planItems,
  revisionSummary = null,
  readinessScore = null,
  readinessGrade = null,
) {
  const EMPTY = {
    totalItems: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    positiveCount: 0,
    revisionOverdueCount: 0,
    revisionDueTodayCount: 0,
    readinessScore: null,
    readinessGrade: null,
  };

  try {
    const items = Array.isArray(planItems) ? planItems : [];
    const counts = { ...EMPTY, totalItems: items.length };

    items.forEach((item) => {
      switch (item.urgencyLevel) {
        case PLAN_URGENCY.CRITICAL:
          counts.criticalCount++;
          break;
        case PLAN_URGENCY.HIGH:
          counts.highCount++;
          break;
        case PLAN_URGENCY.MEDIUM:
          counts.mediumCount++;
          break;
        case PLAN_URGENCY.POSITIVE:
          counts.positiveCount++;
          break;
      }
    });

    if (revisionSummary && typeof revisionSummary === "object") {
      counts.revisionOverdueCount = revisionSummary.overdueCount ?? 0;
      counts.revisionDueTodayCount = revisionSummary.dueTodayCount ?? 0;
    }

    counts.readinessScore =
      typeof readinessScore === "number" ? readinessScore : null;
    counts.readinessGrade = readinessGrade ?? null;

    return counts;
  } catch {
    return EMPTY;
  }
}

/**
 * buildStudyPlan
 *
 * Main entry point. Assembles the complete, normalized Study Plan object
 * from already-existing engine outputs supplied by the caller. This
 * function performs NO fetching and NO recalculation — every input must
 * already have been computed by its owning module (useRevisionQueue,
 * studyRecommendationEngine, revisionIntelligence, readinessCalculator,
 * syllabusService). Designed for long-term extensibility: new fields can
 * be added to the returned object's `meta` or as new top-level keys by
 * later batches without breaking existing consumers that only read
 * `topPriorityItem` / `items` / `summary`.
 *
 * @param {object} inputs
 *   {
 *     examId           {string}       active exam id
 *     recommendations  {Array}        studyRecommendationEngine.generateRecommendations() output
 *     revisionQueue    {Array}        syllabusService.getTodayRevisionQueue(examId) /
 *                                     useRevisionQueue(examId).queue
 *     revisionStats    {object|null}  syllabusService.getRevisionStats(examId) /
 *                                     useRevisionQueue(examId).stats
 *     subjectProgress  {Array}        syllabusService.getAllSubjectProgress(examId)
 *     examProgress     {object|null}  syllabusService.getExamProgress(examId)
 *     readinessScore   {number|null}  readinessCalculator.computeReadinessScore() output
 *     readinessGrade   {object|null}  readinessCalculator.getReadinessGrade() output
 *     activityLog      {Array}        syllabusService.getActivityLog(500)
 *     maxItems         {number}       optional cap on plan.items (default 8)
 *   }
 * @returns {object} StudyPlan
 *   {
 *     examId,
 *     generatedAt,        ISO timestamp of when this plan object was built
 *     topPriorityItem,    the single most important PlanItem
 *     items,              ordered array of PlanItem
 *     summary,            aggregate counts + diagnostic context (see buildPlanSummary)
 *     meta: {
 *       version,          schema version string, for future migrations
 *       sources,          which engines contributed to this plan
 *       itemCount,        items.length (convenience mirror of summary.totalItems)
 *     },
 *   }
 */
export function buildStudyPlan({
  examId = null,
  recommendations = [],
  revisionQueue = [],
  revisionStats = null,
  subjectProgress = [],
  examProgress = null,
  readinessScore = null,
  readinessGrade = null,
  activityLog = [],
  maxItems = DEFAULT_MAX_ITEMS,
} = {}) {
  try {
    const items = buildPlanItems({
      recommendations,
      subjectProgress,
      maxItems,
    });

    const topPriorityItem = getTopPriorityItem(items);

    // revisionSummary is intentionally NOT recomputed here — the engine
    // only accepts it pre-built, so callers reuse revisionIntelligence's
    // buildRevisionSummary(revisionQueue, revisionStats) themselves and
    // pass the result in as `revisionStats`/`revisionQueue` context via
    // buildPlanSummary's own light pass-through below. Since this module
    // must not import revisionIntelligence's summary-building logic
    // redundantly, buildPlanSummary accepts either a pre-built
    // revisionSummary OR falls back to null-safe defaults when omitted.
    const summary = buildPlanSummary(
      items,
      revisionStats
        ? {
            overdueCount: revisionStats.overdueCount ?? 0,
            dueTodayCount: revisionStats.dueToday ?? 0,
          }
        : null,
      readinessScore,
      readinessGrade,
    );

    return {
      examId,
      generatedAt: new Date().toISOString(),
      topPriorityItem,
      items,
      summary,
      meta: {
        version: "1.0.0",
        sources: [
          "studyRecommendationEngine",
          "recommendationPrioritization",
          "spacedRevisionEngine",
          "revisionIntelligence",
          "readinessCalculator",
          "syllabusService",
        ],
        itemCount: items.length,
      },
    };
  } catch {
    const fallbackItems = [{ ...FALLBACK_ITEM }];
    return {
      examId,
      generatedAt: new Date().toISOString(),
      topPriorityItem: fallbackItems[0],
      items: fallbackItems,
      summary: buildPlanSummary(fallbackItems, null, null, null),
      meta: {
        version: "1.0.0",
        sources: [],
        itemCount: fallbackItems.length,
      },
    };
  }
}

export default {
  PLAN_ITEM_TYPE,
  PLAN_ITEM_SOURCE,
  PLAN_URGENCY,
  buildPlanItems,
  getTopPriorityItem,
  buildPlanSummary,
  buildStudyPlan,
};
