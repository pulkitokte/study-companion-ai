// Network state detection + reconnect listener system

const listeners = new Set();

let _state = {
  online: navigator.onLine,
  quality: "unknown", // 'fast' | 'slow' | 'unknown' | 'offline'
  rtt: null,
  lastOnline: navigator.onLine ? new Date().toISOString() : null,
  lastOffline: null,
  downlinks: null,
};

function emit(event) {
  listeners.forEach((fn) => {
    try {
      fn(event, _state);
    } catch {
      /* ignore */
    }
  });
}

// ─── QUALITY DETECTION ────────────────────────────────────────────
function detectQuality() {
  try {
    const conn = navigator.connection;
    if (!conn) return "unknown";
    const { effectiveType, downlink, rtt } = conn;
    _state.rtt = rtt;
    _state.downlinks = downlink;
    if (!navigator.onLine) return "offline";
    if (effectiveType === "4g" && downlink > 1) return "fast";
    if (effectiveType === "3g" || downlink > 0.5) return "slow";
    return "slow";
  } catch {
    return navigator.onLine ? "unknown" : "offline";
  }
}

// ─── ONLINE/OFFLINE HANDLERS ─────────────────────────────────────
function handleOnline() {
  _state = {
    ..._state,
    online: true,
    quality: detectQuality(),
    lastOnline: new Date().toISOString(),
  };
  emit("online");
}

function handleOffline() {
  _state = {
    ..._state,
    online: false,
    quality: "offline",
    lastOffline: new Date().toISOString(),
  };
  emit("offline");
}

function handleConnectionChange() {
  _state = { ..._state, quality: detectQuality() };
  emit("connection_change");
}

// ─── INIT ─────────────────────────────────────────────────────────
let _initialized = false;

export function initNetworkManager() {
  if (_initialized) return;
  _initialized = true;
  _state.quality = detectQuality();

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  try {
    const conn = navigator.connection;
    if (conn) conn.addEventListener("change", handleConnectionChange);
  } catch {
    /* ignore */
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────
export function getNetworkState() {
  return { ..._state };
}

export function isOnline() {
  return _state.online;
}
export function isFast() {
  return _state.quality === "fast";
}
export function isSlow() {
  return _state.quality === "slow";
}

export function onNetwork(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn); // returns cleanup fn
}

// Simple ping to verify real connectivity (not just navigator.onLine)
export async function ping(url = "https://www.google.com/generate_204") {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return { ok: true, status: res.status };
  } catch {
    return { ok: false };
  }
}

export default {
  initNetworkManager,
  getNetworkState,
  isOnline,
  isFast,
  isSlow,
  onNetwork,
  ping,
};
