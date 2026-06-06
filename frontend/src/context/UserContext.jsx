import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  buildUserSnapshot,
  getCachedSnapshot,
  exportSnapshot,
} from "../lib/userSyncEngine.js";
import { getPreferences, setPreferences } from "../lib/userPreferences.js";
import { notifyStatsUpdate } from "../hooks/useGlobalStats.js";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [snapshot, setSnapshot] = useState(
    () => getCachedSnapshot() ?? buildUserSnapshot(),
  );
  const [preferences, setPrefsState] = useState(() => getPreferences());
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Profile convenience
  const profile = snapshot?.profile ?? null;
  const stats = snapshot?.stats ?? {};

  // Auto-rebuild snapshot when storage changes (cross-tab / after quiz/focus)
  useEffect(() => {
    const handler = () => {
      const fresh = buildUserSnapshot();
      setSnapshot(fresh);
    };
    window.addEventListener("storage", handler);
    // Also rebuild on focus (return to tab)
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handler);
    };
  }, []);

  // ─── UPDATE PROFILE ───────────────────────────────────────────
  const updateProfile = useCallback((partial) => {
    try {
      const current = JSON.parse(
        localStorage.getItem("studymind_profile") ?? "{}",
      );
      const updated = {
        ...current,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("studymind_profile", JSON.stringify(updated));
      const fresh = buildUserSnapshot();
      setSnapshot(fresh);
      notifyStatsUpdate();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  // ─── SYNC NOW ─────────────────────────────────────────────────
  const syncNow = useCallback(async () => {
    setSyncing(true);
    const fresh = buildUserSnapshot();
    setSnapshot(fresh);
    notifyStatsUpdate();
    setLastSynced(new Date().toISOString());
    setSyncing(false);
    return fresh;
  }, []);

  // ─── PREFERENCES ─────────────────────────────────────────────
  const updatePreferences = useCallback((partial) => {
    const updated = setPreferences(partial);
    setPrefsState(updated);
    return updated;
  }, []);

  // ─── EXPORT ──────────────────────────────────────────────────
  const exportData = useCallback(() => {
    return exportSnapshot();
  }, []);

  const value = useMemo(
    () => ({
      snapshot,
      profile,
      stats,
      preferences,
      syncing,
      lastSynced,
      updateProfile,
      syncNow,
      updatePreferences,
      exportData,
    }),
    [
      snapshot,
      profile,
      stats,
      preferences,
      syncing,
      lastSynced,
      updateProfile,
      syncNow,
      updatePreferences,
      exportData,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
