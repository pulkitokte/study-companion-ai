import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  initNetworkManager,
  getNetworkState,
  onNetwork,
} from "../lib/networkManager.js";
import {
  startSyncScheduler,
  getSyncSchedulerStatus,
  runSyncCycle,
  onSyncEvent,
} from "../lib/syncScheduler.js";
import { getQueueStats } from "../lib/offlineQueue.js";
import { getCacheStats } from "../lib/cacheManager.js";
import { getLogStats } from "../lib/errorLogger.js";
import { StorageAdapter } from "../lib/storageAdapter.js";
import { installGlobalErrorHandler } from "../lib/errorLogger.js";
import env from "../lib/env.js";

const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const [networkState, setNetworkState] = useState(() => getNetworkState());
  const [syncStatus, setSyncStatus] = useState(() => getSyncSchedulerStatus());
  const [cacheStats, setCacheStats] = useState(() => getCacheStats());
  const [logStats, setLogStats] = useState(() => getLogStats());
  const [lastEvent, setLastEvent] = useState(null);

  // Initialize on mount
  useEffect(() => {
    initNetworkManager();
    startSyncScheduler();
    installGlobalErrorHandler();

    // Network listener
    const offNetwork = onNetwork((event, state) => {
      setNetworkState({ ...state });
      setLastEvent({ type: "network", event, ts: Date.now() });
    });

    // Sync listener
    const offSync = onSyncEvent((event, data) => {
      setSyncStatus(getSyncSchedulerStatus());
      setLastEvent({ type: "sync", event, data, ts: Date.now() });
    });

    // Refresh stats every 30s
    const interval = setInterval(() => {
      setCacheStats(getCacheStats());
      setLogStats(getLogStats());
      setSyncStatus(getSyncSchedulerStatus());
    }, 30000);

    return () => {
      offNetwork();
      offSync();
      clearInterval(interval);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    const result = await runSyncCycle();
    setSyncStatus(getSyncSchedulerStatus());
    setCacheStats(getCacheStats());
    return result;
  }, []);

  const refreshStats = useCallback(() => {
    setCacheStats(getCacheStats());
    setLogStats(getLogStats());
    setSyncStatus(getSyncSchedulerStatus());
    setNetworkState(getNetworkState());
  }, []);

  const storageSize = useMemo(() => {
    const bytes = StorageAdapter.size();
    return {
      bytes,
      kb: parseFloat((bytes / 1024).toFixed(1)),
      pct: Math.min(Math.round((bytes / (5 * 1024 * 1024)) * 100), 100),
    };
  }, [cacheStats]);

  const systemHealth = useMemo(() => {
    const checks = [
      { id: "network", ok: networkState.online, label: "Network" },
      { id: "storage", ok: storageSize.pct < 80, label: "Storage" },
      { id: "errors", ok: logStats.errors < 5, label: "Error Rate" },
      {
        id: "queue",
        ok: (syncStatus.queue?.dead ?? 0) < 5,
        label: "Sync Queue",
      },
      { id: "ai", ok: env.hasGemini, label: "Gemini AI" },
    ];
    const passing = checks.filter((c) => c.ok).length;
    const score = Math.round((passing / checks.length) * 100);
    return { checks, score, passing, total: checks.length };
  }, [networkState, storageSize, logStats, syncStatus, env.hasGemini]);

  const value = useMemo(
    () => ({
      networkState,
      syncStatus,
      cacheStats,
      logStats,
      lastEvent,
      storageSize,
      systemHealth,
      env: {
        hasGemini: env.hasGemini,
        hasBackend: env.hasBackend,
        isMock: env.isMock,
        isProd: env.isProd,
      },
      triggerSync,
      refreshStats,
    }),
    [
      networkState,
      syncStatus,
      cacheStats,
      logStats,
      lastEvent,
      storageSize,
      systemHealth,
      triggerSync,
      refreshStats,
    ],
  );

  return (
    <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be used inside SystemProvider");
  return ctx;
}
