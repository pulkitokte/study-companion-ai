import env from "./env.js";

const DEFAULT_TIMEOUT = 20000;
const MAX_RETRIES = 2;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── CORE FETCH WRAPPER ───────────────────────────────────────────
export async function apiFetch(url, options = {}, retries = MAX_RETRIES) {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOpts } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body?.message ?? `HTTP ${res.status}`,
        res.status,
        body,
      );
    }

    const ct = res.headers.get("content-type") ?? "";
    return ct.includes("application/json") ? res.json() : res.text();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new ApiError("Request timed out", 408);
    if (err instanceof ApiError) throw err;
    // Retry on network errors
    if (retries > 0) {
      await sleep(500 * (MAX_RETRIES - retries + 1));
      return apiFetch(url, options, retries - 1);
    }
    throw new ApiError(err.message ?? "Network error", 0);
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// ─── BACKEND REST HELPER ─────────────────────────────────────────
function buildHeaders(token = null) {
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

function getToken() {
  try {
    return localStorage.getItem("studymind_auth_token") ?? null;
  } catch {
    return null;
  }
}

export const api = {
  get: (path, opts = {}) =>
    apiFetch(`${env.backendUrl}${path}`, {
      method: "GET",
      headers: buildHeaders(getToken()),
      ...opts,
    }),
  post: (path, body, opts = {}) =>
    apiFetch(`${env.backendUrl}${path}`, {
      method: "POST",
      headers: buildHeaders(getToken()),
      body: JSON.stringify(body),
      ...opts,
    }),
  put: (path, body, opts = {}) =>
    apiFetch(`${env.backendUrl}${path}`, {
      method: "PUT",
      headers: buildHeaders(getToken()),
      body: JSON.stringify(body),
      ...opts,
    }),
  delete: (path, opts = {}) =>
    apiFetch(`${env.backendUrl}${path}`, {
      method: "DELETE",
      headers: buildHeaders(getToken()),
      ...opts,
    }),
};

// ─── GEMINI HELPER ───────────────────────────────────────────────
export async function callGeminiDirect({
  systemPrompt,
  messages,
  temperature = 0.85,
  maxTokens = 700,
  onChunk,
}) {
  if (!env.hasGemini) return { ok: false, error: "no_key", text: "" };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${env.geminiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: messages,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
        },
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, text: "" };

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const part =
            JSON.parse(data)?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (part) {
            full += part;
            onChunk?.(full);
          }
        } catch {
          /* skip */
        }
      }
    }
    return { ok: true, text: full };
  } catch (e) {
    clearTimeout(timer);
    return {
      ok: false,
      error: e.name === "AbortError" ? "timeout" : e.message,
      text: "",
    };
  }
}
