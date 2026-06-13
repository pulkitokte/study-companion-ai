// Cloud quiz service — session sync, leaderboard prep, analytics sync.

import { supabaseConfig, SUPABASE_TABLES } from "../config/supabaseConfig.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { getQuizHistory } from "../utils/quizStorage.js";
import { syncNamespaceWithRetry } from "../lib/cloudSyncEngine.js";
import { resolveHistory } from "../lib/conflictResolver.js";
import { getCategoryBreakdown } from "../lib/analyticsEngine.js";

export const cloudQuizService = {
  isCloudEnabled() {
    return supabaseConfig.configured;
  },

  // ─── SESSION SYNC ───────────────────────────────────────────
  getLocalHistory() {
    return getQuizHistory() ?? [];
  },

  async syncHistory() {
    return syncNamespaceWithRetry(NAMESPACES.quiz);
  },

  async pushSession(session) {
    if (!supabaseConfig.configured) {
      return { ok: true, mock: true, table: SUPABASE_TABLES.quizSessions };
    }
    // TODO: real Supabase insert into `quiz_sessions`
    return { ok: true, table: SUPABASE_TABLES.quizSessions };
  },

  mergeHistory(local, cloud) {
    return resolveHistory(local, cloud, "id");
  },

  // ─── LEADERBOARD PREP ───────────────────────────────────────
  // Future: aggregate XP across users via Supabase view/RPC.
  // Mock mode returns only the current user's standing.
  async getLeaderboard() {
    const history = this.getLocalHistory();
    const totalXP = history.reduce((s, q) => s + (q.totalXP ?? 0), 0);
    const accuracy = history.length
      ? Math.round(
          history.reduce((s, q) => s + (q.accuracy ?? 0), 0) / history.length,
        )
      : 0;

    if (!supabaseConfig.configured) {
      return {
        ok: true,
        mock: true,
        rows: [{ rank: 1, name: "You", xp: totalXP, accuracy, isSelf: true }],
      };
    }
    // TODO: real Supabase RPC `get_quiz_leaderboard`
    return {
      ok: true,
      rows: [{ rank: 1, name: "You", xp: totalXP, accuracy, isSelf: true }],
    };
  },

  // ─── ANALYTICS SYNC ─────────────────────────────────────────
  async pushAnalyticsSnapshot() {
    const breakdown = getCategoryBreakdown();
    if (!supabaseConfig.configured) return { ok: true, mock: true, breakdown };
    // TODO: real Supabase upsert analytics snapshot
    return { ok: true, breakdown };
  },
};

export default cloudQuizService;
