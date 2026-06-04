// Lightweight app diagnostics — no external deps

let _frameCount = 0
let _lastTime   = performance.now()
let _fps        = 60
let _active     = false

export function startFPSMonitor() {
  if (_active) return
  _active = true
  const tick = (now) => {
    _frameCount++
    if (now - _lastTime >= 1000) {
      _fps        = _frameCount
      _frameCount = 0
      _lastTime   = now
    }
    if (_active) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function stopFPSMonitor() { _active = false }
export function getFPS()         { return _fps }

// ─── STORAGE SIZE ─────────────────────────────────────────────────
const APP_KEYS = [
  'studymind_profile','studymind_onboarded',
  'studymind_quiz_history','studymind_focus_history',
  'studymind_ai_memory','studymind_chat_history',
  'studymind_planner','studymind_missions',
  'studymind_achievements','studymind_theme','studymind_notif_prefs',
]

export function getStorageSize() {
  let bytes = 0
  APP_KEYS.forEach(k => {
    try { bytes += new Blob([localStorage.getItem(k) ?? '']).size } catch { /* ignore */ }
  })
  return {
    bytes,
    kb:  parseFloat((bytes / 1024).toFixed(1)),
    pct: Math.min(Math.round((bytes / (5 * 1024 * 1024)) * 100), 100),
  }
}

// ─── RENDER TIMER ─────────────────────────────────────────────────
const _marks = {}

export function markStart(label) { _marks[label] = performance.now() }
export function markEnd(label) {
  if (!_marks[label]) return null
  const ms = (performance.now() - _marks[label]).toFixed(2)
  delete _marks[label]
  return parseFloat(ms)
}

// ─── MEMORY ESTIMATE ──────────────────────────────────────────────
export function getMemoryInfo() {
  const mem = performance?.memory;
  if (!mem) return null
  return {
    usedMB:  parseFloat((mem.usedJSHeapSize  / 1048576).toFixed(1)),
    totalMB: parseFloat((mem.totalJSHeapSize / 1048576).toFixed(1)),
    limitMB: parseFloat((mem.jsHeapSizeLimit / 1048576).toFixed(1)),
  }
}

// ─── FULL DIAGNOSTICS ─────────────────────────────────────────────
export function getDiagnostics() {
  const storage = getStorageSize()
  const memory  = getMemoryInfo()
  return {
    fps:     _fps,
    storage,
    memory,
    online:  navigator.onLine,
    ua:      navigator.userAgent.split(' ').pop() ?? 'unknown',
    ts:      new Date().toISOString(),
  }
}