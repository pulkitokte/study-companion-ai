const KEY = 'studymind_focus_history'
const MAX = 150

export function saveFocusSession(session) {
  try {
    const history = getFocusHistory()
    const entry = {
      id:              `fs-${Date.now()}`,
      date:            new Date().toISOString(),
      mode:            session.mode            ?? 'pomodoro',
      durationMinutes: session.durationMinutes ?? 0,
      subject:         session.subject         ?? '',
      goal:            session.goal            ?? '',
      xpEarned:        session.xpEarned        ?? 0,
      pomodoroCount:   session.pomodoroCount   ?? 0,
      completed:       session.completed       ?? true,
    }
    localStorage.setItem(KEY, JSON.stringify([entry, ...history].slice(0, MAX)))
    return entry
  } catch { return null }
}

export function getFocusHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function clearFocusHistory() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

export function getFocusStats() {
  const h = getFocusHistory()
  if (!h.length) {
    return {
      totalSessions: 0, totalMinutes: 0, totalXP: 0,
      recentStreak: 0, bestStreak: 0, averageMinutes: 0,
      todayMinutes: 0, todayXP: 0, weeklyMinutes: 0,
    }
  }

  const today  = new Date().toISOString().slice(0, 10)
  const week   = new Date(); week.setDate(week.getDate() - 7)
  let totalMinutes = 0, totalXP = 0, todayMinutes = 0, todayXP = 0, weeklyMinutes = 0

  h.forEach(s => {
    const m = s.durationMinutes ?? 0
    const x = s.xpEarned       ?? 0
    totalMinutes += m; totalXP += x
    if (s.date?.slice(0, 10) === today) { todayMinutes += m; todayXP += x }
    if (new Date(s.date || 0) > week)    weeklyMinutes += m
  })

  const days = new Set(h.map(s => s.date?.slice(0, 10)).filter(Boolean))
  let streak = 0
  const now  = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    if (days.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  return {
    totalSessions:  h.length,
    totalMinutes,   totalXP,
    recentStreak:   streak,
    bestStreak:     streak,
    averageMinutes: Math.round(totalMinutes / h.length),
    todayMinutes,   todayXP,   weeklyMinutes,
  }
}