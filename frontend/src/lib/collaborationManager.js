import StorageAdapter from "./storageAdapter.js";
import { getCurrentDevice } from "./deviceManager.js";

const ROOMS_NS = "collab_rooms";

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── ROOMS ─────────────────────────────────────────────────────────
export function getRooms() {
  return StorageAdapter.get(ROOMS_NS, []);
}

export function createRoom({ name, subject = "General", emoji = "📚" }) {
  const rooms = getRooms();
  const device = getCurrentDevice();
  const room = {
    id: makeId("room"),
    name: name || "Study Room",
    subject,
    emoji,
    inviteCode: makeId("inv").slice(-8).toUpperCase(),
    createdAt: new Date().toISOString(),
    createdBy: device.id,
    members: [
      {
        id: "self",
        name: "You",
        role: "owner",
        joinedAt: new Date().toISOString(),
      },
    ],
    tasks: [],
    notes: [],
  };
  StorageAdapter.set(ROOMS_NS, [room, ...rooms]);
  return room;
}

export function getRoom(id) {
  return getRooms().find((r) => r.id === id) ?? null;
}

export function deleteRoom(id) {
  StorageAdapter.set(
    ROOMS_NS,
    getRooms().filter((r) => r.id !== id),
  );
}

export function joinRoomByCode(code) {
  const rooms = getRooms();
  const room = rooms.find((r) => r.inviteCode === code?.toUpperCase());
  if (!room) return { ok: false, error: "Invalid invite code" };
  return { ok: true, room };
}

// ─── COLLABORATIVE TASKS ────────────────────────────────────────────
export function addRoomTask(roomId, task) {
  const rooms = getRooms();
  const updated = rooms.map((r) => {
    if (r.id !== roomId) return r;
    const entry = {
      id: makeId("task"),
      title: task.title,
      assignee: task.assignee ?? "Unassigned",
      done: false,
      createdAt: new Date().toISOString(),
    };
    return { ...r, tasks: [entry, ...r.tasks] };
  });
  StorageAdapter.set(ROOMS_NS, updated);
  return updated.find((r) => r.id === roomId);
}

export function toggleRoomTask(roomId, taskId) {
  const rooms = getRooms();
  const updated = rooms.map((r) => {
    if (r.id !== roomId) return r;
    return {
      ...r,
      tasks: r.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t,
      ),
    };
  });
  StorageAdapter.set(ROOMS_NS, updated);
  return updated.find((r) => r.id === roomId);
}

export function removeRoomTask(roomId, taskId) {
  const rooms = getRooms();
  const updated = rooms.map((r) => {
    if (r.id !== roomId) return r;
    return { ...r, tasks: r.tasks.filter((t) => t.id !== taskId) };
  });
  StorageAdapter.set(ROOMS_NS, updated);
  return updated.find((r) => r.id === roomId);
}

// ─── SHARED NOTES ────────────────────────────────────────────────────
export function addRoomNote(roomId, content) {
  const rooms = getRooms();
  const updated = rooms.map((r) => {
    if (r.id !== roomId) return r;
    const note = {
      id: makeId("note"),
      content,
      author: "You",
      createdAt: new Date().toISOString(),
    };
    return { ...r, notes: [note, ...r.notes].slice(0, 50) };
  });
  StorageAdapter.set(ROOMS_NS, updated);
  return updated.find((r) => r.id === roomId);
}

// ─── SEED DEMO ROOM ───────────────────────────────────────────────
export function ensureDemoRoom() {
  const rooms = getRooms();
  if (rooms.length > 0) return rooms[0];

  const room = createRoom({
    name: "UPSC Prelims Squad",
    subject: "Polity & Economy",
    emoji: "🏛️",
  });
  const withMembers = getRooms().map((r) =>
    r.id === room.id
      ? {
          ...r,
          members: [
            ...r.members,
            {
              id: "m2",
              name: "Priya S.",
              role: "member",
              joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              id: "m3",
              name: "Arjun K.",
              role: "member",
              joinedAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          tasks: [
            {
              id: makeId("task"),
              title: "Revise Fundamental Rights (Part III)",
              assignee: "Priya S.",
              done: true,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: makeId("task"),
              title: "Complete Economic Survey Ch.4",
              assignee: "You",
              done: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: makeId("task"),
              title: "Group quiz on Indian Polity",
              assignee: "Arjun K.",
              done: false,
              createdAt: new Date().toISOString(),
            },
          ],
          notes: [
            {
              id: makeId("note"),
              content:
                "Focus on DPSP vs Fundamental Rights distinction for tomorrow.",
              author: "Priya S.",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
        }
      : r,
  );
  StorageAdapter.set(ROOMS_NS, withMembers);
  return withMembers[0];
}
