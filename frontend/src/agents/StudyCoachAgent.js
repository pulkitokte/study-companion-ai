import { aggregateAll } from "../utils/globalStats.js";
import {
  getWeakSubjects,
  getTodaySummary,
  getDisplayName,
  getTargetExam,
} from "../utils/userProfile.js";
import {
  getCategoryBreakdown,
  getWeeklyTrend,
} from "../lib/analyticsEngine.js";
import { addMemoryEntry } from "../lib/agentMemory.js";
import syllabusService from "../services/syllabusService.js";
import { getQuizHistory } from "../utils/quizStorage.js";
import { analyzeKnowledgeGaps } from "../utils/gapAnalysisEngine.js";
import {
  generateRecommendations,
  REC_TYPE,
} from "../utils/studyRecommendationEngine.js";
import { getRecommendationScore } from "../utils/recommendationPrioritization.js";

// ─── LEARNING ANALYSIS ────────────────────────────────────────────────────────
function analyzeLearning(stats = null) {
  const s = stats ?? aggregateAll();
  const breakdown = getCategoryBreakdown();
  const weakIds = getWeakSubjects?.() ?? [];

  const weakSubjects = breakdown.filter(
    (c) => weakIds.includes(c.id) || c.accuracy < 60,
  );
  const strongSubjects = breakdown
    .filter((c) => c.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy);
  const trend = getWeeklyTrend();

  let summary;
  if (breakdown.length === 0) {
    summary =
      "You haven't taken any quizzes yet — start with a quick session to build your profile.";
  } else if (weakSubjects.length === 0) {
    summary = `Solid performance across all ${breakdown.length} subjects you've studied. Keep the momentum going!`;
  } else {
    summary = `${weakSubjects.length} subject${weakSubjects.length > 1 ? "s" : ""} need attention: ${weakSubjects
      .slice(0, 2)
      .map((w) => w.label)
      .join(", ")}.`;
  }

  return { stats: s, breakdown, weakSubjects, strongSubjects, trend, summary };
}

// ─── PERSONALIZED GUIDANCE ────────────────────────────────────────────────────
function getPersonalizedGuidance(stats = null) {
  const {
    weakSubjects,
    strongSubjects,
    trend,
    stats: s,
  } = analyzeLearning(stats);
  const tips = [];

  if (weakSubjects.length > 0) {
    const top = weakSubjects[0];
    tips.push({
      title: `Focus on ${top.label}`,
      detail: `Your accuracy in ${top.label} is ${top.accuracy}% — try a few short quiz sessions to reinforce weak areas.`,
      icon: top.emoji ?? "📘",
      color: top.color ?? "#FFB347",
    });
  }

  if (strongSubjects.length > 0) {
    const top = strongSubjects[0];
    tips.push({
      title: `${top.label} is your strength`,
      detail: `${top.accuracy}% accuracy! Consider tackling harder difficulty questions here for bonus XP.`,
      icon: top.emoji ?? "⭐",
      color: top.color ?? "#00FFC8",
    });
  }

  if (trend.trend === "down") {
    tips.push({
      title: "Activity dipped this week",
      detail: `XP is down ${Math.abs(trend.change)}% vs last week. A short session today can turn the trend around.`,
      icon: "📉",
      color: "#FF6B6B",
    });
  } else if (trend.trend === "up") {
    tips.push({
      title: "Great momentum!",
      detail: `You're up ${trend.change}% in weekly XP. Keep this consistency — it compounds fast.`,
      icon: "📈",
      color: "#00FF64",
    });
  }

  if ((s.streak ?? 0) >= 3) {
    tips.push({
      title: `${s.streak}-day streak`,
      detail: `Don't break the chain — even a 10-minute session today keeps your streak alive.`,
      icon: "🔥",
      color: "#FF6B2B",
    });
  }

  return tips.slice(0, 4);
}

// ─── DAILY BRIEFING ───────────────────────────────────────────────────────────
function getDailyBriefing(stats = null) {
  const s = stats ?? aggregateAll();
  const name = getDisplayName?.() ?? "Scholar";
  const exam = getTargetExam?.() ?? "your exam";
  const today = getTodaySummary?.() ?? {};

  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "Burning the midnight oil"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : hour < 21
            ? "Good evening"
            : "Late session 🔥";

  let motivational;
  if ((s.streak ?? 0) >= 7) {
    motivational = `${s.streak} days strong — you're building a habit that will carry you through ${exam}.`;
  } else if ((s.streak ?? 0) >= 1) {
    motivational = `You're on a ${s.streak}-day streak. Consistency beats intensity — keep showing up.`;
  } else {
    motivational = `Every session counts. Start small today and build from here.`;
  }

  const topPriority = getPersonalizedGuidance(s)[0] ?? {
    title: "Start your day",
    detail: "Pick a subject and complete one quiz to get your stats flowing.",
    icon: "🚀",
    color: "#7C6FFF",
  };

  // ── Phase 31: revision insight injected into daily briefing ───────────────
  const revisionInsight = _buildRevisionInsight();

  return {
    greeting: `${greeting}, ${name}`,
    motivational,
    summary: analyzeLearning(s).summary,
    todayXP: today.xpEarned ?? 0,
    todayMinutes: today.focusMinutes ?? 0,
    streak: s.streak ?? 0,
    topPriority,
    revisionInsight, // NEW — optional field; null when no revision data exists
  };
}

// ─── QUIZ-BASED RECOMMENDATIONS ───────────────────────────────────────────────
function getRecommendations(stats = null) {
  return getPersonalizedGuidance(stats).map((g, i) => ({
    agent: "coach",
    title: g.title,
    description: g.detail,
    category: "study",
    priority: 80 - i * 10,
    icon: g.icon,
    color: g.color,
    action: { label: "Go to Quiz Arena", path: "/quiz" },
  }));
}

// ─── PHASE 37 BATCH F.1: CANONICAL RECOMMENDATION ADAPTER ────────────────────

/**
 * _adaptCanonicalRecommendation
 *
 * Presentation-only adapter — maps a recommendation object produced by
 * studyRecommendationEngine.generateRecommendations() (already ranked by
 * recommendationPrioritization) into the existing StudyCoachAgent feed
 * shape { agent, title, description, category, priority, icon, color, action }.
 *
 * Performs NO recommendation generation, scoring, or ranking of its own.
 * `priority` is taken from recommendationPrioritization.getRecommendationScore()
 * — the same canonical, already-established scoring API every other
 * consumer of the recommendation pipeline relies on — never invented here.
 *
 * @param {object} rec      a single canonical recommendation object
 * @param {object} context  { subjectProgress, activityLog, revisionQueue } —
 *                          same context shape getRecommendationScore expects
 * @param {string} category agent-feed category label (e.g. "revision", "syllabus")
 * @returns {object} agent-feed shaped recommendation
 */
function _adaptCanonicalRecommendation(rec, context, category) {
  return {
    agent: "coach",
    title: rec.title,
    description: rec.message,
    category,
    priority: Math.round(getRecommendationScore(rec, context)),
    icon: rec.icon,
    color: rec.color,
    action: { label: rec.actionLabel, path: rec.actionPath },
  };
}

/**
 * _buildAlmostDoneRecommendation
 *
 * "Almost Done" has no canonical recommendation-type equivalent in
 * studyRecommendationEngine — it is preserved here as an explicitly
 * agent-specific, positive-framing nudge (per Phase 37 Batch F.1
 * instructions: not deleted, not silently merged into MOMENTUM).
 *
 * Its priority (79) is a fixed agent-presentation value, not a canonical
 * score — it does not compete with or attempt to replicate canonical
 * ranking, since no canonical type exists for this concept to score
 * against.
 *
 * @param {Array} subjects  syllabusService.getAllSubjectProgress(examId)
 * @returns {object|null}
 */
function _buildAlmostDoneRecommendation(subjects) {
  try {
    const almostDone = subjects
      .filter(
        (s) => (s.progress?.pct ?? 0) >= 80 && (s.progress?.pct ?? 0) < 100,
      )
      .sort((a, b) => (b.progress.pct ?? 0) - (a.progress.pct ?? 0));

    if (almostDone.length === 0) return null;

    const top = almostDone[0];
    const remaining = (top.progress.total ?? 0) - (top.progress.done ?? 0);

    return {
      agent: "coach",
      title: `Almost Done: ${top.label}`,
      description: `${top.label} is ${top.progress.pct}% complete — only ${remaining} topic${remaining > 1 ? "s" : ""} left. Finishing it unlocks a +200 XP subject completion bonus.`,
      category: "syllabus",
      priority: 79,
      icon: top.emoji ?? "🎯",
      color: top.color ?? "#00FFC8",
      action: { label: "Finish Subject", path: "/syllabus" },
    };
  } catch {
    return null;
  }
}

// ─── SYLLABUS RECOMMENDATIONS (Batch 9, migrated Phase 37 Batch F.1) ─────────

/**
 * getSyllabusRecommendations
 *
 * Phase 37 Batch F.1: HIGH_RISK_SUBJECT / NEGLECTED_SUBJECT /
 * LOW_COMPLETION / MOMENTUM recommendations now delegate entirely to
 * studyRecommendationEngine.generateRecommendations() (canonical
 * pipeline), rather than being independently reimplemented with
 * different thresholds and the legacy progress.revisionNeeded signal.
 *
 * The former "Review Queue" (revision-flagged subjects, using the legacy
 * revisionNeeded status count) has been removed — that territory is
 * already canonically and correctly covered by
 * getSpacedRevisionRecommendations()'s REVISION_DUE delegation, so
 * reimplementing it here would itself be duplication.
 *
 * "Almost Done" has no canonical equivalent and is preserved as an
 * explicitly agent-specific recommendation via _buildAlmostDoneRecommendation().
 *
 * The "no progress at all" onboarding nudge is preserved unchanged — it
 * is agent-specific presentation with no canonical equivalent.
 */
function getSyllabusRecommendations() {
  try {
    const examId = syllabusService.getActiveExam();
    const subjects = syllabusService.getAllSubjectProgress(examId);
    const examProgress = syllabusService.getExamProgress(examId);

    if (!subjects.length) return [];

    // ── No progress at all — agent-specific onboarding nudge ───────────────
    if ((examProgress.done ?? 0) === 0) {
      return [
        {
          agent: "coach",
          title: "Start Your Syllabus Tracker",
          description: `You haven't tracked any ${examId.replace("_", " ").toUpperCase()} topics yet. Opening a subject and marking your first topic done takes 10 seconds — and seeds your study roadmap.`,
          category: "syllabus",
          priority: 74,
          icon: "📚",
          color: "#7C6FFF",
          action: { label: "Open Syllabus", path: "/syllabus" },
        },
      ];
    }

    // ── Assemble canonical pipeline inputs (existing utilities only) ───────
    const activityLog = syllabusService.getActivityLog(500);
    const quizHistory = getQuizHistory() ?? [];
    const revisionQueue = syllabusService.getTodayRevisionQueue(examId);
    const gapItems = analyzeKnowledgeGaps(subjects, quizHistory);

    const recommendations = generateRecommendations({
      subjectProgress: subjects,
      examProgress,
      activityLog,
      quizHistory,
      revisionQueue,
      gapItems,
    });

    const context = {
      subjectProgress: subjects,
      activityLog,
      revisionQueue,
    };

    const CANONICAL_SYLLABUS_TYPES = new Set([
      REC_TYPE.HIGH_RISK_SUBJECT,
      REC_TYPE.NEGLECTED_SUBJECT,
      REC_TYPE.LOW_COMPLETION,
      REC_TYPE.MOMENTUM,
    ]);

    // Already ranked by the canonical pipeline — relative order preserved,
    // not re-sorted here.
    const canonicalRecs = recommendations
      .filter((rec) => CANONICAL_SYLLABUS_TYPES.has(rec.type))
      .map((rec) => _adaptCanonicalRecommendation(rec, context, "syllabus"));

    const almostDoneRec = _buildAlmostDoneRecommendation(subjects);

    const combined = almostDoneRec
      ? [almostDoneRec, ...canonicalRecs]
      : canonicalRecs;

    // Cap at 3 so syllabus doesn't dominate the recommendation feed
    return combined.slice(0, 3);
  } catch {
    // Never break the existing recommendation pipeline
    return [];
  }
}

// ─── PHASE 31: PRIVATE REVISION INSIGHT BUILDER ──────────────────────────────
// NOT modified in this batch — deferred to Phase 37 Batch F.2.

/**
 * _buildRevisionInsight
 *
 * Reads spaced-repetition stats and returns a plain-text insight string
 * for injection into getDailyBriefing() → revisionInsight field.
 *
 * Returns null when no revision data exists yet (safe default).
 * Never throws — wrapped in try/catch.
 */
function _buildRevisionInsight() {
  try {
    const examId = syllabusService.getActiveExam();
    const stats = syllabusService.getRevisionStats(examId);

    if (!stats || (stats.totalScheduled ?? 0) === 0) return null;

    const { overdueCount, dueToday, graduatedCount, totalScheduled } = stats;

    if (overdueCount > 0) {
      return `Your revision backlog needs immediate attention — ${overdueCount} topic${overdueCount > 1 ? "s are" : " is"} overdue. Focus on clearing these before studying anything new.`;
    }

    if (dueToday > 5) {
      return `Today should primarily be a revision day — ${dueToday} topics are scheduled for review. Completing them advances your spaced-repetition progress significantly.`;
    }

    if (dueToday > 0) {
      return `You have ${dueToday} topic${dueToday > 1 ? "s" : ""} scheduled for revision today. Reviewing them now keeps your retention curve strong.`;
    }

    if (graduatedCount >= 20) {
      return `Excellent long-term retention habits — ${graduatedCount} topics have cleared all 5 revision levels. Your knowledge foundation is exceptionally solid.`;
    }

    if (graduatedCount >= 10) {
      return `Strong revision consistency — ${graduatedCount} topics are fully graduated. Keep up the spaced repetition to lock in long-term retention.`;
    }

    if (totalScheduled > 0) {
      return `Your revision pipeline is on track — no topics are overdue right now. Keep completing new topics to grow the schedule.`;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── PHASE 31 → MIGRATED PHASE 37 BATCH F.1: SPACED REVISION RECOMMENDATIONS ─

/**
 * getSpacedRevisionRecommendations
 *
 * Phase 37 Batch F.1: this function no longer independently reads
 * syllabusService.getRevisionStats() or hardcodes revision priorities
 * (95/88/55/50). It now delegates entirely to
 * studyRecommendationEngine.generateRecommendations(), filters for
 * REC_TYPE.REVISION_DUE (the canonical overdue/due-today revision
 * recommendation), and adapts each into the existing agent-feed shape
 * via _adaptCanonicalRecommendation() — with priority sourced from
 * recommendationPrioritization.getRecommendationScore(), the same
 * canonical, already-established scoring API every other pipeline
 * consumer uses.
 *
 * The former "graduated milestone" and "empty pipeline" cases (which had
 * no canonical equivalent) are not reimplemented here — they were
 * agent-invented framing of stats already covered elsewhere in the
 * revision architecture, out of this batch's delegation scope.
 *
 * Never crashes — wrapped in try/catch; returns [] on any failure,
 * matching the existing defensive contract exactly (no fallback
 * recommendation engine is recreated).
 *
 * @returns {Array} recommendation objects (0–2 items: overdue, due-today)
 */
function getSpacedRevisionRecommendations() {
  try {
    const examId = syllabusService.getActiveExam();
    const subjectProgress = syllabusService.getAllSubjectProgress(examId);
    const examProgress = syllabusService.getExamProgress(examId);
    const activityLog = syllabusService.getActivityLog(500);
    const quizHistory = getQuizHistory() ?? [];
    const revisionQueue = syllabusService.getTodayRevisionQueue(examId);
    const gapItems = analyzeKnowledgeGaps(subjectProgress, quizHistory);

    const recommendations = generateRecommendations({
      subjectProgress,
      examProgress,
      activityLog,
      quizHistory,
      revisionQueue,
      gapItems,
    });

    const context = { subjectProgress, activityLog, revisionQueue };

    return recommendations
      .filter((rec) => rec.type === REC_TYPE.REVISION_DUE)
      .map((rec) => _adaptCanonicalRecommendation(rec, context, "revision"));
  } catch {
    // Never break the recommendation pipeline
    return [];
  }
}

// ─── RECORD INSIGHT ───────────────────────────────────────────────────────────
function recordInsight() {
  const { summary } = analyzeLearning();
  return addMemoryEntry("insight", summary, 2);
}

export default {
  analyzeLearning,
  getPersonalizedGuidance,
  getDailyBriefing,
  getRecommendations,
  getSyllabusRecommendations,
  getSpacedRevisionRecommendations,
  recordInsight,
};