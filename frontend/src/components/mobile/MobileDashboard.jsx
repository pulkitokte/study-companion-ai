import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Zap,
  Timer,
  Target,
  Swords,
  Brain,
  Trophy,
  Star,
  CheckCircle2,
  Circle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";
import { getFirstName } from "../../utils/userProfile.js";
import {
  getTodayMissions,
  checkMissionsAutoComplete,
} from "../../utils/progressStorage.js";
import LiveActivityFeed from "../dashboard/LiveActivityFeed.jsx";
import SystemStatus from "../ui/SystemStatus.jsx";

const QA = [
  { label: "Quiz", icon: Swords, color: "#FFB347", path: "/quiz" },
  { label: "Focus", icon: Timer, color: "#B5FF47", path: "/focus" },
  { label: "Chat AI", icon: Brain, color: "#FF6B9D", path: "/chat" },
  { label: "Stats", icon: Trophy, color: "#7C6FFF", path: "/progress" },
];

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export default function MobileDashboard() {
  const navigate = useNavigate();
  const { stats } = useGlobalStats();
  const firstName = getFirstName("Scholar");

  const rawMissions = useMemo(() => getTodayMissions(), []);
  const missions = useMemo(
    () => checkMissionsAutoComplete(rawMissions),
    [rawMissions],
  );
  const doneMiss = missions.filter((m) => m.done).length;
  const missPct = missions.length
    ? Math.round((doneMiss / missions.length) * 100)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-4 pb-24"
    >
      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-5 py-5"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.12),rgba(0,255,200,0.06),rgba(5,5,12,0))",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#FFB347] font-semibold tracking-wider uppercase">
              {greeting}, {firstName}
            </p>
            <h2 className="text-[22px] font-black text-white leading-tight mt-0.5">
              {stats.rank?.emoji ?? "🥉"} {stats.rank?.label ?? "Rookie"}
            </h2>
            <p className="text-[11px] text-white/35 mt-0.5">
              Level {stats.level ?? 1} · {(stats.totalXP ?? 0).toLocaleString()}{" "}
              XP
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="url(#mobileGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 26 * (1 - missPct / 100),
                  }}
                  transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="mobileGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00FFC8" />
                    <stop offset="100%" stopColor="#7C6FFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[13px] font-bold text-white leading-none">
                  {missPct}%
                </p>
                <p className="text-[8px] text-white/30">today</p>
              </div>
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${stats.levelPct ?? 0}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#00FFC8,#7C6FFF)" }}
          />
        </div>
        <p className="text-[9px] text-white/22 mt-1">
          {stats.xpToNextLevel ?? 500} XP to Level {(stats.level ?? 1) + 1}
        </p>
      </motion.div>

      {/* Quick stats row */}
      <motion.div variants={I} className="grid grid-cols-3 gap-2">
        {[
          {
            icon: Flame,
            val: `${stats.streak ?? 0}d`,
            label: "Streak",
            color: "#FF6B2B",
          },
          {
            icon: Zap,
            val: `${stats.todayXP ?? 0}`,
            label: "Today XP",
            color: "#7C6FFF",
          },
          {
            icon: Target,
            val: `${stats.prodScore ?? 0}%`,
            label: "Score",
            color: "#00FFC8",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 py-3 rounded-xl border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <Icon size={14} style={{ color: s.color }} />
              <span className="text-[16px] font-black text-white leading-none">
                {s.val}
              </span>
              <span className="text-[9px] text-white/25 uppercase tracking-wider">
                {s.label}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={I} className="grid grid-cols-4 gap-2">
        {QA.map((a) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.label}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/[0.06] transition-all"
              style={{ background: `${a.color}08` }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ background: `${a.color}18` }}
              >
                <Icon size={16} style={{ color: a.color }} />
              </div>
              <span className="text-[9px] font-semibold text-white/45 text-center">
                {a.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Daily missions */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
          <Star size={13} className="text-[#FFB347]" />
          <span className="text-[12px] font-bold text-white">
            Daily Missions
          </span>
          <span className="ml-auto text-[10px] text-white/25">
            {doneMiss}/{missions.length}
          </span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 px-4 py-3 ${m.done ? "opacity-55" : ""}`}
            >
              {m.done ? (
                <CheckCircle2 size={16} className="text-[#00FFC8] shrink-0" />
              ) : (
                <Circle size={16} className="text-white/20 shrink-0" />
              )}
              <p
                className={`flex-1 text-[12px] font-medium ${m.done ? "line-through text-white/35" : "text-white/72"}`}
              >
                {m.label}
              </p>
              <div className="flex items-center gap-0.5">
                <Zap size={9} className="text-[#7C6FFF]" />
                <span className="text-[10px] font-bold text-[#7C6FFF]">
                  +{m.xp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System status */}
      <motion.div variants={I}>
        <SystemStatus />
      </motion.div>

      {/* Activity feed */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] p-4"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
            Recent Activity
          </p>
          <button
            onClick={() => navigate("/progress")}
            className="flex items-center gap-0.5 text-[10px] text-[#7C6FFF]/60 hover:text-[#7C6FFF] transition-colors"
          >
            All <ChevronRight size={10} />
          </button>
        </div>
        <LiveActivityFeed limit={4} />
      </motion.div>
    </motion.div>
  );
}
