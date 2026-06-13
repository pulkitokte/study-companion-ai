// Auth service — thin wrapper over authClient with service-layer naming
// for consistency with the rest of the /services directory.
// Swap internals for Supabase Auth / Firebase Auth without touching callers.

import {
  authLogin,
  authRegister,
  authLogout,
  authGetMe,
  getStoredToken,
  getStoredSession,
  storeToken,
  clearToken,
  passwordStrength,
} from "../lib/authClient.js";
import {
  storeSession as persistSession,
  restoreSession,
  clearSession,
  touchSession,
  getSessionInfo,
} from "../lib/sessionManager.js";
import env from "../lib/env.js";

export const authService = {
  // ─── CORE AUTH ──────────────────────────────────────────────
  async login({ email, password, rememberMe = false }) {
    const result = await authLogin({ email, password });
    if (result.ok) {
      persistSession(
        result.user,
        getStoredToken() ?? `mock-${Date.now()}`,
        rememberMe,
      );
    }
    return result;
  },

  async register({ name, email, password, rememberMe = false }) {
    const result = await authRegister({ name, email, password });
    if (result.ok) {
      persistSession(
        result.user,
        getStoredToken() ?? `mock-${Date.now()}`,
        rememberMe,
      );
    }
    return result;
  },

  async logout() {
    clearSession();
    return authLogout();
  },

  async getCurrentUser() {
    return authGetMe();
  },

  // ─── SESSION ────────────────────────────────────────────────
  restoreSession,
  getSessionInfo,
  touchSession,
  getStoredSession,
  getStoredToken,

  // ─── HELPERS ────────────────────────────────────────────────
  passwordStrength,
  isMockMode: () => env.isMock,
  getProvider: () =>
    env.hasSupabase ? "supabase" : env.hasBackend ? "custom-rest" : "mock",
};

export default authService;
