import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { aggregateAll } from "../utils/globalStats.js";
import { notifyStatsUpdate } from "../hooks/useGlobalStats.js";
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
