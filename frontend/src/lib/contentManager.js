import StorageAdapter from "./storageAdapter.js";
import { CATEGORIES, DIFFICULTIES } from "../data/mockQuizData.js";

const CUSTOM_QUESTIONS_NS = "admin_custom_questions";
const ANNOUNCEMENTS_NS = "admin_announcements";

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── CUSTOM QUIZ QUESTIONS ─────────────────────────────────────────
// Future: synced with backend question bank. For now, locally
// authored questions are merged with the static mock bank at runtime.

export function getCustomQuestions(category = null) {
  const all = StorageAdapter.get(CUSTOM_QUESTIONS_NS, []);
  return category ? all.filter((q) => q.category === category) : all;
}

export function addCustomQuestion(question) {
  const all = StorageAdapter.get(CUSTOM_QUESTIONS_NS, []);
  const entry = {
    id: makeId("cq"),
    category: question.category,
    difficulty: question.difficulty ?? "medium",
    question: question.question,
    options: question.options ?? [],
    correctIndex: question.correctIndex ?? 0,
    explanation: question.explanation ?? "",
    xp:
      question.xp ??
      DIFFICULTIES.find((d) => d.id === (question.difficulty ?? "medium"))
        ?.xpPerCorrect ??
      10,
    createdAt: new Date().toISOString(),
    custom: true,
  };
  StorageAdapter.set(CUSTOM_QUESTIONS_NS, [entry, ...all]);
  return entry;
}

export function updateCustomQuestion(id, updates) {
  const all = StorageAdapter.get(CUSTOM_QUESTIONS_NS, []);
  const updated = all.map((q) =>
    q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q,
  );
  StorageAdapter.set(CUSTOM_QUESTIONS_NS, updated);
  return updated.find((q) => q.id === id);
}

export function deleteCustomQuestion(id) {
  const all = StorageAdapter.get(CUSTOM_QUESTIONS_NS, []);
  StorageAdapter.set(
    CUSTOM_QUESTIONS_NS,
    all.filter((q) => q.id !== id),
  );
}

export function getQuestionBankStats() {
  const custom = StorageAdapter.get(CUSTOM_QUESTIONS_NS, []);
  const byCategory = {};
  custom.forEach((q) => {
    byCategory[q.category] = (byCategory[q.category] ?? 0) + 1;
  });
  return {
    totalCustom: custom.length,
    byCategory: CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      emoji: c.emoji,
      color: c.color,
      customCount: byCategory[c.id] ?? 0,
    })),
  };
}

// ─── ANNOUNCEMENTS / CONTENT BANNERS ─────────────────────────────────
// Admin-authored announcements shown via UpdateBanner-style UI

export function getAnnouncements() {
  return StorageAdapter.get(ANNOUNCEMENTS_NS, []);
}

export function createAnnouncement({
  title,
  message,
  type = "info",
  active = true,
}) {
  const all = getAnnouncements();
  const entry = {
    id: makeId("ann"),
    title,
    message,
    type, // 'info' | 'feature' | 'warning' | 'maintenance'
    active,
    createdAt: new Date().toISOString(),
  };
  StorageAdapter.set(ANNOUNCEMENTS_NS, [entry, ...all]);
  return entry;
}

export function toggleAnnouncement(id) {
  const all = getAnnouncements();
  const updated = all.map((a) =>
    a.id === id ? { ...a, active: !a.active } : a,
  );
  StorageAdapter.set(ANNOUNCEMENTS_NS, updated);
  return updated.find((a) => a.id === id);
}

export function deleteAnnouncement(id) {
  const all = getAnnouncements();
  StorageAdapter.set(
    ANNOUNCEMENTS_NS,
    all.filter((a) => a.id !== id),
  );
}

export function getActiveAnnouncements() {
  return getAnnouncements().filter((a) => a.active);
}
