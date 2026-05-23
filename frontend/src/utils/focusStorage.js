const FOCUS_KEY = "studymind_focus_history";
const MAX_SESSIONS = 100;

export function saveFocusSession(session) {
  try {
    const history = getFocusHistory();
    const entry = {
      id: `fs-${Date.now()}`,
      date: new Date().toISOString(),
      ...session,
    };
    const updated = [entry, ...history].slice(0, MAX_SESSIONS);
    localStorage.setItem(FOCUS_KEY, JSON.stringify(updated));
    return entry;
  } catch {
    return null;
  }
}

export function getFocusHistory() {
  try {
    const raw = localStorage.getItem(FOCUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearFocusHistory() {
  try {
    localStorage.removeItem(FOCUS_KEY);
  } catch {
    /* ignore */
  }
}

export function getFocusStats() {
  const history = getFocusHistory();
  if (!history.length)
    return {
      totalSessions: 0,
      totalMinutes: 0,
      totalXP: 0,
      bestStreak: 0,
      recentStreak: 0,
      averageMinutes: 0,
    };

  let totalMinutes = 0,
    totalXP = 0,
    bestStreak = 0;
  history.forEach((s) => {
    totalMinutes += s.durationMinutes ?? 0;
    totalXP += s.xpEarned ?? 0;
    if ((s.streak ?? 0) > bestStreak) bestStreak = s.streak ?? 0;
  });

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

  return {
    totalSessions: history.length,
    totalMinutes,
    totalXP,
    bestStreak,
    recentStreak: streak,
    averageMinutes: Math.round(totalMinutes / history.length),
  };
}
