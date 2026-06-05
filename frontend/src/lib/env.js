// Centralized env config — single source of truth for all env checks

const raw = {
  geminiKey:   import.meta.env.VITE_GEMINI_API_KEY     ?? '',
  backendUrl:  import.meta.env.VITE_BACKEND_URL         ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL        ?? '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY   ?? '',
  firebaseKey: import.meta.env.VITE_FIREBASE_API_KEY    ?? '',
  appEnv:      import.meta.env.VITE_APP_ENV             ?? 'development',
  isDev:       import.meta.env.DEV                      ?? false,
}

export const env = {
  ...raw,
  hasGemini:    !!raw.geminiKey,
  hasBackend:   !!raw.backendUrl,
  hasSupabase:  !!(raw.supabaseUrl && raw.supabaseKey),
  hasFirebase:  !!raw.firebaseKey,
  isMock:       !raw.backendUrl && !raw.supabaseUrl && !raw.firebaseKey,
  isProd:       raw.appEnv === 'production',
}

// Validate required vars and warn in dev
if (env.isDev) {
  if (!env.hasGemini) console.info('[StudyMind] No VITE_GEMINI_API_KEY — using mock AI responses.')
  if (env.isMock)     console.info('[StudyMind] No backend configured — running in full localStorage mode.')
}

export default env