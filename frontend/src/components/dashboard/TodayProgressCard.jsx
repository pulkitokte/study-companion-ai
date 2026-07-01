import { motion } from "framer-motion";
import { Zap, CheckCircle2, RotateCcw, Star } from "lucide-react";

/**
 * TodayProgressCard
 *
 * Shows today's XP, topics, revisions, mastered count
 * and an animated XP-towards-goal progress bar.
 *
 * Props:
 *   progress {object}  output of buildTodayProgress()
 */
export default function TodayProgressCard({ progress }) {
  const p = progress ?? {};

  const todayXP = p.todayXP ?? 0;
  const todayTopicsCompleted = p.todayTopicsCompleted ?? 0;
  const todayRevisions = p.todayRevisions ?? 0;
  const todayMastered = p.todayMastered ?? 0;
  const xpGoal = p.xpGoal ?? 100;
  const xpPct = p.xpPct ?? 0;
  const hasAnyActivity = p.hasAnyActivity ?? false;

  const STATS = [
    {
      icon: Zap,
      label: "XP Today",
      value: todayXP.toLocaleString(),
      color: "#7C6FFF",
    },
    {
      icon: CheckCircle2,
      label: "Topics",
      value: todayTopicsCompleted,
      color: "#00FFC8",
    },
    {
      icon: RotateCcw,
      label: "Revisions",
      value: todayRevisions,
      color: "#FFB347",
    },
    { icon: Star, label: "Mastered", value: todayMastered, color: "#FFD700" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.05 }}
      className="rounded-2xl border border-white/[0.07] p-5"
      style={{ background: "#0A0A14" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[9px] font-black text-white/28 uppercase tracking-widest">
          Today's Progress
        </p>
        <span className="text-[10px] font-bold text-white/30">
          Goal: {xpGoal} XP
        </span>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {STATS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}22`,
              }}
            >
              <Icon size={14} style={{ color }} />
            </div>
            <span className="text-[15px] font-black text-white leading-none">
              {value}
            </span>
            <span className="text-[8px] text-white/28 font-bold uppercase tracking-wide">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* XP progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] text-white/30 font-bold">
            XP Progress
          </span>
          <span
            className="text-[10px] font-black"
            style={{
              color:
                xpPct >= 100
                  ? "#00FFC8"
                  : xpPct >= 60
                    ? "#7C6FFF"
                    : "rgba(255,255,255,0.35)",
            }}
          >
            {xpPct}%
          </span>
        </div>

        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(xpPct, 100)}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            style={{
              background:
                xpPct >= 100
                  ? "linear-gradient(90deg, #00FFC8, #7C6FFF)"
                  : xpPct >= 60
                    ? "#7C6FFF"
                    : "#FFB347",
            }}
          />
        </div>

        {!hasAnyActivity && (
          <p className="text-[9px] text-white/20 mt-2 text-center">
            No activity today yet — start your session to fill the bar.
          </p>
        )}

        {xpPct >= 100 && (
          <p className="text-[9px] text-[#00FFC8] mt-2 text-center font-black">
            🎉 Daily XP goal achieved!
          </p>
        )}
      </div>
    </motion.div>
  );
}
