// Gemini API client — streaming + fallback architecture
// Set VITE_GEMINI_API_KEY in frontend/.env to enable real AI

const MODEL   = 'gemini-2.0-flash'
const TIMEOUT = 28000   // 28s

function getKey() {
  return import.meta.env.VITE_GEMINI_API_KEY ?? ''
}

export function isGeminiAvailable() {
  return !!getKey()
}

// ─── STREAMING CALL ────────────────────────────────────────────────
// onChunk(text: string) called incrementally
// Returns { ok, fullText, error }
export async function streamGemini({ systemPrompt, messages, onChunk, temperature = 0.85, maxTokens = 700 }) {
  const key = getKey()
  if (!key) return { ok: false, error: 'no_key', fullText: '' }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${key}`

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages,
    generationConfig: { temperature, maxOutputTokens: maxTokens, topP: 0.95 },
  }

  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    })

    clearTimeout(timer)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { ok: false, error: err?.error?.message ?? `HTTP ${res.status}`, fullText: '' }
    }

    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let full      = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const part   = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
          if (part) { full += part; onChunk?.(full) }
        } catch { /* skip malformed */ }
      }
    }
    return { ok: true, fullText: full, error: null }
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') return { ok: false, error: 'timeout', fullText: '' }
    return { ok: false, error: err.message, fullText: '' }
  }
}

// ─── SINGLE CALL (non-streaming) ──────────────────────────────────
export async function callGemini({ systemPrompt, userMessage, temperature = 0.8, maxTokens = 500 }) {
  const key = getKey()
  if (!key) return { ok: false, error: 'no_key', text: '' }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    })
    clearTimeout(timer)
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, text: '' }
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return { ok: true, text, error: null }
  } catch (err) {
    clearTimeout(timer)
    return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message, text: '' }
  }
}

// ─── MOCK STREAMING ────────────────────────────────────────────────
const MOCK_POOL = {
  motivator: [
    "Every topper you admire started exactly where you are. The gap between you and them isn't talent — it's consistency. Close distractions. Open the book. The timer starts NOW. ⚡",
    "Stop waiting to feel ready. Readiness is built through action. One chapter. One hour. Start. The version of you that clears this exam is built in sessions exactly like this one. 🔥",
    "Your competition doesn't care how you feel today. They're studying anyway. That's the only gap that matters — between those who feel like it and those who show up regardless. 💪",
  ],
  chill: [
    "Hey, no pressure okay? You're doing better than you think. Let's take it one step at a time. What do you feel like working on today? I'm right here with you. 😌",
    "Burnout is real and it's completely valid to feel this way. Take a breath first. Maybe start with something lighter — one article, one topic. Every bit compounds. 🌿",
    "Off days happen to everyone. The trick is not letting one bad day become two. What's one small thing we can do together right now? ✨",
  ],
  strict: [
    "That level of preparation is insufficient. A serious aspirant would have covered this in daily revision. Three hours remain today. Open the NCERT. No phone. No excuses. Execute.",
    "Consistency is the minimum requirement — not the achievement. Are you meeting that baseline or looking for validation of mediocrity? Revise. Report back with what you've covered.",
    "Close every distraction. Set a 90-minute timer. Complete the chapter. No negotiation. The exam does not care about your circumstances — only your output.",
  ],
  roast: [
    "Oh fascinating — asking about study techniques after that impressive YouTube session. Truly elite preparation strategy. I'm sure the UPSC board will love your watch history. 😂",
    "Three days without studying and now you want a motivational speech? At this rate you'll crack UPSC sometime around 2048. Very strategic long game. 🔥",
    "Your 'study plan' document is beautiful. The execution? Also beautiful — in a modern art 'what does it mean' kind of way. Maybe open the actual book today? 💀",
  ],
  interviewer: [
    "Let us begin. You've expressed interest in administrative services. Tell me — what specific failure of governance convinced you this was the solution rather than merely a career aspiration?",
    "Interesting response. However, you haven't addressed the constitutional dimension. Article 356 — when is Presidential Rule justified, and what prevents its political misuse?",
    "The board notes that answer. Please elaborate on a concrete, measurable outcome you would implement in your first posting — not a philosophy, a specific policy with a timeline.",
  ],
}

export function getMockResponse(modeId, index = 0) {
  const pool = MOCK_POOL[modeId] ?? MOCK_POOL.motivator
  return pool[index % pool.length]
}

export async function mockStream(text, onChunk, wordDelay = 32) {
  const words = text.split(' ')
  let full    = ''
  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, wordDelay + Math.random() * 18))
    full += (i === 0 ? '' : ' ') + words[i]
    onChunk(full)
  }
  return full
}