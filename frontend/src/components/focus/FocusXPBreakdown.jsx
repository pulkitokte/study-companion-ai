import { motion } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";
import { getFocusHistory } from "../../utils/focusStorage.js";
import {
  getRank,
  getNextRank,
  getRankProgress,
  RANKS,
} from "../../utils/quizCalculations.js";

export default function FocusXPBreakdown({ stats }) {
  const history = getFocusHistory();
  const totalXP = stats.totalXP ?? 0;
  const { pct, current, next, xpToNext } = getRankProgress(totalXP);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayXP = history
    .filter((s) => s.date?.slice(0, 10) === todayStr)
    .reduce((sum, s) => sum + (s.xpEarned ?? 0), 0);

  // XP by mode
  const modeXP = {};
  history.forEach((s) => {
    const m = s.mode ?? "unknown";
    modeXP[m] = (modeXP[m] ?? 0) + (s.xpEarned ?? 0);
  });
  const modeEntries = Object.entries(modeXP).sort((a, b) => b[1] - a[1]);
  const maxModeXP = modeEntries.length
    ? Math.max(...modeEntries.map(([, v]) => v))
    : 1;

  const MODE_META = {
    pomodoro: { emoji: "🍅", color: "#FF6B2B", label: "Pomodoro" },
    deepwork: { emoji: "🧠", color: "#7C6FFF", label: "Deep Work" },
    sprint: { emoji: "⚡", color: "#00FFC8", label: "Sprint" },
  };

  return (
    <div className="space-y-5">
      {/* Rank card */}
      <div
        className="relative overflow-hidden rounded-xl border px-5 py-4"
        style={{
          borderColor: `${current.color}30`,
          background: `linear-gradient(135deg,${current.color}0D,rgba(5,5,12,0))`,
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
              <p className="text-[10px] text-white/28 uppercase tracking-widest">
                Focus Rank
              </p>
              <p
                className="text-[18px] font-black"
                style={{ color: current.color }}
              >
                {current.label}
              </p>
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
            {todayXP > 0 && (
              <p className="text-[10px] text-[#00FFC8]/70">+{todayXP} today</p>
            )}
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
            <p className="text-[9px] text-white/16 text-right">
              {pct}% to next rank
            </p>
          </div>
        ) : (
          <p className="text-[11px] font-bold" style={{ color: current.color }}>
            Maximum rank achieved. 👑
          </p>
        )}
      </div>

      {/* Today's XP highlight */}
      {todayXP > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#00FFC8]/22 bg-[#00FFC8]/06">
          <TrendingUp size={14} className="text-[#00FFC8] shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-white">
              +{todayXP} XP earned today
            </p>
            <p className="text-[10px] text-white/28">
              Keep going — every session stacks.
            </p>
          </div>
        </div>
      )}

      {/* XP by mode */}
      {modeEntries.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] text-white/22 uppercase tracking-widest">
            XP by Mode
          </p>
          {modeEntries.map(([modeId, xp], i) => {
            const meta = MODE_META[modeId] ?? {
              emoji: "⏱",
              color: "#888",
              label: modeId,
            };
            const barPct = Math.round((xp / maxModeXP) * 100);
            return (
              <motion.div
                key={modeId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="space-y-1.5"
              >
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/55">
                    <span>{meta.emoji}</span>
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap size={9} style={{ color: meta.color }} />
                    <span className="font-bold" style={{ color: meta.color }}>
                      {xp.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{
                      delay: 0.1 + i * 0.08,
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg,${meta.color}60,${meta.color})`,
                      boxShadow: `0 0 6px ${meta.color}40`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rank ladder (compact) */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-white/22 uppercase tracking-widest">
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all"
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
