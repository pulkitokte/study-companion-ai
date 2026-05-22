import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import {
  getRank,
  getNextRank,
  getRankProgress,
  RANKS,
} from "../../utils/quizCalculations.js";

export default function XPBreakdown({ totalXP = 0, categoryStats = {} }) {
  const { pct, current, next, xpToNext } = getRankProgress(totalXP);

  const catEntries = Object.entries(categoryStats)
    .filter(([, v]) => v.xp > 0)
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, 6);

  const maxCatXP = catEntries.length
    ? Math.max(...catEntries.map(([, v]) => v.xp))
    : 1;

  return (
    <div className="space-y-5">
      {/* Current rank card */}
      <div
        className="relative overflow-hidden rounded-xl border px-5 py-4"
        style={{
          borderColor: `${current.color}30`,
          background: `linear-gradient(135deg,${current.color}0E,rgba(5,5,12,0))`,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg,transparent,${current.color}70,transparent)`,
          }}
        />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
              style={{
                background: `${current.color}14`,
                borderColor: `${current.color}35`,
              }}
            >
              {current.emoji}
            </div>
            <div>
              <p className="text-[10px] text-white/28 tracking-widest uppercase">
                Current Rank
              </p>
              <p
                className="text-[18px] font-black"
                style={{ color: current.color }}
              >
                {current.label}
              </p>
              <p className="text-[10px] text-white/30">{current.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/22 uppercase tracking-wider">
              Total XP
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[22px] font-black text-white tabular-nums"
            >
              {totalXP.toLocaleString()}
            </motion.p>
          </div>
        </div>

        {next ? (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-white/28">
              <span>{current.label}</span>
              <span style={{ color: next.color }}>
                {xpToNext.toLocaleString()} XP → {next.label} {next.emoji}
              </span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg,${current.color}80,${next.color})`,
                  boxShadow: `0 0 8px ${current.color}50`,
                }}
              />
            </div>
            <p className="text-[9px] text-white/18 text-right">
              {pct}% to next rank
            </p>
          </div>
        ) : (
          <p className="text-[11px] font-bold" style={{ color: current.color }}>
            Maximum rank achieved. You are a legend. 👑
          </p>
        )}
      </div>

      {/* XP by category */}
      {catEntries.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-white/22 tracking-widest uppercase">
            XP by Subject
          </p>
          {catEntries.map(([catId, data], i) => {
            const barPct = Math.round((data.xp / maxCatXP) * 100);
            return (
              <motion.div
                key={catId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="space-y-1"
              >
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/55 capitalize">
                    {catId.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap size={9} className="text-[#7C6FFF]" />
                    <span className="font-bold text-[#7C6FFF]">
                      {data.xp.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{
                      delay: 0.1 + i * 0.07,
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#7C6FFF80,#7C6FFF)",
                      boxShadow: "0 0 6px rgba(124,111,255,0.4)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rank ladder */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-white/22 tracking-widest uppercase">
          Rank Ladder
        </p>
        {RANKS.map((rank, i) => {
          const isUnlocked = totalXP >= rank.minXP;
          const isCurrent = rank.id === current.id;
          return (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200"
              style={{
                background: isCurrent ? `${rank.color}0E` : "transparent",
                borderColor: isCurrent
                  ? `${rank.color}38`
                  : isUnlocked
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.03)",
                opacity: isUnlocked ? 1 : 0.4,
              }}
            >
              <span className="text-base w-7 text-center">{rank.emoji}</span>
              <div className="flex-1">
                <span
                  className="text-[12px] font-bold"
                  style={{
                    color: isCurrent
                      ? rank.color
                      : isUnlocked
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(255,255,255,0.2)",
                  }}
                >
                  {rank.label}
                </span>
                <span className="text-[9px] text-white/18 ml-2">
                  {rank.minXP.toLocaleString()} XP
                </span>
              </div>
              {isCurrent && (
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded"
                  style={{ color: rank.color, background: `${rank.color}18` }}
                >
                  You
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
