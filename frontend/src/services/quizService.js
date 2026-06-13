// Quiz service — sessions, history, analytics, achievements.
// Backend-ready: every mutation enqueues a sync action for future API push.

import {
  getQuizHistory,
  saveQuizSession,
  getPerformanceStats,
  checkAndUnlockAchievements,
} from "../utils/quizStorage.js";
import { getCategoryBreakdown } from "../lib/analyticsEngine.js";
import { CATEGORIES, DIFFICULTIES } from "../data/mockQuizData.js";
import { enqueueSync } from "../lib/cloudSync.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";

export const quizService = {
  // ─── HISTORY ────────────────────────────────────────────────
  getHistory(limit = null) {
    const history = getQuizHistory() ?? [];
    return limit ? history.slice(0, limit) : history;
  },

  // ─── SAVE SESSION ───────────────────────────────────────────
  saveSession(session) {
    saveQuizSession(session);
    enqueueSync("quiz_session", session);
    const stats = getPerformanceStats();
    const unlocked = checkAndUnlockAchievements(session, stats);
    if (unlocked.length > 0) {
      enqueueSync("achievements_unlocked", { ids: unlocked, source: "quiz" });
    }
    return { session, stats, newAchievements: unlocked };
  },

  // ─── STATS / ANALYTICS ──────────────────────────────────────
  getStats() {
    return getPerformanceStats();
  },

  getCategoryBreakdown,

  getCategories() {
    return CATEGORIES;
  },
  getDifficulties() {
    return DIFFICULTIES;
  },

  // ─── ACHIEVEMENTS ───────────────────────────────────────────
  getUnlockedAchievements() {
    return StorageAdapter.get(NAMESPACES.achievements, []);
  },

  // ─── CLEAR / RESET ──────────────────────────────────────────
  clearHistory() {
    StorageAdapter.remove(NAMESPACES.quiz);
    enqueueSync("quiz_history_cleared", {});
  },
};

export default quizService;
