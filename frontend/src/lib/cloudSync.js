import env from "./env.js";

// ─── SYNC QUEUE ──────────────────────────────────────────────────
const QUEUE_KEY = "studymind_sync_queue";
const STATUS_KEY = "studymind_sync_status";

export const SyncStatus = {
  IDLE: "idle",
  SYNCING: "syncing",
  SYNCED: "synced",
  ERROR: "error",
  OFFLINE: "offline",
  MOCK: "mock",
};

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQueue(q) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
  } catch {
    /* ignore */
  }
}

// ─── ENQUEUE ACTION ───────────────────────────────────────────────
// Any module can call this to queue an action for cloud sync
export function enqueueSync(type, payload) {
  const q = getQueue();
  const entry = {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  saveQueue([...q, entry]);
}

// ─── STATUS HELPERS ───────────────────────────────────────────────
export function getSyncStatus() {
  if (env.isMock) return SyncStatus.MOCK;
  if (!navigator.onLine) return SyncStatus.OFFLINE;
  try {
    return localStorage.getItem(STATUS_KEY) ?? SyncStatus.IDLE;
  } catch {
    return SyncStatus.IDLE;
  }
}

function setSyncStatus(status) {
  try {
    localStorage.setItem(STATUS_KEY, status);
  } catch {
    /* ignore */
  }
}

// ─── SYNC RUNNER ─────────────────────────────────────────────────
// Call this periodically or after app becomes online
export async function runSync() {
  if (env.isMock || !navigator.onLine || !env.hasBackend) {
    setSyncStatus(env.isMock ? SyncStatus.MOCK : SyncStatus.OFFLINE);
    return { ok: false, reason: env.isMock ? "mock" : "offline" };
  }

  const queue = getQueue();
  if (!queue.length) {
    setSyncStatus(SyncStatus.SYNCED);
    return { ok: true, synced: 0 };
  }

  setSyncStatus(SyncStatus.SYNCING);

  let synced = 0;
  const failed = [];

  for (const item of queue) {
    try {
      await fetch(`${env.backendUrl}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("studymind_auth_token") ?? ""}`,
        },
        body: JSON.stringify(item),
      });
      synced++;
    } catch {
      failed.push({ ...item, attempts: (item.attempts ?? 0) + 1 });
    }
  }

  saveQueue(failed);
  setSyncStatus(failed.length > 0 ? SyncStatus.ERROR : SyncStatus.SYNCED);
  return { ok: true, synced, failed: failed.length };
}

// ─── FULL DATA SNAPSHOT ───────────────────────────────────────────
// Builds a cloud-ready snapshot from localStorage
export function buildSyncPayload() {
  const keys = {
    profile: "studymind_profile",
    quizHistory: "studymind_quiz_history",
    focusHistory: "studymind_focus_history",
    planner: "studymind_planner",
    achievements: "studymind_achievements",
    missions: "studymind_missions",
  };
  const snapshot = { syncedAt: new Date().toISOString() };
  Object.entries(keys).forEach(([k, sk]) => {
    try {
      snapshot[k] = JSON.parse(localStorage.getItem(sk) ?? "null");
    } catch {
      snapshot[k] = null;
    }
  });
  return snapshot;
}

// ─── RESTORE FROM CLOUD ──────────────────────────────────────────
export function restoreFromSnapshot(snapshot) {
  const map = {
    profile: "studymind_profile",
    quizHistory: "studymind_quiz_history",
    focusHistory: "studymind_focus_history",
    planner: "studymind_planner",
    achievements: "studymind_achievements",
    missions: "studymind_missions",
  };
  let restored = 0;
  Object.entries(map).forEach(([k, sk]) => {
    if (snapshot[k] !== undefined && snapshot[k] !== null) {
      try {
        localStorage.setItem(sk, JSON.stringify(snapshot[k]));
        restored++;
      } catch {
        /* ignore */
      }
    }
  });
  return restored;
}
