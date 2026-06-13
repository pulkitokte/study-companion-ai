// Cloud progress service — XP sync, achievements sync, rank sync.

import { supabaseConfig, SUPABASE_TABLES } from "../config/supabaseConfig.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { aggregateAll } from "../utils/globalStats.js";
import { RANKS } from "../utils/progressStorage.js";
import { syncNamespaceWithRetry } from "../lib/cloudSyncEngine.js";
import { resolveXP, resolveAchievements } from "../lib/conflictResolver.js";

export const cloudProgressService = {
  isCloudEnabled() {
    return supabaseConfig.configured;
  },

  // ─── XP SYNC ────────────────────────────────────────────────
  getLocalStats() {
    return aggregateAll();
  },

  async pushXP() {
    const stats = this.getLocalStats();
    if (!supabaseConfig.configured)
      return {
        ok: true,
        mock: true,
        table: SUPABASE_TABLES.progress,
        totalXP: stats.totalXP,
      };
    // TODO: real Supabase upsert into `user_progress`
    return {
      ok: true,
      table: SUPABASE_TABLES.progress,
      totalXP: stats.totalXP,
    };
  },

  mergeXP(localXP, cloudXP) {
    return resolveXP(localXP, cloudXP);
  },

  // ─── ACHIEVEMENTS SYNC ──────────────────────────────────────
  getLocalAchievements() {
    return StorageAdapter.get(NAMESPACES.achievements, []);
  },

  async syncAchievements() {
    return syncNamespaceWithRetry(NAMESPACES.achievements);
  },

  async pushAchievements() {
    const ids = this.getLocalAchievements();
    if (!supabaseConfig.configured)
      return {
        ok: true,
        mock: true,
        table: SUPABASE_TABLES.achievements,
        count: ids.length,
      };
    // TODO: real Supabase upsert into `user_achievements`
    return { ok: true, table: SUPABASE_TABLES.achievements, count: ids.length };
  },

  mergeAchievements(local, cloud) {
    return resolveAchievements(local, cloud);
  },

  // ─── RANK SYNC ──────────────────────────────────────────────
  getLocalRank() {
    const stats = this.getLocalStats();
    return stats.rank ?? RANKS[0];
  },

  async pushRank() {
    const rank = this.getLocalRank();
    if (!supabaseConfig.configured)
      return { ok: true, mock: true, rank: rank.id };
    // TODO: real Supabase upsert rank into `user_progress`
    return { ok: true, rank: rank.id };
  },

  getAllRanks() {
    return RANKS;
  },
};

export default cloudProgressService;
