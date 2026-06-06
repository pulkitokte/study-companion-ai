const TOKEN_KEY = "studymind_auth_token";
const SESSION_KEY = "studymind_auth_session";
const REMEMBER_KEY = "studymind_remember_me";
const EXPIRY_HOURS = 72; // default session length

function ts() {
  return Date.now();
}

// ─── STORE / CLEAR ────────────────────────────────────────────────
export function storeSession(user, token, rememberMe = false) {
  try {
    const expiry = rememberMe
      ? ts() + 30 * 24 * 60 * 60 * 1000 // 30 days
      : ts() + EXPIRY_HOURS * 60 * 60 * 1000;

    const session = { user, token, expiry, rememberMe };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, token);
    if (rememberMe) localStorage.setItem(REMEMBER_KEY, "true");
    return true;
  } catch {
    return false;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* ignore */
  }
}

// ─── RESTORE ─────────────────────────────────────────────────────
export function restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session?.user || !session?.token) return null;

    // Check expiry
    if (session.expiry && ts() > session.expiry) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRememberMe() {
  return localStorage.getItem(REMEMBER_KEY) === "true";
}

// ─── REFRESH EXPIRY ───────────────────────────────────────────────
export function touchSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    const remember = session.rememberMe;
    const expiry = remember
      ? ts() + 30 * 24 * 60 * 60 * 1000
      : ts() + EXPIRY_HOURS * 60 * 60 * 1000;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, expiry }));
  } catch {
    /* ignore */
  }
}

// ─── SESSION INFO ─────────────────────────────────────────────────
export function getSessionInfo() {
  const session = restoreSession();
  if (!session) return null;
  const minsLeft = Math.round((session.expiry - ts()) / 60000);
  return {
    user: session.user,
    token: session.token,
    expiresIn: minsLeft,
    rememberMe: session.rememberMe ?? false,
  };
}
