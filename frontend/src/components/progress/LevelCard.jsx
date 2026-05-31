import { motion } from "framer-motion";
import { Star, ChevronUp } from "lucide-react";
import { useProgress } from "../../context/ProgressContext.jsx";
import { RANKS } from "../../utils/progressStorage.js";

const C = 2 * Math.PI * 54;

export default function LevelCard() {
  const { stats } = useProgress();

  const level = stats.level ?? 1;
  const pct = stats.levelPct ?? 0;
  const xpInto = stats.xpInto ?? 0;
  const toNext = stats.xpToNextLevel ?? 500;
  const rank = stats.rank ?? RANKS[0];
  const nextRank = stats.nextRank ?? null;
  const dashOff = C * (1 - pct / 100);

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center gap-2">
        <Star size={14} style={{ color: rank.color }} />
        <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
          Level & Rank
        </span>
      </div>

      {/* Ring + info row */}
      <div className="flex items-center gap-5">
        {/* Circular level ring */}
        <div className="relative shrink-0">
          <motion.div
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 rounded-full blur-lg"
            style={{ background: rank.color }}
          />
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="-rotate-90"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="7"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={rank.color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: dashOff }}
              transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 8px ${rank.color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[28px] font-black text-white leading-none">
              {level}
            </p>
            <p className="text-[9px] text-white/30 uppercase tracking-wider">
              Level
            </p>
          </div>
        </div>

        {/* Rank info */}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-[10px] text-white/28 uppercase tracking-widest">
              Current Rank
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl">{rank.emoji}</span>
              <p
                className="text-[18px] font-black"
                style={{ color: rank.color }}
              >
                {rank.label}
              </p>
            </div>
            <p className="text-[10px] text-white/28 mt-0.5">
              {rank.description}
            </p>
          </div>

          {/* XP progress */}
          <div>
            <div className="flex justify-between text-[10px] text-white/28 mb-1">
              <span>{xpInto.toLocaleString()} XP</span>
              <span>{toNext.toLocaleString()} to next</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg,${rank.color}70,${rank.color})`,
                  boxShadow: `0 0 8px ${rank.color}50`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Next rank hint */}
      {nextRank && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <ChevronUp size={12} style={{ color: nextRank.color }} />
          <span className="text-[11px] text-white/35">
            Next:{" "}
            <span className="font-bold" style={{ color: nextRank.color }}>
              {nextRank.label} {nextRank.emoji}
            </span>
            <span className="text-white/20"> at Level {nextRank.minLevel}</span>
          </span>
        </div>
      )}

      {/* Full rank ladder (mini) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {RANKS.map((r) => {
          const active = r.id === rank.id;
          const done = level >= r.minLevel;
          return (
            <div
              key={r.id}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-all"
              style={{
                borderColor: active
                  ? `${r.color}50`
                  : done
                    ? `${r.color}20`
                    : "rgba(255,255,255,0.06)",
                background: active ? `${r.color}14` : "transparent",
                color: done ? r.color : "rgba(255,255,255,0.18)",
              }}
            >
              <span>{r.emoji}</span>
              <span className="hidden sm:inline">{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
