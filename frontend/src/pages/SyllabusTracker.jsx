import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Star,
  Award,
} from "lucide-react";
import syllabusService from "../services/syllabusService.js";
import SYLLABUS_DATA, { getAllExams, getExam } from "../data/syllabusData.js";
import { useToast } from "../components/ui/Toast.jsx";
import TopicPanel from "../components/syllabus/TopicPanel.jsx";
import SyllabusProgressRing from "../components/syllabus/SyllabusProgressRing.jsx";
import SyllabusStats from "../components/syllabus/SyllabusStats.jsx";
import SyllabusAnalyticsView from "../components/syllabus/analytics/SyllabusAnalyticsView.jsx";
import RevisionView from "../components/syllabus/revision/RevisionView.jsx";
import SearchBar from "../components/syllabus/search/SearchBar.jsx";
import SearchResults from "../components/syllabus/search/SearchResults.jsx";
import ExamReadinessCard from "../components/syllabus/ExamReadinessCard.jsx";
import ActivityHeatmap from "../components/syllabus/heatmap/ActivityHeatmap.jsx";
import ExamCountdownCard from "../components/syllabus/ExamCountdownCard.jsx";
import GapAnalysisView from "../components/syllabus/gap-analysis/GapAnalysisView.jsx";
import RecommendationView from "../components/syllabus/recommendations/RecommendationView.jsx";
import { buildSearchIndex, runSearch } from "../utils/searchUtils.js";
import { getQuizHistory } from "../utils/quizStorage.js";

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

// ─── VIEW TABS ────────────────────────────────────────────────────────────────
const VIEW_TABS = [
  { id: "overview", icon: "📋", label: "Overview" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "revision", icon: "🔁", label: "Revision" },
  { id: "gap-analysis", icon: "🔍", label: "Gap Analysis" },
  { id: "recommendations", icon: "🌟", label: "Recommendations" },
];

// ─── VALID TAB IDS FOR SESSION STORAGE RESTORATION ───────────────────────────
// CHANGE 1 — added by Phase 34 Batch C
// Includes all rendered tab ids plus any extra ids the Dashboard Command Center
// may store. Unknown values are ignored and fall back to "overview".
const VALID_TAB_IDS = new Set([
  "overview",
  "analytics",
  "revision",
  "gap-analysis",
  "recommendations",
  "search",
  "planner",
]);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtAgo(iso) {
  try {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  } catch {
    return "";
  }
}

const ACTION_META = {
  topic_completed: { label: "Completed", color: "#00FFC8" },
  topic_revised: { label: "Revised", color: "#7C6FFF" },
  topic_mastered: { label: "Mastered", color: "#FFD700" },
  topic_revision_needed: { label: "Flagged", color: "#FF6B2B" },
  subject_completed: { label: "Subject Complete", color: "#00FFC8" },
  subject_mastered: { label: "Subject Mastered", color: "#FFD700" },
  exam_half_complete: { label: "50% Milestone", color: "#FF6B2B" },
  exam_full_complete: { label: "Exam Complete", color: "#FFD700" },
};

// ─── SUBJECT CARD ─────────────────────────────────────────────────────────────
function SubjectCard({ subject, index, onOpen }) {
  const progress = subject.progress ?? {};
  const pct = progress.pct ?? 0;
  const done = progress.done ?? 0;
  const total = progress.total ?? 0;
  const mastered = progress.mastered ?? 0;
  const xpEarned = progress.xpEarned ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => onOpen(subject)}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 cursor-pointer group transition-all"
      style={{ background: done > 0 ? `${subject.color}09` : "#0A0A14" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg,transparent,${subject.color},transparent)`,
        }}
      />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl leading-none shrink-0">{subject.emoji}</span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-white leading-tight truncate">
              {subject.label}
            </p>
            <p className="text-[10px] text-white/28 mt-0.5">{total} topics</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <span
            className="text-[13px] font-black"
            style={{
              color: pct > 0 ? subject.color : "rgba(255,255,255,0.22)",
            }}
          >
            {pct}%
          </span>
          <ChevronRight
            size={13}
            className="text-white/18 group-hover:text-white/45 transition-colors"
          />
        </div>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.75,
            delay: index * 0.04 + 0.1,
            ease: "easeOut",
          }}
          style={{
            background: pct > 0 ? subject.color : "rgba(255,255,255,0.08)",
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2
            size={11}
            style={{
              color: done > 0 ? subject.color : "rgba(255,255,255,0.18)",
            }}
          />
          <span className="text-[10px] text-white/42">
            {done}/{total} done
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {mastered > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} className="text-[#FFD700]" />
              <span className="text-[9px] text-[#FFD700] font-bold">
                {mastered}
              </span>
            </div>
          )}
          {xpEarned > 0 && (
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-[#7C6FFF]" />
              <span className="text-[9px] text-[#7C6FFF] font-bold">
                {xpEarned}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ACTIVITY ROW ─────────────────────────────────────────────────────────────
function ActivityRow({ entry, index }) {
  const meta = ACTION_META[entry.action] ?? {
    label: entry.action,
    color: "#888",
  };
  const hasTopicLabel = typeof entry.topicLabel === "string";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-0"
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}50` }}
      />
      <div className="flex-1 min-w-0">
        {hasTopicLabel ? (
          <>
            <p className="text-[11px] text-white/70 leading-snug truncate">
              {entry.topicLabel}
            </p>
            <p className="text-[9px] text-white/28 mt-0.5 capitalize">
              {entry.subject} · {meta.label}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-white/70 leading-snug">
            {(entry.exam ?? "").toUpperCase()} — {meta.label}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {entry.xp > 0 && (
          <span className="text-[10px] font-bold text-[#7C6FFF]">
            +{entry.xp} XP
          </span>
        )}
        <span className="text-[9px] text-white/20">
          {fmtAgo(entry.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SyllabusTracker() {
  const navigate = useNavigate();
  const { show } = useToast();

  // ── Core state ────────────────────────────────────────────────────────────
  const [activeExam, setActiveExamState] = useState(() =>
    syllabusService.getActiveExam(),
  );
  const [examProgress, setExamProgress] = useState(null);
  const [subjectData, setSubjectData] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [revisionQueue, setRevisionQueue] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // CHANGE 2 — Phase 34 Batch C: lazy initialiser reads sessionStorage once.
  // If the Dashboard Command Center stored a target tab, consume it
  // (remove immediately so back-navigation does not re-apply a stale value).
  // Any value absent from VALID_TAB_IDS falls back to "overview".
  const [view, setView] = useState(() => {
    try {
      const stored = sessionStorage.getItem("studymind_syllabus_initial_tab");
      if (stored) {
        sessionStorage.removeItem("studymind_syllabus_initial_tab");
        if (VALID_TAB_IDS.has(stored)) return stored;
      }
    } catch {
      // sessionStorage unavailable (e.g. private-browsing quirks) — ignore
    }
    return "overview";
  });

  const [highlightedTopicId, setHighlightedTopicId] = useState(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const allExams = useMemo(() => getAllExams(), []);
  const examDef = useMemo(() => getExam(activeExam), [activeExam]);
  const accent = examDef?.color ?? "#7C6FFF";

  // ── Search index (built once) ─────────────────────────────────────────────
  const searchIndex = useMemo(() => buildSearchIndex(SYLLABUS_DATA), []);

  // ── Quiz history — shared by readiness score, gap analysis, recommendations
  const quizHistory = useMemo(() => {
    try {
      return getQuizHistory() ?? [];
    } catch {
      return [];
    }
  }, []);

  // ── Quiz stats for readiness score ────────────────────────────────────────
  const quizStats = useMemo(() => {
    try {
      if (quizHistory.length === 0) return null;
      const totalQuestions = quizHistory.reduce(
        (s, q) => s + (q.total ?? 0),
        0,
      );
      const correctAnswers = quizHistory.reduce(
        (s, q) => s + (q.correct ?? 0),
        0,
      );
      return { totalQuestions, correctAnswers };
    } catch {
      return null;
    }
  }, [quizHistory]);

  // ── Debounced search ──────────────────────────────────────────────────────
  const searchTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      const raw = runSearch(trimmed, searchIndex, 20);
      const enriched = raw.map((r) => ({
        ...r,
        progress: syllabusService.getTopicProgress(
          r.examId,
          r.subjectId,
          r.topicId,
        ),
      }));
      setSearchResults(enriched);
      setSearchOpen(true);
    }, 120);

    return () => clearTimeout(searchTimerRef.current);
  }, [query, searchIndex]);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    setExamProgress(syllabusService.getExamProgress(activeExam));
    setSubjectData(syllabusService.getAllSubjectProgress(activeExam));
    setActivityLog(syllabusService.getActivityLog(500));
    // Phase 33: load today's spaced-repetition queue for recommendation engine
    try {
      setRevisionQueue(syllabusService.getTodayRevisionQueue(activeExam) ?? []);
    } catch {
      setRevisionQueue([]);
    }
  }, [activeExam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Close panel when exam switches
  useEffect(() => {
    setSelectedSubject(null);
  }, [activeExam]);

  // Navigate-to-settings listener (from ExamCountdownCard CTA)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === "settings") navigate("/settings");
    };
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleExamChange = useCallback((examId) => {
    syllabusService.setActiveExam(examId);
    setActiveExamState(examId);
  }, []);

  const handleRefresh = () => {
    loadData();
    show({ type: "info", title: "Refreshed", duration: 1500 });
  };

  const handleSubjectOpen = useCallback((subject) => {
    setSelectedSubject(subject);
  }, []);
  const handleProgressChange = useCallback(() => {
    loadData();
  }, [loadData]);

  // ── Search handlers ───────────────────────────────────────────────────────
  const handleSearchClear = useCallback(() => {
    setQuery("");
    setSearchResults([]);
    setSearchOpen(false);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const handleResultSelect = useCallback(
    (result) => {
      if (result.examId !== activeExam) {
        syllabusService.setActiveExam(result.examId);
        setActiveExamState(result.examId);
      }
      setView("overview");
      setSelectedSubject({
        id: result.subjectId,
        label: result.subjectLabel,
        emoji: result.subjectEmoji,
        color: result.subjectColor,
      });
      setHighlightedTopicId(result.topicId);
      setTimeout(() => setHighlightedTopicId(null), 4000);
      handleSearchClear();
    },
    [activeExam, handleSearchClear],
  );

  // ── Recommendation CTA navigation handler ─────────────────────────────────
  // Called by RecommendationView when a card's action button is tapped.
  // If the path is /syllabus we stay on this page and switch to the
  // revision tab; otherwise navigate away (e.g. /quiz).
  const handleRecommendationNavigate = useCallback(
    (path) => {
      if (path === "/syllabus") {
        setView("revision");
      } else {
        navigate(path);
      }
    },
    [navigate],
  );

  // ── Derived display values ────────────────────────────────────────────────
  const pct = examProgress?.pct ?? 0;
  const done = examProgress?.done ?? 0;
  const total = examProgress?.total ?? 0;
  const mastered = examProgress?.mastered ?? 0;
  const xpEarned = examProgress?.xpEarned ?? 0;

  return (
    <>
      <motion.div
        variants={C}
        initial="hidden"
        animate="visible"
        className="space-y-5 max-w-5xl mx-auto pb-16"
      >
        {/* ── Page header ────────────────────────────────────────────────── */}
        <motion.div
          variants={I}
          className="flex items-center justify-between gap-3"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08]
                       text-[11px] font-bold text-white/35 hover:text-white/60
                       hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </motion.div>

        {/* ── Hero (always visible) ───────────────────────────────────────── */}
        <motion.div
          variants={I}
          className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6 md:p-7"
          style={{
            background: `linear-gradient(135deg, ${accent}12, rgba(5,5,12,0))`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]"
            style={{
              background: `linear-gradient(90deg,transparent,${accent},transparent)`,
            }}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <SyllabusProgressRing pct={pct} color={accent} size={108} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl leading-none">{examDef?.emoji}</span>
                <h2 className="text-[20px] font-black text-white leading-tight">
                  {examDef?.shortLabel}
                </h2>
              </div>
              <p className="text-[11px] text-white/35 mb-4 leading-relaxed">
                {examDef?.description}
              </p>
              <SyllabusStats
                done={done}
                total={total}
                mastered={mastered}
                xpEarned={xpEarned}
                subjectCount={subjectData.length}
                examColor={accent}
              />
            </div>
          </div>
          {total > 0 && done === 0 && (
            <div className="mt-5 px-4 py-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 justify-center">
                <BookOpen size={14} className="text-white/30 shrink-0" />
                <p className="text-[12px] text-white/38 text-center">
                  Select a subject below and mark your first topic complete to
                  start tracking.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Exam Countdown Card ─────────────────────────────────────────── */}
        <motion.div variants={I}>
          <ExamCountdownCard
            examId={activeExam}
            examDef={examDef}
            examProgress={examProgress}
          />
        </motion.div>

        {/* ── Exam Readiness Card ─────────────────────────────────────────── */}
        <motion.div variants={I}>
          <ExamReadinessCard
            examProgress={examProgress}
            quizStats={quizStats}
            examDef={examDef}
          />
        </motion.div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <motion.div variants={I} className="relative">
          <SearchBar
            query={query}
            onChange={setQuery}
            onClear={handleSearchClear}
            resultCount={searchResults.length}
            isOpen={searchOpen}
          />
          <SearchResults
            results={searchResults}
            query={query}
            isOpen={searchOpen && query.trim().length >= 2}
            onSelect={handleResultSelect}
            onClose={handleSearchClose}
          />
        </motion.div>

        {/* ── Exam selector (always visible) ─────────────────────────────── */}
        <motion.div
          variants={I}
          className="flex gap-1.5 overflow-x-auto scrollbar-none"
        >
          {allExams.map((exam) => {
            const active = exam.id === activeExam;
            return (
              <button
                key={exam.id}
                onClick={() => handleExamChange(exam.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0 text-[12px] font-bold transition-all duration-200"
                style={{
                  background: active
                    ? `${exam.color}14`
                    : "rgba(255,255,255,0.025)",
                  borderColor: active
                    ? `${exam.color}42`
                    : "rgba(255,255,255,0.07)",
                  color: active ? exam.color : "rgba(255,255,255,0.35)",
                  boxShadow: active ? `0 0 14px ${exam.color}12` : "none",
                }}
              >
                <span className="text-base leading-none">{exam.emoji}</span>
                {exam.shortLabel}
              </button>
            );
          })}
        </motion.div>

        {/* ── View toggle (always visible) ────────────────────────────────── */}
        <motion.div
          variants={I}
          className="flex gap-1.5 overflow-x-auto scrollbar-none"
        >
          {VIEW_TABS.map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0 text-[12px] font-bold transition-all duration-200"
                style={{
                  background: active
                    ? `${accent}14`
                    : "rgba(255,255,255,0.025)",
                  borderColor: active
                    ? `${accent}42`
                    : "rgba(255,255,255,0.07)",
                  color: active ? accent : "rgba(255,255,255,0.35)",
                  boxShadow: active ? `0 0 14px ${accent}12` : "none",
                }}
              >
                <span className="text-sm leading-none">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* ── Overview ────────────────────────────────────────────────────── */}
        {view === "overview" && (
          <>
            {/* Subject grid */}
            <motion.div variants={I}>
              <p className="text-[11px] font-bold text-white/32 uppercase tracking-widest mb-3">
                Subjects
              </p>
              {subjectData.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-2 py-12 rounded-2xl border border-white/[0.05]"
                  style={{ background: "#0A0A14" }}
                >
                  <BookOpen size={28} className="text-white/18" />
                  <p className="text-[12px] text-white/28">No subjects found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectData.map((subject, i) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      index={i}
                      onOpen={handleSubjectOpen}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={I}>
              <p className="text-[11px] font-bold text-white/32 uppercase tracking-widest mb-3">
                Recent Activity
              </p>
              <div
                className="rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ background: "#0A0A14" }}
              >
                {activityLog.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                    <BookOpen size={26} className="text-white/16" />
                    <p className="text-[12px] text-white/28">No activity yet</p>
                    <p className="text-[10px] text-white/18 max-w-xs leading-relaxed">
                      Complete a topic from any subject to begin your syllabus
                      journey.
                    </p>
                  </div>
                ) : (
                  activityLog
                    .slice(0, 10)
                    .map((entry, i) => (
                      <ActivityRow
                        key={`${entry.timestamp ?? i}-${i}`}
                        entry={entry}
                        index={i}
                      />
                    ))
                )}
              </div>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div variants={I}>
              <ActivityHeatmap activityLog={activityLog} examColor={accent} />
            </motion.div>
          </>
        )}

        {/* ── Analytics ───────────────────────────────────────────────────── */}
        {view === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SyllabusAnalyticsView
              activeExam={activeExam}
              examProgress={examProgress}
              subjectProgress={subjectData}
              activityLog={activityLog}
            />
          </motion.div>
        )}

        {/* ── Revision ────────────────────────────────────────────────────── */}
        {view === "revision" && (
          <motion.div
            key="revision"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <RevisionView
              activeExam={activeExam}
              onProgressChange={handleProgressChange}
            />
          </motion.div>
        )}

        {/* ── Gap Analysis ────────────────────────────────────────────────── */}
        {view === "gap-analysis" && (
          <motion.div
            key="gap-analysis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GapAnalysisView
              subjectProgress={subjectData}
              quizHistory={quizHistory}
              examColor={accent}
            />
          </motion.div>
        )}

        {/* ── Recommendations ─────────────────────────────────────────────── */}
        {view === "recommendations" && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <RecommendationView
              subjectProgress={subjectData}
              examProgress={examProgress}
              activityLog={activityLog}
              quizHistory={quizHistory}
              revisionQueue={revisionQueue}
              examColor={accent}
              onNavigate={handleRecommendationNavigate}
            />
          </motion.div>
        )}
      </motion.div>

      {/* ── Topic Panel overlay ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSubject && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/65 z-[200] backdrop-blur-[2px]"
              onClick={() => {
                setSelectedSubject(null);
                setHighlightedTopicId(null);
              }}
            />
            <TopicPanel
              key={`panel-${selectedSubject.id}`}
              examId={activeExam}
              subject={selectedSubject}
              onClose={() => {
                setSelectedSubject(null);
                setHighlightedTopicId(null);
              }}
              onProgressChange={handleProgressChange}
              highlightedTopicId={highlightedTopicId}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
