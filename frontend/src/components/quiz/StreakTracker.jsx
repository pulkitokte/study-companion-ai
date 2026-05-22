import { motion } from "framer-motion";
import { Flame, Calendar, Zap, Trophy } from "lucide-react";
import { getQuizHistory } from "../../utils/quizStorage.js";

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakTracker({ stats }) {
  const history = getQuizHistory();
  const last7 = getLast7Days();
  const today = new Date().toISOString().slice(0, 10);
  const activeDays = new Set(
    history.map((s) => s.date?.slice(0, 10)).filter(Boolean),
  );

  const daily = stats.recentStreak ?? 0;
  const best = stats.bestStreak ?? 0;
  const total = stats.totalQuizzes ?? 0;
  const totalXP = stats.totalXP ?? 0;

  const streakLabel =
    daily >= 30
      ? { text: "Legendary Consistency 🏆", color: "#FFD700" }
      : daily >= 14
        ? { text: "On a Hot Streak 🔥", color: "#FF6B2B" }
        : daily >= 7
          ? { text: "Week Warrior ⚡", color: "#00FFC8" }
          : daily >= 3
            ? { text: "Building Habits 💪", color: "#7C6FFF" }
            : daily >= 1
              ? { text: "Getting Started 🌱", color: "#4FC3F7" }
              : { text: "Start Your Streak Today", color: "#888" };

  const PILLS = [
    { icon: Flame, val: daily, label: "Day Streak", color: "#FF6B2B" },
    { icon: Trophy, val: best, label: "Best Streak", color: "#FFD700" },
    { icon: Calendar, val: total, label: "Quizzes Done", color: "#7C6FFF" },
    {
      icon: Zap,
      val: totalXP.toLocaleString(),
      label: "Total XP",
      color: "#00FFC8",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Streak hero */}
      <div
        className="relative overflow-hidden rounded-xl border px-5 py-4"
        style={{
          borderColor: "rgba(255,107,43,0.25)",
          background: "rgba(255,107,43,0.06)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#FF6B2B,transparent)",
          }}
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/28 uppercase tracking-widest mb-1">
              Current Streak
            </p>
            <div className="flex items-end gap-2">
              <motion.span
                key={daily}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-black text-white leading-none"
              >
                {daily}
              </motion.span>
              <span className="text-[14px] text-white/38 pb-1">days</span>
            </div>
            <p
              className="text-[11px] font-semibold mt-1"
              style={{ color: streakLabel.color }}
            >
              {streakLabel.text}
            </p>
          </div>
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }}
              className="absolute inset-0 blur-xl rounded-full"
              style={{ background: "#FF6B2B" }}
            />
            <span className="relative text-6xl leading-none select-none">
              {daily >= 1 ? "🔥" : "💤"}
            </span>
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PILLS.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <Icon size={13} style={{ color: p.color }} />
              <span className="text-[20px] font-black text-white leading-none">
                {p.val}
              </span>
              <span className="text-[9px] text-white/22 uppercase tracking-wider text-center">
                {p.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* 7-day heatmap */}
      <div
        className="rounded-xl border border-white/[0.06] px-4 py-4"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <p className="text-[10px] text-white/22 tracking-widest uppercase mb-3">
          Last 7 Days
        </p>
        <div className="flex items-end justify-between gap-2">
          {last7.map((day, i) => {
            const isActive = activeDays.has(day);
            const isToday = day === today;
            const count = history.filter(
              (s) => s.date?.slice(0, 10) === day,
            ).length;
            const barH = count === 0 ? 6 : Math.min(8 + count * 12, 48);
            const label = DAY_LABELS[new Date(day + "T12:00:00").getDay()];
            return (
              <div
                key={day}
                className="flex flex-col items-center gap-1.5 flex-1"
              >
                <motion.div
                  initial={{ height: 6, opacity: 0 }}
                  animate={{ height: barH, opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="w-full rounded-sm"
                  style={{
                    background: isActive
                      ? isToday
                        ? "linear-gradient(180deg,#00FFC8,#7C6FFF)"
                        : "rgba(0,255,200,0.45)"
                      : "rgba(255,255,255,0.06)",
                    boxShadow: isActive
                      ? "0 0 6px rgba(0,255,200,0.3)"
                      : "none",
                  }}
                />
                <span
                  className="text-[9px] font-bold"
                  style={{
                    color: isToday ? "#00FFC8" : "rgba(255,255,255,0.22)",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
