// Supabase configuration — env-driven, with mock fallback.
// NO real credentials are stored here. Set these in frontend/.env:
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-public-key

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  configured: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
};

// ─── VALIDATION ────────────────────────────────────────────────────
export function validateSupabaseConfig() {
  const issues = [];
  if (!SUPABASE_URL) issues.push("VITE_SUPABASE_URL is not set");
  if (!SUPABASE_ANON_KEY) issues.push("VITE_SUPABASE_ANON_KEY is not set");

  if (SUPABASE_URL && !SUPABASE_URL.startsWith("https://")) {
    issues.push("VITE_SUPABASE_URL should start with https://");
  }
  if (
    SUPABASE_URL &&
    !SUPABASE_URL.includes(".supabase.co") &&
    !SUPABASE_URL.includes("localhost")
  ) {
    issues.push("VITE_SUPABASE_URL does not look like a Supabase project URL");
  }

  return {
    valid: issues.length === 0,
    configured: supabaseConfig.configured,
    issues,
  };
}

// ─── CLIENT FACTORY (lazy, future-ready) ───────────────────────────
// Returns null in mock mode. When @supabase/supabase-js is installed
// and env vars are set, this becomes:
//   import { createClient } from '@supabase/supabase-js'
//   return createClient(supabaseConfig.url, supabaseConfig.anonKey)
let _client = null;

export function getSupabaseClient() {
  if (!supabaseConfig.configured) return null;
  if (_client) return _client;

  // Placeholder — real implementation requires @supabase/supabase-js
  _client = {
    _mock: true,
    url: supabaseConfig.url,
    note: "Install @supabase/supabase-js and replace this stub with createClient()",
  };
  return _client;
}

// ─── TABLE NAMES (schema reference) ────────────────────────────────
export const SUPABASE_TABLES = {
  profiles: "profiles",
  preferences: "user_preferences",
  quizSessions: "quiz_sessions",
  focusSessions: "focus_sessions",
  plannerTasks: "planner_tasks",
  achievements: "user_achievements",
  progress: "user_progress",
  syncLog: "sync_log",
};

export default supabaseConfig;
