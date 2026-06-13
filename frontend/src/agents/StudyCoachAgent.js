import { aggregateAll } from "../utils/globalStats.js";
import {
  getWeakSubjects,
  getTodaySummary,
  getDisplayName,
  getTargetExam,
  getUnifiedStreak,
} from "../utils/userProfile.js";
import {
  getCategoryBreakdown,
  getWeeklyTrend,
} from "../lib/analyticsEngine.js";
import { CATEGORIES } from "../data/mockQuizData.js";
import { addMemoryEntry } from "../lib/agentMemory.js";

// ─── LEARNING ANALYSIS ─────────────────────────────────────────────
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

// ─── PERSONALIZED GUIDANCE ──────────────────────────────────────────
function getPersonalizedGuidance(stats = null) {
  const analysis = analyzeLearning(stats);
  const { weakSubjects, strongSubjects, trend, stats: s } = analysis;

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

// ─── DAILY BRIEFING ─────────────────────────────────────────────────
function getDailyBriefing(stats = null) {
  const s = stats ?? aggregateAll();
  const name = getDisplayName?.() ?? "Scholar";
  const exam = getTargetExam?.() ?? "your exam";
  const today = getTodaySummary?.() ?? {};
  const analysis = analyzeLearning(s);

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
            : "Late night session";

  let motivational;
  if ((s.streak ?? 0) >= 7)
    motivational = `${s.streak} days strong — you're building a habit that will carry you through ${exam}.`;
  else if ((s.streak ?? 0) >= 1)
    motivational = `You're on a ${s.streak}-day streak. Consistency beats intensity — keep showing up.`;
  else
    motivational = `Every session counts. Start small today and build from here.`;

  const topPriority = getPersonalizedGuidance(s)[0] ?? {
    title: "Start your day",
    detail: "Pick a subject and complete one quiz to get your stats flowing.",
    icon: "🚀",
    color: "#7C6FFF",
  };

  return {
    greeting: `${greeting}, ${name}`,
    motivational,
    summary: analysis.summary,
    todayXP: today.xpEarned ?? 0,
    todayMinutes: today.focusMinutes ?? 0,
    streak: s.streak ?? 0,
    topPriority,
  };
}

// ─── RECOMMENDATIONS (for recommendationEngine) ────────────────────
function getRecommendations(stats = null) {
  const guidance = getPersonalizedGuidance(stats);
  return guidance.map((g, i) => ({
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

// ─── RECORD INSIGHT (persisted to memory) ───────────────────────────
function recordInsight() {
  const analysis = analyzeLearning();
  return addMemoryEntry("insight", analysis.summary, 2);
}

export default {
  analyzeLearning,
  getPersonalizedGuidance,
  getDailyBriefing,
  getRecommendations,
  recordInsight,
};
