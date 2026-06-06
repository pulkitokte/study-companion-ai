import StorageAdapter, { NAMESPACES } from "./storageAdapter.js";

// Cache entry: { value, expiresAt, createdAt, hits }

const CACHE_NS = NAMESPACES.cache;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

function readCache() {
  return StorageAdapter.get(CACHE_NS, {});
}

function writeCache(cache) {
  // Keep max 50 entries — evict oldest
  const entries = Object.entries(cache);
  if (entries.length > 50) {
    entries.sort((a, b) => (a[1].createdAt ?? 0) - (b[1].createdAt ?? 0));
    const pruned = Object.fromEntries(entries.slice(-50));
    StorageAdapter.set(CACHE_NS, pruned);
    return pruned;
  }
  StorageAdapter.set(CACHE_NS, cache);
  return cache;
}

// ─── SET ──────────────────────────────────────────────────────────
export function cacheSet(key, value, ttl = DEFAULT_TTL) {
  const cache = readCache();
  cache[key] = {
    value,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttl,
    hits: 0,
  };
  writeCache(cache);
}

// ─── GET ──────────────────────────────────────────────────────────
export function cacheGet(key) {
  const cache = readCache();
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete cache[key];
    writeCache(cache);
    return null;
  }
  // Track hits
  cache[key] = { ...entry, hits: (entry.hits ?? 0) + 1 };
  writeCache(cache);
  return entry.value;
}

// ─── INVALIDATE ───────────────────────────────────────────────────
export function cacheInvalidate(key) {
  const cache = readCache();
  if (cache[key]) {
    delete cache[key];
    writeCache(cache);
  }
}

export function cacheInvalidatePattern(prefix) {
  const cache = readCache();
  const updated = {};
  Object.entries(cache).forEach(([k, v]) => {
    if (!k.startsWith(prefix)) updated[k] = v;
  });
  writeCache(updated);
}

export function cacheClear() {
  StorageAdapter.set(CACHE_NS, {});
}

// ─── STATS ────────────────────────────────────────────────────────
export function getCacheStats() {
  const cache = readCache();
  const entries = Object.entries(cache);
  const now = Date.now();
  const valid = entries.filter(([, v]) => now < v.expiresAt);
  const expired = entries.length - valid.length;
  const hits = entries.reduce((s, [, v]) => s + (v.hits ?? 0), 0);

  return {
    total: entries.length,
    valid: valid.length,
    expired,
    hits,
    sizeKB: parseFloat(
      (new Blob([JSON.stringify(cache)]).size / 1024).toFixed(1),
    ),
  };
}

// ─── WITH-CACHE HELPER ────────────────────────────────────────────
// Usage: const data = await withCache('key', () => fetchData(), 60000)
export async function withCache(key, fetcher, ttl = DEFAULT_TTL) {
  const cached = cacheGet(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  if (fresh !== null && fresh !== undefined) cacheSet(key, fresh, ttl);
  return fresh;
}
