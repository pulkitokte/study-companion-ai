// Centralized API route definitions — drop-in ready for real backend

const BASE = (path) => path; // will prefix env.backendUrl in real mode

export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: BASE("/auth/login"),
    REGISTER: BASE("/auth/register"),
    LOGOUT: BASE("/auth/logout"),
    ME: BASE("/auth/me"),
    REFRESH: BASE("/auth/refresh"),
  },

  // User
  USER: {
    PROFILE: BASE("/user/profile"),
    UPDATE_PROFILE: BASE("/user/profile"),
    PREFERENCES: BASE("/user/preferences"),
    EXPORT: BASE("/user/export"),
    DELETE: BASE("/user/delete"),
  },

  // Quiz
  QUIZ: {
    HISTORY: BASE("/quiz/history"),
    SAVE: BASE("/quiz/save"),
    ANALYTICS: BASE("/quiz/analytics"),
    LEADERBOARD: BASE("/quiz/leaderboard"),
  },

  // Focus
  FOCUS: {
    HISTORY: BASE("/focus/history"),
    SAVE: BASE("/focus/save"),
    ANALYTICS: BASE("/focus/analytics"),
  },

  // Planner
  PLANNER: {
    ALL: BASE("/planner"),
    CREATE: BASE("/planner"),
    UPDATE: (id) => BASE(`/planner/${id}`),
    DELETE: (id) => BASE(`/planner/${id}`),
  },

  // Progress
  PROGRESS: {
    STATS: BASE("/progress/stats"),
    ACHIEVEMENTS: BASE("/progress/achievements"),
    MISSIONS: BASE("/progress/missions"),
    LEADERBOARD: BASE("/progress/leaderboard"),
  },

  // AI
  AI: {
    CHAT: BASE("/ai/chat"),
    MEMORY: BASE("/ai/memory"),
    HISTORY: BASE("/ai/history"),
    STREAM: BASE("/ai/stream"),
  },

  // Sync
  SYNC: {
    PUSH: BASE("/sync/push"),
    PULL: BASE("/sync/pull"),
    FULL: BASE("/sync/full"),
    DELTA: BASE("/sync/delta"),
  },

  // System
  SYSTEM: {
    HEALTH: BASE("/system/health"),
    VERSION: BASE("/system/version"),
    ANALYTICS: BASE("/system/analytics"),
  },
};

// Route metadata for documentation/display
export const ROUTE_META = {
  implemented: ["AUTH", "USER", "QUIZ", "FOCUS", "PLANNER", "PROGRESS", "SYNC"],
  mockReady: ["AUTH", "USER", "QUIZ", "FOCUS", "PLANNER", "PROGRESS"],
  planned: ["AI", "SYSTEM"],
};

export default API_ROUTES;
