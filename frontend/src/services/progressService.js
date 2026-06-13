// Progress service — XP, levels, ranks, achievements, missions.

import { aggregateAll, quickStats } from "../utils/globalStats.js";
import {
  getTodayMissions,
  checkMissionsAutoComplete,
  ALL_ACHIEVEMENTS,
  RANKS,
} from "../utils/progressStorage.js";
import { getXPTimeline, getWeeklyTrend } from "../lib/analyticsEngine.js";
import { enqueueSync } from "../lib/cloudSync.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";

export const progressService = {
  // ─── AGGREGATE STATS ────────────────────────────────────────
  getStats() {
    return aggregateAll();
  },
  getQuickStats() {
    return quickStats();
  },

  // ─── RANKS / LEVELS ─────────────────────────────────────────
  getRanks() {
    return RANKS;
  },

  getRankForLevel(level) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (level >= r.minLevel) rank = r;
      else break;
    }
    return rank;
  },

  // ─── ACHIEVEMENTS ───────────────────────────────────────────
  getAllAchievements() {
    return ALL_ACHIEVEMENTS;
  },

  getUnlockedAchievements() {
    return StorageAdapter.get(NAMESPACES.achievements, []);
  },

  getAchievementProgress() {
    const unlocked = new Set(this.getUnlockedAchievements());
    const all = Object.keys(ALL_ACHIEVEMENTS ?? {});
    return {
      unlocked: unlocked.size,
      total: all.length,
      pct: all.length > 0 ? Math.round((unlocked.size / all.length) * 100) : 0,
    };
  },

  // ─── MISSIONS ───────────────────────────────────────────────
  getTodayMissions() {
    const raw = getTodayMissions();
    return checkMissionsAutoComplete(raw);
  },

  // ─── XP TIMELINE / TRENDS ───────────────────────────────────
  getXPTimeline,
  getWeeklyTrend,

  // ─── SYNC ───────────────────────────────────────────────────
  pushProgressSnapshot() {
    const stats = aggregateAll();
    enqueueSync("progress_snapshot", stats);
    return stats;
  },
};

export default progressService;
