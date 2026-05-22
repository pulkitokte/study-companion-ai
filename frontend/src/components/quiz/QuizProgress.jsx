import { motion } from "framer-motion";
import { Zap, Flame, Target } from "lucide-react";

export default function QuizProgress({
  current,
  total,
  correctCount,
  streak,
  xpEarned,
  accentColor = "#00FFC8",
}) {
  const pct = ((current - 1) / total) * 100;
  const acc =
    current > 1 ? Math.round((correctCount / (current - 1)) * 100) : 0;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/35">
            <span className="font-black text-white">{current}</span>
            <span className="text-white/25"> / {total}</span>
          </span>
          {streak >= 2 && (
            <motion.div
              key={streak}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#FF6B2B]/40 bg-[#FF6B2B]/10"
            >
              <Flame size={9} className="text-[#FF6B2B]" />
              <span className="text-[9px] font-bold text-[#FF6B2B]">
                {streak}x
              </span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Target size={10} style={{ color: accentColor }} />
            <span
              className="text-[10px] font-bold"
              style={{ color: accentColor }}
            >
              {acc}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={10} className="text-[#7C6FFF]" />
            <span className="text-[10px] font-bold text-[#7C6FFF]">
              {xpEarned}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg,${accentColor}60,${accentColor})`,
            boxShadow: `0 0 8px ${accentColor}40`,
          }}
        />
        {Array.from({ length: total - 1 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-[1px] bg-black/40"
            style={{ left: `${((i + 1) / total) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
