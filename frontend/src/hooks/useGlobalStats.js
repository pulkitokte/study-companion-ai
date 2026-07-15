import { useState, useCallback, useEffect, useRef } from "react";
import { aggregateAll } from "../utils/globalStats.js";

// Singleton event bus — any module can call notifyStatsUpdate()
// to trigger re-renders in all useGlobalStats consumers
const listeners = new Set();

export function notifyStatsUpdate() {
  listeners.forEach((fn) => fn());
}

/**
 * onStatsUpdate — Phase 35 Batch F
 *
 * Exposes the shared global-stats pub/sub bus so OTHER contexts
 * (e.g. ProgressContext) can subscribe to the exact same listener
 * Set that notifyStatsUpdate() already broadcasts on, instead of
 * building a second, parallel synchronization mechanism.
 *
 * notifyStatsUpdate() is already called by syllabusService whenever
 * a topic transition earns XP (including from the Focus post-session
 * topic completion workflow), by FocusContext after a session is
 * saved, and by UserContext after profile/sync updates — so any
 * consumer registered here reacts to all of those automatically.
 *
 * @param {() => void} fn  called (no args) whenever notifyStatsUpdate() fires
 * @returns {() => void}   unsubscribe function
 */
export function onStatsUpdate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useGlobalStats() {
  const [stats, setStats] = useState(() => aggregateAll());
  const mountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (mountedRef.current) setStats(aggregateAll());
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = onStatsUpdate(refresh);
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refresh]);

  return { stats, refresh };
}
