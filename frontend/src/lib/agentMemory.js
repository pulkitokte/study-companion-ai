import StorageAdapter from "./storageAdapter.js";

const MEMORY_NS = "agent_memory";
const RECS_NS = "agent_recommendation_history";
const PREFS_NS = "agent_preferences";

const MAX_MEMORY = 100;
const MAX_RECS = 100;

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── LONG-TERM MEMORY ──────────────────────────────────────────────
// { id, type, content, importance, createdAt }
// type: 'insight' | 'observation' | 'goal' | 'feedback'

export function getMemoryEntries(type = null) {
  const all = StorageAdapter.get(MEMORY_NS, []);
  return type ? all.filter((m) => m.type === type) : all;
}

export function addMemoryEntry(type, content, importance = 1) {
  const all = StorageAdapter.get(MEMORY_NS, []);
  const entry = {
    id: makeId("mem"),
    type,
    content,
    importance,
    createdAt: new Date().toISOString(),
  };
  StorageAdapter.set(MEMORY_NS, [entry, ...all].slice(0, MAX_MEMORY));
  return entry;
}

export function clearMemory() {
  StorageAdapter.set(MEMORY_NS, []);
}

export function getRecentInsights(limit = 5) {
  return getMemoryEntries("insight").slice(0, limit);
}

// ─── RECOMMENDATION HISTORY ─────────────────────────────────────────
// { id, agent, title, description, category, priority, action, createdAt, status }
// status: 'pending' | 'accepted' | 'dismissed' | 'completed'

export function logRecommendation(rec) {
  const all = StorageAdapter.get(RECS_NS, []);
  // Avoid duplicate active recommendations for the same agent+title
  const existing = all.find(
    (r) =>
      r.agent === rec.agent && r.title === rec.title && r.status === "pending",
  );
  if (existing) return existing;

  const entry = {
    id: makeId("rec"),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...rec,
  };
  StorageAdapter.set(RECS_NS, [entry, ...all].slice(0, MAX_RECS));
  return entry;
}

export function getRecommendationHistory(limit = 50) {
  return StorageAdapter.get(RECS_NS, []).slice(0, limit);
}

export function getActiveRecommendations() {
  return StorageAdapter.get(RECS_NS, []).filter((r) => r.status === "pending");
}

export function markRecommendationFeedback(id, status) {
  const all = StorageAdapter.get(RECS_NS, []);
  const updated = all.map((r) =>
    r.id === id ? { ...r, status, resolvedAt: new Date().toISOString() } : r,
  );
  StorageAdapter.set(RECS_NS, updated);
  return updated.find((r) => r.id === id);
}

export function clearRecommendationHistory() {
  StorageAdapter.set(RECS_NS, []);
}

// ─── PREFERENCE PROFILE (learned over time) ─────────────────────────
const DEFAULT_PROFILE = {
  preferredStudyTime: null, // 'morning' | 'afternoon' | 'evening' | 'night'
  preferredMode: null, // focus mode preference
  weakSubjects: [],
  strongSubjects: [],
  lastAnalyzedAt: null,
};

export function getPreferenceProfile() {
  return StorageAdapter.get(PREFS_NS, { ...DEFAULT_PROFILE });
}

export function updatePreferenceProfile(partial) {
  const current = getPreferenceProfile();
  const updated = {
    ...current,
    ...partial,
    lastAnalyzedAt: new Date().toISOString(),
  };
  StorageAdapter.set(PREFS_NS, updated);
  return updated;
}

export function resetPreferenceProfile() {
  StorageAdapter.set(PREFS_NS, { ...DEFAULT_PROFILE });
  return { ...DEFAULT_PROFILE };
}
