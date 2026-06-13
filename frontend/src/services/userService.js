// User profile + preferences service — sync-ready, backend-agnostic.

import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import {
  getPreferences,
  setPreference,
  setPreferences,
  resetPreferences,
  getNotifPrefs,
  getStudyGoals,
} from "../lib/userPreferences.js";
import {
  buildUserSnapshot,
  getCachedSnapshot,
  exportSnapshot,
  importFromSnapshot,
  mergeSnapshots,
} from "../lib/userSyncEngine.js";
import { enqueueSync } from "../lib/cloudSync.js";

export const userService = {
  // ─── PROFILE ────────────────────────────────────────────────
  getProfile() {
    return StorageAdapter.get(NAMESPACES.profile, null);
  },

  updateProfile(partial) {
    const current = this.getProfile() ?? {};
    const updated = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    StorageAdapter.set(NAMESPACES.profile, updated);
    enqueueSync("profile_update", updated);
    return updated;
  },

  isOnboarded() {
    return (
      StorageAdapter.get(NAMESPACES.onboarded) === true ||
      localStorage.getItem("studymind_onboarded") === "true"
    );
  },

  // ─── PREFERENCES ────────────────────────────────────────────
  getPreferences,
  setPreference,
  setPreferences,
  resetPreferences,
  getNotifPrefs,
  getStudyGoals,

  // ─── SNAPSHOT / SYNC ────────────────────────────────────────
  buildSnapshot: buildUserSnapshot,
  getCachedSnapshot,
  mergeSnapshots,

  exportProfile() {
    return exportSnapshot();
  },

  importProfile(json) {
    return importFromSnapshot(json);
  },
};

export default userService;
