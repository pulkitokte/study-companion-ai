import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { aggregateAll } from "../utils/globalStats.js";
import { notifyStatsUpdate, onStatsUpdate } from "../hooks/useGlobalStats.js";
import {
  getTodayMissions,
  checkMissionsAutoComplete,
} from "../utils/progressStorage.js";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [rev, setRev] = useState(0);

  const stats = useMemo(() => aggregateAll(), [rev]);
  const rawMiss = useMemo(() => getTodayMissions(), [rev]);
  const missions = useMemo(() => checkMissionsAutoComplete(rawMiss), [rev]);

  const refreshStats = useCallback(() => {
    setRev((r) => r + 1);
    notifyStatsUpdate(); // propagate to all useGlobalStats consumers
  }, []);

  // ── Phase 35 Batch F: live sync ─────────────────────────────────────────
  // Subscribe to the SAME shared global-stats pub/sub bus that
  // notifyStatsUpdate() already broadcasts on. This context previously
  // only wrote to that bus (via refreshStats) but never listened to it,
  // so it stayed stale whenever another subsystem — most notably
  // syllabusService.updateTopicStatus() during the Focus post-session
  // topic completion workflow — called notifyStatsUpdate() on its own.
  //
  // The subscriber bumps `rev` directly (NOT via refreshStats) so it
  // does not re-call notifyStatsUpdate() itself, avoiding a re-entrant
  // broadcast loop. This reuses the existing synchronization
  // architecture rather than introducing a second one.
  useEffect(() => {
    const unsubscribe = onStatsUpdate(() => {
      setRev((r) => r + 1);
    });
    return unsubscribe;
  }, []);

  return (
    <ProgressContext.Provider value={{ stats, missions, refreshStats }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
