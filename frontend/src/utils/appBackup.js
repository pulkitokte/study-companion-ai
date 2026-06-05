const BACKUP_VERSION = "2.0";

const KEYS = {
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
    const r = localStorage.getItem(key);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}

// ─── CREATE BACKUP ───────────────────────────────────────────────
export function createBackup() {
  const data = {};
  Object.entries(KEYS).forEach(([k, sk]) => {
    data[k] = safeRead(sk);
  });

  const qH = data.quizHistory ?? [];
  const fH = data.focusHistory ?? [];
  const tasks = data.planner?.tasks ?? [];

  data._meta = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    totalXP:
      qH.reduce((s, q) => s + (q.totalXP ?? 0), 0) +
      fH.reduce((s, f) => s + (f.xpEarned ?? 0), 0),
    totalQuizzes: qH.length,
    totalFocusSessions: fH.length,
    totalTasks: tasks.length,
    achievementsCount: (data.achievements ?? []).length,
    userName: data.profile?.name ?? "Unknown",
    checksum: qH.length + fH.length + tasks.length,
  };
  return data;
}

// ─── DOWNLOAD BACKUP ─────────────────────────────────────────────
export function downloadBackup() {
  try {
    const payload = createBackup();
    const date = new Date().toISOString().slice(0, 10);
    const name = payload._meta.userName.replace(/\s+/g, "_").toLowerCase();
    const filename = `studymind_backup_${name}_${date}.json`;
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
    return { ok: true, filename };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── VALIDATE BACKUP ─────────────────────────────────────────────
export function validateBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data._meta) return { ok: false, error: "Missing metadata" };
    if (!data._meta.version)
      return { ok: false, error: "Unknown backup format" };
    if (!data.profile)
      return { ok: false, error: "No profile found in backup" };
    return {
      ok: true,
      meta: data._meta,
      data,
    };
  } catch (e) {
    return { ok: false, error: `Parse error: ${e.message}` };
  }
}

// ─── RESTORE BACKUP ──────────────────────────────────────────────
export function restoreBackup(jsonString) {
  const { ok, error, data } = validateBackup(jsonString);
  if (!ok) return { ok: false, error };

  try {
    Object.entries(KEYS).forEach(([k, sk]) => {
      if (data[k] !== undefined && data[k] !== null) {
        localStorage.setItem(sk, JSON.stringify(data[k]));
      }
    });
    return { ok: true, meta: data._meta };
  } catch (e) {
    return { ok: false, error: `Restore failed: ${e.message}` };
  }
}

// ─── AUTO-BACKUP (localStorage) ──────────────────────────────────
const AUTO_KEY = "studymind_auto_backup";

export function saveAutoBackup() {
  try {
    const payload = createBackup();
    localStorage.setItem(AUTO_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function getAutoBackup() {
  try {
    const raw = localStorage.getItem(AUTO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
