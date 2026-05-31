import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useProgress } from "../../context/ProgressContext.jsx";
import { ALL_ACHIEVEMENTS } from "../../utils/progressStorage.js";

const CATEGORIES = ["general", "quiz", "focus", "streak", "xp", "level"];

export default function AchievementGrid({ filter = "all" }) {
  const { stats } = useProgress();
  const unlocked = stats.achievementIds ?? new Set();
  const entries = Object.entries(ALL_ACHIEVEMENTS);
  const visible =
    filter === "all"
      ? entries
      : entries.filter(([, v]) => v.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-[#FFD700]" />
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Achievements
          </span>
        </div>
        <span className="text-[10px] text-white/25">
          {unlocked.size} / {entries.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visible.map(([id, meta], i) => {
          const on = unlocked.has(id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: on ? 1.02 : 1 }}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
              style={{
                background: on ? `${meta.color}0A` : "rgba(255,255,255,0.02)",
                borderColor: on ? `${meta.color}28` : "rgba(255,255,255,0.05)",
                opacity: on ? 1 : 0.42,
                boxShadow: on ? `0 0 12px ${meta.color}08` : "none",
              }}
            >
              <span className="text-xl shrink-0">{on ? meta.emoji : "🔒"}</span>
              <div className="min-w-0">
                <p
                  className="text-[12px] font-bold leading-tight"
                  style={{ color: on ? meta.color : "rgba(255,255,255,0.25)" }}
                >
                  {meta.label}
                </p>
                <p className="text-[10px] text-white/22 leading-snug">
                  {meta.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
