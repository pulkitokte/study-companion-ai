const HISTORY_KEY = "studymind_quiz_history";
const ACHIEVEMENTS_KEY = "studymind_achievements";
const MAX_SESSIONS = 100;

export function saveQuizSession(session) {
  try {
    const history = getQuizHistory();
    const entry = {
      id: `q-${Date.now()}`,
      date: new Date().toISOString(),
      ...session,
    };
    const updated = [entry, ...history].slice(0, MAX_SESSIONS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return entry;
  } catch {
    return null;
  }
}

export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearQuizHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function getPerformanceStats() {
  const history = getQuizHistory();
  if (!history.length) {
    return {
      totalQuizzes: 0,
      totalXP: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      bestStreak: 0,
      totalSeconds: 0,
      recentStreak: 0,
      categoryStats: {},
    };
  }
  let totalXP = 0,
    totalCorrect = 0,
    totalAnswered = 0;
  let bestAccuracy = 0,
    bestStreak = 0,
    totalSeconds = 0;
  const catMap = {};

  history.forEach((s) => {
    totalXP += s.totalXP ?? 0;
    totalCorrect += s.correct ?? 0;
    totalAnswered += s.total ?? 0;
    totalSeconds += s.durationSeconds ?? 0;
    if ((s.accuracy ?? 0) > bestAccuracy) bestAccuracy = s.accuracy ?? 0;
    if ((s.maxStreak ?? 0) > bestStreak) bestStreak = s.maxStreak ?? 0;
    const cat = s.category ?? "unknown";
    if (!catMap[cat])
      catMap[cat] = { sessions: 0, correct: 0, total: 0, xp: 0 };
    catMap[cat].sessions++;
    catMap[cat].correct += s.correct ?? 0;
    catMap[cat].total += s.total ?? 0;
    catMap[cat].xp += s.totalXP ?? 0;
  });

  Object.keys(catMap).forEach((cat) => {
    const c = catMap[cat];
    c.accuracy = c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0;
  });

  return {
    totalQuizzes: history.length,
    totalXP,
    totalCorrect,
    totalAnswered,
    averageAccuracy:
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    bestAccuracy,
    bestStreak,
    totalSeconds,
    categoryStats: catMap,
    recentStreak: calcDailyStreak(history),
  };
}

export function getCategoryStats() {
  return getPerformanceStats().categoryStats;
}

export function getBestStreak() {
  return getPerformanceStats().bestStreak;
}

function calcDailyStreak(history) {
  const days = new Set(
    history.map((s) => s.date?.slice(0, 10)).filter(Boolean),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }
  return streak;
}

// ─── ACHIEVEMENTS ──────────────────────────────────────────────────
export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(id) {
  try {
    const current = getUnlockedAchievements();
    if (current.includes(id)) return false;
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...current, id]));
    return true;
  } catch {
    return false;
  }
}

export function checkAndUnlockAchievements(session, stats) {
  const newly = [];
  const unlocked = getUnlockedAchievements();

  const try_ = (id, condition) => {
    if (!unlocked.includes(id) && !newly.includes(id) && condition) {
      if (unlockAchievement(id)) newly.push(id);
    }
  };

  try_("first_quiz", stats.totalQuizzes === 1);
  try_("quiz_5", stats.totalQuizzes >= 5);
  try_("quiz_25", stats.totalQuizzes >= 25);
  try_("quiz_50", stats.totalQuizzes >= 50);
  try_("accuracy_master", session.accuracy >= 90);
  try_("perfect_score", session.accuracy === 100);
  try_("streak_3", session.maxStreak >= 3);
  try_("streak_5", session.maxStreak >= 5);
  try_("xp_1000", stats.totalXP >= 1000);
  try_("xp_5000", stats.totalXP >= 5000);
  try_("daily_3", stats.recentStreak >= 3);
  try_("daily_7", stats.recentStreak >= 7);

  if (
    session.durationSeconds > 0 &&
    session.durationSeconds / (session.total || 1) < 15
  ) {
    try_("speed_demon", true);
  }
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 3) try_("night_grinder", true);

  return newly;
}
