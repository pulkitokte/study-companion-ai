// Cloud focus service — session sync, streak sync, productivity sync.

import { supabaseConfig, SUPABASE_TABLES } from "../config/supabaseConfig.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { getFocusHistory, getFocusStats } from "../utils/focusStorage.js";
import { syncNamespaceWithRetry } from "../lib/cloudSyncEngine.js";
import { resolveHistory } from "../lib/conflictResolver.js";
import { getFocusModeBreakdown } from "../lib/analyticsEngine.js";

export const cloudFocusService = {
  isCloudEnabled() {
    return supabaseConfig.configured;
  },

  // ─── SESSION SYNC ───────────────────────────────────────────
  getLocalHistory() {
    return getFocusHistory() ?? [];
  },

  async syncHistory() {
    return syncNamespaceWithRetry(NAMESPACES.focus);
  },

  async pushSession(session) {
    if (!supabaseConfig.configured) {
      return { ok: true, mock: true, table: SUPABASE_TABLES.focusSessions };
    }
    // TODO: real Supabase insert into `focus_sessions`
    return { ok: true, table: SUPABASE_TABLES.focusSessions };
  },

  mergeHistory(local, cloud) {
    return resolveHistory(local, cloud, "id");
  },

  // ─── STREAK SYNC ────────────────────────────────────────────
  getLocalStreak() {
    const history = this.getLocalHistory();
    const days = new Set(
      history.map((f) => f.date?.slice(0, 10)).filter(Boolean),
    );
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().slice(0, 10))) streak++;
      else break;
    }
    return streak;
  },

  async pushStreak() {
    const streak = this.getLocalStreak();
    if (!supabaseConfig.configured) return { ok: true, mock: true, streak };
    // TODO: real Supabase upsert streak counter
    return { ok: true, streak };
  },

  // ─── PRODUCTIVITY SYNC ──────────────────────────────────────
  async pushProductivitySnapshot() {
    const stats = getFocusStats();
    const breakdown = getFocusModeBreakdown();
    if (!supabaseConfig.configured)
      return { ok: true, mock: true, stats, breakdown };
    // TODO: real Supabase upsert productivity snapshot
    return { ok: true, stats, breakdown };
  },
};

export default cloudFocusService;
