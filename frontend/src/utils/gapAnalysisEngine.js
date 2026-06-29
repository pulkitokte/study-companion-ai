/**
 * gapAnalysisEngine.js
 *
 * Pure gap analysis utility — Phase 32.
 * Cross-references syllabus completion against quiz performance
 * to surface knowledge gaps the user may not be aware of.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All inputs passed by caller
 */

// ─── RISK LEVEL CONSTANTS ─────────────────────────────────────────────────────

export const RISK_LEVEL = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  UNATTEMPTED: "unattempted",
};

// Priority sort order for display (highest risk first)
const RISK_SORT_ORDER = {
  [RISK_LEVEL.HIGH]: 0,
  [RISK_LEVEL.MEDIUM]: 1,
  [RISK_LEVEL.LOW]: 2,
  [RISK_LEVEL.UNATTEMPTED]: 3,
};

export const RISK_COLORS = {
  [RISK_LEVEL.HIGH]: "#FF6B6B",
  [RISK_LEVEL.MEDIUM]: "#FFB347",
  [RISK_LEVEL.LOW]: "#00FFC8",
  [RISK_LEVEL.UNATTEMPTED]: "#7C6FFF",
};

export const RISK_LABELS = {
  [RISK_LEVEL.HIGH]: "High Risk",
  [RISK_LEVEL.MEDIUM]: "Needs Practice",
  [RISK_LEVEL.LOW]: "Strong Area",
  [RISK_LEVEL.UNATTEMPTED]: "No Quiz Data",
};

// ─── RISK CLASSIFICATION ──────────────────────────────────────────────────────

/**
 * Classifies a single subject into a risk level.
 *
 * Rules:
 *   UNATTEMPTED → completion > 0 AND no quiz data
 *   HIGH        → completion >= 70% AND accuracy < 60%
 *   MEDIUM      → completion >= 40% AND accuracy >= 60 AND accuracy < 75
 *   LOW         → completion >= 70% AND accuracy >= 75
 *   null        → insufficient data (no completion, no quiz) — excluded
 */
function _classifyRisk(completionPct, quizAccuracy, hasQuizData) {
  if (completionPct <= 0) return null; // not started — not enough data

  if (!hasQuizData) return RISK_LEVEL.UNATTEMPTED;

  if (completionPct >= 70 && quizAccuracy < 60) return RISK_LEVEL.HIGH;
  if (completionPct >= 40 && quizAccuracy >= 60 && quizAccuracy < 75)
    return RISK_LEVEL.MEDIUM;
  if (completionPct >= 70 && quizAccuracy >= 75) return RISK_LEVEL.LOW;

  // Catch-all for intermediate states (started but < 40% + has quiz data)
  if (completionPct > 0 && hasQuizData) {
    if (quizAccuracy < 60) return RISK_LEVEL.HIGH;
    return RISK_LEVEL.MEDIUM;
  }

  return null;
}

/**
 * Generates a recommendation string for a given risk level and subject.
 */
function _buildRecommendation(
  riskLevel,
  subjectLabel,
  completionPct,
  quizAccuracy,
) {
  switch (riskLevel) {
    case RISK_LEVEL.HIGH:
      return `You have completed ${completionPct}% of ${subjectLabel} but quiz accuracy is only ${quizAccuracy}%. This gap indicates surface-level coverage without deep understanding. Prioritise immediate revision.`;

    case RISK_LEVEL.MEDIUM:
      return `${subjectLabel} shows moderate quiz accuracy (${quizAccuracy}%) against ${completionPct}% syllabus coverage. Practice additional quizzes to solidify understanding before the exam.`;

    case RISK_LEVEL.LOW:
      return `Strong understanding of ${subjectLabel} — ${quizAccuracy}% quiz accuracy across ${completionPct}% completion. Maintain through periodic revision to preserve retention.`;

    case RISK_LEVEL.UNATTEMPTED:
      return `You have covered ${completionPct}% of ${subjectLabel} in the syllabus but have not attempted any quizzes for this subject. Take a quiz to validate your understanding.`;

    default:
      return "";
  }
}

/**
 * Action message — short, card-level prompt.
 */
function _actionMessage(riskLevel) {
  switch (riskLevel) {
    case RISK_LEVEL.HIGH:
      return "Prioritize revision immediately.";
    case RISK_LEVEL.MEDIUM:
      return "Practice additional quizzes.";
    case RISK_LEVEL.LOW:
      return "Strong understanding. Maintain through revision.";
    case RISK_LEVEL.UNATTEMPTED:
      return "No quiz attempts found for this subject.";
    default:
      return "";
  }
}

// ─── QUIZ HISTORY PROCESSING ─────────────────────────────────────────────────

/**
 * Builds a map of { subjectId → { totalQ, correctQ, accuracy } }
 * from the raw quiz history array.
 *
 * Quiz session objects are expected to contain:
 *   { subject (id or label), total, correct, ... }
 *
 * The engine tries both `subject` (id) and `subjectId` fields to be
 * maximally compatible with different quiz session shapes.
 */
function _buildQuizAccuracyMap(quizHistory) {
  const map = {};

  if (!Array.isArray(quizHistory)) return map;

  quizHistory.forEach((session) => {
    // Support both field name conventions
    const subjectKey = session.subjectId ?? session.subject ?? null;
    if (!subjectKey) return;

    const total = session.total ?? session.totalQuestions ?? 0;
    const correct = session.correct ?? session.correctAnswers ?? 0;

    if (total <= 0) return;

    if (!map[subjectKey]) {
      map[subjectKey] = { totalQ: 0, correctQ: 0 };
    }
    map[subjectKey].totalQ += total;
    map[subjectKey].correctQ += correct;
  });

  // Compute accuracy for each subject
  Object.keys(map).forEach((key) => {
    const { totalQ, correctQ } = map[key];
    map[key].accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
  });

  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * analyzeKnowledgeGaps
 *
 * Cross-references syllabus subject progress against quiz history
 * to produce a sorted array of gap analysis results.
 *
 * @param {Array}  subjectProgress  syllabusService.getAllSubjectProgress(examId)
 *                                  each item: { id, label, emoji, color, progress }
 * @param {Array}  quizHistory      getQuizHistory() result
 * @returns {Array} sorted gap items:
 *   [{
 *     id, subject, emoji, color,
 *     completionPct, masteredCount, revisedCount, totalTopics, doneTopics,
 *     quizAccuracy, totalQuizQuestions, hasQuizData,
 *     riskLevel, riskColor, riskLabel,
 *     recommendation, actionMessage,
 *   }]
 */
export function analyzeKnowledgeGaps(subjectProgress, quizHistory) {
  try {
    if (!Array.isArray(subjectProgress) || subjectProgress.length === 0)
      return [];

    const accuracyMap = _buildQuizAccuracyMap(quizHistory);

    const results = [];

    subjectProgress.forEach((subject) => {
      const progress = subject.progress ?? {};

      const completionPct = progress.pct ?? 0;
      const masteredCount = progress.mastered ?? 0;
      const revisedCount = progress.revised ?? 0;
      const totalTopics = progress.total ?? 0;
      const doneTopics = progress.done ?? 0;

      // Skip subjects with zero coverage — not enough signal
      if (completionPct <= 0 && totalTopics === 0) return;

      // Match quiz accuracy by subject id (primary) or subject label (fallback)
      const quizData =
        accuracyMap[subject.id] ?? accuracyMap[subject.label] ?? null;

      const hasQuizData = quizData !== null && (quizData.totalQ ?? 0) > 0;
      const quizAccuracy = hasQuizData ? quizData.accuracy : 0;
      const totalQuizQuestions = hasQuizData ? quizData.totalQ : 0;

      const riskLevel = _classifyRisk(completionPct, quizAccuracy, hasQuizData);
      if (riskLevel === null) return; // not enough data to classify

      results.push({
        id: subject.id,
        subject: subject.label ?? subject.id,
        emoji: subject.emoji ?? "📚",
        color: subject.color ?? "#7C6FFF",
        completionPct,
        masteredCount,
        revisedCount,
        totalTopics,
        doneTopics,
        quizAccuracy,
        totalQuizQuestions,
        hasQuizData,
        riskLevel,
        riskColor: RISK_COLORS[riskLevel] ?? "#888",
        riskLabel: RISK_LABELS[riskLevel] ?? riskLevel,
        recommendation: _buildRecommendation(
          riskLevel,
          subject.label ?? subject.id,
          completionPct,
          quizAccuracy,
        ),
        actionMessage: _actionMessage(riskLevel),
      });
    });

    // Sort: High → Medium → Low → Unattempted
    // Within same risk level: lowest quiz accuracy first (worst gaps first)
    results.sort((a, b) => {
      const orderDiff =
        (RISK_SORT_ORDER[a.riskLevel] ?? 99) -
        (RISK_SORT_ORDER[b.riskLevel] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      return (a.quizAccuracy ?? 0) - (b.quizAccuracy ?? 0);
    });

    return results;
  } catch {
    return [];
  }
}

/**
 * buildGapSummary
 *
 * Derives aggregate counts from the gap analysis result array.
 *
 * @param {Array} gapItems  output of analyzeKnowledgeGaps()
 * @returns {{
 *   highRiskCount,
 *   mediumRiskCount,
 *   lowRiskCount,
 *   unattemptedCount,
 *   totalAnalyzed,
 * }}
 */
export function buildGapSummary(gapItems) {
  const EMPTY = {
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    unattemptedCount: 0,
    totalAnalyzed: 0,
  };

  try {
    if (!Array.isArray(gapItems) || gapItems.length === 0) return EMPTY;

    const counts = { ...EMPTY, totalAnalyzed: gapItems.length };

    gapItems.forEach((item) => {
      switch (item.riskLevel) {
        case RISK_LEVEL.HIGH:
          counts.highRiskCount++;
          break;
        case RISK_LEVEL.MEDIUM:
          counts.mediumRiskCount++;
          break;
        case RISK_LEVEL.LOW:
          counts.lowRiskCount++;
          break;
        case RISK_LEVEL.UNATTEMPTED:
          counts.unattemptedCount++;
          break;
      }
    });

    return counts;
  } catch {
    return EMPTY;
  }
}

export default {
  analyzeKnowledgeGaps,
  buildGapSummary,
  RISK_LEVEL,
  RISK_COLORS,
  RISK_LABELS,
};
