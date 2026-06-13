// Storage service — abstraction over StorageAdapter with provider-swap support.
// Today: localStorage only. Future: swap `_provider` for Supabase/Firebase adapter
// without changing any calling code.

import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import env from "../lib/env.js";

// ─── PROVIDER ABSTRACTION ──────────────────────────────────────────
const localProvider = {
  name: "localStorage",
  get: (ns, fallback) => StorageAdapter.get(ns, fallback),
  set: (ns, value) => StorageAdapter.set(ns, value),
  merge: (ns, partial) => StorageAdapter.merge(ns, partial),
  remove: (ns) => StorageAdapter.remove(ns),
  prepend: (ns, item, max) => StorageAdapter.prepend(ns, item, max),
  append: (ns, item, max) => StorageAdapter.append(ns, item, max),
};

// Future backend provider stub — wired when VITE_BACKEND_URL / Supabase configured
const remoteProvider = {
  name: env.hasSupabase ? "supabase" : env.hasBackend ? "rest" : "remote",
  get: async () => {
    throw new Error("Remote provider not yet implemented");
  },
  set: async () => {
    throw new Error("Remote provider not yet implemented");
  },
  merge: async () => {
    throw new Error("Remote provider not yet implemented");
  },
  remove: async () => {
    throw new Error("Remote provider not yet implemented");
  },
  prepend: async () => {
    throw new Error("Remote provider not yet implemented");
  },
  append: async () => {
    throw new Error("Remote provider not yet implemented");
  },
};

// Active provider — defaults to local until a backend is configured AND ready
const _provider = localProvider;

export function getActiveProvider() {
  return _provider.name;
}

export function isRemoteReady() {
  return env.hasSupabase || env.hasBackend;
}

// ─── CORE API ────────────────────────────────────────────────────
export const storageService = {
  get(namespace, fallback = null) {
    return _provider.get(namespace, fallback);
  },
  set(namespace, value) {
    return _provider.set(namespace, value);
  },
  merge(namespace, partial) {
    return _provider.merge(namespace, partial);
  },
  remove(namespace) {
    return _provider.remove(namespace);
  },
  prepend(namespace, item, maxLen = 200) {
    return _provider.prepend(namespace, item, maxLen);
  },
  append(namespace, item, maxLen = 200) {
    return _provider.append(namespace, item, maxLen);
  },

  // Pass-through utilities (always local — diagnostics)
  keys() {
    return StorageAdapter.keys();
  },
  size() {
    return StorageAdapter.size();
  },
  clearAll() {
    return StorageAdapter.clearAll();
  },
};

export { NAMESPACES };
export default storageService;
