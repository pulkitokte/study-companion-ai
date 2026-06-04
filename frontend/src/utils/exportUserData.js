const EXPORT_KEYS = {
  profile: "studymind_profile",
  onboarded: "studymind_onboarded",
  quizHistory: "studymind_quiz_history",
  focusHistory: "studymind_focus_history",
  aiMemory: "studymind_ai_memory",
  chatHistory: "studymind_chat_history",
  planner: "studymind_planner",
  missions: "studymind_missions",
  achievements: "studymind_achievements",
  theme: "studymind_theme",
  notifPrefs: "studymind_notif_prefs",
};

function safeRead(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function buildExportPayload() {
  const data = {};
  const quizH = safeRead(EXPORT_KEYS.quizHistory) ?? [];
  const focusH = safeRead(EXPORT_KEYS.focusHistory) ?? [];
  const { tasks = [] } = safeRead(EXPORT_KEYS.planner) ?? {};

  // Raw data
  Object.entries(EXPORT_KEYS).forEach(([k, storageKey]) => {
    data[k] = safeRead(storageKey);
  });

  // Computed summary
  const quizXP = quizH.reduce((s, q) => s + (q.totalXP ?? 0), 0);
  const focusXP = focusH.reduce((s, f) => s + (f.xpEarned ?? 0), 0);
  const planXP = tasks
    .filter((t) => t.done)
    .reduce((s, t) => s + (t.xp ?? 0), 0);

  data._summary = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    totalXP: quizXP + focusXP + planXP,
    totalQuizzes: quizH.length,
    totalFocusSessions: focusH.length,
    totalPlannerTasks: tasks.length,
    achievementsUnlocked: (safeRead(EXPORT_KEYS.achievements) ?? []).length,
  };

  return data;
}

export function downloadJSON(payload, filename) {
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export function exportAllData() {
  const payload = buildExportPayload();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `studymind-export-${date}.json`;
  return downloadJSON(payload, filename);
}

export function importData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    Object.entries(EXPORT_KEYS).forEach(([k, storageKey]) => {
      if (parsed[k] !== undefined && parsed[k] !== null) {
        localStorage.setItem(storageKey, JSON.stringify(parsed[k]));
      }
    });
    return { ok: true, summary: parsed._summary };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
