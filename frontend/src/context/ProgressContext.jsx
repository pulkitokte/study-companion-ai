import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  getGlobalStats,
  getTodayMissions,
  checkMissionsAutoComplete,
} from "../utils/progressStorage.js";
import { getQuizHistory } from "../utils/quizStorage.js";
import { getFocusHistory } from "../utils/focusStorage.js";

const ProgressContext = createContext(null);

function calcTodayXP() {
  const today = new Date().toISOString().slice(0, 10);
  const qXP = (getQuizHistory() ?? [])
    .filter((q) => q.date?.slice(0, 10) === today)
    .reduce((s, q) => s + (q.totalXP ?? 0), 0);
  const fXP = (getFocusHistory() ?? [])
    .filter((f) => f.date?.slice(0, 10) === today)
    .reduce((s, f) => s + (f.xpEarned ?? 0), 0);
  return qXP + fXP;
}

export function ProgressProvider({ children }) {
  const [rev, setRev] = useState(0);

  const stats = useMemo(() => getGlobalStats(), [rev]);
  const rawMiss = useMemo(() => getTodayMissions(), [rev]);
  const missions = useMemo(() => checkMissionsAutoComplete(rawMiss), [rev]);
  const xpToday = useMemo(() => calcTodayXP(), [rev]);

  const refreshStats = useCallback(() => setRev((r) => r + 1), []);

  return (
    <ProgressContext.Provider
      value={{ stats, missions, xpToday, refreshStats }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
