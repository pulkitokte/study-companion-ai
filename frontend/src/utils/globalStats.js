import { getQuizHistory }  from './quizStorage.js'
import { getFocusHistory } from './focusStorage.js'
import { getPlanner }      from './plannerStorage.js'

const XP_PER_LEVEL = 500

export function aggregateAll() {
  const qH = getQuizHistory()  ?? []
  const fH = getFocusHistory() ?? []
  const { tasks = [] } = getPlanner()

  // ── XP ──────────────────────────────────────────────────────────
  const quizXP   = qH.reduce((s, q) => s + (q.totalXP    ?? 0), 0)
  const focusXP  = fH.reduce((s, f) => s + (f.xpEarned   ?? 0), 0)
  const plannerXP= tasks.filter(t => t.done).reduce((s, t) => s + (t.xp ?? 0), 0)
  const totalXP  = quizXP + focusXP + plannerXP

  // ── LEVEL ───────────────────────────────────────────────────────
  const level   = Math.floor(totalXP / XP_PER_LEVEL) + 1
  const xpInto  = totalXP % XP_PER_LEVEL
  const levelPct= Math.round((xpInto / XP_PER_LEVEL) * 100)

  // ── STREAK ──────────────────────────────────────────────────────
  const allDays = new Set([
    ...qH.map(q => q.date?.slice(0, 10)),
    ...fH.map(f => f.date?.slice(0, 10)),
    ...tasks.filter(t => t.done && t.completedAt).map(t => t.completedAt?.slice(0, 10)),
  ].filter(Boolean))

  let streak = 0
  const now  = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    if (allDays.has(d.toISOString().slice(0, 10))) streak++; else break
  }

  // ── TODAY ───────────────────────────────────────────────────────
  const today     = new Date().toISOString().slice(0, 10)
  const todayQ    = qH.filter(q => q.date?.slice(0, 10) === today)
  const todayF    = fH.filter(f => f.date?.slice(0, 10) === today)
  const todayT    = tasks.filter(t => t.done && t.completedAt?.slice(0, 10) === today)
  const todayXP   = todayQ.reduce((s,q)=>s+(q.totalXP??0),0) + todayF.reduce((s,f)=>s+(f.xpEarned??0),0) + todayT.reduce((s,t)=>s+(t.xp??0),0)
  const todayFocusMins = todayF.reduce((s,f)=>s+(f.durationMinutes??0),0)
  const todayQuizDone  = todayQ.reduce((s,q)=>s+(q.total??0),0)

  // ── TOTALS ──────────────────────────────────────────────────────
  const totalFocusMins = fH.reduce((s,f)=>s+(f.durationMinutes??0),0)
  const avgQuizAcc     = qH.length ? Math.round(qH.reduce((s,q)=>s+(q.accuracy??0),0) / qH.length) : 0
  const plannerDone    = tasks.filter(t => t.done).length
  const plannerTotal   = tasks.length

  // ── ACHIEVEMENTS ────────────────────────────────────────────────
  const unlocked = (() => {
    try { return new Set(JSON.parse(localStorage.getItem('studymind_achievements') ?? '[]')) }
    catch { return new Set() }
  })()

  // ── PRODUCTIVITY SCORE ──────────────────────────────────────────
  const prodScore = Math.round(
    Math.min(streak / 30, 1) * 30 +
    Math.min(qH.length / 50, 1) * 20 +
    Math.min(fH.length / 30, 1) * 20 +
    Math.min(avgQuizAcc / 100, 1) * 20 +
    Math.min(totalFocusMins / 300, 1) * 10
  )

  // ── RANK ────────────────────────────────────────────────────────
  const RANKS = [
    { id:'rookie',      label:'Rookie',      minLevel:1,  color:'#888888', emoji:'🥉' },
    { id:'cadet',       label:'Cadet',       minLevel:5,  color:'#4FC3F7', emoji:'🎖️'  },
    { id:'disciplined', label:'Disciplined', minLevel:10, color:'#00FFC8', emoji:'⚡'  },
    { id:'strategist',  label:'Strategist',  minLevel:20, color:'#7C6FFF', emoji:'🧠'  },
    { id:'elite',       label:'Elite',       minLevel:35, color:'#FFB347', emoji:'🔱'  },
    { id:'legend',      label:'Legend',      minLevel:50, color:'#FFD700', emoji:'👑'  },
  ]
  let rank = RANKS[0]
  for (const r of RANKS) { if (level >= r.minLevel) rank = r; else break }
  const nextRank = RANKS.find(r => r.minLevel > level) ?? null

  // ── MISSIONS ────────────────────────────────────────────────────
  const missions = (() => {
    try {
      const raw = localStorage.getItem('studymind_missions')
      if (!raw) return { done: 0, total: 0 }
      const { missions: m = [] } = JSON.parse(raw)
      return { done: m.filter(x=>x.done).length, total: m.length }
    } catch { return { done: 0, total: 0 } }
  })()

  return {
    // XP
    totalXP, quizXP, focusXP, plannerXP,
    todayXP, todayFocusMins, todayQuizDone,
    // Level
    level, xpInto, levelPct, xpToNextLevel: XP_PER_LEVEL - xpInto,
    // Streak
    streak,
    // Rank
    rank, nextRank,
    // Totals
    totalQuizzes:        qH.length,
    totalFocusSessions:  fH.length,
    totalFocusMins,
    avgQuizAcc,
    plannerDone,
    plannerTotal,
    // Achievements
    achievementsUnlocked: unlocked.size,
    achievementIds:       unlocked,
    // Scores
    prodScore,
    // Missions
    missions,
  }
}

// Lightweight version for Navbar/Sidebar (avoids heavy recalc)
export function quickStats() {
  const qH = getQuizHistory()  ?? []
  const fH = getFocusHistory() ?? []

  const quizXP  = qH.reduce((s,q)=>s+(q.totalXP??0),0)
  const focusXP = fH.reduce((s,f)=>s+(f.xpEarned??0),0)
  const totalXP = quizXP + focusXP

  const allDays = new Set([
    ...qH.map(q=>q.date?.slice(0,10)),
    ...fH.map(f=>f.date?.slice(0,10)),
  ].filter(Boolean))
  let streak = 0
  const now = new Date()
  for (let i=0; i<365; i++) {
    const d = new Date(now); d.setDate(d.getDate()-i)
    if (allDays.has(d.toISOString().slice(0,10))) streak++; else break
  }

  const level = Math.floor(totalXP / 500) + 1
  return { totalXP, streak, level }
}