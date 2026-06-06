import StorageAdapter, { NAMESPACES } from "./storageAdapter.js";

// ─── QUEUE ENTRY SHAPE ────────────────────────────────────────────
// { id, action, payload, createdAt, attempts, maxAttempts, priority }

const MAX_QUEUE = 300;
const MAX_RETRIES = 5;

function makeId() {
  return `oq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── READ / WRITE ─────────────────────────────────────────────────
function readQueue() {
  return StorageAdapter.get(NAMESPACES.syncQueue, []);
}

function writeQueue(q) {
  StorageAdapter.set(NAMESPACES.syncQueue, q.slice(-MAX_QUEUE));
}

// ─── ENQUEUE ──────────────────────────────────────────────────────
export function enqueue(
  action,
  payload,
  { priority = "normal", maxAttempts = MAX_RETRIES } = {},
) {
  const q = readQueue();
  const entry = {
    id: makeId(),
    action,
    payload,
    priority, // 'high' | 'normal' | 'low'
    maxAttempts,
    attempts: 0,
    createdAt: new Date().toISOString(),
    lastAttempt: null,
  };
  // High priority at front
  const updated = priority === "high" ? [entry, ...q] : [...q, entry];
  writeQueue(updated);
  return entry.id;
}

// ─── DEQUEUE (batch) ─────────────────────────────────────────────
export function dequeue(limit = 20) {
  const q = readQueue();
  return q.filter((e) => e.attempts < e.maxAttempts).slice(0, limit);
}

// ─── MARK PROCESSED ──────────────────────────────────────────────
export function markDone(id) {
  const q = readQueue();
  writeQueue(q.filter((e) => e.id !== id));
}

export function markFailed(id) {
  const q = readQueue();
  writeQueue(
    q.map((e) =>
      e.id === id
        ? {
            ...e,
            attempts: e.attempts + 1,
            lastAttempt: new Date().toISOString(),
          }
        : e,
    ),
  );
}

// ─── REPLAY (called when back online) ────────────────────────────
export async function replayQueue(processor) {
  if (!navigator.onLine) return { replayed: 0, failed: 0, skipped: 0 };
  const batch = dequeue();
  if (!batch.length) return { replayed: 0, failed: 0, skipped: 0 };

  let replayed = 0,
    failed = 0,
    skipped = 0;

  for (const entry of batch) {
    try {
      await processor(entry);
      markDone(entry.id);
      replayed++;
    } catch {
      markFailed(entry.id);
      const updated = readQueue().find((e) => e.id === entry.id);
      if (updated && updated.attempts >= updated.maxAttempts) {
        markDone(entry.id); // give up
        skipped++;
      } else {
        failed++;
      }
    }
  }

  return { replayed, failed, skipped };
}

// ─── STATS ────────────────────────────────────────────────────────
export function getQueueStats() {
  const q = readQueue();
  const pending = q.filter((e) => e.attempts < e.maxAttempts).length;
  const dead = q.filter((e) => e.attempts >= e.maxAttempts).length;
  const high = q.filter((e) => e.priority === "high").length;
  return { total: q.length, pending, dead, high };
}

export function clearQueue() {
  writeQueue([]);
}
