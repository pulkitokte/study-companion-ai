import { aggregateAll } from "../utils/globalStats.js";
import { getXPTimeline, getWeeklyTrend } from "../lib/analyticsEngine.js";
import { ALL_ACHIEVEMENTS, RANKS } from "../utils/progressStorage.js";

// ─── XP ANALYSIS ─────────────────────────────────────────────────────
function analyzeXP() {
  const stats = aggregateAll();
  const timeline = getXPTimeline(14);
  const trend = getWeeklyTrend();

  const avgDailyXP = Math.round(
    timeline.reduce((s, d) => s + d.total, 0) / timeline.length,
  );
  const bestDay = [...timeline].sort((a, b) => b.total - a.total)[0];
  const activeDays = timeline.filter((d) => d.total > 0).length;

  return { stats, timeline, trend, avgDailyXP, bestDay, activeDays };
}

// ─── ACHIEVEMENT RECOMMENDATIONS ──────────────────────────────────────
function getNextAchievements() {
  const stats = aggregateAll();
  const unlocked = new Set(stats.achievementIds ?? []);
  const allEntries = Object.entries(ALL_ACHIEVEMENTS ?? {});

  const locked = allEntries.filter(([id]) => !unlocked.has(id));

  // Heuristic "closeness" scoring based on common achievement patterns
  const scored = locked
    .map(([id, meta]) => {
      let closeness = 0.3;
      const label = (meta.label ?? "").toLowerCase();
      const desc = (meta.desc ?? "").toLowerCase();

      if (label.includes("streak") || desc.includes("streak")) {
        closeness = Math.min(0.95, (stats.streak ?? 0) / 7);
      } else if (label.includes("quiz") || desc.includes("quiz")) {
        closeness = Math.min(0.95, (stats.totalQuizzes ?? 0) / 10);
      } else if (label.includes("focus") || desc.includes("focus")) {
        closeness = Math.min(0.95, (stats.totalFocusSessions ?? 0) / 10);
      } else if (label.includes("xp") || desc.includes("xp")) {
        closeness = Math.min(0.95, (stats.totalXP ?? 0) / 5000);
      }

      return { id, ...meta, closeness };
    })
    .sort((a, b) => b.closeness - a.closeness);

  return scored.slice(0, 3);
}

// ─── GROWTH FORECASTING ────────────────────────────────────────────────
function forecastGrowth() {
  const { stats, avgDailyXP } = analyzeXP();
  const currentLevel = stats.level ?? 1;
  const xpIntoLevel = stats.xpInto ?? 0;
  const xpToNext = stats.xpToNextLevel ?? 500;

  const daysToNextLevel =
    avgDailyXP > 0 ? Math.ceil(xpToNext / avgDailyXP) : null;

  const nextRank = RANKS.find((r) => r.minLevel > currentLevel) ?? null;
  const levelsToNextRank = nextRank ? nextRank.minLevel - currentLevel : 0;
  const xpToNextRank = levelsToNextRank * 500 - xpIntoLevel; // rough estimate (500 XP/level)
  const daysToNextRank =
    avgDailyXP > 0 && nextRank
      ? Math.ceil(Math.max(xpToNextRank, 0) / avgDailyXP)
      : null;

  return {
    avgDailyXP,
    daysToNextLevel,
    nextRank,
    daysToNextRank,
    projection30Day: avgDailyXP * 30,
  };
}

// ─── RECOMMENDATIONS (for recommendationEngine) ─────────────────────
function getRecommendations() {
  const recs = [];
  const { trend, activeDays } = analyzeXP();
  const nextAchievements = getNextAchievements();
  const forecast = forecastGrowth();

  if (nextAchievements.length > 0) {
    const top = nextAchievements[0];
    recs.push({
      agent: "progress",
      title: `Close to: ${top.label}`,
      description: top.desc ?? "Keep going — this achievement is within reach.",
      category: "progress",
      priority: Math.round(60 * top.closeness),
      icon: top.emoji ?? "🏆",
      color: top.color ?? "#FFD700",
      action: { label: "View Progress", path: "/progress" },
    });
  }

  if (forecast.daysToNextLevel !== null && forecast.daysToNextLevel <= 5) {
    recs.push({
      agent: "progress",
      title: `Level up in ~${forecast.daysToNextLevel} day${forecast.daysToNextLevel === 1 ? "" : "s"}`,
      description: `At your current pace (${forecast.avgDailyXP} XP/day), you'll reach the next level soon.`,
      category: "progress",
      priority: 65,
      icon: "⬆️",
      color: "#7C6FFF",
      action: { label: "View Progress", path: "/progress" },
    });
  }

  if (activeDays < 7) {
    recs.push({
      agent: "progress",
      title: "Increase activity frequency",
      description: `You were active ${activeDays}/14 days in the last two weeks. More frequent (even short) sessions compound XP gains.`,
      category: "progress",
      priority: 55,
      icon: "📊",
      color: "#FFB347",
      action: { label: "View Progress", path: "/progress" },
    });
  }

  return recs;
}

export default {
  analyzeXP,
  getNextAchievements,
  forecastGrowth,
  getRecommendations,
};
