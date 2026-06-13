// Cloud user service — profile, preferences, avatar sync.

import { supabaseConfig, SUPABASE_TABLES } from "../config/supabaseConfig.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { getPreferences, setPreferences } from "../lib/userPreferences.js";
import { syncNamespaceWithRetry } from "../lib/cloudSyncEngine.js";
import { resolveProfile } from "../lib/conflictResolver.js";

export const cloudUserService = {
  isCloudEnabled() {
    return supabaseConfig.configured;
  },

  // ─── PROFILE SYNC ───────────────────────────────────────────
  getLocalProfile() {
    return StorageAdapter.get(NAMESPACES.profile, null);
  },

  async syncProfile() {
    return syncNamespaceWithRetry(NAMESPACES.profile);
  },

  async pushProfile(profile) {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    StorageAdapter.set(NAMESPACES.profile, updated);

    if (!supabaseConfig.configured) {
      return { ok: true, mock: true, table: SUPABASE_TABLES.profiles };
    }

    // TODO: real Supabase upsert into `profiles` table
    return { ok: true, table: SUPABASE_TABLES.profiles };
  },

  async pullProfile() {
    if (!supabaseConfig.configured) {
      return { ok: true, profile: this.getLocalProfile(), mock: true };
    }
    // TODO: real Supabase select from `profiles` table by user id
    return { ok: true, profile: this.getLocalProfile() };
  },

  mergeProfile(local, cloud) {
    return resolveProfile(local, cloud);
  },

  // ─── PREFERENCES SYNC ───────────────────────────────────────
  getLocalPreferences() {
    return getPreferences();
  },

  async pushPreferences(prefs) {
    setPreferences(prefs);
    if (!supabaseConfig.configured)
      return { ok: true, mock: true, table: SUPABASE_TABLES.preferences };
    // TODO: real Supabase upsert into `user_preferences`
    return { ok: true, table: SUPABASE_TABLES.preferences };
  },

  async pullPreferences() {
    if (!supabaseConfig.configured)
      return { ok: true, preferences: getPreferences(), mock: true };
    // TODO: real Supabase select from `user_preferences`
    return { ok: true, preferences: getPreferences() };
  },

  // ─── AVATAR SYNC ─────────────────────────────────────────────
  // Avatars currently derive from initials (no upload pipeline yet).
  // Stub ready for Supabase Storage bucket integration.
  async uploadAvatar(file) {
    if (!supabaseConfig.configured) {
      return {
        ok: false,
        error: "Avatar upload requires Supabase Storage configuration",
      };
    }
    // TODO: upload to Supabase Storage bucket 'avatars', return public URL
    return { ok: false, error: "Not yet implemented" };
  },

  getAvatarUrl(profile) {
    return profile?.avatarUrl ?? null;
  },
};

export default cloudUserService;
