import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useProgress } from "../../context/ProgressContext.jsx";
import { RANKS } from "../../utils/progressStorage.js";

export default function RankJourney() {
  const { stats } = useProgress();
  const level = stats.level ?? 1;
  const rank = stats.rank ?? RANKS[0];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-white/25 uppercase tracking-widest">
        Rank Journey
      </p>
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none pb-1">
        {RANKS.map((r, i) => {
          const reached = level >= r.minLevel;
          const isCurrent = r.id === rank.id;
          const isLast = i === RANKS.length - 1;
          return (
            <div key={r.id} className="flex items-center gap-0 shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200"
                style={{
                  background: isCurrent
                    ? `${r.color}12`
                    : reached
                      ? "rgba(255,255,255,0.03)"
                      : "transparent",
                  borderColor: isCurrent
                    ? `${r.color}45`
                    : reached
                      ? `${r.color}18`
                      : "rgba(255,255,255,0.06)",
                  opacity: reached ? 1 : 0.38,
                }}
              >
                <span className="text-xl">{r.emoji}</span>
                <span
                  className="text-[10px] font-bold"
                  style={{
                    color: reached ? r.color : "rgba(255,255,255,0.25)",
                  }}
                >
                  {r.label}
                </span>
                <span className="text-[8px] text-white/20">
                  Lv.{r.minLevel}
                </span>
                {isCurrent && (
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: r.color, background: `${r.color}18` }}
                  >
                    YOU
                  </span>
                )}
              </motion.div>
              {!isLast && (
                <ChevronRight
                  size={14}
                  className="shrink-0"
                  style={{
                    color:
                      level >= RANKS[i + 1].minLevel
                        ? RANKS[i + 1].color
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
