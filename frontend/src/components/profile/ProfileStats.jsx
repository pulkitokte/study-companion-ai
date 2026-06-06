import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Flame,
  Star,
  Trophy,
  Timer,
  Target,
  TrendingUp,
  BarChart3,
  Swords,
  CheckCircle2,
} from "lucide-react";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";
import { RANKS } from "../../utils/progressStorage.js";

function StatCard({ icon: Icon, value, label, color, sub, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className="relative overflow-hidden flex flex-col gap-2 p-4 rounded-2xl border border-white/[0.07] group cursor-default"
      style={{ background: `${color}07` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg,transparent,${color},transparent)`,
        }}
      />
      <div
        className="p-1.5 w-fit rounded-xl"
        style={{ background: `${color}15` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p className="text-[22px] font-black text-white leading-none tabular-nums">
          {value}
        </p>
        <p className="text-[10px] text-white/32 uppercase tracking-wider mt-0.5">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] mt-0.5" style={{ color: `${color}99` }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function ProfileStats() {
  const { stats } = useGlobalStats();

  const nextRank = useMemo(() => {
    const level = stats.level ?? 1;
    return RANKS.find((r) => r.minLevel > level) ?? null;
  }, [stats]);

  const CARDS = [
    {
      icon: Zap,
      value: (stats.totalXP ?? 0).toLocaleString(),
      label: "Total XP",
      color: "#7C6FFF",
      sub: `+${stats.quizXP ?? 0} quiz · +${stats.focusXP ?? 0} focus`,
    },
    {
      icon: Star,
      value: `Lv.${stats.level ?? 1}`,
      label: "Current Level",
      color: "#FFB347",
      sub: nextRank
        ? `${stats.xpToNextLevel ?? 500} XP to Lv.${(stats.level ?? 1) + 1}`
        : "Max level!",
    },
    {
      icon: Flame,
      value: `${stats.streak ?? 0}d`,
      label: "Day Streak",
      color: "#FF6B2B",
      sub:
        stats.streak >= 7
          ? "Week warrior 🔥"
          : stats.streak >= 3
            ? "Building habit"
            : "Start today",
    },
    {
      icon: Swords,
      value: stats.totalQuizzes ?? 0,
      label: "Quizzes Done",
      color: "#FFB347",
      sub: `${stats.avgQuizAcc ?? 0}% avg accuracy`,
    },
    {
      icon: Timer,
      value: `${Math.floor((stats.totalFocusMins ?? 0) / 60)}h ${(stats.totalFocusMins ?? 0) % 60}m`,
      label: "Total Focus",
      color: "#00FFC8",
      sub: `${stats.totalFocusSessions ?? 0} sessions`,
    },
    {
      icon: Target,
      value: `${stats.avgQuizAcc ?? 0}%`,
      label: "Quiz Accuracy",
      color: "#4FC3F7",
      sub:
        stats.avgQuizAcc >= 80
          ? "Elite level"
          : stats.avgQuizAcc >= 60
            ? "Solid"
            : "Needs work",
    },
    {
      icon: Trophy,
      value: stats.achievementsUnlocked ?? 0,
      label: "Achievements",
      color: "#FFD700",
      sub: "Across all modules",
    },
    {
      icon: CheckCircle2,
      value: `${stats.plannerDone ?? 0}/${stats.plannerTotal ?? 0}`,
      label: "Tasks Done",
      color: "#B5FF47",
      sub: "From study planner",
    },
    {
      icon: BarChart3,
      value: `${stats.prodScore ?? 0}%`,
      label: "Prod. Score",
      color: "#FF6B9D",
      sub: stats.prodScore >= 70 ? "Excellent" : "Room to grow",
    },
    {
      icon: TrendingUp,
      value:
        stats.totalXP > 0
          ? ((stats.level ?? 1) - 1) * 500 + (stats.xpInto ?? 0)
          : "0",
      label: "XP Into Level",
      color: "#7C6FFF",
      sub: `${stats.levelPct ?? 0}% progress`,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
        Performance Stats
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {CARDS.map((c, i) => (
          <StatCard key={c.label} {...c} index={i} />
        ))}
      </div>

      {/* Rank progress */}
      {stats.rank && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl border px-5 py-4"
          style={{
            borderColor: `${stats.rank.color}28`,
            background: `${stats.rank.color}07`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg,transparent,${stats.rank.color}60,transparent)`,
            }}
          />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stats.rank.emoji}</span>
              <div>
                <p className="text-[10px] text-white/28 uppercase tracking-widest">
                  Current Rank
                </p>
                <p
                  className="text-[18px] font-black"
                  style={{ color: stats.rank.color }}
                >
                  {stats.rank.label}
                </p>
                <p className="text-[10px] text-white/30">
                  {stats.rank.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/22 uppercase tracking-wider">
                Total XP
              </p>
              <p className="text-[22px] font-black text-white tabular-nums">
                {(stats.totalXP ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          {nextRank && (
            <div className="space-y-1.5">
              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.levelPct ?? 0}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg,${stats.rank.color}80,${stats.rank.color})`,
                    boxShadow: `0 0 8px ${stats.rank.color}50`,
                  }}
                />
              </div>
              <p className="text-[10px] text-white/22">
                {(stats.xpToNextLevel ?? 500).toLocaleString()} XP to{" "}
                {nextRank.label} {nextRank.emoji}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
