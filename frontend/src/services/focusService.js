// Focus service — sessions, streaks, productivity metrics.

import {
  getFocusHistory,
  saveFocusSession,
  getFocusStats,
} from "../utils/focusStorage.js";
import { getFocusModeBreakdown } from "../lib/analyticsEngine.js";
import { FOCUS_MODES } from "../context/FocusContext.jsx";
import { enqueueSync } from "../lib/cloudSync.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";

export const focusService = {
  // ─── HISTORY ────────────────────────────────────────────────
  getHistory(limit = null) {
    const history = getFocusHistory() ?? [];
    return limit ? history.slice(0, limit) : history;
  },

  // ─── SAVE SESSION ───────────────────────────────────────────
  saveSession(session) {
    saveFocusSession(session);
    enqueueSync("focus_session", session);
    return { session, stats: getFocusStats() };
  },

  // ─── STATS ──────────────────────────────────────────────────
  getStats() {
    return getFocusStats();
  },

  getModeBreakdown: getFocusModeBreakdown,
  getModes() {
    return FOCUS_MODES;
  },

  // ─── STREAK ─────────────────────────────────────────────────
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

  // ─── CLEAR / RESET ──────────────────────────────────────────
  clearHistory() {
    StorageAdapter.remove(NAMESPACES.focus);
    enqueueSync("focus_history_cleared", {});
  },
};

export default focusService;
