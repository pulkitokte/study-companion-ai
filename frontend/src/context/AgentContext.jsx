import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import StudyCoachAgent from "../agents/StudyCoachAgent.js";
import PlannerAgent from "../agents/PlannerAgent.js";
import FocusAgent from "../agents/FocusAgent.js";
import ProgressAgent from "../agents/ProgressAgent.js";
import { aggregateAll } from "../utils/globalStats.js";
import {
  generateRecommendations,
  acceptRecommendation,
  dismissRecommendation,
  completeRecommendation,
  getActiveRecommendations,
} from "../lib/recommendationEngine.js";
import {
  getPreferenceProfile,
  updatePreferenceProfile,
  getRecentInsights,
} from "../lib/agentMemory.js";

const AgentContext = createContext(null);

export function AgentProvider({ children }) {
  const [stats, setStats] = useState(() => aggregateAll());
  const [briefing, setBriefing] = useState(() =>
    StudyCoachAgent.getDailyBriefing(),
  );
  const [recommendations, setRecommendations] = useState(() => {
    const active = getActiveRecommendations();
    return active.length > 0 ? active : generateRecommendations();
  });
  const [studyPath, setStudyPath] = useState([]);
  const [insights, setInsights] = useState(() => getRecentInsights());
  const [preferences, setPreferences] = useState(() => getPreferenceProfile());

  // ─── REFRESH ALL ────────────────────────────────────────────
  const refresh = useCallback(() => {
    const freshStats = aggregateAll();
    setStats(freshStats);
    setBriefing(StudyCoachAgent.getDailyBriefing(freshStats));
    setRecommendations(generateRecommendations());
    setStudyPath([]);
    setInsights(getRecentInsights());
  }, []);

  // Refresh on mount and every 5 minutes
  useEffect(() => {
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  // ─── RECOMMENDATION ACTIONS ─────────────────────────────────
  const accept = useCallback((id) => {
    acceptRecommendation(id);
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)),
    );
  }, []);

  const dismiss = useCallback((id) => {
    dismissRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const complete = useCallback((id) => {
    completeRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ─── PREFERENCES ─────────────────────────────────────────────
  const setPreference = useCallback((partial) => {
    const updated = updatePreferenceProfile(partial);
    setPreferences(updated);
    return updated;
  }, []);

  // ─── AGENT-SPECIFIC ANALYSIS (lazy, computed on demand) ──────
  const getCoachAnalysis = useCallback(
    () => StudyCoachAgent.analyzeLearning(stats),
    [stats],
  );
  const getFocusAnalysis = useCallback(
    () => FocusAgent.analyzeFocusPatterns(),
    [stats],
  );
  const getPlannerPlan = useCallback(
    () => PlannerAgent.getStudyPlan(),
    [stats],
  );
  const getProgressForecast = useCallback(
    () => ProgressAgent.forecastGrowth(),
    [stats],
  );
  const getNextAchievements = useCallback(
    () => ProgressAgent.getNextAchievements(),
    [stats],
  );

  const value = useMemo(
    () => ({
      stats,
      briefing,
      recommendations,
      studyPath,
      insights,
      preferences,
      refresh,
      accept,
      dismiss,
      complete,
      setPreference,
      getCoachAnalysis,
      getFocusAnalysis,
      getPlannerPlan,
      getProgressForecast,
      getNextAchievements,
    }),
    [
      stats,
      briefing,
      recommendations,
      studyPath,
      insights,
      preferences,
      refresh,
      accept,
      dismiss,
      complete,
      setPreference,
      getCoachAnalysis,
      getFocusAnalysis,
      getPlannerPlan,
      getProgressForecast,
      getNextAchievements,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgentContext() {
  const ctx = useContext(AgentContext);
  if (!ctx)
    throw new Error("useAgentContext must be used inside AgentProvider");
  return ctx;
}
