// Cloud auth service — Supabase-ready signup/login/session, mock fallback.

import { supabaseConfig, getSupabaseClient } from "../config/supabaseConfig.js";
import authClient from "../lib/authClient.js";
import {
  storeSession,
  restoreSession,
  clearSession,
  getSessionInfo,
} from "../lib/sessionManager.js";

const {
  authLogin,
  authRegister,
  authLogout,
  authGetMe,
  getStoredToken,
  passwordStrength,
} = authClient;

export const cloudAuthService = {
  isCloudEnabled() {
    return supabaseConfig.configured;
  },

  getProvider() {
    return supabaseConfig.configured ? "supabase" : "mock";
  },

  // ─── SIGNUP ─────────────────────────────────────────────────
  async signup({ name, email, password, rememberMe = false }) {
    if (!supabaseConfig.configured) {
      const result = await authRegister({ name, email, password });
      if (result.ok)
        storeSession(
          result.user,
          getStoredToken() ?? `mock-${Date.now()}`,
          rememberMe,
        );
      return { ...result, provider: "mock" };
    }

    // TODO: real Supabase signup
    // const client = getSupabaseClient()
    // const { data, error } = await client.auth.signUp({ email, password, options:{ data:{ name } } })
    const result = await authRegister({ name, email, password });
    if (result.ok)
      storeSession(
        result.user,
        getStoredToken() ?? `cloud-${Date.now()}`,
        rememberMe,
      );
    return { ...result, provider: "supabase-pending" };
  },

  // ─── LOGIN ──────────────────────────────────────────────────
  async login({ email, password, rememberMe = false }) {
    if (!supabaseConfig.configured) {
      const result = await authLogin({ email, password });
      if (result.ok)
        storeSession(
          result.user,
          getStoredToken() ?? `mock-${Date.now()}`,
          rememberMe,
        );
      return { ...result, provider: "mock" };
    }

    // TODO: real Supabase login
    // const client = getSupabaseClient()
    // const { data, error } = await client.auth.signInWithPassword({ email, password })
    const result = await authLogin({ email, password });
    if (result.ok)
      storeSession(
        result.user,
        getStoredToken() ?? `cloud-${Date.now()}`,
        rememberMe,
      );
    return { ...result, provider: "supabase-pending" };
  },

  // ─── LOGOUT ─────────────────────────────────────────────────
  async logout() {
    clearSession();
    return authLogout();
  },

  // ─── SESSION ────────────────────────────────────────────────
  restoreSession,
  getSessionInfo,

  async getCurrentUser() {
    return authGetMe();
  },

  passwordStrength,
};

export default cloudAuthService;
