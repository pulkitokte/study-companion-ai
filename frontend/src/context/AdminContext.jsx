import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  isAdminUnlocked,
  unlockAdmin,
  lockAdmin,
  getFeatureFlags,
  setFeatureFlag,
  resetFeatureFlags,
  getAdminLog,
  logAdminAction,
  clearAdminLog,
  getAdminOverview,
  resetModuleData,
} from "../lib/adminEngine.js";
import {
  getEventSummary,
  getXPTimeline,
  getCategoryBreakdown,
  getFocusModeBreakdown,
  getWeeklyTrend,
  clearEvents,
} from "../lib/analyticsEngine.js";
import {
  getCustomQuestions,
  addCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  getQuestionBankStats,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "../lib/contentManager.js";

const AdminContext = createContext(null);

// Helper — builds the analytics snapshot from current localStorage state
function buildAnalytics() {
  return {
    events: getEventSummary(),
    xpTimeline: getXPTimeline(14),
    categoryBreakdown: getCategoryBreakdown(),
    focusBreakdown: getFocusModeBreakdown(),
    weeklyTrend: getWeeklyTrend(),
  };
}

export function AdminProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked());
  const [flags, setFlags] = useState(() => getFeatureFlags());
  const [overview, setOverview] = useState(() => getAdminOverview());
  const [actionLog, setActionLog] = useState(() => getAdminLog());
  const [announcements, setAnnouncements] = useState(() => getAnnouncements());
  // analytics is now its own state slice so wipeEvents() can refresh it independently
  const [analyticsData, setAnalyticsData] = useState(() => buildAnalytics());

  // ─── AUTH ───────────────────────────────────────────────────
  const login = useCallback((passcode) => {
    const ok = unlockAdmin(passcode);
    if (ok) {
      setUnlocked(true);
      setActionLog(getAdminLog());
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    lockAdmin();
    setUnlocked(false);
    setActionLog(getAdminLog());
  }, []);

  // ─── FEATURE FLAGS ──────────────────────────────────────────
  const toggleFlag = useCallback(
    (key) => {
      const current = flags[key];
      const updated = setFeatureFlag(key, !current);
      setFlags(updated);
      setActionLog(getAdminLog());
      return updated;
    },
    [flags],
  );

  const resetFlags = useCallback(() => {
    const updated = resetFeatureFlags();
    setFlags(updated);
    setActionLog(getAdminLog());
    return updated;
  }, []);

  // ─── DATA TOOLS ─────────────────────────────────────────────
  const resetModule = useCallback((moduleKey) => {
    const result = resetModuleData(moduleKey);
    setOverview(getAdminOverview());
    setAnalyticsData(buildAnalytics()); // module reset may affect analytics
    setActionLog(getAdminLog());
    return result;
  }, []);

  const refreshOverview = useCallback(() => {
    setOverview(getAdminOverview());
    setAnalyticsData(buildAnalytics());
    setActionLog(getAdminLog());
  }, []);

  // ─── ANALYTICS ──────────────────────────────────────────────
  // FIX: wipeEvents now also refreshes analyticsData state so the panel updates
  const wipeEvents = useCallback(() => {
    clearEvents();
    logAdminAction("events_cleared", {});
    setActionLog(getAdminLog());
    setAnalyticsData(buildAnalytics()); // was missing — caused stale analytics UI
  }, []);

  // ─── CONTENT MANAGEMENT ─────────────────────────────────────
  const [questionBank, setQuestionBank] = useState(() =>
    getQuestionBankStats(),
  );
  const [customQuestions, setCustomQuestions] = useState(() =>
    getCustomQuestions(),
  );

  const createQuestion = useCallback((q) => {
    const entry = addCustomQuestion(q);
    setCustomQuestions(getCustomQuestions());
    setQuestionBank(getQuestionBankStats());
    logAdminAction("question_created", { category: q.category });
    setActionLog(getAdminLog());
    return entry;
  }, []);

  const editQuestion = useCallback((id, updates) => {
    const entry = updateCustomQuestion(id, updates);
    setCustomQuestions(getCustomQuestions());
    return entry;
  }, []);

  const removeQuestion = useCallback((id) => {
    deleteCustomQuestion(id);
    setCustomQuestions(getCustomQuestions());
    setQuestionBank(getQuestionBankStats());
    logAdminAction("question_deleted", { id });
    setActionLog(getAdminLog());
  }, []);

  // ─── ANNOUNCEMENTS ──────────────────────────────────────────
  const addAnnouncement = useCallback((data) => {
    const entry = createAnnouncement(data);
    setAnnouncements(getAnnouncements());
    logAdminAction("announcement_created", { title: data.title });
    setActionLog(getAdminLog());
    return entry;
  }, []);

  const flipAnnouncement = useCallback((id) => {
    toggleAnnouncement(id);
    setAnnouncements(getAnnouncements());
  }, []);

  const removeAnnouncement = useCallback((id) => {
    deleteAnnouncement(id);
    setAnnouncements(getAnnouncements());
    logAdminAction("announcement_deleted", { id });
    setActionLog(getAdminLog());
  }, []);

  const clearLog = useCallback(() => {
    clearAdminLog();
    setActionLog([]);
  }, []);

  const value = useMemo(
    () => ({
      unlocked,
      login,
      logout,
      flags,
      toggleFlag,
      resetFlags,
      overview,
      refreshOverview,
      resetModule,
      actionLog,
      clearLog,
      analytics: analyticsData, // renamed from inline useMemo to state-driven
      wipeEvents,
      questionBank,
      customQuestions,
      createQuestion,
      editQuestion,
      removeQuestion,
      announcements,
      addAnnouncement,
      flipAnnouncement,
      removeAnnouncement,
    }),
    [
      unlocked,
      flags,
      overview,
      actionLog,
      analyticsData,
      questionBank,
      customQuestions,
      announcements,
      login,
      logout,
      toggleFlag,
      resetFlags,
      refreshOverview,
      resetModule,
      clearLog,
      wipeEvents,
      createQuestion,
      editQuestion,
      removeQuestion,
      addAnnouncement,
      flipAnnouncement,
      removeAnnouncement,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx)
    throw new Error("useAdminContext must be used inside AdminProvider");
  return ctx;
}
