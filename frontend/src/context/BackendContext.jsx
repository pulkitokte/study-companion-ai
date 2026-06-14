import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  getRegistryHealth,
  getServiceList,
  getService,
} from "../lib/serviceRegistry.js";
import {
  downloadEcosystemExport,
  importEcosystem,
  validateEcosystemImport,
  migrateLegacyKeys,
  getSchemaVersion,
} from "../lib/dataMigration.js";
// FIX: getStorageSize was imported from performanceMonitor.js where it does NOT exist.
// Replaced with StorageAdapter.size() via a local helper defined below.
import StorageAdapter from "../lib/storageAdapter.js";
import { supabaseConfig } from "../config/supabaseConfig.js";
import env from "../lib/env.js";

const BackendContext = createContext(null);

// ─── LOCAL HELPER (replaces missing `getStorageSize` from performanceMonitor) ──
function getStorageInfo() {
  const bytes = StorageAdapter.size();
  return {
    bytes,
    kb: parseFloat((bytes / 1024).toFixed(1)),
    pct: Math.min(Math.round((bytes / (5 * 1024 * 1024)) * 100), 100),
  };
}

export function BackendProvider({ children }) {
  const [registry, setRegistry] = useState(() => getRegistryHealth());
  const [storageInfo, setStorageInfo] = useState(() => getStorageInfo());
  const [lastAction, setLastAction] = useState(null);

  // Run legacy key migration once on mount (safe no-op if nothing to migrate)
  useEffect(() => {
    const result = migrateLegacyKeys();
    if (result.migrated > 0) {
      setLastAction({
        type: "migration",
        detail: `${result.migrated} legacy keys migrated`,
        ts: Date.now(),
      });
    }
  }, []);

  const refresh = useCallback(() => {
    setRegistry(getRegistryHealth());
    setStorageInfo(getStorageInfo());
  }, []);

  const exportData = useCallback(() => {
    const result = downloadEcosystemExport();
    setLastAction({ type: "export", detail: result.filename, ts: Date.now() });
    refresh();
    return result;
  }, [refresh]);

  const importData = useCallback(
    (jsonString, opts) => {
      const result = importEcosystem(jsonString, opts);
      if (result.ok) {
        setLastAction({
          type: "import",
          detail: `${result.restored} keys restored, ${result.skipped} skipped`,
          ts: Date.now(),
        });
        refresh();
      }
      return result;
    },
    [refresh],
  );

  const validateImport = useCallback(
    (jsonString) => validateEcosystemImport(jsonString),
    [],
  );

  const value = useMemo(
    () => ({
      registry,
      storageInfo,
      lastAction,
      schemaVersion: getSchemaVersion(),
      backendMode: env.isMock ? "mock" : env.hasSupabase ? "supabase" : "rest",
      isMock: env.isMock,
      cloudConfigured: supabaseConfig.configured,
      services: getServiceList(),
      getService,
      refresh,
      exportData,
      importData,
      validateImport,
    }),
    [
      registry,
      storageInfo,
      lastAction,
      refresh,
      exportData,
      importData,
      validateImport,
    ],
  );

  return (
    <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
  );
}

export function useBackendContext() {
  const ctx = useContext(BackendContext);
  if (!ctx)
    throw new Error("useBackendContext must be used inside BackendProvider");
  return ctx;
}
