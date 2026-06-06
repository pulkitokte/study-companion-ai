import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { ALL_ACHIEVEMENTS } from "../../utils/progressStorage.js";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";

export default function ProfileAchievements() {
  const { stats } = useGlobalStats();
  const unlocked = stats.achievementIds ?? new Set();
  const entries = Object.entries(ALL_ACHIEVEMENTS ?? {});
  const unlockedArr = [...unlocked];

  const sorted = useMemo(() => {
    return [...entries].sort(([idA], [idB]) => {
      const aOn = unlockedArr.includes(idA);
      const bOn = unlockedArr.includes(idB);
      if (aOn && !bOn) return -1;
      if (!aOn && bOn) return 1;
      return 0;
    });
  }, [entries, unlockedArr]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-[#FFD700]" />
          <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
            Achievements
          </p>
        </div>
        <span className="text-[11px] text-white/25">
          {unlocked.size} / {entries.length} unlocked
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${entries.length > 0 ? Math.round((unlocked.size / entries.length) * 100) : 0}%`,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg,#FFD700,#FFB347)",
            boxShadow: "0 0 8px rgba(255,215,0,0.4)",
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sorted.map(([id, meta], i) => {
          const on = unlockedArr.includes(id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.22 }}
              whileHover={{ scale: on ? 1.02 : 1 }}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
              style={{
                background: on ? `${meta.color}0A` : "rgba(255,255,255,0.02)",
                borderColor: on ? `${meta.color}28` : "rgba(255,255,255,0.05)",
                opacity: on ? 1 : 0.42,
                boxShadow: on ? `0 0 10px ${meta.color}07` : "none",
              }}
            >
              <span className="text-xl shrink-0">{on ? meta.emoji : "🔒"}</span>
              <div className="min-w-0">
                <p
                  className="text-[12px] font-bold leading-tight truncate"
                  style={{ color: on ? meta.color : "rgba(255,255,255,0.28)" }}
                >
                  {meta.label}
                </p>
                <p className="text-[10px] text-white/22 leading-snug truncate">
                  {meta.desc}
                </p>
              </div>
              {on && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ color: meta.color, background: `${meta.color}18` }}
                >
                  ✓
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
