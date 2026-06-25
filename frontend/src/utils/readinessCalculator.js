/**
 * readinessCalculator.js
 *
 * Pure scoring functions for the Exam Readiness system.
 *
 * Constraints:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 *   - All inputs passed by caller
 */

// ─── GRADE TABLE ──────────────────────────────────────────────────────────────

export const READINESS_GRADES = [
  {
    min: 90,
    max: 100,
    label: "Exam Ready",
    emoji: "🏆",
    color: "#00FFC8",
    description: "Outstanding preparation. You are fully ready for exam day.",
  },
  {
    min: 70,
    max: 89,
    label: "Strong Position",
    emoji: "⚡",
    color: "#7C6FFF",
    description: "Solid coverage. Focus on mastering remaining weak areas.",
  },
  {
    min: 40,
    max: 69,
    label: "On Track",
    emoji: "📈",
    color: "#FFB347",
    description: "Good progress. Keep building momentum across all subjects.",
  },
  {
    min: 0,
    max: 39,
    label: "Needs Work",
    emoji: "📚",
    color: "#FF6B2B",
    description:
      "Early stage. Consistent daily effort will build momentum fast.",
  },
];

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

function _clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function _pct(numerator, denominator) {
  if (!denominator || denominator <= 0) return 0;
  return _clamp((numerator / denominator) * 100);
}

// ─── COMPONENT SCORES ─────────────────────────────────────────────────────────

/**
 * Syllabus completion score (0–100).
 * Directly uses examProgress.pct — already accounts for all topic statuses.
 */
function _completionScore(examProgress) {
  return _clamp(examProgress?.pct ?? 0);
}

/**
 * Mastery ratio score (0–100).
 * mastered / total topics expressed as a percentage.
 */
function _masteryScore(examProgress) {
  const mastered = examProgress?.mastered ?? 0;
  const total = examProgress?.total ?? 0;
  return _pct(mastered, total);
}

/**
 * Revision backlog penalty score (0–100, higher = better).
 * No revision backlog → 100. Full backlog → 0.
 * Penalty is proportional to (revisionNeeded / done).
 */
function _revisionScore(examProgress) {
  const revisionNeeded = examProgress?.revisionNeeded ?? 0;
  const done = examProgress?.done ?? 0;

  if (done === 0) return 100; // No completed topics yet — no penalty

  // Backlog ratio: what fraction of done topics are in review queue
  const backlogRatio = _clamp(revisionNeeded / done);
  // Invert: 0 backlog → score 100; full backlog → score 0
  return _clamp(100 - backlogRatio * 100);
}

/**
 * Quiz performance score (0–100).
 * Uses overall quiz accuracy if quizStats is provided.
 * Falls back to 50 (neutral) so quiz absence doesn't tank the total.
 *
 * @param {object|null} quizStats - { totalQuestions, correctAnswers } or null
 */
function _quizScore(quizStats) {
  if (!quizStats) return 50; // Neutral fallback — user has not taken quizzes

  const total = quizStats.totalQuestions ?? 0;
  const correct = quizStats.correctAnswers ?? 0;

  if (total === 0) return 50;

  return _pct(correct, total);
}

// ─── EXPORTED FUNCTIONS ───────────────────────────────────────────────────────

/**
 * computeReadinessScore
 *
 * Returns a composite readiness score 0–100.
 *
 * Weights (from spec):
 *   40% completion   → how much of the syllabus is done
 *   20% mastery      → how many topics are fully mastered
 *   20% revision     → how clean the revision backlog is
 *   20% quiz         → quiz accuracy (neutral if no data)
 *
 * @param {object} examProgress  - syllabusService.getExamProgress() output
 * @param {object|null} quizStats - { totalQuestions, correctAnswers } or null
 * @returns {number} integer 0–100
 */
export function computeReadinessScore(examProgress, quizStats = null) {
  try {
    if (!examProgress || typeof examProgress !== "object") return 0;

    const completion = _completionScore(examProgress);
    const mastery = _masteryScore(examProgress);
    const revision = _revisionScore(examProgress);
    const quiz = _quizScore(quizStats);

    const raw = completion * 0.4 + mastery * 0.2 + revision * 0.2 + quiz * 0.2;

    return Math.round(_clamp(raw));
  } catch {
    return 0;
  }
}

/**
 * getReadinessGrade
 *
 * Returns the grade metadata object for a given score.
 *
 * @param {number} score - 0–100
 * @returns {object} from READINESS_GRADES
 */
export function getReadinessGrade(score) {
  const s = _clamp(typeof score === "number" ? score : 0);
  return (
    READINESS_GRADES.find((g) => s >= g.min && s <= g.max) ??
    READINESS_GRADES[READINESS_GRADES.length - 1]
  );
}

/**
 * getReadinessBreakdown
 *
 * Returns the four component scores for use in debug or detail views.
 *
 * @param {object}      examProgress
 * @param {object|null} quizStats
 * @returns {object} { completion, mastery, revision, quiz, total }
 */
export function getReadinessBreakdown(examProgress, quizStats = null) {
  try {
    const completion = _completionScore(examProgress);
    const mastery = _masteryScore(examProgress);
    const revision = _revisionScore(examProgress);
    const quiz = _quizScore(quizStats);

    return {
      completion: Math.round(completion),
      mastery: Math.round(mastery),
      revision: Math.round(revision),
      quiz: Math.round(quiz),
      total: Math.round(
        _clamp(completion * 0.4 + mastery * 0.2 + revision * 0.2 + quiz * 0.2),
      ),
    };
  } catch {
    return { completion: 0, mastery: 0, revision: 0, quiz: 0, total: 0 };
  }
}

/**
 * getReadinessRecommendation
 *
 * Returns an actionable single-line tip based on the weakest component.
 *
 * @param {object}      examProgress
 * @param {object|null} quizStats
 * @returns {string}
 */
export function getReadinessRecommendation(examProgress, quizStats = null) {
  try {
    const bd = getReadinessBreakdown(examProgress, quizStats);

    // Find the weakest weighted component
    const components = [
      {
        key: "completion",
        weighted: bd.completion * 0.4,
        score: bd.completion,
      },
      { key: "mastery", weighted: bd.mastery * 0.2, score: bd.mastery },
      { key: "revision", weighted: bd.revision * 0.2, score: bd.revision },
      { key: "quiz", weighted: bd.quiz * 0.2, score: bd.quiz },
    ].sort((a, b) => a.weighted - b.weighted);

    const weakest = components[0].key;

    const pending = (examProgress?.total ?? 0) - (examProgress?.done ?? 0);

    const tips = {
      completion:
        pending > 0
          ? `${pending} topic${pending !== 1 ? "s" : ""} remaining — mark at least 2 topics done every day.`
          : "All topics covered — focus on revision and mastery.",
      mastery: `Only ${examProgress?.mastered ?? 0} topics mastered. After revising, push topics to Mastered for full XP.`,
      revision: `${examProgress?.revisionNeeded ?? 0} topic${(examProgress?.revisionNeeded ?? 0) !== 1 ? "s" : ""} flagged for review. Clear your revision queue to strengthen your score.`,
      quiz:
        bd.quiz < 50
          ? "Quiz accuracy is low. Practice with the Quiz Arena to reinforce what you have studied."
          : "Take more quizzes linked to your completed subjects to validate your preparation.",
    };

    return (
      tips[weakest] ??
      "Keep going — consistent daily progress is the key to exam success."
    );
  } catch {
    return "Keep going — consistent daily progress is the key to exam success.";
  }
}
