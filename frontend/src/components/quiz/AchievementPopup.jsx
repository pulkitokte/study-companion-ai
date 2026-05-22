import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { ACHIEVEMENTS } from "../../utils/quizCalculations.js";

export default function AchievementPopup({ achievementIds = [], onDismiss }) {
  const first = achievementIds[0];
  const meta = ACHIEVEMENTS[first];
  const show = achievementIds.length > 0 && !!meta;

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDismiss?.(), 4500);
    return () => clearTimeout(t);
  }, [show, first, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={first}
          initial={{ opacity: 0, y: -70, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] w-[310px]"
        >
          <div
            className="relative rounded-2xl border overflow-hidden px-5 py-4 flex items-center gap-3.5"
            style={{
              background: `linear-gradient(135deg,${meta.color}15,rgba(5,5,12,0.96))`,
              borderColor: `${meta.color}40`,
              boxShadow: `0 0 40px ${meta.color}22, 0 8px 32px rgba(0,0,0,0.6)`,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Top line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1.5px]"
              style={{
                background: `linear-gradient(90deg,transparent,${meta.color},transparent)`,
              }}
            />

            {/* Pulsing icon */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute inset-0 rounded-xl blur-md"
                style={{ background: meta.color }}
              />
              <div
                className="relative w-11 h-11 rounded-xl flex items-center justify-center text-xl border"
                style={{
                  background: `${meta.color}18`,
                  borderColor: `${meta.color}40`,
                }}
              >
                {meta.emoji}
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Trophy size={9} style={{ color: meta.color }} />
                <span
                  className="text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: meta.color }}
                >
                  Achievement Unlocked
                </span>
              </div>
              <p className="text-[14px] font-black text-white leading-tight">
                {meta.label}
              </p>
              <p className="text-[10px] text-white/38 mt-0.5 leading-snug">
                {meta.desc}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="shrink-0 p-1.5 rounded-lg text-white/22 hover:text-white/55 hover:bg-white/[0.07] transition-colors"
            >
              <X size={12} />
            </button>

            {/* Multi-unlock badge */}
            {achievementIds.length > 1 && (
              <div
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-black"
                style={{ background: meta.color }}
              >
                {achievementIds.length}
              </div>
            )}

            {/* Shimmer */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 opacity-10"
              style={{
                background:
                  "linear-gradient(90deg,transparent,white,transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </div>

          {/* Auto-dismiss progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4.5, ease: "linear" }}
            className="h-0.5 rounded-full mt-1.5 mx-1"
            style={{ background: meta.color, opacity: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
