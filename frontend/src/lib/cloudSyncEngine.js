// Background cloud sync engine — queue, retry, and reconciliation layer.
// Operates on top of offlineQueue.js + conflictResolver.js.
// In mock mode, all "cloud" operations resolve locally with simulated latency.

import StorageAdapter, { NAMESPACES } from "./storageAdapter.js";
import { isOnline } from "./networkManager.js";
import { supabaseConfig } from "../config/supabaseConfig.js";
import * as resolver from "./conflictResolver.js";

const SYNC_LOG_NS = "cloud_sync_log";
const SYNC_STATE_NS = "cloud_sync_state";
const MAX_LOG = 50;
const MAX_RETRIES = 4;

const listeners = new Set();

function emit(event, data = {}) {
  listeners.forEach((fn) => {
    try {
      fn(event, data);
    } catch {
      /* ignore */
    }
  });
}

export function onCloudSyncEvent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── SYNC LOG ────────────────────────────────────────────────────
function appendLog(entry) {
  const log = StorageAdapter.get(SYNC_LOG_NS, []);
  StorageAdapter.set(
    SYNC_LOG_NS,
    [
      { id: makeId("sl"), ts: new Date().toISOString(), ...entry },
      ...log,
    ].slice(0, MAX_LOG),
  );
}

export function getSyncLog(limit = 20) {
  return StorageAdapter.get(SYNC_LOG_NS, []).slice(0, limit);
}

export function clearSyncLog() {
  StorageAdapter.set(SYNC_LOG_NS, []);
}

// ─── SYNC STATE ──────────────────────────────────────────────────
export function getCloudSyncState() {
  return StorageAdapter.get(SYNC_STATE_NS, {
    lastFullSync: null,
    syncCount: 0,
    conflicts: 0,
    cloudEnabled: supabaseConfig.configured,
  });
}

function updateState(partial) {
  const current = getCloudSyncState();
  const updated = { ...current, ...partial };
  StorageAdapter.set(SYNC_STATE_NS, updated);
  return updated;
}

// ─── SIMULATED CLOUD FETCH/PUSH ─────────────────────────────────────
// In mock mode, "cloud" data == local data (round-trips with latency).
// Once Supabase is configured, these become real REST/RPC calls.
async function simulateLatency(min = 150, max = 400) {
  await new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

async function fetchCloudCopy(namespace) {
  await simulateLatency();
  if (!supabaseConfig.configured) {
    // Mock mode: cloud mirrors local (no real divergence to demo against)
    return StorageAdapter.get(namespace, null);
  }
  // TODO: real Supabase fetch by namespace/table
  return StorageAdapter.get(namespace, null);
}

async function pushLocalCopy(namespace, value) {
  await simulateLatency();
  if (!supabaseConfig.configured) {
    return { ok: true, mock: true };
  }
  // TODO: real Supabase upsert
  return { ok: true };
}

// ─── PER-NAMESPACE SYNC ────────────────────────────────────────────
const RESOLVER_MAP = {
  [NAMESPACES.profile]: (l, c) => resolver.resolveProfile(l, c),
  [NAMESPACES.quiz]: (l, c) => resolver.resolveHistory(l, c, "id"),
  [NAMESPACES.focus]: (l, c) => resolver.resolveHistory(l, c, "id"),
  [NAMESPACES.achievements]: (l, c) => resolver.resolveAchievements(l, c),
};

export async function syncNamespace(namespace) {
  if (!isOnline()) {
    appendLog({ namespace, status: "skipped", reason: "offline" });
    return { ok: false, reason: "offline" };
  }

  emit("namespace_start", { namespace });

  try {
    const local = StorageAdapter.get(namespace, null);
    const cloud = await fetchCloudCopy(namespace);

    const resolveFn =
      RESOLVER_MAP[namespace] ??
      ((l, c) => resolver.resolve(l, c, resolver.STRATEGIES.NEWEST_WINS));
    const { value, source, conflict } = resolveFn(local, cloud);

    if (value !== null && value !== undefined) {
      StorageAdapter.set(namespace, value);
    }

    await pushLocalCopy(namespace, value);

    if (conflict) {
      const state = getCloudSyncState();
      updateState({ conflicts: (state.conflicts ?? 0) + 1 });
    }

    appendLog({ namespace, status: "synced", source, conflict });
    emit("namespace_done", { namespace, source, conflict });
    return { ok: true, source, conflict };
  } catch (e) {
    appendLog({ namespace, status: "error", error: e.message });
    emit("namespace_error", { namespace, error: e.message });
    return { ok: false, error: e.message };
  }
}

// ─── FULL SYNC CYCLE ────────────────────────────────────────────────
const SYNC_NAMESPACES = [
  NAMESPACES.profile,
  NAMESPACES.quiz,
  NAMESPACES.focus,
  NAMESPACES.planner,
  NAMESPACES.achievements,
  NAMESPACES.missions,
];

let _running = false;

export async function runFullCloudSync() {
  if (_running) return { ok: false, reason: "already_running" };
  if (!isOnline()) return { ok: false, reason: "offline" };

  _running = true;
  emit("full_sync_start", { namespaces: SYNC_NAMESPACES.length });

  const results = [];
  for (const ns of SYNC_NAMESPACES) {
    const result = await syncNamespace(ns);
    results.push({ namespace: ns, ...result });
  }

  const state = updateState({
    lastFullSync: new Date().toISOString(),
    syncCount: (getCloudSyncState().syncCount ?? 0) + 1,
  });

  _running = false;
  emit("full_sync_done", { results, state });
  return { ok: true, results, state };
}

export function isCloudSyncRunning() {
  return _running;
}

// ─── RETRY WITH BACKOFF ──────────────────────────────────────────────
export async function syncNamespaceWithRetry(namespace, attempt = 1) {
  const result = await syncNamespace(namespace);
  if (result.ok || attempt >= MAX_RETRIES) return result;

  const delay = 500 * Math.pow(2, attempt - 1);
  await new Promise((r) => setTimeout(r, delay));
  return syncNamespaceWithRetry(namespace, attempt + 1);
}

export default {
  runFullCloudSync,
  syncNamespace,
  syncNamespaceWithRetry,
  getCloudSyncState,
  getSyncLog,
  clearSyncLog,
  onCloudSyncEvent,
  isCloudSyncRunning,
};
