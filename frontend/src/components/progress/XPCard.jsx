import { motion } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";
import { useProgress } from "../../context/ProgressContext.jsx";

export default function XPCard() {
  const { stats, xpToday } = useProgress();

  const sources = [
    { label: "Quiz XP", val: stats.quizXP ?? 0, color: "#FFB347" },
    { label: "Focus XP", val: stats.focusXP ?? 0, color: "#7C6FFF" },
  ];
  const maxSource = Math.max(stats.quizXP ?? 0, stats.focusXP ?? 0, 1);

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
      style={{ background: "#0A0A14" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[#FFD700]" />
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Total XP
          </span>
        </div>
        {xpToday > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#00FFC8]/25 bg-[#00FFC8]/08">
            <TrendingUp size={9} className="text-[#00FFC8]" />
            <span className="text-[10px] font-bold text-[#00FFC8]">
              +{xpToday} today
            </span>
          </div>
        )}
      </div>

      {/* Big number */}
      <div>
        <motion.p
          key={stats.totalXP}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-[42px] font-black text-white leading-none tabular-nums"
        >
          {(stats.totalXP ?? 0).toLocaleString()}
        </motion.p>
        <p className="text-[11px] text-white/30 mt-1">
          experience points earned
        </p>
      </div>

      {/* Source bars */}
      <div className="space-y-2.5">
        {sources.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-white/45">{s.label}</span>
              <span className="font-bold" style={{ color: s.color }}>
                {s.val.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((s.val / maxSource) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg,${s.color}60,${s.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
