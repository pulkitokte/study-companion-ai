// Unified sync engine — merges all localStorage modules into one profile snapshot

import { getQuizHistory }  from '../utils/quizStorage.js'
import { getFocusHistory } from '../utils/focusStorage.js'
import { getPlanner }      from '../utils/plannerStorage.js'

const SNAPSHOT_KEY = 'studymind_user_snapshot'

// ─── BUILD FULL SNAPSHOT ─────────────────────────────────────────
export function buildUserSnapshot() {
  const qH  = getQuizHistory()  ?? []
  const fH  = getFocusHistory() ?? []
  const { tasks = [] } = getPlanner()

  const quizXP    = qH.reduce((s,q)=>s+(q.totalXP??0),0)
  const focusXP   = fH.reduce((s,f)=>s+(f.xpEarned??0),0)
  const plannerXP = tasks.filter(t=>t.done).reduce((s,t)=>s+(t.xp??0),0)
  const totalXP   = quizXP + focusXP + plannerXP

  const focusMins = fH.reduce((s,f)=>s+(f.durationMinutes??0),0)
  const avgAcc    = qH.length
    ? Math.round(qH.reduce((s,q)=>s+(q.accuracy??0),0)/qH.length) : 0

  // streak
  const allDays = new Set([
    ...qH.map(q=>q.date?.slice(0,10)),
    ...fH.map(f=>f.date?.slice(0,10)),
    ...tasks.filter(t=>t.done&&t.completedAt).map(t=>t.completedAt?.slice(0,10)),
  ].filter(Boolean))
  let streak = 0
  const now = new Date()
  for (let i=0;i<365;i++) {
    const d = new Date(now); d.setDate(d.getDate()-i)
    if (allDays.has(d.toISOString().slice(0,10))) streak++; else break
  }

  const achievements = (() => {
    try { return JSON.parse(localStorage.getItem('studymind_achievements')?? '[]') } catch { return [] }
  })()

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('studymind_profile')??'null') } catch { return null }
  })()

  const snapshot = {
    generatedAt:        new Date().toISOString(),
    profile,
    stats: {
      totalXP, quizXP, focusXP, plannerXP,
      level:              Math.floor(totalXP/500)+1,
      streak,
      totalQuizzes:       qH.length,
      totalFocusSessions: fH.length,
      focusMinutes:       focusMins,
      avgQuizAccuracy:    avgAcc,
      plannerDone:        tasks.filter(t=>t.done).length,
      plannerTotal:       tasks.length,
      achievementsCount:  achievements.length,
    },
    achievementIds: achievements,
  }

  try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot)) } catch { /* ignore */ }
  return snapshot
}

// ─── READ CACHED SNAPSHOT ────────────────────────────────────────
export function getCachedSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ─── CONFLICT-SAFE MERGE ─────────────────────────────────────────
// Merges remote cloud data with local data — local wins on conflict for now
export function mergeSnapshots(local, remote) {
  if (!remote) return local
  if (!local)  return remote

  const localXP  = local.stats?.totalXP  ?? 0
  const remoteXP = remote.stats?.totalXP ?? 0

  // Higher XP wins for stats (the device that did more work is authoritative)
  const winnerStats = localXP >= remoteXP ? local.stats : remote.stats

  // Merge achievement arrays (union)
  const localAch  = new Set(local.achievementIds  ?? [])
  const remoteAch = new Set(remote.achievementIds ?? [])
  const merged    = [...new Set([...localAch, ...remoteAch])]

  return {
    ...local,
    stats:          winnerStats,
    achievementIds: merged,
    mergedAt:       new Date().toISOString(),
  }
}

// ─── EXPORT HELPERS ───────────────────────────────────────────────
export function exportSnapshot() {
  const snapshot = buildUserSnapshot()
  const blob     = new Blob([JSON.stringify(snapshot, null, 2)], { type:'application/json' })
  const url      = URL.createObjectURL(blob)
  const a        = Object.assign(document.createElement('a'), {
    href:     url,
    download: `studymind-profile-${new Date().toISOString().slice(0,10)}.json`,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return snapshot
}

// ─── IMPORT / RESTORE ────────────────────────────────────────────
export function importFromSnapshot(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    if (!data?.stats) return { ok:false, error:'Invalid snapshot format' }

    if (data.profile) {
      localStorage.setItem('studymind_profile', JSON.stringify(data.profile))
    }
    if (Array.isArray(data.achievementIds)) {
      localStorage.setItem('studymind_achievements', JSON.stringify(data.achievementIds))
    }
    try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data)) } catch { /* ignore */ }

    return { ok:true, stats: data.stats }
  } catch (e) { return { ok:false, error:e.message } }
}