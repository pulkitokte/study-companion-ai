// Single source of truth — reads quiz + focus history and merges into unified stats.
import { getQuizHistory } from "./quizStorage.js";
import { getFocusHistory } from "./focusStorage.js";

const MISSIONS_KEY = "studymind_missions";
const ACHIEVEMENTS_KEY = "studymind_achievements";

// ─── UNIFIED XP ────────────────────────────────────────────────────
export function getTotalXP() {
  const quizXP = (getQuizHistory() ?? []).reduce(
    (s, q) => s + (q.totalXP ?? 0),
    0,
  );
  const focusXP = (getFocusHistory() ?? []).reduce(
    (s, f) => s + (f.xpEarned ?? 0),
    0,
  );
  return quizXP + focusXP;
}

// ─── LEVEL SYSTEM ──────────────────────────────────────────────────
export const XP_PER_LEVEL = 500; // XP needed per level

export function getLevelData(totalXP = 0) {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInto = totalXP % XP_PER_LEVEL;
  const pct = Math.round((xpInto / XP_PER_LEVEL) * 100);
  const toNext = XP_PER_LEVEL - xpInto;
  return { level, xpInto, pct, toNext, xpForNext: XP_PER_LEVEL };
}

// ─── RANKS ─────────────────────────────────────────────────────────
export const RANKS = [
  {
    id: "rookie",
    label: "Rookie",
    minLevel: 1,
    color: "#888",
    emoji: "🥉",
    description: "The journey begins",
  },
  {
    id: "cadet",
    label: "Cadet",
    minLevel: 5,
    color: "#4FC3F7",
    emoji: "🎖️",
    description: "Building foundation",
  },
  {
    id: "disciplined",
    label: "Disciplined",
    minLevel: 10,
    color: "#00FFC8",
    emoji: "⚡",
    description: "Habits forming",
  },
  {
    id: "strategist",
    label: "Strategist",
    minLevel: 20,
    color: "#7C6FFF",
    emoji: "🧠",
    description: "Tactical excellence",
  },
  {
    id: "elite",
    label: "Elite",
    minLevel: 35,
    color: "#FFB347",
    emoji: "🔱",
    description: "Top 5% performer",
  },
  {
    id: "legend",
    label: "Legend",
    minLevel: 50,
    color: "#FFD700",
    emoji: "👑",
    description: "UPSC Champion material",
  },
];

export function getRankByLevel(level = 1) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
    else break;
  }
  return rank;
}

export function getNextRankByLevel(level = 1) {
  for (let i = 0; i < RANKS.length - 1; i++) {
    if (level < RANKS[i + 1].minLevel) return RANKS[i + 1];
  }
  return null;
}

// ─── UNIFIED STREAK ────────────────────────────────────────────────
export function getGlobalStreak() {
  const quizDays = new Set(
    (getQuizHistory() ?? []).map((s) => s.date?.slice(0, 10)).filter(Boolean),
  );
  const focusDays = new Set(
    (getFocusHistory() ?? []).map((s) => s.date?.slice(0, 10)).filter(Boolean),
  );
  const allDays = new Set([...quizDays, ...focusDays]);
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (allDays.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }
  return streak;
}

export function getLast30Days() {
  const quizDays = new Set(
    (getQuizHistory() ?? []).map((s) => s.date?.slice(0, 10)).filter(Boolean),
  );
  const focusDays = new Set(
    (getFocusHistory() ?? []).map((s) => s.date?.slice(0, 10)).filter(Boolean),
  );
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      hasQuiz: quizDays.has(key),
      hasFocus: focusDays.has(key),
      active: quizDays.has(key) || focusDays.has(key),
    };
  });
}

// ─── DAILY MISSIONS ────────────────────────────────────────────────
export const MISSION_TEMPLATES = [
  { id: "quiz_10", label: "Answer 10 quiz questions", xp: 100, type: "quiz" },
  {
    id: "focus_25",
    label: "Complete a 25m focus session",
    xp: 150,
    type: "focus",
  },
  { id: "quiz_acc", label: "Score 75%+ on a quiz", xp: 120, type: "quiz" },
  {
    id: "focus_60",
    label: "Focus for 60 minutes total",
    xp: 200,
    type: "focus",
  },
  { id: "both", label: "Do both a quiz & focus today", xp: 250, type: "mixed" },
  { id: "streak", label: "Extend your daily streak", xp: 80, type: "streak" },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayMissions() {
  try {
    const raw = localStorage.getItem(MISSIONS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.date === getTodayKey()) return saved.missions;
    }
  } catch {
    /* ignore */
  }

  // Generate 3 missions for today deterministically
  const dayNum = Math.floor(Date.now() / 86400000);
  const missions = MISSION_TEMPLATES.slice(dayNum % 2, (dayNum % 2) + 3).map(
    (t) => ({ ...t, done: false }),
  );
  saveMissions(missions);
  return missions;
}

export function saveMissions(missions) {
  try {
    localStorage.setItem(
      MISSIONS_KEY,
      JSON.stringify({ date: getTodayKey(), missions }),
    );
  } catch {
    /* ignore */
  }
}

export function checkMissionsAutoComplete(missions) {
  const qHistory = getQuizHistory() ?? [];
  const fHistory = getFocusHistory() ?? [];
  const today = getTodayKey();
  const todayQuiz = qHistory.filter((q) => q.date?.slice(0, 10) === today);
  const todayFoc = fHistory.filter((f) => f.date?.slice(0, 10) === today);
  const totalAns = todayQuiz.reduce((s, q) => s + (q.total ?? 0), 0);
  const bestAcc = todayQuiz.length
    ? Math.max(...todayQuiz.map((q) => q.accuracy ?? 0))
    : 0;
  const focusMins = todayFoc.reduce((s, f) => s + (f.durationMinutes ?? 0), 0);

  return missions.map((m) => {
    if (m.done) return m;
    let done = false;
    if (m.id === "quiz_10") done = totalAns >= 10;
    if (m.id === "focus_25")
      done = todayFoc.some((f) => (f.durationMinutes ?? 0) >= 25);
    if (m.id === "quiz_acc") done = bestAcc >= 75;
    if (m.id === "focus_60") done = focusMins >= 60;
    if (m.id === "both") done = todayQuiz.length > 0 && todayFoc.length > 0;
    if (m.id === "streak") done = getGlobalStreak() >= 2;
    return { ...m, done };
  });
}

// ─── ACHIEVEMENTS ──────────────────────────────────────────────────
export const ALL_ACHIEVEMENTS = {
  // Onboarding
  profile_complete: {
    label: "Profile Built",
    desc: "Completed onboarding",
    emoji: "🎯",
    color: "#00FFC8",
    category: "general",
  },
  // Quiz
  first_quiz: {
    label: "First Battle",
    desc: "Completed first quiz",
    emoji: "⚔️",
    color: "#FFB347",
    category: "quiz",
  },
  quiz_10: {
    label: "Quiz Grinder",
    desc: "Completed 10 quizzes",
    emoji: "📚",
    color: "#7C6FFF",
    category: "quiz",
  },
  quiz_ace: {
    label: "Ace",
    desc: "Scored 90%+ on any quiz",
    emoji: "🎖️",
    color: "#00FFC8",
    category: "quiz",
  },
  perfect_quiz: {
    label: "Perfect Round",
    desc: "Scored 100% on any quiz",
    emoji: "💎",
    color: "#FFD700",
    category: "quiz",
  },
  // Focus
  first_focus: {
    label: "First Lock-In",
    desc: "Completed first focus session",
    emoji: "🔒",
    color: "#7C6FFF",
    category: "focus",
  },
  focus_marathon: {
    label: "Marathon",
    desc: "Focused for 2+ hours in one session",
    emoji: "🏃",
    color: "#FF6B2B",
    category: "focus",
  },
  focus_50: {
    label: "Focus Machine",
    desc: "Completed 50 focus sessions",
    emoji: "⚙️",
    color: "#FFB347",
    category: "focus",
  },
  // Streaks
  streak_3: {
    label: "Consistent",
    desc: "3-day activity streak",
    emoji: "🔥",
    color: "#FF6B2B",
    category: "streak",
  },
  streak_7: {
    label: "Week Warrior",
    desc: "7-day activity streak",
    emoji: "📅",
    color: "#FFD700",
    category: "streak",
  },
  streak_30: {
    label: "Unstoppable",
    desc: "30-day activity streak",
    emoji: "⚡",
    color: "#00FFC8",
    category: "streak",
  },
  // XP
  xp_500: {
    label: "XP Seeker",
    desc: "Earned 500 total XP",
    emoji: "⭐",
    color: "#FFB347",
    category: "xp",
  },
  xp_2000: {
    label: "XP Hunter",
    desc: "Earned 2,000 total XP",
    emoji: "🌟",
    color: "#7C6FFF",
    category: "xp",
  },
  xp_5000: {
    label: "XP Legend",
    desc: "Earned 5,000 total XP",
    emoji: "👑",
    color: "#FFD700",
    category: "xp",
  },
  // Levels
  level_5: {
    label: "Level 5",
    desc: "Reached Level 5",
    emoji: "📈",
    color: "#00FFC8",
    category: "level",
  },
  level_10: {
    label: "Level 10",
    desc: "Reached Level 10",
    emoji: "🚀",
    color: "#7C6FFF",
    category: "level",
  },
  level_20: {
    label: "Level 20",
    desc: "Reached Level 20",
    emoji: "🔱",
    color: "#FFB347",
    category: "level",
  },
};

export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function computeUnlocked(
  totalXP,
  level,
  streak,
  quizHistory,
  focusHistory,
) {
  const ids = new Set();
  const qLen = quizHistory.length;
  const fLen = focusHistory.length;
  const bestAcc = qLen
    ? Math.max(...quizHistory.map((q) => q.accuracy ?? 0))
    : 0;
  const maxFocus = fLen
    ? Math.max(...focusHistory.map((f) => f.durationMinutes ?? 0))
    : 0;

  const onboarded = localStorage.getItem("studymind_onboarded") === "true";
  if (onboarded) ids.add("profile_complete");
  if (qLen >= 1) ids.add("first_quiz");
  if (qLen >= 10) ids.add("quiz_10");
  if (bestAcc >= 90) ids.add("quiz_ace");
  if (bestAcc >= 100) ids.add("perfect_quiz");
  if (fLen >= 1) ids.add("first_focus");
  if (fLen >= 50) ids.add("focus_50");
  if (maxFocus >= 120) ids.add("focus_marathon");
  if (streak >= 3) ids.add("streak_3");
  if (streak >= 7) ids.add("streak_7");
  if (streak >= 30) ids.add("streak_30");
  if (totalXP >= 500) ids.add("xp_500");
  if (totalXP >= 2000) ids.add("xp_2000");
  if (totalXP >= 5000) ids.add("xp_5000");
  if (level >= 5) ids.add("level_5");
  if (level >= 10) ids.add("level_10");
  if (level >= 20) ids.add("level_20");

  // Persist
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
  return ids;
}

// ─── UNIFIED STATS ─────────────────────────────────────────────────
export function getGlobalStats() {
  const qHistory = getQuizHistory() ?? [];
  const fHistory = getFocusHistory() ?? [];
  const totalXP = getTotalXP();
  const { level, xpInto, pct, toNext } = getLevelData(totalXP);
  const streak = getGlobalStreak();
  const rank = getRankByLevel(level);
  const nextRank = getNextRankByLevel(level);
  const unlocked = computeUnlocked(totalXP, level, streak, qHistory, fHistory);

  const quizXP = qHistory.reduce((s, q) => s + (q.totalXP ?? 0), 0);
  const focusXP = fHistory.reduce((s, f) => s + (f.xpEarned ?? 0), 0);
  const quizMins = qHistory.reduce((s, q) => s + (q.total ?? 0) * 1.5, 0); // approx
  const focusMins = fHistory.reduce((s, f) => s + (f.durationMinutes ?? 0), 0);

  return {
    totalXP,
    quizXP,
    focusXP,
    level,
    xpInto,
    levelPct: pct,
    xpToNextLevel: toNext,
    streak,
    rank,
    nextRank,
    totalQuizzes: qHistory.length,
    totalFocusSessions: fHistory.length,
    focusMinutes: focusMins,
    quizAccuracy: qHistory.length
      ? Math.round(
          qHistory.reduce((s, q) => s + (q.accuracy ?? 0), 0) / qHistory.length,
        )
      : 0,
    achievementsUnlocked: unlocked.size,
    achievementIds: unlocked,
  };
}
