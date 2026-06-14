// FIX: replaced `import { FOCUS_MODES } from '../context/FocusContext.jsx'`
// with import from standalone data constants file.
// Services must not depend on React context layer.
import {
  getFocusHistory,
  saveFocusSession,
  getFocusStats,
} from "../utils/focusStorage.js";
import { getFocusModeBreakdown } from "../lib/analyticsEngine.js";
import { FOCUS_MODES } from "../data/focusModes.js";
import { syncNamespaceWithRetry } from "../lib/cloudSyncEngine.js";
import { enqueueSync } from "../lib/cloudSync.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";

export const focusService = {
  // ─── HISTORY ─────────────────────────────────────────────────
  getHistory(limit = null) {
    const history = getFocusHistory() ?? [];
    return limit ? history.slice(0, limit) : history;
  },

  // ─── SAVE SESSION ────────────────────────────────────────────
  saveSession(session) {
    saveFocusSession(session);
    enqueueSync("focus_session", session);
    return { session, stats: getFocusStats() };
  },

  // ─── STATS ───────────────────────────────────────────────────
  getStats() {
    return getFocusStats();
  },

  getModeBreakdown: getFocusModeBreakdown,

  // Now reads from data constants — no React context dependency
  getModes() {
    return FOCUS_MODES;
  },

  // ─── STREAK ──────────────────────────────────────────────────
  getStreak() {
    const history = getFocusHistory() ?? [];
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

  // ─── CLEAR / RESET ───────────────────────────────────────────
  clearHistory() {
    StorageAdapter.remove(NAMESPACES.focus);
    enqueueSync("focus_history_cleared", {});
  },
};

export default focusService;
