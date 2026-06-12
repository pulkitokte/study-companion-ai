import StorageAdapter from "./storageAdapter.js";
import { getSimulatedPresence } from "./presenceSystem.js";

const LIVE_SESSION_NS = "live_focus_session";

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── SHARED FOCUS SESSION SHAPE ──────────────────────────────────────
// { id, mode, durationMinutes, startedAt, participants: [...], status }

export function getLiveSession() {
  return StorageAdapter.get(LIVE_SESSION_NS, null);
}

export function startLiveSession({
  mode = "pomodoro",
  durationMinutes = 25,
  subject = "",
}) {
  const sims = getSimulatedPresence(3).filter((u) => u.status === "online");
  const session = {
    id: makeId("live"),
    mode,
    subject,
    durationMinutes,
    startedAt: new Date().toISOString(),
    status: "active", // 'active' | 'paused' | 'completed'
    participants: [
      {
        id: "self",
        name: "You",
        color: "#00FFC8",
        joinedAt: new Date().toISOString(),
        avatar: "YOU",
      },
      ...sims.map((u) => ({
        id: u.id,
        name: u.name,
        color: u.color,
        joinedAt: new Date().toISOString(),
        avatar: u.avatar,
      })),
    ],
  };
  StorageAdapter.set(LIVE_SESSION_NS, session);
  return session;
}

export function endLiveSession() {
  const session = getLiveSession();
  if (!session) return null;
  const updated = {
    ...session,
    status: "completed",
    endedAt: new Date().toISOString(),
  };
  StorageAdapter.set(LIVE_SESSION_NS, updated);
  return updated;
}

export function clearLiveSession() {
  StorageAdapter.remove(LIVE_SESSION_NS);
}

export function pauseLiveSession() {
  const session = getLiveSession();
  if (!session) return null;
  const updated = {
    ...session,
    status: session.status === "paused" ? "active" : "paused",
  };
  StorageAdapter.set(LIVE_SESSION_NS, updated);
  return updated;
}

// ─── ELAPSED CALCULATION ──────────────────────────────────────────────
export function getLiveSessionProgress() {
  const session = getLiveSession();
  if (!session || session.status !== "active") return null;

  const elapsedMs = Date.now() - new Date(session.startedAt).getTime();
  const totalMs = session.durationMinutes * 60 * 1000;
  const pct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  const remainingSec = Math.max(0, Math.round((totalMs - elapsedMs) / 1000));

  return { pct, remainingSec, elapsedMs, totalMs };
}
