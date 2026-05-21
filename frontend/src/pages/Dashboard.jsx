// FILE PATH: frontend/src/pages/Dashboard.jsx
// DASHBOARD PAGE — the first thing users see after logging in.
// Currently shows: greeting, daily missions, stats overview, quick actions.
// All data is mocked — will be replaced with real API/Supabase data later.
// Each card/widget will become its own component in the next phase.

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
} from "lucide-react";

// ─── MOCK DATA ─────────────────────────────────────────────────────
const MOCK_MISSIONS = [
  {
    id: 1,
    title: "Complete 20 Polity MCQs",
    xp: 150,
    done: true,
    subject: "Polity",
    color: "#7C6FFF",
  },
  {
    id: 2,
    title: "Read Current Affairs digest",
    xp: 100,
    done: true,
    subject: "Current Affairs",
    color: "#00FFC8",
  },
  {
    id: 3,
    title: "Revise Indian Economy Ch. 4",
    xp: 200,
    done: false,
    subject: "Economy",
    color: "#FFB347",
  },
  {
    id: 4,
    title: "2 hours of History preparation",
    xp: 180,
    done: false,
    subject: "History",
    color: "#FF6B9D",
  },
  {
    id: 5,
    title: "Practice 10 CSAT reasoning questions",
    xp: 120,
    done: false,
    subject: "CSAT",
    color: "#4FC3F7",
  },
];

const MOCK_STATS = [
  {
    label: "Day Streak",
    value: "7",
    unit: "days",
    icon: Flame,
    color: "#FF6B2B",
    bg: "rgba(255,107,43,0.08)",
  },
  {
    label: "Total XP",
    value: "3,240",
    unit: "points",
    icon: Zap,
    color: "#7C6FFF",
    bg: "rgba(124,111,255,0.08)",
  },
  {
    label: "Hours Studied",
    value: "142",
    unit: "hrs",
    icon: BookOpen,
    color: "#00FFC8",
    bg: "rgba(0,255,200,0.08)",
  },
  {
    label: "Quiz Accuracy",
    value: "73",
    unit: "%",
    icon: Target,
    color: "#FFB347",
    bg: "rgba(255,179,71,0.08)",
  },
];

const QUICK_ACTIONS = [
  { label: "Start Quiz", icon: Swords, color: "#FFB347", path: "/quiz" },
  {
    label: "Ask Companion",
    icon: MessageSquareHeart,
    color: "#FF6B9D",
    path: "/chat",
  },
  { label: "Focus Session", icon: Timer, color: "#B5FF47", path: "/focus" },
  { label: "Study Plan", icon: Calendar, color: "#7C6FFF", path: "/planner" },
];

const MOCK_WEAK_SUBJECTS = [
  { subject: "Economy", score: 42, color: "#FF6B9D" },
  { subject: "Environment", score: 55, color: "#FFB347" },
  { subject: "Science & Tech", score: 61, color: "#7C6FFF" },
];

// Stagger animation config for card reveals
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function Dashboard() {
  const completedCount = MOCK_MISSIONS.filter((m) => m.done).length;
  const totalXP = MOCK_MISSIONS.filter((m) => m.done).reduce(
    (acc, m) => acc + m.xp,
    0,
  );
  const progressPercent = Math.round(
    (completedCount / MOCK_MISSIONS.length) * 100,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1200px] mx-auto"
    >
      {/* ── GREETING HERO ── */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,111,255,0.12) 0%, rgba(0,255,200,0.06) 50%, rgba(5,5,12,0) 100%)",
          }}
        />
        {/* Decorative glow blob */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[200px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, #7C6FFF 0%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[#FFB347]" />
              <span className="text-[11px] text-[#FFB347] tracking-widest uppercase font-semibold">
                Good morning
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight">
              Rise and grind,{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #00FFC8, #7C6FFF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Arjun
              </span>{" "}
              ⚡
            </h2>
            <p className="text-[13px] text-white/40 max-w-[400px] leading-relaxed">
              You&apos;re on a{" "}
              <span className="text-[#FF6B2B] font-semibold">7-day streak</span>
              . UPSC 2026 is your target. Don&apos;t stop now — 2 missions done,
              3 to go.
            </p>
          </div>

          {/* Daily progress ring summary */}
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
                  stroke="url(#progressGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 22 * (1 - progressPercent / 100),
                  }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00FFC8" />
                    <stop offset="100%" stopColor="#7C6FFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[14px] font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">
                Today
              </p>
              <p className="text-[22px] font-bold text-white leading-none">
                {completedCount}
                <span className="text-white/30 text-base">
                  /{MOCK_MISSIONS.length}
                </span>
              </p>
              <p className="text-[10px] text-[#00FFC8]/60 mt-0.5">
                +{totalXP} XP earned
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ROW ── */}
      <motion.div
        variants={cardVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {MOCK_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.06] p-4 group hover:border-white/10 transition-colors"
              style={{ background: stat.bg }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon size={14} style={{ color: stat.color }} />
                </div>
                <TrendingUp size={11} className="text-white/15" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-white leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] text-white/30 mb-0.5">
                  {stat.unit}
                </span>
              </div>
              <p className="text-[10px] text-white/35 mt-1 tracking-wide uppercase">
                {stat.label}
              </p>
              {/* Bottom glow line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── MAIN GRID: Missions + Right Column ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* ── DAILY MISSIONS ── */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "#0A0A14" }}
        >
          {/* Header */}
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
                  Complete missions to earn XP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30">
                {completedCount}/{MOCK_MISSIONS.length}
              </span>
              <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #00FFC8, #7C6FFF)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mission list */}
          <div className="divide-y divide-white/[0.04]">
            {MOCK_MISSIONS.map((mission, i) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
                className={`
                  flex items-center gap-4 px-5 py-4
                  hover:bg-white/[0.02] transition-colors group cursor-pointer
                  ${mission.done ? "opacity-60" : ""}
                `}
              >
                {/* Checkbox */}
                <div className="shrink-0">
                  {mission.done ? (
                    <CheckCircle2 size={18} style={{ color: mission.color }} />
                  ) : (
                    <Circle
                      size={18}
                      className="text-white/20 group-hover:text-white/40 transition-colors"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-medium leading-snug ${mission.done ? "line-through text-white/40" : "text-white/80"}`}
                  >
                    {mission.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        color: mission.color,
                        background: `${mission.color}15`,
                        border: `1px solid ${mission.color}20`,
                      }}
                    >
                      {mission.subject}
                    </span>
                  </div>
                </div>

                {/* XP reward */}
                <div
                  className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg ${mission.done ? "opacity-50" : ""}`}
                  style={{
                    background: "rgba(124,111,255,0.08)",
                    border: "1px solid rgba(124,111,255,0.15)",
                  }}
                >
                  <Zap size={10} className="text-[#7C6FFF]" />
                  <span className="text-[11px] font-bold text-[#7C6FFF]">
                    +{mission.xp}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-4 border-t border-white/[0.05]">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.05] transition-all duration-200 border border-white/[0.05] hover:border-white/10">
              View all missions
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#0A0A14" }}
          >
            <h3 className="text-[12px] font-bold text-white/50 tracking-widest uppercase mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.07 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group"
                    style={{ background: `${action.color}08` }}
                  >
                    <div
                      className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
                      style={{ background: `${action.color}15` }}
                    >
                      <Icon size={16} style={{ color: action.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-white/50 group-hover:text-white/80 transition-colors text-center leading-tight">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Weak Subjects */}
          <motion.div
            variants={cardVariants}
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
              {MOCK_WEAK_SUBJECTS.map((item, i) => (
                <motion.div
                  key={item.subject}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-white/70">
                      {item.subject}
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: item.color }}
                    >
                      {item.score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5 + i * 0.1,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all border border-white/[0.04] hover:border-white/[0.08]">
              <Trophy size={11} />
              See full analysis
            </button>
          </motion.div>

          {/* Today's Quote / Motivator */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-2xl border border-[#00FFC8]/10 p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,255,200,0.06), rgba(124,111,255,0.06))",
            }}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none"
              style={{
                background: "radial-gradient(circle, #00FFC8, transparent 70%)",
              }}
            />
            <Sparkles size={14} className="text-[#00FFC8]/60 mb-3" />
            <p className="text-[12px] text-white/60 leading-relaxed italic">
              &quot;An investment in knowledge pays the best interest. Keep
              going, one chapter at a time.&quot;
            </p>
            <p className="text-[10px] text-[#00FFC8]/50 mt-2 tracking-wider">
              — Your AI Companion
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
