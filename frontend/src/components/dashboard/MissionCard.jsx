import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

/**
 * MissionCard
 *
 * Displays the single highest-priority mission for today.
 * Fully prop-driven — no service calls.
 *
 * Props:
 *   mission   {object}   output of buildDashboardMission()
 *   onAction  {function} (mission) => void
 */
export default function MissionCard({ mission, onAction }) {
  if (!mission) return null;

  const { emoji, title, explanation, ctaLabel, urgencyLevel, color } = mission;

  const isCritical = urgencyLevel === "critical";
  const isHigh = urgencyLevel === "high";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-5"
      style={{
        background: isCritical
          ? `linear-gradient(135deg, ${color}12, #0A0A14)`
          : "#0A0A14",
      }}
    >
      {/* Priority accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: isCritical ? 0.9 : isHigh ? 0.65 : 0.4,
        }}
      />

      {/* Section label */}
      <p className="text-[9px] font-black text-white/28 uppercase tracking-widest mb-3">
        Mission Priority
      </p>

      {/* Emoji + title */}
      <div className="flex items-start gap-3 mb-2.5">
        <span
          className="text-[28px] leading-none shrink-0 mt-0.5"
          style={{
            filter: isCritical ? `drop-shadow(0 0 8px ${color}60)` : "none",
          }}
        >
          {emoji}
        </span>
        <p
          className="text-[16px] font-black leading-snug"
          style={{
            color: isCritical || isHigh ? color : "rgba(255,255,255,0.88)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Explanation */}
      <p className="text-[11px] text-white/40 leading-relaxed mb-4">
        {explanation}
      </p>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onAction?.(mission)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black
                   transition-all border"
        style={{
          color: isCritical ? "#0A0A14" : color,
          background: isCritical ? color : `${color}14`,
          borderColor: `${color}30`,
        }}
      >
        {ctaLabel}
        <ChevronRight size={13} />
      </motion.button>
    </motion.div>
  );
}
