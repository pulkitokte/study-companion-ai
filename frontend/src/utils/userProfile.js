// Safe reader for onboarding profile + unified cross-system stats.
// Import this anywhere — no context needed, no circular deps.

import { getQuizHistory }  from './quizStorage.js'
import { getFocusHistory } from './focusStorage.js'

// ─── PROFILE ───────────────────────────────────────────────────────
export function getProfile() {
  try {
    const raw = localStorage.getItem('studymind_profile')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export function isOnboarded() {
  return localStorage.getItem('studymind_onboarded') === 'true'
}

export function getDisplayName(fallback = 'Scholar') {
  return getProfile()?.name?.trim() || fallback
}

export function getFirstName(fallback = 'Scholar') {
  const full = getProfile()?.name?.trim() || fallback
  return full.split(' ')[0]
}

export function getTargetExam(fallback = 'Govt. Exam') {
  return getProfile()?.targetExam || fallback
}

export function getWeakSubjects() {
  const p = getProfile()
  if (!p?.weakSubjects) return []
  if (Array.isArray(p.weakSubjects)) return p.weakSubjects
  return []
}

export function getDreamGoal(fallback = 'Your dream post') {
  return getProfile()?.dreamGoal || fallback
}

// ─── UNIFIED XP ────────────────────────────────────────────────────
export function getUnifiedXP() {
  const quizXP  = (getQuizHistory()  ?? []).reduce((s, q) => s + (q.totalXP    ?? 0), 0)
  const focusXP = (getFocusHistory() ?? []).reduce((s, f) => s + (f.xpEarned   ?? 0), 0)
  return { quizXP, focusXP, totalXP: quizXP + focusXP }
}

// ─── UNIFIED STREAK ────────────────────────────────────────────────
export function getUnifiedStreak() {
  const qDays = new Set((getQuizHistory()  ?? []).map(s => s.date?.slice(0,10)).filter(Boolean))
  const fDays = new Set((getFocusHistory() ?? []).map(s => s.date?.slice(0,10)).filter(Boolean))
  const all   = new Set([...qDays, ...fDays])
  let streak  = 0
  const now   = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    if (all.has(d.toISOString().slice(0, 10))) streak++; else break
  }
  return streak
}

// ─── LEVEL ─────────────────────────────────────────────────────────
export function getLevelFromXP(xp = 0) {
  return Math.floor(xp / 500) + 1
}

export function getLevelProgress(xp = 0) {
  const level  = getLevelFromXP(xp)
  const into   = xp % 500
  const pct    = Math.round((into / 500) * 100)
  return { level, into, pct, toNext: 500 - into }
}

// ─── PRODUCTIVITY SCORE ────────────────────────────────────────────
export function getProductivityScore() {
  const streak       = getUnifiedStreak()
  const qH           = getQuizHistory()  ?? []
  const fH           = getFocusHistory() ?? []
  const sessions     = qH.length + fH.length
  const avgAcc       = qH.length ? qH.reduce((s, q) => s + (q.accuracy ?? 0), 0) / qH.length : 0
  const focusMins    = fH.reduce((s, f) => s + (f.durationMinutes ?? 0), 0)

  const streakScore  = Math.min(streak   / 30,  1) * 25
  const sessionScore = Math.min(sessions / 100, 1) * 25
  const accScore     = Math.min(avgAcc   / 100, 1) * 25
  const focusScore   = Math.min(focusMins / 300, 1) * 25

  return Math.round(streakScore + sessionScore + accScore + focusScore)
}

// ─── TODAY SUMMARY ─────────────────────────────────────────────────
export function getTodaySummary() {
  const today   = new Date().toISOString().slice(0, 10)
  const qToday  = (getQuizHistory()  ?? []).filter(q => q.date?.slice(0,10) === today)
  const fToday  = (getFocusHistory() ?? []).filter(f => f.date?.slice(0,10) === today)
  const quizXP  = qToday.reduce((s, q) => s + (q.totalXP ?? 0), 0)
  const focusXP = fToday.reduce((s, f) => s + (f.xpEarned ?? 0), 0)
  const focusMins = fToday.reduce((s, f) => s + (f.durationMinutes ?? 0), 0)
  const quizDone  = qToday.reduce((s, q) => s + (q.total ?? 0), 0)
  return {
    xpToday:    quizXP + focusXP,
    focusMins,
    quizDone,
    quizSessions:  qToday.length,
    focusSessions: fToday.length,
  }
}

// ─── UNIFIED ACTIVITY FEED ─────────────────────────────────────────
export function getUnifiedActivity(limit = 15) {
  const qH = getQuizHistory()  ?? []
  const fH = getFocusHistory() ?? []

  const quizItems = qH.slice(0, 20).map(q => ({
    type:  'quiz',
    date:  q.date,
    title: `Quiz · ${q.category ?? 'General'}`,
    sub:   `${q.accuracy ?? 0}% accuracy · ${q.total ?? 0} questions`,
    xp:    q.totalXP ?? 0,
    color: '#FFB347',
    icon:  'quiz',
  }))

  const focusItems = fH.slice(0, 20).map(f => ({
    type:  'focus',
    date:  f.date,
    title: `Focus · ${f.mode ?? 'session'}${f.subject ? ` · ${f.subject}` : ''}`,
    sub:   `${f.durationMinutes ?? 0} minutes`,
    xp:    f.xpEarned ?? 0,
    color: '#7C6FFF',
    icon:  'focus',
  }))

  return [...quizItems, ...focusItems]
    .filter(e => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

// ─── SMART RECOMMENDATIONS ─────────────────────────────────────────
export function getSmartRecommendations() {
  const profile  = getProfile()
  const streak   = getUnifiedStreak()
  const prodScore= getProductivityScore()
  const { xpToday, focusMins, quizDone } = getTodaySummary()
  const recs     = []

  // Streak warning
  if (streak === 0) {
    recs.push({ type: 'streak',  urgency: 'high',   text: "Start your streak today — even 15 minutes counts.", action: 'focus' })
  } else if (streak >= 3) {
    recs.push({ type: 'streak',  urgency: 'positive', text: `${streak}-day streak! Don't break it today.`, action: 'quiz' })
  }

  // Weak subject nudge
  const weak = getWeakSubjects()
  if (weak.length > 0 && quizDone < 5) {
    recs.push({ type: 'quiz',   urgency: 'medium', text: `You haven't quizzed on ${weak[0]} today. Tackle it now.`, action: 'quiz' })
  }

  // Focus nudge
  if (focusMins < 25) {
    recs.push({ type: 'focus',  urgency: 'medium', text: 'No focus session today. Even 25 minutes makes a difference.', action: 'focus' })
  }

  // Low productivity
  if (prodScore < 30 && profile) {
    recs.push({ type: 'general', urgency: 'low',  text: `Consistency is the edge, ${getFirstName()}. Small daily wins compound.`, action: 'chat' })
  }

  // XP milestone
  const { totalXP } = getUnifiedXP()
  const nextMilestone = [500, 1000, 2000, 5000, 10000].find(m => m > totalXP)
  if (nextMilestone && totalXP > nextMilestone * 0.85) {
    recs.push({ type: 'xp', urgency: 'positive', text: `Only ${nextMilestone - totalXP} XP to your next milestone!`, action: 'quiz' })
  }

  return recs.slice(0, 3)
}