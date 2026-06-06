import StorageAdapter, { NAMESPACES } from "./storageAdapter.js";

const LOG_NS = NAMESPACES.errorLog;
const MAX_LOGS = 50;

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const isDev = import.meta.env.DEV;

function makeEntry(level, message, context = {}) {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    level,
    message: String(message).slice(0, 500),
    context: safeStringify(context),
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
  };
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj).slice(0, 300);
  } catch {
    return String(obj).slice(0, 300);
  }
}

function persist(entry) {
  try {
    const logs = StorageAdapter.get(LOG_NS, []);
    const updated = [entry, ...logs].slice(0, MAX_LOGS);
    StorageAdapter.set(LOG_NS, updated);
  } catch {
    /* ignore */
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────
export const log = {
  error(message, context = {}) {
    const entry = makeEntry("error", message, context);
    if (isDev) console.error("[StudyMind Error]", message, context);
    persist(entry);
    return entry;
  },

  warn(message, context = {}) {
    const entry = makeEntry("warn", message, context);
    if (isDev) console.warn("[StudyMind Warn]", message, context);
    persist(entry);
    return entry;
  },

  info(message, context = {}) {
    const entry = makeEntry("info", message, context);
    if (isDev) console.info("[StudyMind]", message, context);
    persist(entry);
    return entry;
  },

  debug(message, context = {}) {
    if (!isDev) return null;
    const entry = makeEntry("debug", message, context);
    console.debug("[StudyMind Debug]", message, context);
    return entry; // debug not persisted in production
  },
};

// ─── RETRIEVE / CLEAR ─────────────────────────────────────────────
export function getLogs(level = null) {
  const all = StorageAdapter.get(LOG_NS, []);
  if (!level) return all;
  return all.filter((e) => e.level === level);
}

export function clearLogs() {
  StorageAdapter.set(LOG_NS, []);
}

export function getLogStats() {
  const all = StorageAdapter.get(LOG_NS, []);
  return {
    total: all.length,
    errors: all.filter((e) => e.level === "error").length,
    warns: all.filter((e) => e.level === "warn").length,
    infos: all.filter((e) => e.level === "info").length,
    latest: all[0] ?? null,
  };
}

// ─── GLOBAL HANDLER ───────────────────────────────────────────────
export function installGlobalErrorHandler() {
  window.addEventListener("error", (e) => {
    log.error(e.message, {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });
  window.addEventListener("unhandledrejection", (e) => {
    log.error(`Unhandled rejection: ${e.reason}`, { type: "promise" });
  });
}

export default log;
