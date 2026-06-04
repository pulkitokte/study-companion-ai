import { getQuizHistory }  from './quizStorage.js'
import { getFocusHistory } from './focusStorage.js'
import { getPlanner }      from './plannerStorage.js'
import { isGeminiAvailable } from './geminiClient.js'

const STORAGE_KEYS = [
  'studymind_profile', 'studymind_onboarded',
  'studymind_quiz_history', 'studymind_focus_history',
  'studymind_ai_memory', 'studymind_chat_history',
  'studymind_planner', 'studymind_missions',
  'studymind_achievements', 'studymind_theme', 'studymind_notif_prefs',
]

function safeSize(key) {
  try {
    const raw = localStorage.getItem(key) ?? ''
    return new Blob([raw]).size   // bytes
  } catch { return 0 }
}

export function getStorageUsage() {
  let total = 0
  STORAGE_KEYS.forEach(k => { total += safeSize(k) })
  const kb   = (total / 1024).toFixed(1)
  const pct  = Math.min(Math.round((total / (5 * 1024 * 1024)) * 100), 100)   // 5 MB quota
  return { bytes: total, kb, pct }
}

export function getSystemHealth() {
  const qH = getQuizHistory()  ?? []
  const fH = getFocusHistory() ?? []
  const { tasks = [] } = getPlanner()
  const storage = getStorageUsage()

  const profile  = (() => {
    try { return JSON.parse(localStorage.getItem('studymind_profile') ?? 'null') } catch { return null }
  })()

  const statuses = {
    profile:   { ok: !!profile?.name,      label: profile?.name ? 'Configured' : 'Not set'   },
    quiz:      { ok: qH.length > 0,        label: `${qH.length} sessions`                    },
    focus:     { ok: fH.length > 0,        label: `${fH.length} sessions`                    },
    planner:   { ok: tasks.length > 0,     label: `${tasks.length} tasks`                    },
    ai:        { ok: isGeminiAvailable(),  label: isGeminiAvailable() ? 'Gemini connected' : 'Mock mode' },
    storage:   { ok: storage.pct < 80,     label: `${storage.kb} KB / 5 MB (${storage.pct}%)` },
  }

  const issues = Object.entries(statuses)
    .filter(([, v]) => !v.ok)
    .map(([k, v]) => ({ system: k, label: v.label }))

  const score = Math.round((Object.values(statuses).filter(v => v.ok).length / Object.keys(statuses).length) * 100)

  return { statuses, issues, score, storage, aiMode: isGeminiAvailable() ? 'gemini' : 'mock' }
}

export function clearAllData() {
  STORAGE_KEYS.forEach(k => { try { localStorage.removeItem(k) } catch { /* ignore */ } })
}