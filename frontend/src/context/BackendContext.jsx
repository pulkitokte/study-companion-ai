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
  exportEcosystem,
  downloadEcosystemExport,
  importEcosystem,
  validateEcosystemImport,
  migrateLegacyKeys,
  getSchemaVersion,
} from "../lib/dataMigration.js";
import { getStorageSize } from "../utils/performanceMonitor.js";
import env from "../lib/env.js";

const BackendContext = createContext(null);

export function BackendProvider({ children }) {
  const [registry, setRegistry] = useState(() => getRegistryHealth());
  const [storageInfo, setStorageInfo] = useState(() => getStorageSize());
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    // Run legacy key migration once on mount (safe no-op if nothing to migrate)
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
    setStorageInfo(getStorageSize());
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
