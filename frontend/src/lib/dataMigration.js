import StorageAdapter, { NAMESPACES } from "./storageAdapter.js";

const SCHEMA_VERSION = "1.0.0";

// ─── FULL ECOSYSTEM EXPORT ────────────────────────────────────────
export function exportEcosystem() {
  const data = {};
  Object.entries(NAMESPACES).forEach(([key, ns]) => {
    data[key] = StorageAdapter.get(ns, null);
  });

  data._meta = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    keysExported: Object.keys(NAMESPACES).length,
    storageBytes: StorageAdapter.size(),
    app: "StudyMind AI",
  };

  return data;
}

export function downloadEcosystemExport() {
  const data = exportEcosystem();
  const filename = `studymind-full-export-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
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
  return { ok: true, filename, meta: data._meta };
}

// ─── VALIDATE IMPORT ──────────────────────────────────────────────
export function validateEcosystemImport(jsonString) {
  try {
    const data =
      typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString;
    if (!data?._meta)
      return {
        ok: false,
        error: "Missing _meta — not a StudyMind export file",
      };
    if (!data._meta.schemaVersion)
      return { ok: false, error: "Unknown schema version" };

    const knownKeys = Object.keys(NAMESPACES);
    const foundKeys = knownKeys.filter((k) => data[k] !== undefined);

    return {
      ok: true,
      meta: data._meta,
      data,
      coverage: { found: foundKeys.length, total: knownKeys.length },
    };
  } catch (e) {
    return { ok: false, error: `Parse error: ${e.message}` };
  }
}

// ─── IMPORT (RESTORE) ─────────────────────────────────────────────
export function importEcosystem(jsonString, { overwrite = true } = {}) {
  const validation = validateEcosystemImport(jsonString);
  if (!validation.ok) return validation;

  const { data } = validation;
  let restored = 0;
  let skipped = 0;

  Object.entries(NAMESPACES).forEach(([key, ns]) => {
    if (data[key] === undefined || data[key] === null) {
      skipped++;
      return;
    }
    if (!overwrite && StorageAdapter.get(ns) !== null) {
      skipped++;
      return;
    }
    StorageAdapter.set(ns, data[key]);
    restored++;
  });

  return { ok: true, restored, skipped, meta: validation.meta };
}

// ─── MIGRATION FROM LEGACY KEY FORMAT ────────────────────────────
// Some early phases used raw `studymind_*` keys directly instead of
// the StorageAdapter prefix convention. This ensures backward compat.
const LEGACY_KEY_MAP = {
  studymind_profile: NAMESPACES.profile,
  studymind_onboarded: NAMESPACES.onboarded,
  studymind_quiz_history: NAMESPACES.quiz,
  studymind_focus_history: NAMESPACES.focus,
  studymind_planner: NAMESPACES.planner,
  studymind_missions: NAMESPACES.missions,
  studymind_achievements: NAMESPACES.achievements,
  studymind_chat_history: NAMESPACES.chatHistory,
  studymind_ai_memory: NAMESPACES.aiMemory,
  studymind_theme: NAMESPACES.theme,
  studymind_notif_prefs: NAMESPACES.notifPrefs,
};

export function migrateLegacyKeys() {
  let migrated = 0;
  Object.entries(LEGACY_KEY_MAP).forEach(([legacyKey, ns]) => {
    try {
      const raw = localStorage.getItem(legacyKey);
      if (raw === null) return;
      const targetKey = `studymind_${ns}`;
      // Already namespaced correctly (StorageAdapter prefixes with studymind_)
      if (legacyKey === targetKey) return;
      if (localStorage.getItem(targetKey) === null) {
        localStorage.setItem(targetKey, raw);
        migrated++;
      }
    } catch {
      /* ignore */
    }
  });
  return { migrated };
}

// ─── RESET ALL ────────────────────────────────────────────────────
export function resetEcosystem() {
  StorageAdapter.clearAll();
  return { ok: true };
}

export function getSchemaVersion() {
  return SCHEMA_VERSION;
}
