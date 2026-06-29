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

// ─── SYLLABUS RECOMMENDATIONS (Batch 9) ───────────────────────────────────────
function getSyllabusRecommendations() {
  try {
    const examId = syllabusService.getActiveExam();
    const subjects = syllabusService.getAllSubjectProgress(examId);
    const examProgress = syllabusService.getExamProgress(examId);

    if (!subjects.length) return [];

    const recs = [];

    // ── No progress at all ────────────────────────────────────────────────
    if ((examProgress.done ?? 0) === 0) {
      recs.push({
        agent: "coach",
        title: "Start Your Syllabus Tracker",
        description: `You haven't tracked any ${examId.replace("_", " ").toUpperCase()} topics yet. Opening a subject and marking your first topic done takes 10 seconds — and seeds your study roadmap.`,
        category: "syllabus",
        priority: 74,
        icon: "📚",
        color: "#7C6FFF",
        action: { label: "Open Syllabus", path: "/syllabus" },
      });
      return recs;
    }

    // ── Revision queue: subjects with flagged topics ───────────────────────
    const needsRevision = subjects
      .filter((s) => (s.progress?.revisionNeeded ?? 0) > 0)
      .sort(
        (a, b) =>
          (b.progress.revisionNeeded ?? 0) - (a.progress.revisionNeeded ?? 0),
      );

    if (needsRevision.length > 0) {
      const top = needsRevision[0];
      const count = top.progress.revisionNeeded;
      recs.push({
        agent: "coach",
        title: `Review Queue: ${top.label}`,
        description: `${count} topic${count > 1 ? "s are" : " is"} flagged for revision in ${top.label}. Clearing your review queue now prevents knowledge gaps on exam day.`,
        category: "syllabus",
        priority: 83,
        icon: top.emoji ?? "🔁",
        color: "#FF6B2B",
        action: { label: "Review Now", path: "/syllabus" },
      });
    }

    // ── Almost complete: ≥80% but <100% ──────────────────────────────────
    const almostDone = subjects
      .filter(
        (s) => (s.progress?.pct ?? 0) >= 80 && (s.progress?.pct ?? 0) < 100,
      )
      .sort((a, b) => (b.progress.pct ?? 0) - (a.progress.pct ?? 0));

    if (almostDone.length > 0) {
      const top = almostDone[0];
      const remaining = (top.progress.total ?? 0) - (top.progress.done ?? 0);
      recs.push({
        agent: "coach",
        title: `Almost Done: ${top.label}`,
        description: `${top.label} is ${top.progress.pct}% complete — only ${remaining} topic${remaining > 1 ? "s" : ""} left. Finishing it unlocks a +200 XP subject completion bonus.`,
        category: "syllabus",
        priority: 79,
        icon: top.emoji ?? "🎯",
        color: top.color ?? "#00FFC8",
        action: { label: "Finish Subject", path: "/syllabus" },
      });
    }

    // ── Lagging: has some progress but <40% ──────────────────────────────
    const lagging = subjects
      .filter((s) => (s.progress?.done ?? 0) > 0 && (s.progress?.pct ?? 0) < 40)
      .sort((a, b) => (a.progress?.pct ?? 0) - (b.progress?.pct ?? 0));

    if (lagging.length > 0) {
      const top = lagging[0];
      const left = (top.progress.total ?? 0) - (top.progress.done ?? 0);
      recs.push({
        agent: "coach",
        title: `Push Through: ${top.label}`,
        description: `${top.label} is only ${top.progress.pct}% done with ${left} topics remaining. Steady daily effort on this subject will make a significant dent in your coverage.`,
        category: "syllabus",
        priority: 68,
        icon: top.emoji ?? "⚡",
        color: top.color ?? "#FFB347",
        action: { label: "Continue Subject", path: "/syllabus" },
      });
    }

    // ── Neglected: zero progress while others have been started ──────────
    const neglected = subjects.filter((s) => (s.progress?.done ?? 0) === 0);
    const started = subjects.filter((s) => (s.progress?.done ?? 0) > 0);

    if (neglected.length > 0 && started.length > 0) {
      const pick =
        neglected[Math.floor(Math.random() * Math.min(neglected.length, 3))];
      recs.push({
        agent: "coach",
        title: `Unexplored: ${pick.label}`,
        description: `You haven't started ${pick.label} yet. Broadening coverage across subjects is key to competitive exam success — even 2-3 topics a day adds up fast.`,
        category: "syllabus",
        priority: 60,
        icon: pick.emoji ?? "🗺️",
        color: pick.color ?? "#4FC3F7",
        action: { label: "Start Subject", path: "/syllabus" },
      });
    }

    // Cap at 3 so syllabus doesn't dominate the recommendation feed
    return recs.slice(0, 3);
  } catch {
    // Never break the existing recommendation pipeline
    return [];
  }
}

// ─── PHASE 31: PRIVATE REVISION INSIGHT BUILDER ──────────────────────────────

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

// ─── PHASE 31: SPACED REVISION RECOMMENDATIONS ───────────────────────────────

/**
 * getSpacedRevisionRecommendations
 *
 * Returns 0–3 high-priority recommendation objects based on the current
 * state of the spaced-repetition schedule.
 *
 * Priority order (highest first):
 *   1. Overdue revisions     → VERY HIGH (95)
 *   2. Due today revisions   → HIGH (88)
 *   3. Graduated milestone   → MEDIUM (55)
 *   4. Empty pipeline        → MEDIUM (50)
 *
 * Slotted into the recommendation feed ABOVE syllabus coverage recs
 * when conditions are met. Never crashes — wrapped in try/catch.
 *
 * @returns {Array} recommendation objects
 */
function getSpacedRevisionRecommendations() {
  try {
    const examId = syllabusService.getActiveExam();
    const stats = syllabusService.getRevisionStats(examId);

    if (!stats) return [];

    const { overdueCount, dueToday, graduatedCount, totalScheduled } = stats;
    const recs = [];

    // ── 1. Overdue revisions — VERY HIGH PRIORITY ─────────────────────────
    if ((overdueCount ?? 0) > 0) {
      recs.push({
        agent: "coach",
        title: `🔥 ${overdueCount} Overdue Revision${overdueCount > 1 ? "s" : ""}`,
        description: `You have ${overdueCount} topic${overdueCount > 1 ? "s" : ""} past their scheduled revision date. Clear these first — reviewing overdue topics now before studying new material is the single most effective action you can take today.`,
        category: "revision",
        priority: 95,
        icon: "🔥",
        color: "#FF6B2B",
        action: { label: "Review Overdue", path: "/syllabus" },
      });
    }

    // ── 2. Topics due today ───────────────────────────────────────────────
    if ((dueToday ?? 0) > 0) {
      recs.push({
        agent: "coach",
        title: `📚 ${dueToday} Revision${dueToday > 1 ? "s" : ""} Scheduled Today`,
        description: `You have ${dueToday} topic${dueToday > 1 ? "s" : ""} scheduled for spaced-repetition review today. Completing them advances each topic's revision level and locks in long-term retention.`,
        category: "revision",
        priority: 88,
        icon: "📚",
        color: "#FFB347",
        action: { label: "Today's Revisions", path: "/syllabus" },
      });
    }

    // ── 3. Graduated milestone ────────────────────────────────────────────
    if ((graduatedCount ?? 0) >= 10) {
      recs.push({
        agent: "coach",
        title: `🏆 ${graduatedCount} Topics Fully Graduated`,
        description: `${graduatedCount} topics have cleared all 5 spaced-repetition revision levels. This is exceptional consistency — your long-term retention for these topics is now well established.`,
        category: "revision",
        priority: 55,
        icon: "🏆",
        color: "#FFD700",
        action: { label: "View Syllabus", path: "/syllabus" },
      });
    }

    // ── 4. Empty pipeline — prompt to complete first topics ───────────────
    if ((totalScheduled ?? 0) === 0) {
      recs.push({
        agent: "coach",
        title: "Activate Smart Revision Scheduling",
        description:
          "Mark your first syllabus topic as completed to activate the spaced repetition engine. Each completed topic is automatically scheduled for future revision at the optimal interval.",
        category: "revision",
        priority: 50,
        icon: "🗓️",
        color: "#4FC3F7",
        action: { label: "Open Syllabus", path: "/syllabus" },
      });
    }

    return recs;
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
