const MEMORY_KEY   = 'studymind_ai_memory'
const SESSIONS_KEY = 'studymind_chat_history'
const MAX_MEMORIES = 80
const MAX_SESSIONS = 5   // per mode for context injection

// ─── MEMORY TYPES ──────────────────────────────────────────────────
// Each memory is: { id, type, content, importance, createdAt, modeId }
// type: 'habit' | 'weakness' | 'goal' | 'emotional' | 'fact'

export function saveMemory(memory) {
  try {
    const all = getAllMemories()
    const entry = {
      id:        `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
      importance: 3,
      ...memory,
    }
    const updated = [entry, ...all].slice(0, MAX_MEMORIES)
    localStorage.setItem(MEMORY_KEY, JSON.stringify(updated))
    return entry
  } catch { return null }
}

export function getAllMemories() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function getMemoriesByType(type) {
  return getAllMemories().filter(m => m.type === type)
}

export function getTopMemories(n = 8) {
  return getAllMemories()
    .sort((a, b) => (b.importance ?? 3) - (a.importance ?? 3))
    .slice(0, n)
}

export function clearMemories() {
  try { localStorage.removeItem(MEMORY_KEY) } catch { /* ignore */ }
}

// Auto-extract facts from a completed message pair
export function extractAndSaveMemories(userMsg, aiMsg, modeId) {
  const msg = userMsg.toLowerCase()

  // Detect study habit signals
  if (/i study|i usually|i always|i never|i tend to/.test(msg)) {
    saveMemory({ type: 'habit', content: userMsg.slice(0, 120), importance: 3, modeId })
  }
  // Detect weakness signals
  if (/i struggle|i can't|i don't understand|weak|difficult|hard for me/.test(msg)) {
    saveMemory({ type: 'weakness', content: userMsg.slice(0, 120), importance: 4, modeId })
  }
  // Detect goal signals
  if (/i want|my goal|i plan|i aim|i hope|target|rank/.test(msg)) {
    saveMemory({ type: 'goal', content: userMsg.slice(0, 120), importance: 5, modeId })
  }
  // Detect emotional signals
  if (/stressed|anxious|burnt out|tired|motivated|excited|overwhelmed|depressed/.test(msg)) {
    saveMemory({ type: 'emotional', content: userMsg.slice(0, 120), importance: 4, modeId })
  }
}

// ─── CONVERSATION HISTORY ──────────────────────────────────────────
export function getConversationHistory(modeId, limit = MAX_SESSIONS) {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return {}
    const all = JSON.parse(raw)
    if (!modeId) return all
    const modeConvs = all[modeId] ?? []
    // Return last `limit` messages for context
    return modeConvs.slice(-limit * 2)
  } catch { return [] }
}

export function saveConversationHistory(modeId, messages) {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    // Keep last 60 messages per mode
    all[modeId] = messages.slice(-60)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}