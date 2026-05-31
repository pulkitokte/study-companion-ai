import { motion } from "framer-motion";
import { Flame, Calendar } from "lucide-react";
import { useProgress } from "../../context/ProgressContext.jsx";
import { getLast30Days } from "../../utils/progressStorage.js";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakPanel() {
  const { stats } = useProgress();
  const days30 = getLast30Days();
  const streak = stats.streak ?? 0;
  const today = new Date().toISOString().slice(0, 10);

  const label =
    streak >= 30
      ? { text: "Legendary 🏆", color: "#FFD700" }
      : streak >= 14
        ? { text: "Blazing 🔥", color: "#FF6B2B" }
        : streak >= 7
          ? { text: "Strong ⚡", color: "#00FFC8" }
          : streak >= 3
            ? { text: "Growing 🌱", color: "#7C6FFF" }
            : streak >= 1
              ? { text: "Started", color: "#4FC3F7" }
              : { text: "Start today", color: "#888" };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-[#FF6B2B]" />
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Activity Streak
          </span>
        </div>
        <span className="text-[10px] font-bold" style={{ color: label.color }}>
          {label.text}
        </span>
      </div>

      {/* Streak hero */}
      <div className="flex items-end gap-4">
        <div className="relative">
          <motion.div
            animate={{
              scale: streak > 0 ? [1, 1.15, 1] : 1,
              opacity: streak > 0 ? [0.4, 0.8, 0.4] : 0.3,
            }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: "#FF6B2B" }}
          />
          <span className="relative text-5xl leading-none select-none">
            {streak >= 1 ? "🔥" : "💤"}
          </span>
        </div>
        <div>
          <motion.p
            key={streak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[48px] font-black text-white leading-none tabular-nums"
          >
            {streak}
          </motion.p>
          <p className="text-[12px] text-white/35">consecutive days active</p>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="space-y-2">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          Last 30 Days
        </p>
        <div className="grid grid-cols-[repeat(30,1fr)] gap-0.5">
          {days30.map((d, i) => (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.008, duration: 0.18 }}
              title={`${d.date}${d.hasQuiz ? " · Quiz" : ""}${d.hasFocus ? " · Focus" : ""}`}
              className="aspect-square rounded-sm"
              style={{
                background:
                  d.hasQuiz && d.hasFocus
                    ? "linear-gradient(135deg,#FFB347,#7C6FFF)"
                    : d.hasQuiz
                      ? "#FFB34780"
                      : d.hasFocus
                        ? "#7C6FFF80"
                        : "rgba(255,255,255,0.05)",
                boxShadow: d.active
                  ? `0 0 4px ${d.hasQuiz && d.hasFocus ? "#FFD700" : d.hasQuiz ? "#FFB347" : "#7C6FFF"}60`
                  : "none",
                outline:
                  d.date === today ? "1px solid rgba(0,255,200,0.7)" : "none",
              }}
            />
          ))}
        </div>
        <div className="flex gap-4 flex-wrap text-[9px] text-white/25">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#FFB347]/70" /> Quiz
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#7C6FFF]/70" /> Focus
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ background: "linear-gradient(135deg,#FFB347,#7C6FFF)" }}
            />{" "}
            Both
          </div>
        </div>
      </div>
    </div>
  );
}
