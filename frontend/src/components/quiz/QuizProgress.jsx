// FILE PATH: frontend/src/components/quiz/QuizProgress.jsx

import { motion } from "framer-motion";
import { Zap, Flame, Target } from "lucide-react";

export default function QuizProgress({
  current, // 1-based current question index
  total,
  correctCount,
  streak,
  xpEarned,
  accentColor = "#00FFC8",
}) {
  const pct = ((current - 1) / total) * 100;

  return (
    <div className="space-y-3">
      {/* Top row: counters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Question count */}
          <span className="text-[11px] text-white/35">
            <span className="font-black text-white">{current}</span>
            <span className="text-white/25"> / {total}</span>
          </span>

          {/* Streak badge */}
          {streak >= 2 && (
            <motion.div
              key={streak}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full border"
              style={{
                borderColor: "rgba(255,107,43,0.4)",
                background: "rgba(255,107,43,0.1)",
              }}
            >
              <Flame size={10} className="text-[#FF6B2B]" />
              <span className="text-[9px] font-bold text-[#FF6B2B]">
                {streak} streak
              </span>
            </motion.div>
          )}
        </div>

        {/* Right: XP + accuracy */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Target size={10} style={{ color: accentColor }} />
            <span
              className="text-[10px] font-bold"
              style={{ color: accentColor }}
            >
              {current > 1
                ? Math.round((correctCount / (current - 1)) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={10} className="text-[#7C6FFF]" />
            <span className="text-[10px] font-bold text-[#7C6FFF]">
              {xpEarned} XP
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar with segment dots */}
      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              background: `linear-gradient(90deg, ${accentColor}60, ${accentColor})`,
              boxShadow: `0 0 8px ${accentColor}40`,
            }}
          />
        </div>

        {/* Segment dots at each question boundary */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: total - 1 }, (_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-full"
              style={{
                left: `${((i + 1) / total) * 100}%`,
                background: "rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
