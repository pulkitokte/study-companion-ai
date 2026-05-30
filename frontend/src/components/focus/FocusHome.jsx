import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Timer,
  Zap,
  Flame,
  Clock,
  ChevronRight,
  Brain,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";
import { useFocus } from "../../context/FocusContext.jsx";
import { getFocusHistory, getFocusStats } from "../../utils/focusStorage.js";
import { getRank, getRankProgress } from "../../utils/quizCalculations.js";
import SessionCard from "./SessionCard.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function FocusHome({ onAnalyticsClick }) {
  const { goToSetup } = useFocus();
  const stats = useMemo(() => getFocusStats(), []);
  const recent = useMemo(() => getFocusHistory().slice(0, 4), []);

  const rank = getRank(stats.totalXP ?? 0);
  const rankProg = getRankProgress(stats.totalXP ?? 0);

  const prodScore = useMemo(() => {
    if (!stats.totalSessions) return 0;
    return Math.round(
      Math.min((stats.recentStreak ?? 0) / 30, 1) * 35 +
        Math.min(stats.totalSessions / 50, 1) * 35 +
        Math.min((stats.averageMinutes ?? 0) / 90, 1) * 30,
    );
  }, [stats]);

  const pills = [
    {
      icon: Clock,
      val: `${Math.floor((stats.totalMinutes ?? 0) / 60)}h ${(stats.totalMinutes ?? 0) % 60}m`,
      label: "Total Focus",
      color: "#7C6FFF",
    },
    {
      icon: Flame,
      val: stats.recentStreak ?? 0,
      label: "Day Streak",
      color: "#FF6B2B",
    },
    {
      icon: Zap,
      val: (stats.totalXP ?? 0).toLocaleString(),
      label: "Total XP",
      color: "#FFB347",
    },
    {
      icon: Target,
      val: `${prodScore}%`,
      label: "Prod. Score",
      color: "#00FFC8",
    },
  ];

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.04),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-[280px] h-[180px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right,rgba(124,111,255,0.14),transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-[#7C6FFF]" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#7C6FFF] uppercase">
              Focus Mode
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
            Enter Deep Work.{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#7C6FFF,#00FFC8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              No distractions.
            </span>
          </h2>
          <p className="text-[12px] text-white/35 max-w-md leading-relaxed mb-5">
            Structured sessions with XP rewards, ambient effects, and streak
            tracking.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              {
                emoji: "🍅",
                label: "Pomodoro",
                color: "#FF6B2B",
                hint: "25m · 5m break",
              },
              {
                emoji: "🧠",
                label: "Deep Work",
                color: "#7C6FFF",
                hint: "90m block",
              },
              {
                emoji: "⚡",
                label: "Sprint",
                color: "#00FFC8",
                hint: "15m burst",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px]"
                style={{
                  borderColor: `${m.color}25`,
                  background: `${m.color}08`,
                  color: m.color,
                }}
              >
                <span>{m.emoji}</span>
                <span className="font-semibold">{m.label}</span>
                <span className="opacity-50">{m.hint}</span>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToSetup}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-[13px] tracking-widest uppercase relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
              color: "#fff",
              boxShadow: "0 0 32px rgba(124,111,255,0.35)",
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "linear",
                repeatDelay: 1,
              }}
              className="absolute inset-y-0 w-1/3 opacity-20"
              style={{
                background:
                  "linear-gradient(90deg,transparent,white,transparent)",
                transform: "skewX(-20deg)",
              }}
            />
            <Timer size={14} className="relative" />
            <span className="relative">Start Focus Session</span>
            <ChevronRight size={14} className="relative" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={I}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {pills.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <Icon size={14} style={{ color: s.color }} />
              <span className="text-[18px] font-black text-white leading-none">
                {s.val}
              </span>
              <span className="text-[9px] text-white/22 uppercase tracking-wider text-center">
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Rank progress */}
      {(stats.totalXP ?? 0) > 0 && (
        <motion.div
          variants={I}
          className="relative overflow-hidden rounded-xl border px-5 py-4"
          style={{
            borderColor: `${rank.color}28`,
            background: `${rank.color}07`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg,transparent,${rank.color}60,transparent)`,
            }}
          />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{rank.emoji}</span>
              <div>
                <p className="text-[9px] text-white/25 uppercase tracking-widest">
                  Focus Rank
                </p>
                <p
                  className="text-[15px] font-black"
                  style={{ color: rank.color }}
                >
                  {rank.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/22">Focus XP</p>
              <p className="text-[18px] font-black text-white tabular-nums">
                {(stats.totalXP ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          {rankProg.next && (
            <>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProg.pct}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg,${rank.color}80,${rank.color})`,
                    boxShadow: `0 0 8px ${rank.color}50`,
                  }}
                />
              </div>
              <p className="text-[9px] text-white/20 mt-1">
                {rankProg.xpToNext?.toLocaleString()} XP to{" "}
                {rankProg.next?.label} {rankProg.next?.emoji}
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Today */}
      {(stats.todayMinutes ?? 0) > 0 && (
        <motion.div
          variants={I}
          className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[#00FFC8]/18 bg-[#00FFC8]/05"
        >
          <TrendingUp size={13} className="text-[#00FFC8] shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-white">
              Today: {stats.todayMinutes}m focused · +{stats.todayXP} XP
            </p>
            <p className="text-[10px] text-white/28">
              Keep stacking. Consistency compounds.
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent sessions */}
      {recent.length > 0 ? (
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-white/22 uppercase tracking-widest">
              Recent Sessions
            </p>
            {onAnalyticsClick && (
              <button
                onClick={onAnalyticsClick}
                className="text-[10px] text-[#7C6FFF]/55 hover:text-[#7C6FFF] flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight size={10} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {recent.map((s, i) => (
              <SessionCard key={s.id ?? i} session={s} index={i} />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={I}
          className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl border border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <span className="text-4xl">🧘</span>
          <p className="text-[13px] text-white/28">No focus sessions yet.</p>
          <p className="text-[11px] text-white/18">
            Start your first session to build your streak.
          </p>
        </motion.div>
      )}

      {/* Analytics CTA */}
      {stats.totalSessions > 0 && onAnalyticsClick && (
        <motion.div variants={I}>
          <button
            onClick={onAnalyticsClick}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.07] text-[12px] font-bold text-white/32 hover:text-white/58 hover:bg-white/[0.04] transition-all"
          >
            <BarChart3 size={13} /> View Full Analytics{" "}
            <ChevronRight size={13} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
