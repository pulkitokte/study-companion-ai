import StorageAdapter from './storageAdapter.js'
import { aggregateAll } from '../utils/globalStats.js'
import { getQuizHistory }  from '../utils/quizStorage.js'
import { getFocusHistory } from '../utils/focusStorage.js'
import { getPlanner }      from '../utils/plannerStorage.js'

const ADMIN_NS       = 'admin_session'
const ADMIN_LOG_NS   = 'admin_action_log'
const FEATURE_FLAGS_NS = 'admin_feature_flags'
const MAX_LOG = 100

// ─── ADMIN ACCESS ───────────────────────────────────────────────────
// Local-only "admin mode" — gated behind a passcode stored client-side.
// In production this becomes a real role check from the auth backend.
const DEFAULT_PASSCODE = 'studymind-admin'

export function isAdminUnlocked() {
  return StorageAdapter.get(ADMIN_NS)?.unlocked === true
}

export function unlockAdmin(passcode) {
  const ok = passcode === DEFAULT_PASSCODE
  if (ok) {
    StorageAdapter.set(ADMIN_NS, { unlocked: true, unlockedAt: new Date().toISOString() })
    logAdminAction('admin_unlock', { method: 'passcode' })
  }
  return ok
}

export function lockAdmin() {
  StorageAdapter.set(ADMIN_NS, { unlocked: false })
  logAdminAction('admin_lock', {})
}

export function getAdminSession() {
  return StorageAdapter.get(ADMIN_NS, { unlocked: false })
}

// ─── ACTION LOG ───────────────────────────────────────────────────
function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
}

export function logAdminAction(action, meta = {}) {
  const log = StorageAdapter.get(ADMIN_LOG_NS, [])
  const entry = {
    id:        makeId('admin'),
    action,
    meta,
    timestamp: new Date().toISOString(),
  }
  StorageAdapter.set(ADMIN_LOG_NS, [entry, ...log].slice(0, MAX_LOG))
  return entry
}

export function getAdminLog(limit = 50) {
  return StorageAdapter.get(ADMIN_LOG_NS, []).slice(0, limit)
}

export function clearAdminLog() {
  StorageAdapter.set(ADMIN_LOG_NS, [])
}

// ─── FEATURE FLAGS ───────────────────────────────────────────────────
const DEFAULT_FLAGS = {
  aiChat:        true,
  quizArena:     true,
  focusMode:     true,
  planner:       true,
  collaboration: true,
  realtimeBeta:  true,
  demoMode:      true,
  notifications: true,
}

export function getFeatureFlags() {
  const stored = StorageAdapter.get(FEATURE_FLAGS_NS, {})
  return { ...DEFAULT_FLAGS, ...stored }
}

export function setFeatureFlag(key, value) {
  const flags = getFeatureFlags()
  const updated = { ...flags, [key]: value }
  StorageAdapter.set(FEATURE_FLAGS_NS, updated)
  logAdminAction('feature_flag_change', { key, value })
  return updated
}

export function resetFeatureFlags() {
  StorageAdapter.set(FEATURE_FLAGS_NS, DEFAULT_FLAGS)
  logAdminAction('feature_flags_reset', {})
  return { ...DEFAULT_FLAGS }
}

// ─── DATA RESET / MAINTENANCE TOOLS ──────────────────────────────────
export function resetModuleData(moduleKey) {
  const map = {
    quiz:    'quiz_history',
    focus:   'focus_history',
    planner: 'planner',
    chat:    'chat_history',
    aiMemory:'ai_memory',
    missions:'missions',
    achievements:'achievements',
  }
  const ns = map[moduleKey]
  if (!ns) return { ok:false, error:'Unknown module' }
  StorageAdapter.remove(ns)
  logAdminAction('module_reset', { module: moduleKey })
  return { ok:true }
}

// ─── SYSTEM SNAPSHOT (for admin dashboard) ───────────────────────────
export function getAdminOverview() {
  const stats   = aggregateAll()
  const qH      = getQuizHistory()  ?? []
  const fH      = getFocusHistory() ?? []
  const { tasks=[] } = getPlanner()
  const flags   = getFeatureFlags()
  const enabledFlags  = Object.values(flags).filter(Boolean).length
  const totalFlags    = Object.keys(flags).length

  return {
    stats,
    counts: {
      quizSessions:  qH.length,
      focusSessions: fH.length,
      plannerTasks:  tasks.length,
      achievements:  stats.achievementsUnlocked ?? 0,
    },
    flags,
    flagsEnabled: enabledFlags,
    flagsTotal:   totalFlags,
    storageBytes: StorageAdapter.size(),
    generatedAt:  new Date().toISOString(),
  }
}