import StorageAdapter from "./storageAdapter.js";
import { aggregateAll } from "../utils/globalStats.js";

const TEAM_NS = "team_workspace";

// ─── TEAM SHAPE ─────────────────────────────────────────────────────
// { id, name, goal, members: [{ id, name, xp, streak, color }], createdAt }

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SIM_MEMBERS = [
  { id: "m1", name: "Priya S.", color: "#00FFC8", xp: 8420, streak: 12 },
  { id: "m2", name: "Arjun K.", color: "#7C6FFF", xp: 6210, streak: 5 },
  { id: "m3", name: "Meera R.", color: "#FF6B9D", xp: 9870, streak: 18 },
  { id: "m4", name: "Rohan T.", color: "#FFB347", xp: 4100, streak: 2 },
];

// ─── GET / CREATE TEAM ───────────────────────────────────────────────
export function getTeam() {
  let team = StorageAdapter.get(TEAM_NS);
  if (!team) {
    const stats = aggregateAll();
    team = {
      id: makeId("team"),
      name: "UPSC Aspirants Circle",
      goal: "Complete Prelims syllabus by Dec 2026",
      createdAt: new Date().toISOString(),
      members: [
        {
          id: "self",
          name: "You",
          color: "#00FFC8",
          xp: stats.totalXP ?? 0,
          streak: stats.streak ?? 0,
          isSelf: true,
        },
        ...SIM_MEMBERS,
      ],
    };
    StorageAdapter.set(TEAM_NS, team);
  }
  return team;
}

export function refreshSelfStats() {
  const team = getTeam();
  const stats = aggregateAll();
  const updated = {
    ...team,
    members: team.members.map((m) =>
      m.isSelf
        ? { ...m, xp: stats.totalXP ?? 0, streak: stats.streak ?? 0 }
        : m,
    ),
  };
  StorageAdapter.set(TEAM_NS, updated);
  return updated;
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────
export function getLeaderboard() {
  const team = refreshSelfStats();
  return [...team.members]
    .sort((a, b) => b.xp - a.xp)
    .map((m, i) => ({ ...m, rank: i + 1 }));
}

// ─── TEAM STREAK ─────────────────────────────────────────────────────
export function getTeamStreakStats() {
  const team = getTeam();
  const streaks = team.members.map((m) => m.streak);
  return {
    avgStreak: Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length),
    maxStreak: Math.max(...streaks),
    minStreak: Math.min(...streaks),
    activeToday: streaks.filter((s) => s > 0).length,
    totalMembers: team.members.length,
  };
}

// ─── UPDATE GOAL ─────────────────────────────────────────────────────
export function updateTeamGoal(goal) {
  const team = getTeam();
  const updated = { ...team, goal };
  StorageAdapter.set(TEAM_NS, updated);
  return updated;
}

export function updateTeamName(name) {
  const team = getTeam();
  const updated = { ...team, name };
  StorageAdapter.set(TEAM_NS, updated);
  return updated;
}
