import env from "./env.js";
import { log } from "./errorLogger.js";
import { enqueue } from "./offlineQueue.js";
import { isOnline } from "./networkManager.js";
import { cacheGet, cacheSet } from "./cacheManager.js";

const DEFAULT_TIMEOUT = 20000;

// ─── NORMALIZED RESPONSE ─────────────────────────────────────────
function ok(data) {
  return { ok: true, data, error: null };
}
function fail(error, code) {
  return { ok: false, data: null, error, code };
}

// ─── CORE FETCH ───────────────────────────────────────────────────
async function coreFetch(url, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    cacheKey = null,
    cacheTTL = 60000,
    ...rest
  } = options;

  // Cache check (GET requests only)
  if (cacheKey && rest.method === undefined) {
    const cached = cacheGet(cacheKey);
    if (cached) return ok(cached);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return fail(body?.message ?? `HTTP ${res.status}`, res.status);
    }
    const ct = res.headers.get("content-type") ?? "";
    const data = ct.includes("application/json")
      ? await res.json()
      : await res.text();
    if (cacheKey) cacheSet(cacheKey, data, cacheTTL);
    return ok(data);
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") return fail("Request timed out", 408);
    return fail(err.message, 0);
  }
}

// ─── REQUEST CLIENT ───────────────────────────────────────────────
function getToken() {
  try {
    return localStorage.getItem("studymind_auth_token");
  } catch {
    return null;
  }
}

function headers(extra = {}) {
  const h = { "Content-Type": "application/json", ...extra };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

export const client = {
  async get(path, opts = {}) {
    if (env.isMock || !env.hasBackend) return fail("mock_mode", 0);
    return coreFetch(`${env.backendUrl}${path}`, {
      method: "GET",
      headers: headers(),
      ...opts,
    });
  },

  async post(path, body = {}, opts = {}) {
    if (env.isMock || !env.hasBackend) return fail("mock_mode", 0);
    return coreFetch(`${env.backendUrl}${path}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      ...opts,
    });
  },

  async put(path, body = {}, opts = {}) {
    if (env.isMock || !env.hasBackend) return fail("mock_mode", 0);
    return coreFetch(`${env.backendUrl}${path}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
      ...opts,
    });
  },

  async delete(path, opts = {}) {
    if (env.isMock || !env.hasBackend) return fail("mock_mode", 0);
    return coreFetch(`${env.backendUrl}${path}`, {
      method: "DELETE",
      headers: headers(),
      ...opts,
    });
  },

  // Queue-aware POST — saves to offline queue if offline
  async queuedPost(action, payload, path = null) {
    if (!isOnline() || env.isMock || !env.hasBackend) {
      const id = enqueue(action, payload, { priority: "normal" });
      return { ok: true, queued: true, id };
    }
    if (!path) return { ok: true, queued: false };
    const result = await this.post(path, payload);
    if (!result.ok) {
      enqueue(action, payload, { priority: "normal" });
      return { ok: true, queued: true };
    }
    return result;
  },
};

export default client;
