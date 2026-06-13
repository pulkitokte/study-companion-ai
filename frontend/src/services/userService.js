// Storage service — abstraction over StorageAdapter with provider-swap support.
// Now wired to detect Supabase configuration via supabaseConfig.js.
// Today: localStorage only. The cloud sync engine handles reconciliation
// separately (see cloudSyncEngine.js) — this layer remains the fast,
// always-available local read/write path.

import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { supabaseConfig } from "../config/supabaseConfig.js";
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

// Active provider — local remains primary; cloudSyncEngine reconciles
// with Supabase in the background once configured.
const _provider = localProvider;

export function getActiveProvider() {
  return _provider.name;
}

export function isRemoteReady() {
  return supabaseConfig.configured || env.hasBackend;
}

export function getRemoteProviderName() {
  if (supabaseConfig.configured) return "supabase";
  if (env.hasBackend) return "rest";
  return "none";
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

  getActiveProvider,
  isRemoteReady,
  getRemoteProviderName,

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
