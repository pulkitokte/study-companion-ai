import storageService, {
  getActiveProvider,
} from "../services/storageService.js";
import authService from "../services/authService.js";
import userService from "../services/userService.js";
import quizService from "../services/quizService.js";
import focusService from "../services/focusService.js";
import progressService from "../services/progressService.js";
import chatService from "../services/chatService.js";
import env from "./env.js";

// ─── CENTRAL SERVICE REGISTRY ────────────────────────────────────
// Single import point for all data services. Each entry includes
// metadata used by DeveloperCenter for health/status display.

export const SERVICES = {
  storage: {
    name: "Storage Service",
    instance: storageService,
    provider: getActiveProvider(),
    description: "Namespaced localStorage abstraction, backend-swappable",
    ready: true,
  },
  auth: {
    name: "Auth Service",
    instance: authService,
    provider: authService.getProvider(),
    description: "Login, register, session management",
    ready: true,
  },
  user: {
    name: "User Service",
    instance: userService,
    provider: "localStorage",
    description: "Profile, preferences, sync snapshots",
    ready: true,
  },
  quiz: {
    name: "Quiz Service",
    instance: quizService,
    provider: "localStorage",
    description: "Quiz sessions, history, achievements",
    ready: true,
  },
  focus: {
    name: "Focus Service",
    instance: focusService,
    provider: "localStorage",
    description: "Focus sessions, streaks, productivity",
    ready: true,
  },
  progress: {
    name: "Progress Service",
    instance: progressService,
    provider: "localStorage",
    description: "XP, levels, ranks, missions, achievements",
    ready: true,
  },
  chat: {
    name: "Chat Service",
    instance: chatService,
    provider: env.hasGemini ? "gemini" : "mock",
    description: "AI conversation history + Gemini integration",
    ready: true,
  },
};

export function getService(key) {
  return SERVICES[key]?.instance ?? null;
}

export function getServiceList() {
  return Object.entries(SERVICES).map(([key, s]) => ({
    key,
    name: s.name,
    provider: s.provider,
    description: s.description,
    ready: s.ready,
  }));
}

export function getRegistryHealth() {
  const list = getServiceList();
  const ready = list.filter((s) => s.ready).length;
  return {
    total: list.length,
    ready,
    pct: Math.round((ready / list.length) * 100),
    backend: env.hasSupabase
      ? "Supabase (configured)"
      : env.hasBackend
        ? "Custom REST (configured)"
        : "localStorage (mock)",
    services: list,
  };
}

export default SERVICES;
