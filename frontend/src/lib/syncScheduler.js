import { getQueueStats, replayQueue, clearQueue } from "./offlineQueue.js";
import { isOnline } from "./networkManager.js";
import StorageAdapter, { NAMESPACES } from "./storageAdapter.js";
import { buildUserSnapshot } from "./userSyncEngine.js";

const STATUS_NS = NAMESPACES.syncStatus;
const INTERVAL_MS = 60 * 1000; // 1 minute background sync

const listeners = new Set();

let _ticker = null;
let _syncing = false;
let _lastSync = StorageAdapter.get(STATUS_NS)?.lastSync ?? null;
let _syncCount = StorageAdapter.get(STATUS_NS)?.syncCount ?? 0;

function persistStatus(extra = {}) {
  StorageAdapter.set(STATUS_NS, {
    lastSync: _lastSync,
    syncCount: _syncCount,
    ...extra,
  });
}

function emit(event, data = {}) {
  listeners.forEach((fn) => {
    try {
      fn(event, data);
    } catch {
      /* ignore */
    }
  });
}

// ─── MOCK PROCESSOR ──────────────────────────────────────────────
// In production, this becomes a real API call
async function defaultProcessor(entry) {
  // Simulate async op
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
  // In mock mode every action "succeeds"
  return { ok: true, action: entry.action };
}

// ─── SINGLE SYNC RUN ─────────────────────────────────────────────
export async function runSyncCycle(processor = defaultProcessor) {
  if (_syncing || !isOnline())
    return { skipped: true, reason: _syncing ? "already_syncing" : "offline" };

  _syncing = true;
  emit("sync_start");

  try {
    // Rebuild snapshot
    const snapshot = buildUserSnapshot();

    // Replay queued actions
    const result = await replayQueue(processor);

    _lastSync = new Date().toISOString();
    _syncCount = _syncCount + 1;
    persistStatus();
    emit("sync_done", { ...result, snapshot });
    return { ok: true, ...result };
  } catch (e) {
    emit("sync_error", { error: e.message });
    return { ok: false, error: e.message };
  } finally {
    _syncing = false;
  }
}

// ─── SCHEDULER ────────────────────────────────────────────────────
export function startSyncScheduler() {
  if (_ticker) return;
  _ticker = setInterval(() => {
    const { pending } = getQueueStats();
    if (pending > 0 && isOnline()) runSyncCycle();
  }, INTERVAL_MS);

  // Sync when tab becomes visible
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && isOnline()) {
      runSyncCycle();
    }
  });

  // Sync when back online
  window.addEventListener("online", () => {
    setTimeout(() => runSyncCycle(), 1500);
  });
}

export function stopSyncScheduler() {
  if (_ticker) {
    clearInterval(_ticker);
    _ticker = null;
  }
}

// ─── LISTENERS ────────────────────────────────────────────────────
export function onSyncEvent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ─── STATUS ───────────────────────────────────────────────────────
export function getSyncSchedulerStatus() {
  return {
    active: !!_ticker,
    syncing: _syncing,
    lastSync: _lastSync,
    syncCount: _syncCount,
    queue: getQueueStats(),
    online: isOnline(),
  };
}
