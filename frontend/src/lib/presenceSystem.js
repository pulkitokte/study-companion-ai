import StorageAdapter from "./storageAdapter.js";
import { getCurrentDevice } from "./deviceManager.js";

const PRESENCE_NS = "presence_self";

// ─── SELF PRESENCE ─────────────────────────────────────────────────
export function getSelfPresence() {
  const device = getCurrentDevice();
  return StorageAdapter.get(PRESENCE_NS, {
    status: "online",
    activity: "idle",
    deviceId: device.id,
    since: new Date().toISOString(),
  });
}

export function setPresence(status, activity = "idle") {
  const device = getCurrentDevice();
  const updated = {
    status, // 'online' | 'away' | 'offline'
    activity, // 'idle' | 'quiz' | 'focus' | 'planner' | 'chat'
    deviceId: device.id,
    since: new Date().toISOString(),
  };
  StorageAdapter.set(PRESENCE_NS, updated);
  return updated;
}

// ─── TYPING INDICATOR ──────────────────────────────────────────────
let _typingTimeout = null;
const typingListeners = new Set();

export function setTyping(isTyping, label = "You") {
  typingListeners.forEach((fn) => fn({ isTyping, label }));
  if (_typingTimeout) clearTimeout(_typingTimeout);
  if (isTyping) {
    _typingTimeout = setTimeout(() => {
      typingListeners.forEach((fn) => fn({ isTyping: false, label }));
    }, 3000);
  }
}

export function onTyping(fn) {
  typingListeners.add(fn);
  return () => typingListeners.delete(fn);
}

// ─── SIMULATED ROOM USERS ──────────────────────────────────────────
const SIM_NAMES = ["Priya S.", "Arjun K.", "Meera R.", "Rohan T.", "Ananya V."];
const SIM_COLORS = ["#00FFC8", "#7C6FFF", "#FF6B9D", "#FFB347", "#B5FF47"];
const ACTIVITIES = ["idle", "quiz", "focus", "planner", "chat"];

export function getSimulatedPresence(count = 4) {
  const now = Date.now();
  return SIM_NAMES.slice(0, count).map((name, i) => ({
    id: `sim-user-${i}`,
    name,
    color: SIM_COLORS[i % SIM_COLORS.length],
    status: i === 1 ? "away" : "online",
    activity: ACTIVITIES[(i + Math.floor(now / 60000)) % ACTIVITIES.length],
    avatar: name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    lastSeen: new Date(now - i * 1000 * 60 * 3).toISOString(),
  }));
}

export function getPresenceSummary(simulatedCount = 4) {
  const self = getSelfPresence();
  const sims = getSimulatedPresence(simulatedCount);
  const all = [
    { id: "self", name: "You", color: "#00FFC8", ...self, avatar: "YOU" },
    ...sims,
  ];
  return {
    total: all.length,
    online: all.filter((u) => u.status === "online").length,
    users: all,
  };
}
