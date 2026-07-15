import { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Zap,
  Target,
  Brain,
  Swords,
  Timer,
  CheckCircle2,
  Circle,
  TrendingUp,
  MessageSquareHeart,
  Star,
  Trophy,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useGlobalStats } from "../hooks/useGlobalStats.js";
import { isMobile } from "../utils/mobileOptimizations.js";
import MobileDashboard from "../components/mobile/MobileDashboard.jsx";
import SystemStatus from "../components/ui/SystemStatus.jsx";
import LiveActivityFeed from "../components/dashboard/LiveActivityFeed.jsx";
import SmartRecommendations from "../components/dashboard/SmartRecommendations.jsx";
import CommandCenter from "../components/dashboard/CommandCenter.jsx";
import {
  getFirstName,
  getSmartRecommendations,
  getWeakSubjects,
} from "../utils/userProfile.js";
import { getQuizHistory } from "../utils/quizStorage.js";
import {
  getTodayMissions,
  checkMissionsAutoComplete,
} from "../utils/progressStorage.js";
import { CATEGORIES } from "../data/mockQuizData.js";
import SyllabusDashboardWidget from "../components/syllabus/SyllabusDashboardWidget.jsx";
import syllabusService from "../services/syllabusService.js";
import { getRankedRecommendations } from "../lib/recommendationEngine.js";
import { useSyllabusSyncListener } from "../hooks/useSyllabusSyncListener.js";

// Return mobile layout on small screens
function DashboardContent() {
  if (isMobile()) return <MobileDashboard />;
  return <DesktopDashboard />;
}

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};

const QUICK_ACTIONS = [
  { label: "Start Quiz", icon: Swords, color: "#FFB347", path: "/quiz" },
  {
    label: "Ask AI",
    icon: MessageSquareHeart,
    color: "#FF6B9D",
    path: "/chat",
  },
  { label: "Focus Session", icon: Timer, color: "#B5FF47", path: "/focus" },
  {
    label: "View Progress",
    icon: TrendingUp,
    color: "#7C6FFF",
    path: "/progress",
  },
];

function DesktopDashboard() {
  const navigate = useNavigate();
  const { stats } = useGlobalStats();
  const firstName = getFirstName("Scholar");
  const recs = useMemo(() => getSmartRecommendations(), []);

  const rawMissions = useMemo(() => getTodayMissions(), []);
  const missions = useMemo(
    () => checkMissionsAutoComplete(rawMissions),
    [rawMissions],
  );
  const doneMissions = missions.filter((m) => m.done).length;
  const missionPct =
    missions.length > 0
      ? Math.round((doneMissions / missions.length) * 100)
      : 0;

  const weakFromQuiz = useMemo(() => {
    const qH = getQuizHistory() ?? [];
    const map = {};
    qH.slice(0, 30).forEach((q) => {
      const c = q.category ?? "unknown";
      if (!map[c]) map[c] = { total: 0, count: 0 };
      map[c].total += q.accuracy ?? 0;
      map[c].count++;
    });
    return Object.entries(map)
      .map(([cat, v]) => ({
        subject: cat,
        accuracy: Math.round(v.total / v.count),
        catObj: CATEGORIES.find((c) => c.id === cat),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const STAT_CARDS = [
    {
      label: "Day Streak",
      value: stats.streak,
      unit: "days",
      icon: Flame,
      color: "#FF6B2B",
      bg: "rgba(255,107,43,0.08)",
    },
    {
      label: "Total XP",
      value: (stats.totalXP ?? 0).toLocaleString(),
      unit: "pts",
      icon: Zap,
      color: "#7C6FFF",
      bg: "rgba(124,111,255,0.08)",
    },
    {
      label: "Focus Today",
      value: stats.todayFocusMins ?? 0,
      unit: "min",
      icon: Timer,
      color: "#00FFC8",
      bg: "rgba(0,255,200,0.08)",
    },
    {
      label: "Prod. Score",
      value: stats.prodScore ?? 0,
      unit: "%",
      icon: Target,
      color: "#FFB347",
      bg: "rgba(255,179,71,0.08)",
    },
  ];

  // ── Phase 34: Command Center data ─────────────────────────────────────────
  // All service calls isolated here in DesktopDashboard.
  // CommandCenter itself receives only plain data props.

  const activeExam = useMemo(() => {
    try {
      return syllabusService.getActiveExam();
    } catch {
      return "upsc";
    }
  }, []);

  const [commandExamProgress, setCommandExamProgress] = useState(null);
  const [commandSubjectProgress, setCommandSubjectProgress] = useState([]);
  const [commandActivityLog, setCommandActivityLog] = useState([]);
  const [commandRevisionQueue, setCommandRevisionQueue] = useState([]);
  const [commandRecommendations, setCommandRecommendations] = useState([]);

  // Phase 35 Batch F: loader extracted from the previous one-shot useMemo
  // calls so it can be re-run whenever syllabus data changes (e.g. after
  // a topic is completed from the Focus post-session workflow), without
  // duplicating any of the underlying syllabusService/recommendation calls.
  const loadCommandData = useCallback(() => {
    try {
      setCommandExamProgress(syllabusService.getExamProgress(activeExam));
    } catch {
      setCommandExamProgress(null);
    }
    try {
      setCommandSubjectProgress(
        syllabusService.getAllSubjectProgress(activeExam) ?? [],
      );
    } catch {
      setCommandSubjectProgress([]);
    }
    try {
      setCommandActivityLog(syllabusService.getActivityLog(500) ?? []);
    } catch {
      setCommandActivityLog([]);
    }
    try {
      setCommandRevisionQueue(
        syllabusService.getTodayRevisionQueue(activeExam) ?? [],
      );
    } catch {
      setCommandRevisionQueue([]);
    }
    try {
      setCommandRecommendations(getRankedRecommendations() ?? []);
    } catch {
      setCommandRecommendations([]);
    }
  }, [activeExam]);

  useEffect(() => {
    loadCommandData();
  }, [loadCommandData]);

  // Phase 35 Batch F: reuse the existing Batch E sync hook so Command
  // Center's syllabus-derived data refreshes live after a topic
  // completion, exactly like SyllabusTracker / SyllabusDashboardWidget.
  useSyllabusSyncListener(loadCommandData);

  // ── Phase 34: Command Center navigation handler ────────────────────────────
  // Tab is stored in sessionStorage so SyllabusTracker can restore it on mount.
  // For non-syllabus paths, navigate directly.
  const handleCommandNavigate = useCallback(
    (path, tab) => {
      if (path === "/syllabus" && tab) {
        try {
          sessionStorage.setItem("studymind_syllabus_initial_tab", tab);
        } catch {}
      }
      navigate(path);
    },
    [navigate],
  );

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1200px] mx-auto"
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.12),rgba(0,255,200,0.06),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-[280px] h-[180px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right,#7C6FFF,transparent 70%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[#FFB347]" />
              <span className="text-[11px] text-[#FFB347] tracking-widest uppercase font-semibold">
                {greeting}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight">
              Let&apos;s go,{" "}
              <span
                style={{
                  background: "linear-gradient(90deg,#00FFC8,#7C6FFF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {firstName}
              </span>{" "}
              ⚡
            </h2>
            <p className="text-[13px] text-white/38 max-w-[420px] leading-relaxed">
              {stats.streak > 0 && (
                <span className="text-[#FF6B2B] font-semibold">
                  {stats.streak}-day streak.{" "}
                </span>
              )}
              {stats.rank && (
                <span style={{ color: stats.rank.color }}>
                  {stats.rank.emoji} {stats.rank.label}.{" "}
                </span>
              )}
              {doneMissions > 0
                ? `${doneMissions}/${missions.length} missions done.`
                : "Begin today's sessions."}
            </p>
          </div>

          {/* Mission ring */}
          <div className="shrink-0 flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="url(#dashGrad2)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 22 * (1 - missionPct / 100),
                  }}
                  transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="dashGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00FFC8" />
                    <stop offset="100%" stopColor="#7C6FFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[14px] font-bold text-white">
                  {missionPct}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">
                Missions
              </p>
              <p className="text-[22px] font-bold text-white leading-none">
                {doneMissions}
                <span className="text-white/28 text-base">
                  /{missions.length}
                </span>
              </p>
              <p className="text-[10px] text-[#00FFC8]/55 mt-0.5">
                +{stats.todayXP ?? 0} XP today
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Phase 34: Command Center (directly below hero) ─────────────────── */}
      <motion.div variants={I}>
        <CommandCenter
          revisionQueue={commandRevisionQueue}
          recommendations={commandRecommendations}
          subjectProgress={commandSubjectProgress}
          examProgress={commandExamProgress}
          activityLog={commandActivityLog}
          onNavigate={handleCommandNavigate}
        />
      </motion.div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <motion.div
        variants={I}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {STAT_CARDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.06] p-4 group hover:border-white/[0.1] transition-all"
              style={{ background: s.bg }}
            >
              <div
                className="p-2 rounded-lg w-fit mb-3"
                style={{ background: `${s.color}15` }}
              >
                <Icon size={14} style={{ color: s.color }} />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-[24px] font-bold text-white leading-none">
                  {s.value}
                </span>
                <span className="text-[10px] text-white/28 mb-0.5">
                  {s.unit}
                </span>
              </div>
              <p className="text-[10px] text-white/32 mt-1 tracking-wide uppercase">
                {s.label}
              </p>
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg,transparent,${s.color},transparent)`,
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Syllabus Dashboard Widget ─────────────────────────────────────── */}
      <motion.div variants={I}>
        <SyllabusDashboardWidget />
      </motion.div>

      {/* ── Smart recommendations ─────────────────────────────────────────── */}
      <motion.div variants={I}>
        <SmartRecommendations />
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          {/* Daily missions */}
          <motion.div
            variants={I}
            className="rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{ background: "#0A0A14" }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
              <div className="p-2 rounded-lg bg-[#FFB347]/10">
                <Star size={14} className="text-[#FFB347]" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white">
                  Daily Missions
                </h3>
                <p className="text-[10px] text-white/28">
                  Auto-detected from activity
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-white/28">
                  {doneMissions}/{missions.length}
                </span>
                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${missionPct}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#00FFC8,#7C6FFF)",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {missions.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 + i * 0.06 }}
                  className={`flex items-center gap-4 px-5 py-3.5 ${m.done ? "opacity-55" : "hover:bg-white/[0.02]"} transition-colors`}
                >
                  <div className="shrink-0">
                    {m.done ? (
                      <CheckCircle2 size={18} className="text-[#00FFC8]" />
                    ) : (
                      <Circle size={18} className="text-white/20" />
                    )}
                  </div>
                  <p
                    className={`flex-1 text-[13px] font-medium ${m.done ? "line-through text-white/35" : "text-white/78"}`}
                  >
                    {m.label}
                  </p>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7C6FFF]/08 border border-[#7C6FFF]/15">
                    <Zap size={10} className="text-[#7C6FFF]" />
                    <span className="text-[11px] font-bold text-[#7C6FFF]">
                      +{m.xp}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Live activity */}
          <motion.div
            variants={I}
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#0A0A14" }}
          >
            <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-4">
              Recent Activity
            </p>
            <LiveActivityFeed limit={6} />
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <motion.div variants={I}>
            <SystemStatus />
          </motion.div>

          {/* Quick actions */}
          <motion.div
            variants={I}
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#0A0A14" }}
          >
            <h3 className="text-[11px] font-bold text-white/38 tracking-widest uppercase mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                    style={{ background: `${action.color}08` }}
                  >
                    <div
                      className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                      style={{ background: `${action.color}15` }}
                    >
                      <Icon size={16} style={{ color: action.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-white/45 group-hover:text-white/72 text-center leading-tight transition-colors">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Weak subjects */}
          {weakFromQuiz.length > 0 && (
            <motion.div
              variants={I}
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain size={13} className="text-[#FF6B9D]" />
                <h3 className="text-[11px] font-bold text-white/38 tracking-widest uppercase">
                  Focus Areas
                </h3>
              </div>
              <div className="space-y-3">
                {weakFromQuiz.map((item, i) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[12px] text-white/62 capitalize">
                        {item.catObj?.label ?? item.subject}
                      </span>
                      <span className="text-[11px] font-bold text-[#FF6B9D]">
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.accuracy}%` }}
                        transition={{ duration: 0.7, delay: 0.4 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg,#FF6B9D80,#FF6B9D)",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
                <button
                  onClick={() => navigate("/quiz")}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] text-white/28 hover:text-white/55 hover:bg-white/[0.04] transition-all border border-white/[0.04] hover:border-white/[0.08]"
                >
                  <Trophy size={11} /> Practice these now
                </button>
              </div>
            </motion.div>
          )}

          {/* Quote */}
          <motion.div
            variants={I}
            className="relative overflow-hidden rounded-2xl border border-[#00FFC8]/10 p-5"
            style={{
              background:
                "linear-gradient(135deg,rgba(0,255,200,0.06),rgba(124,111,255,0.06))",
            }}
          >
            <Sparkles size={14} className="text-[#00FFC8]/55 mb-3" />
            <p className="text-[12px] text-white/50 leading-relaxed italic">
              &ldquo;Discipline is choosing between what you want now and what
              you want most.&rdquo;
            </p>
            <p className="text-[10px] text-[#00FFC8]/45 mt-2">— StudyMind AI</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
