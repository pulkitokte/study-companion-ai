import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  supabaseConfig,
  validateSupabaseConfig,
} from "../config/supabaseConfig.js";
import {
  runFullCloudSync,
  getCloudSyncState,
  getSyncLog,
  onCloudSyncEvent,
  isCloudSyncRunning,
  clearSyncLog,
} from "../lib/cloudSyncEngine.js";
import { isOnline, onNetwork } from "../lib/networkManager.js";
import { getQueueStats } from "../lib/offlineQueue.js";

const CloudContext = createContext(null);

export function CloudProvider({ children }) {
  const [configStatus, setConfigStatus] = useState(() =>
    validateSupabaseConfig(),
  );
  const [syncState, setSyncState] = useState(() => getCloudSyncState());
  const [syncLog, setSyncLog] = useState(() => getSyncLog());
  const [online, setOnline] = useState(() => isOnline());
  const [syncing, setSyncing] = useState(() => isCloudSyncRunning());
  const [queueStats, setQueueStats] = useState(() => getQueueStats());
  const [lastEvent, setLastEvent] = useState(null);

  // Network listener
  useEffect(() => {
    const off = onNetwork((event, state) => {
      setOnline(state.online);
      if (event === "online") {
        // Auto-sync shortly after reconnect
        setTimeout(() => triggerSync(), 1200);
      }
    });
    return off;
  }, []); // eslint-disable-line

  // Cloud sync engine listener
  useEffect(() => {
    const off = onCloudSyncEvent((event, data) => {
      setLastEvent({ event, data, ts: Date.now() });
      if (event === "full_sync_start") setSyncing(true);
      if (event === "full_sync_done") {
        setSyncing(false);
        setSyncState(getCloudSyncState());
        setSyncLog(getSyncLog());
        setQueueStats(getQueueStats());
      }
    });
    return off;
  }, []);

  const triggerSync = useCallback(async () => {
    const result = await runFullCloudSync();
    setSyncState(getCloudSyncState());
    setSyncLog(getSyncLog());
    setQueueStats(getQueueStats());
    return result;
  }, []);

  const refresh = useCallback(() => {
    setConfigStatus(validateSupabaseConfig());
    setSyncState(getCloudSyncState());
    setSyncLog(getSyncLog());
    setQueueStats(getQueueStats());
    setOnline(isOnline());
  }, []);

  const wipeLog = useCallback(() => {
    clearSyncLog();
    setSyncLog([]);
  }, []);

  const value = useMemo(
    () => ({
      configStatus,
      cloudEnabled: supabaseConfig.configured,
      provider: supabaseConfig.configured ? "supabase" : "mock",
      online,
      syncing,
      syncState,
      syncLog,
      queueStats,
      lastEvent,
      triggerSync,
      refresh,
      wipeLog,
    }),
    [
      configStatus,
      online,
      syncing,
      syncState,
      syncLog,
      queueStats,
      lastEvent,
      triggerSync,
      refresh,
      wipeLog,
    ],
  );

  return (
    <CloudContext.Provider value={value}>{children}</CloudContext.Provider>
  );
}

export function useCloudContext() {
  const ctx = useContext(CloudContext);
  if (!ctx)
    throw new Error("useCloudContext must be used inside CloudProvider");
  return ctx;
}
