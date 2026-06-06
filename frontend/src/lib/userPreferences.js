const PREFS_KEY = "studymind_user_prefs";

const DEFAULTS = {
  // Theme
  accentColor: "cyan",
  glowIntensity: "normal",
  // Notifications
  notifXP: true,
  notifStreak: true,
  notifAchieve: true,
  notifMission: true,
  notifFocus: true,
  // Dashboard
  dashboardLayout: "full", // 'full' | 'compact'
  showActivityFeed: true,
  showSystemStatus: true,
  // Study goals
  dailyXPGoal: 500,
  dailyFocusMins: 60,
  weeklyQuizTarget: 10,
  // Misc
  language: "en",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setPreference(key, value) {
  try {
    const current = getPreferences();
    const updated = { ...current, [key]: value };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getPreferences();
  }
}

export function setPreferences(partial) {
  try {
    const current = getPreferences();
    const updated = { ...current, ...partial };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getPreferences();
  }
}

export function resetPreferences() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULTS));
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS };
}

// Convenience getters
export function getNotifPrefs() {
  const p = getPreferences();
  return {
    xp: p.notifXP,
    streak: p.notifStreak,
    achievement: p.notifAchieve,
    mission: p.notifMission,
    focus: p.notifFocus,
  };
}

export function getStudyGoals() {
  const p = getPreferences();
  return {
    dailyXP: p.dailyXPGoal,
    dailyFocusMins: p.dailyFocusMins,
    weeklyQuizzes: p.weeklyQuizTarget,
  };
}
