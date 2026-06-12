import StorageAdapter from './storageAdapter.js'
import { getQuizHistory }  from '../utils/quizStorage.js'
import { getFocusHistory } from '../utils/focusStorage.js'
import { getPlanner }      from '../utils/plannerStorage.js'
import { CATEGORIES }      from '../data/mockQuizData.js'

const EVENTS_NS = 'analytics_events'
const MAX_EVENTS = 500

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
}

// ─── EVENT TRACKING ───────────────────────────────────────────────
// Lightweight local event log — future-ready for real analytics pipeline
export function trackEvent(name, props = {}) {
  const events = StorageAdapter.get(EVENTS_NS, [])
  const entry = {
    id:        makeId('evt'),
    name,
    props,
    path:      window.location?.pathname ?? '',
    timestamp: new Date().toISOString(),
  }
  StorageAdapter.set(EVENTS_NS, [entry, ...events].slice(0, MAX_EVENTS))
  return entry
}

export function getEvents(limit = 100) {
  return StorageAdapter.get(EVENTS_NS, []).slice(0, limit)
}

export function clearEvents() {
  StorageAdapter.set(EVENTS_NS, [])
}

// ─── EVENT SUMMARY ────────────────────────────────────────────────
export function getEventSummary() {
  const events = StorageAdapter.get(EVENTS_NS, [])
  const byName = {}
  events.forEach(e => { byName[e.name] = (byName[e.name] ?? 0) + 1 })

  const byPath = {}
  events.forEach(e => { byPath[e.path] = (byPath[e.path] ?? 0) + 1 })

  return {
    total: events.length,
    byName: Object.entries(byName).sort((a,b)=>b[1]-a[1]).slice(0,10),
    byPath: Object.entries(byPath).sort((a,b)=>b[1]-a[1]).slice(0,10),
  }
}

// ─── XP TIMELINE (for charts) ────────────────────────────────────────
export function getXPTimeline(days = 14) {
  const qH = getQuizHistory()  ?? []
  const fH = getFocusHistory() ?? []
  const { tasks=[] } = getPlanner()

  const map = {}
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0,10)
    map[key] = { date:key, quizXP:0, focusXP:0, plannerXP:0, total:0 }
  }

  qH.forEach(q => {
    const key = q.date?.slice(0,10)
    if (map[key]) { map[key].quizXP += q.totalXP ?? 0; map[key].total += q.totalXP ?? 0 }
  })
  fH.forEach(f => {
    const key = f.date?.slice(0,10)
    if (map[key]) { map[key].focusXP += f.xpEarned ?? 0; map[key].total += f.xpEarned ?? 0 }
  })
  tasks.filter(t=>t.done && t.completedAt).forEach(t => {
    const key = t.completedAt?.slice(0,10)
    if (map[key]) { map[key].plannerXP += t.xp ?? 0; map[key].total += t.xp ?? 0 }
  })

  return Object.values(map)
}

// ─── CATEGORY BREAKDOWN ───────────────────────────────────────────────
export function getCategoryBreakdown() {
  const qH = getQuizHistory() ?? []
  const map = {}
  qH.forEach(q => {
    const cat = q.category ?? 'unknown'
    if (!map[cat]) map[cat] = { total:0, correct:0, count:0, xp:0 }
    map[cat].total   += q.total ?? 0
    map[cat].correct += q.correct ?? 0
    map[cat].count++
    map[cat].xp += q.totalXP ?? 0
  })

  return Object.entries(map).map(([cat, v]) => {
    const meta = CATEGORIES.find(c=>c.id===cat)
    return {
      id: cat,
      label: meta?.label ?? cat,
      emoji: meta?.emoji ?? '📘',
      color: meta?.color ?? '#7C6FFF',
      accuracy: v.total > 0 ? Math.round((v.correct/v.total)*100) : 0,
      sessions: v.count,
      xp: v.xp,
    }
  }).sort((a,b) => b.xp - a.xp)
}

// ─── FOCUS MODE BREAKDOWN ──────────────────────────────────────────────
export function getFocusModeBreakdown() {
  const fH = getFocusHistory() ?? []
  const map = {}
  fH.forEach(f => {
    const mode = f.mode ?? 'unknown'
    if (!map[mode]) map[mode] = { sessions:0, minutes:0, xp:0 }
    map[mode].sessions++
    map[mode].minutes += f.durationMinutes ?? 0
    map[mode].xp += f.xpEarned ?? 0
  })
  return Object.entries(map).map(([mode, v]) => ({ mode, ...v }))
}

// ─── PRODUCTIVITY TRENDS (week-over-week) ─────────────────────────────
export function getWeeklyTrend() {
  const timeline = getXPTimeline(14)
  const thisWeek = timeline.slice(7)
  const lastWeek = timeline.slice(0,7)

  const sum = (arr, key) => arr.reduce((s,d)=>s+d[key],0)

  const thisWeekXP = sum(thisWeek, 'total')
  const lastWeekXP = sum(lastWeek, 'total')
  const change     = lastWeekXP > 0 ? Math.round(((thisWeekXP-lastWeekXP)/lastWeekXP)*100) : (thisWeekXP > 0 ? 100 : 0)

  return {
    thisWeekXP, lastWeekXP, change,
    trend: change > 5 ? 'up' : change < -5 ? 'down' : 'flat',
  }
}