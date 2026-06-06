// Unified storage layer — swap localStorage for backend by changing one impl

const PREFIX = 'studymind_'

function key(namespace) { return `${PREFIX}${namespace}` }

function safeJSON(raw, fallback = null) {
  try { return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}

// ─── CORE CRUD ────────────────────────────────────────────────────
export const StorageAdapter = {
  // Read
  get(namespace, fallback = null) {
    try { return safeJSON(localStorage.getItem(key(namespace)), fallback) }
    catch { return fallback }
  },

  // Write
  set(namespace, value) {
    try {
      localStorage.setItem(key(namespace), JSON.stringify(value))
      return true
    } catch { return false }
  },

  // Partial update (merges objects)
  merge(namespace, partial) {
    try {
      const current = this.get(namespace, {})
      const updated = Array.isArray(current)
        ? partial                          // replace arrays
        : { ...current, ...partial }
      return this.set(namespace, updated)
    } catch { return false }
  },

  // Delete
  remove(namespace) {
    try { localStorage.removeItem(key(namespace)); return true }
    catch { return false }
  },

  // Prepend item to array (like quiz/focus history)
  prepend(namespace, item, maxLen = 200) {
    try {
      const list = this.get(namespace, [])
      const updated = [item, ...list].slice(0, maxLen)
      return this.set(namespace, updated)
    } catch { return false }
  },

  // Append item to array
  append(namespace, item, maxLen = 200) {
    try {
      const list = this.get(namespace, [])
      const updated = [...list, item].slice(-maxLen)
      return this.set(namespace, updated)
    } catch { return false }
  },

  // List all studymind_ keys
  keys() {
    try {
      return Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
    } catch { return [] }
  },

  // Total storage size (bytes)
  size() {
    try {
      return this.keys().reduce((total, k) => {
        return total + new Blob([localStorage.getItem(k) ?? '']).size
      }, 0)
    } catch { return 0 }
  },

  // Clear all app data
  clearAll() {
    try { this.keys().forEach(k => localStorage.removeItem(k)); return true }
    catch { return false }
  },
}

// ─── TYPED NAMESPACES ────────────────────────────────────────────
export const NAMESPACES = {
  profile:     'profile',
  onboarded:   'onboarded',
  quiz:        'quiz_history',
  focus:       'focus_history',
  planner:     'planner',
  missions:    'missions',
  achievements:'achievements',
  chatHistory: 'chat_history',
  aiMemory:    'ai_memory',
  theme:       'theme',
  notifPrefs:  'notif_prefs',
  authSession: 'auth_session',
  authToken:   'auth_token',
  syncQueue:   'sync_queue',
  syncStatus:  'sync_status',
  cache:       'cache',
  errorLog:    'error_log',
  snapshot:    'user_snapshot',
  prefs:       'user_prefs',
}

export default StorageAdapter