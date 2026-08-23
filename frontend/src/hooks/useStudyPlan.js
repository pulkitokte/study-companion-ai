/**
 * useStudyPlan.js
 *
 * Phase 37 Batch D — React Integration Layer for the Unified Study Plan.
 *
 * Single entry point for any future UI component that consumes the
 * Study Plan produced by studyPlanEngine.js. Follows the exact
 * architectural conventions established by useRevisionQueue.js
 * (Phase 36 Batch A), useGlobalStats() (Phase 35 Batch F), and
 * useSyllabusSyncListener.js (Phase 35 Batch E/G):
 *
 *   - Fetches/composes on mount, exposes { ..., loading, refresh }
 *   - Subscribes to the SAME shared sync primitive every other syllabus-
 *     derived hook already uses (same-tab custom event + cross-tab
 *     storage event) — no new event, no new global state introduced.
 *   - Fully defensive: never throws, always returns safe fallback data.
 *
 * This hook performs NO recommendation generation, NO ranking, and NO
 * scoring of its own. It only:
 *   1. Reads the same raw inputs studyRecommendationEngine /
 *      readinessCalculator / studyPlanEngine already expect
 *      (subjectProgress, examProgress, activityLog, quizHistory,
 *      revisionQueue/stats, gapItems).
 *   2. Calls the existing pure engines in the existing order
 *      (gapAnalysisEngine → studyRecommendationEngine → readinessCalculator
 *      → studyPlanEngine), exactly mirroring the composition already
 *      performed today in SyllabusTracker.jsx / RecommendationView.jsx —
 *      no new business logic is introduced anywhere in this file.
 *   3. Hands the assembled inputs to studyPlanEngine.buildStudyPlan(),
 *      which does the actual orchestration.
 *
 * NOT WIRED TO ANY UI YET. Nothing currently imports this hook — it is
 * inert until a future migration batch adopts it in a consumer
 * (Dashboard, CommandCenter, RecommendationView, RevisionView, or any
 * agent, all of which remain completely unmodified by this batch).
 */

import { useState, useEffect, useCallback } from "react";
import syllabusService from "../services/syllabusService.js";
import { getQuizHistory } from "../utils/quizStorage.js";
import { analyzeKnowledgeGaps } from "../utils/gapAnalysisEngine.js";
import { generateRecommendations } from "../utils/studyRecommendationEngine.js";
import {
  computeReadinessScore,
  getReadinessGrade,
} from "../utils/readinessCalculator.js";
import { buildStudyPlan } from "../utils/studyPlanEngine.js";
import { useRevisionQueue } from "./useRevisionQueue.js";
import { useSyllabusSyncListener } from "./useSyllabusSyncListener.js";

const EMPTY_PLAN = Object.freeze({
  examId: null,
  generatedAt: null,
  topPriorityItem: null,
  items: [],
  summary: {
    totalItems: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    positiveCount: 0,
    revisionOverdueCount: 0,
    revisionDueTodayCount: 0,
    readinessScore: null,
    readinessGrade: null,
  },
  meta: {
    version: "1.0.0",
    sources: [],
    itemCount: 0,
  },
});

/**
 * useStudyPlan
 *
 * @param {string} examId  active exam id ('upsc' | 'ssc_cgl' | 'banking_po')
 * @returns {{
 *   plan:            object,        the full StudyPlan (studyPlanEngine.buildStudyPlan output)
 *   topPriorityItem: object|null,   convenience mirror of plan.topPriorityItem
 *   items:           Array,         convenience mirror of plan.items
 *   summary:         object,        convenience mirror of plan.summary
 *   generatedAt:     string|null,   convenience mirror of plan.generatedAt
 *   loading:         boolean,       true only during the very first build
 *   refresh:         () => void,    manually rebuild the plan
 * }}
 */
export function useStudyPlan(examId) {
  const [plan, setPlan] = useState(EMPTY_PLAN);
  const [loading, setLoading] = useState(true);

  // Reuse the existing Batch A/B/C revision architecture wholesale —
  // no duplicate fetching of the revision queue or its stats.
  const { queue: revisionQueue, stats: revisionStats } =
    useRevisionQueue(examId);

  const buildPlan = useCallback(() => {
    try {
      // ── Gather raw inputs (same shapes SyllabusTracker/RecommendationView
      // already gather today — no new logic, only reuse) ─────────────────
      let subjectProgress = [];
      let examProgress = null;
      let activityLog = [];
      let quizHistory = [];

      try {
        subjectProgress = syllabusService.getAllSubjectProgress(examId) ?? [];
      } catch {
        subjectProgress = [];
      }

      try {
        examProgress = syllabusService.getExamProgress(examId);
      } catch {
        examProgress = null;
      }

      try {
        activityLog = syllabusService.getActivityLog(500) ?? [];
      } catch {
        activityLog = [];
      }

      try {
        quizHistory = getQuizHistory() ?? [];
      } catch {
        quizHistory = [];
      }

      const quizStats =
        quizHistory.length > 0
          ? {
              totalQuestions: quizHistory.reduce(
                (s, q) => s + (q.total ?? 0),
                0,
              ),
              correctAnswers: quizHistory.reduce(
                (s, q) => s + (q.correct ?? 0),
                0,
              ),
            }
          : null;

      // ── Existing pure engines, called in the existing order ────────────
      const gapItems = analyzeKnowledgeGaps(subjectProgress, quizHistory);

      const recommendations = generateRecommendations({
        subjectProgress,
        examProgress,
        activityLog,
        quizHistory,
        revisionQueue,
        gapItems,
      });

      const readinessScore = computeReadinessScore(
        examProgress,
        quizStats,
        revisionStats,
      );
      const readinessGrade = getReadinessGrade(readinessScore);

      // ── Orchestration only — studyPlanEngine does no calculation of
      // its own beyond merging/ordering these already-computed inputs ───
      const nextPlan = buildStudyPlan({
        examId,
        recommendations,
        revisionQueue,
        revisionStats,
        subjectProgress,
        examProgress,
        readinessScore,
        readinessGrade,
        activityLog,
      });

      setPlan(nextPlan ?? EMPTY_PLAN);
    } catch {
      setPlan({ ...EMPTY_PLAN, examId });
    } finally {
      setLoading(false);
    }
  }, [examId, revisionQueue, revisionStats]);

  useEffect(() => {
    setLoading(true);
    buildPlan();
  }, [buildPlan]);

  // Reuse the existing shared sync architecture (same-tab custom event +
  // cross-tab storage event) — no new listener mechanism introduced.
  // Filtered to matching examId exactly as useRevisionQueue/RevisionView
  // already do, so an update concerning a different exam does not trigger
  // an unnecessary rebuild.
  useSyllabusSyncListener(
    useCallback(
      (detail) => {
        if (detail && detail.examId && detail.examId !== examId) {
          return;
        }
        buildPlan();
      },
      [examId, buildPlan],
    ),
  );

  return {
    plan,
    topPriorityItem: plan?.topPriorityItem ?? null,
    items: plan?.items ?? [],
    summary: plan?.summary ?? EMPTY_PLAN.summary,
    generatedAt: plan?.generatedAt ?? null,
    loading,
    refresh: buildPlan,
  };
}

export default useStudyPlan;