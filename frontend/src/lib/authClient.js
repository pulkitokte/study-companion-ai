import env from "./env.js";
import { api } from "./apiClient.js";

const TOKEN_KEY = "studymind_auth_token";
const SESSION_KEY = "studymind_auth_session";

// ─── TOKEN HELPERS ────────────────────────────────────────────────
export function storeToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function storeSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── MOCK AUTH (no backend configured) ──────────────────────────
// Returns user shape matching future real-auth shape
function makeMockUser(email, name) {
  return {
    id: `local-${Date.now()}`,
    email,
    name: name || email.split("@")[0],
    avatar: null,
    createdAt: new Date().toISOString(),
    provider: "mock",
    verified: true,
  };
}

// ─── AUTH METHODS ─────────────────────────────────────────────────
export async function authLogin({ email, password }) {
  if (!email || !password)
    return { ok: false, error: "Email and password are required." };

  if (env.isMock) {
    // Mock: accept any email/password combo, load existing profile if present
    const existing = getStoredSession();
    const profile = (() => {
      try {
        return JSON.parse(localStorage.getItem("studymind_profile") ?? "null");
      } catch {
        return null;
      }
    })();
    const user =
      existing?.email === email ? existing : makeMockUser(email, profile?.name);
    storeToken(`mock-token-${Date.now()}`);
    storeSession(user);
    return { ok: true, user };
  }

  // Real backend call
  try {
    const { token, user } = await api.post("/auth/login", { email, password });
    storeToken(token);
    storeSession(user);
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function authRegister({ name, email, password }) {
  if (!name || !email || !password)
    return { ok: false, error: "All fields are required." };
  if (password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };

  if (env.isMock) {
    const user = makeMockUser(email, name);
    storeToken(`mock-token-${Date.now()}`);
    storeSession(user);
    // Persist name to profile as well
    try {
      const existing = JSON.parse(
        localStorage.getItem("studymind_profile") ?? "{}",
      );
      localStorage.setItem(
        "studymind_profile",
        JSON.stringify({ ...existing, name }),
      );
    } catch {
      /* ignore */
    }
    return { ok: true, user };
  }

  try {
    const { token, user } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    storeToken(token);
    storeSession(user);
    return { ok: true, user };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function authLogout() {
  clearToken();
  if (!env.isMock) {
    try {
      await api.post("/auth/logout", {});
    } catch {
      /* ignore */
    }
  }
  return { ok: true };
}

export async function authGetMe() {
  const session = getStoredSession();
  const token = getStoredToken();

  if (!token) return { ok: false, user: null };

  if (env.isMock) {
    return session ? { ok: true, user: session } : { ok: false, user: null };
  }

  try {
    const user = await api.get("/auth/me");
    storeSession(user);
    return { ok: true, user };
  } catch {
    clearToken();
    return { ok: false, user: null };
  }
}

export function passwordStrength(pw = "") {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["#FF3C3C", "#FF6B2B", "#FFB347", "#B5FF47", "#00FFC8"];
  return {
    score,
    label: labels[Math.min(score, 4)],
    color: colors[Math.min(score, 4)],
    pct: (score / 5) * 100,
  };
}
