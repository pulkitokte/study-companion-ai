// Simulated WebSocket-style realtime engine.
// Future: swap _simulateConnection() with a real WebSocket/Socket.io connection.
// The public API (connect/send/on/off/disconnect) is designed to map 1:1
// to a real socket implementation.

const listeners = new Map(); // event -> Set<fn>
let _connected = false;
let _connecting = false;
let _heartbeat = null;
let _reconnectAttempts = 0;

const MAX_RECONNECT = 5;

function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach((fn) => {
    try {
      fn(payload);
    } catch {
      /* ignore */
    }
  });
}

// ─── CONNECTION LIFECYCLE ─────────────────────────────────────────
export function connect() {
  if (_connected || _connecting) return;
  _connecting = true;
  emit("connecting", { ts: Date.now() });

  // Simulate connection handshake latency
  setTimeout(
    () => {
      _connected = true;
      _connecting = false;
      _reconnectAttempts = 0;
      emit("connected", { ts: Date.now(), simulated: true });
      startHeartbeat();
    },
    400 + Math.random() * 400,
  );
}

export function disconnect() {
  _connected = false;
  stopHeartbeat();
  emit("disconnected", { ts: Date.now(), reason: "manual" });
}

function startHeartbeat() {
  stopHeartbeat();
  _heartbeat = setInterval(() => {
    if (!_connected) return;
    emit("heartbeat", { ts: Date.now() });
  }, 15000);
}

function stopHeartbeat() {
  if (_heartbeat) {
    clearInterval(_heartbeat);
    _heartbeat = null;
  }
}

// ─── RECONNECT HANDLING ───────────────────────────────────────────
export function attemptReconnect() {
  if (_connected) return;
  if (_reconnectAttempts >= MAX_RECONNECT) {
    emit("reconnect_failed", { attempts: _reconnectAttempts });
    return;
  }
  _reconnectAttempts++;
  emit("reconnecting", { attempt: _reconnectAttempts, max: MAX_RECONNECT });
  setTimeout(() => connect(), 800 * _reconnectAttempts);
}

// ─── SEND (simulated broadcast) ───────────────────────────────────
// In production this sends over the socket. Here, it loops back as
// a "broadcast" event so UI can render optimistic local state.
export function send(event, payload) {
  if (!_connected) {
    emit("send_failed", { event, payload, reason: "not_connected" });
    return false;
  }
  // Simulated round-trip latency
  setTimeout(
    () => {
      emit("message", { event, payload, ts: Date.now(), echo: true });
      emit(event, payload);
    },
    80 + Math.random() * 120,
  );
  return true;
}

// ─── SUBSCRIBE / UNSUBSCRIBE ──────────────────────────────────────
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  listeners.get(event)?.delete(fn);
}

// ─── STATE ─────────────────────────────────────────────────────────
export function isConnected() {
  return _connected;
}
export function isConnecting() {
  return _connecting;
}

export function getEngineStatus() {
  return {
    connected: _connected,
    connecting: _connecting,
    reconnectAttempts: _reconnectAttempts,
    maxReconnect: MAX_RECONNECT,
  };
}

export default {
  connect,
  disconnect,
  attemptReconnect,
  send,
  on,
  off,
  isConnected,
  isConnecting,
  getEngineStatus,
};
