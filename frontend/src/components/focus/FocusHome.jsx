import { motion } from "framer-motion";
import { Timer, Zap, Flame, Clock, ChevronRight, Brain } from "lucide-react";
import { useFocus } from "../../context/FocusContext.jsx";
import { getFocusHistory, getFocusStats } from "../../utils/focusStorage.js";
import SessionCard from "./SessionCard.jsx";

const MODE_PREVIEWS = [
  {
    emoji: "🍅",
    label: "Pomodoro",
    color: "#FF6B2B",
    hint: "25m work · 5m break",
  },
  { emoji: "🧠", label: "Deep Work", color: "#7C6FFF", hint: "90m deep focus" },
  { emoji: "⚡", label: "Sprint", color: "#00FFC8", hint: "15m quick burst" },
];

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function FocusHome() {
  const { goToSetup } = useFocus();
  const stats = getFocusStats();
  const history = getFocusHistory().slice(0, 5);

  const STAT_PILLS = [
    {
      icon: Timer,
      val: stats.totalSessions,
      label: "Sessions",
      color: "#7C6FFF",
    },
    {
      icon: Clock,
      val: `${stats.totalMinutes}m`,
      label: "Focus Time",
      color: "#00FFC8",
    },
    {
      icon: Zap,
      val: stats.totalXP.toLocaleString(),
      label: "XP Earned",
      color: "#FFB347",
    },
    {
      icon: Flame,
      val: stats.recentStreak,
      label: "Day Streak",
      color: "#FF6B2B",
    },
  ];

  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Hero */}
      <motion.div
        variants={ITEM}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.05),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-[300px] h-[200px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right,rgba(124,111,255,0.15),transparent 70%)",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={15} className="text-[#7C6FFF]" />
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
            Structured focus sessions with XP rewards, ambient effects, and
            progress tracking. Build the consistency that creates results.
          </p>

          {/* Mode previews */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MODE_PREVIEWS.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px]"
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
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-[13px] tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
              color: "#fff",
              boxShadow: "0 0 32px rgba(124,111,255,0.35)",
            }}
          >
            <Timer size={15} />
            Start Focus Session
            <ChevronRight size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={ITEM}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {STAT_PILLS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <Icon size={14} style={{ color: s.color }} />
              <span className="text-[20px] font-black text-white leading-none">
                {s.val}
              </span>
              <span className="text-[9px] text-white/22 uppercase tracking-wider">
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent sessions */}
      {history.length > 0 && (
        <motion.div
          variants={ITEM}
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <p className="text-[10px] text-white/22 uppercase tracking-widest mb-4">
            Recent Sessions
          </p>
          <div className="space-y-2">
            {history.map((s, i) => (
              <SessionCard key={s.id ?? i} session={s} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!history.length && (
        <motion.div
          variants={ITEM}
          className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl border border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <span className="text-4xl">🧘</span>
          <p className="text-[13px] text-white/30">No focus sessions yet.</p>
          <p className="text-[11px] text-white/18">
            Start your first session to build your streak.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
