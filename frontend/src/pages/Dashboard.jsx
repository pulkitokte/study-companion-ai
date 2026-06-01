// FILE PATH: frontend/src/pages/Dashboard.jsx
// REPLACES existing Dashboard.jsx — fully personalized with real data.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Zap,
  Target,
  BookOpen,
  Brain,
  Swords,
  Timer,
  CheckCircle2,
  Circle,
  TrendingUp,
  Calendar,
  MessageSquareHeart,
  Star,
  Trophy,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  getFirstName,
  getTargetExam,
  getWeakSubjects,
  getDreamGoal,
  getUnifiedXP,
  getUnifiedStreak,
  getLevelProgress,
  getTodaySummary,
  getProductivityScore,
  getSmartRecommendations,
} from "../utils/userProfile.js";
import { getQuizHistory } from "../utils/quizStorage.js";
import { getFocusHistory } from "../utils/focusStorage.js";
import {
  getTodayMissions,
  checkMissionsAutoComplete,
  MISSION_TEMPLATES,
} from "../utils/progressStorage.js";

// Stagger container
const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const QUICK_ACTIONS = [
  { label: "Start Quiz", icon: Swords, color: "#FFB347", path: "/quiz" },
  {
    label: "Ask Companion",
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

export default function Dashboard() {
  const navigate = useNavigate();

  // Real data
  const firstName = getFirstName("Scholar");
  const targetExam = getTargetExam();
  const dreamGoal = getDreamGoal();
  const weakSubjects = getWeakSubjects();
  const { totalXP } = useMemo(() => getUnifiedXP(), []);
  const streak = useMemo(() => getUnifiedStreak(), []);
  const { level, pct: levelPct } = getLevelProgress(totalXP);
  const today = useMemo(() => getTodaySummary(), []);
  const prodScore = useMemo(() => getProductivityScore(), []);
  const recs = useMemo(() => getSmartRecommendations(), []);

  // Missions
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

  // Recent quiz accuracy (for weak subjects display)
  const recentQuiz = useMemo(() => {
    const history = getQuizHistory() ?? [];
    const catMap = {};
    history.slice(0, 20).forEach((q) => {
      const c = q.category ?? "unknown";
      if (!catMap[c]) catMap[c] = { total: 0, count: 0 };
      catMap[c].total += q.accuracy ?? 0;
      catMap[c].count++;
    });
    return Object.entries(catMap)
      .map(([cat, v]) => ({
        subject: cat,
        accuracy: Math.round(v.total / v.count),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, []);

  const STAT_CARDS = [
    {
      label: "Day Streak",
      value: streak,
      unit: "days",
      icon: Flame,
      color: "#FF6B2B",
      bg: "rgba(255,107,43,0.08)",
    },
    {
      label: "Total XP",
      value: totalXP.toLocaleString(),
      unit: "pts",
      icon: Zap,
      color: "#7C6FFF",
      bg: "rgba(124,111,255,0.08)",
    },
    {
      label: "Focus Today",
      value: today.focusMins,
      unit: "min",
      icon: Timer,
      color: "#00FFC8",
      bg: "rgba(0,255,200,0.08)",
    },
    {
      label: "Prod. Score",
      value: prodScore,
      unit: "%",
      icon: Target,
      color: "#FFB347",
      bg: "rgba(255,179,71,0.08)",
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1200px] mx-auto"
    >
      {/* ── GREETING HERO ── */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.12) 0%,rgba(0,255,200,0.06) 50%,rgba(5,5,12,0) 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-[300px] h-[200px] opacity-20 pointer-events-none"
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
              Rise and grind,{" "}
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
            <p className="text-[13px] text-white/40 max-w-[400px] leading-relaxed">
              {streak > 0 && (
                <span className="text-[#FF6B2B] font-semibold">
                  {streak}-day streak.
                </span>
              )}{" "}
              {dreamGoal
                ? `${dreamGoal} is the target.`
                : `${targetExam} prep in progress.`}{" "}
              {doneMissions > 0
                ? `${doneMissions}/${missions.length} missions done.`
                : "Let's begin today."}
            </p>
          </div>

          {/* Day progress ring */}
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
                  stroke="url(#grad)"
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
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
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
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">
                Today
              </p>
              <p className="text-[22px] font-bold text-white leading-none">
                {doneMissions}
                <span className="text-white/30 text-base">
                  /{missions.length}
                </span>
              </p>
              <p className="text-[10px] text-[#00FFC8]/60 mt-0.5">missions</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
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
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.06] p-4 group hover:border-white/10 transition-colors"
              style={{ background: s.bg }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${s.color}15` }}
                >
                  <Icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-white leading-none">
                  {s.value}
                </span>
                <span className="text-[10px] text-white/30 mb-0.5">
                  {s.unit}
                </span>
              </div>
              <p className="text-[10px] text-white/35 mt-1 tracking-wide uppercase">
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

      {/* ── SMART RECOMMENDATIONS (only if any) ── */}
      {recs.length > 0 && (
        <motion.div variants={I} className="space-y-2">
          {recs.map((rec, i) => {
            const urgencyColor =
              rec.urgency === "high"
                ? "#FF3C3C"
                : rec.urgency === "positive"
                  ? "#00FFC8"
                  : "#FFB347";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer hover:bg-white/[0.02] transition-all"
                style={{
                  borderColor: `${urgencyColor}22`,
                  background: `${urgencyColor}06`,
                }}
                onClick={() => navigate(`/${rec.action}`)}
              >
                <AlertTriangle
                  size={13}
                  style={{ color: urgencyColor }}
                  className="shrink-0"
                />
                <p className="text-[12px] text-white/65 flex-1">{rec.text}</p>
                <ArrowRight
                  size={12}
                  style={{ color: urgencyColor }}
                  className="shrink-0"
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Daily Missions */}
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFB347]/10">
                <Star size={14} className="text-[#FFB347]" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white tracking-wide">
                  Daily Missions
                </h3>
                <p className="text-[10px] text-white/30">
                  Auto-tracked from your activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30">
                {doneMissions}/{missions.length}
              </span>
              <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${missionPct}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
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
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.1 + i * 0.07 }}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors ${m.done ? "opacity-60" : ""}`}
              >
                <div className="shrink-0">
                  {m.done ? (
                    <CheckCircle2 size={18} className="text-[#00FFC8]" />
                  ) : (
                    <Circle size={18} className="text-white/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-medium leading-snug ${m.done ? "line-through text-white/40" : "text-white/80"}`}
                  >
                    {m.label}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7C6FFF]/08 border border-[#7C6FFF]/15">
                  <Zap size={10} className="text-[#7C6FFF]" />
                  <span className="text-[11px] font-bold text-[#7C6FFF]">
                    +{m.xp}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <motion.div
            variants={I}
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#0A0A14" }}
          >
            <h3 className="text-[12px] font-bold text-white/50 tracking-widest uppercase mb-4">
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
                      className="p-2 rounded-lg transition-all group-hover:scale-110"
                      style={{ background: `${action.color}15` }}
                    >
                      <Icon size={16} style={{ color: action.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-white/50 group-hover:text-white/80 text-center leading-tight transition-colors">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Weak Subjects */}
          {recentQuiz.length > 0 && (
            <motion.div
              variants={I}
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain size={13} className="text-[#FF6B9D]" />
                <h3 className="text-[12px] font-bold text-white/50 tracking-widest uppercase">
                  Focus Areas
                </h3>
              </div>
              <div className="space-y-3">
                {recentQuiz.map((item, i) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-white/70 capitalize">
                        {item.subject}
                      </span>
                      <span className="text-[11px] font-bold text-[#FF6B9D]">
                        {item.accuracy}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.accuracy}%` }}
                        transition={{
                          duration: 0.7,
                          delay: 0.4 + i * 0.1,
                          ease: "easeOut",
                        }}
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
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all border border-white/[0.04] hover:border-white/[0.08]"
                >
                  <Trophy size={11} /> Practice these now
                </button>
              </div>
            </motion.div>
          )}

          {/* Motivational quote */}
          <motion.div
            variants={I}
            className="relative overflow-hidden rounded-2xl border border-[#00FFC8]/10 p-5"
            style={{
              background:
                "linear-gradient(135deg,rgba(0,255,200,0.06),rgba(124,111,255,0.06))",
            }}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none"
              style={{
                background: "radial-gradient(circle,#00FFC8,transparent 70%)",
              }}
            />
            <Sparkles size={14} className="text-[#00FFC8]/60 mb-3" />
            <p className="text-[12px] text-white/55 leading-relaxed italic">
              &ldquo;Investment in knowledge pays the best interest. Keep going,{" "}
              {firstName}.&rdquo;
            </p>
            <p className="text-[10px] text-[#00FFC8]/50 mt-2 tracking-wider">
              — StudyMind AI
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
