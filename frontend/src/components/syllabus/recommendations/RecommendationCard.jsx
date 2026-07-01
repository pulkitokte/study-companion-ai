import { motion } from "framer-motion";
import {
  ChevronRight,
  AlertOctagon,
  AlertTriangle,
  Info,
  TrendingUp,
} from "lucide-react";
import {
  PRIORITY,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  REC_TYPE,
} from "../../../utils/studyRecommendationEngine.js";

/**
 * RecommendationCard
 *
 * Displays a single adaptive recommendation.
 * Fully prop-driven — no service calls.
 *
 * Props:
 *   rec    {object}  recommendation from generateRecommendations()
 *   index  {number}  stagger animation index
 *   onAction {function} (rec) => void  — called when CTA is tapped
 */

const PRIORITY_ICONS = {
  [PRIORITY.CRITICAL]: AlertOctagon,
  [PRIORITY.HIGH]: AlertTriangle,
  [PRIORITY.MEDIUM]: Info,
  [PRIORITY.POSITIVE]: TrendingUp,
};

// Glow intensity per priority
const GLOW_OPACITY = {
  [PRIORITY.CRITICAL]: 0.12,
  [PRIORITY.HIGH]: 0.09,
  [PRIORITY.MEDIUM]: 0.06,
  [PRIORITY.POSITIVE]: 0.06,
};

// Accent line opacity per priority
const ACCENT_OPACITY = {
  [PRIORITY.CRITICAL]: 0.85,
  [PRIORITY.HIGH]: 0.65,
  [PRIORITY.MEDIUM]: 0.4,
  [PRIORITY.POSITIVE]: 0.4,
};

export default function RecommendationCard({ rec, index = 0, onAction }) {
  if (!rec) return null;

  const {
    type,
    title,
    message,
    priority,
    subjectLabel,
    color,
    icon,
    actionLabel,
  } = rec;

  const priorityColor = PRIORITY_COLORS[priority] ?? "#888";
  const priorityLabel = PRIORITY_LABELS[priority] ?? priority;
  const PriorityIcon = PRIORITY_ICONS[priority] ?? Info;
  const isCritical = priority === PRIORITY.CRITICAL;
  const isPositive = priority === PRIORITY.POSITIVE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="relative rounded-2xl border border-white/[0.06] p-5 overflow-hidden"
      style={{
        background: isCritical
          ? `linear-gradient(135deg, ${priorityColor}${Math.round(
              GLOW_OPACITY[priority] * 255,
            )
              .toString(16)
              .padStart(2, "0")}, #0A0A14)`
          : "#0A0A14",
      }}
    >
      {/* Top priority accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, ${priorityColor}, transparent)`,
          opacity: ACCENT_OPACITY[priority] ?? 0.4,
        }}
      />

      {/* Subtle glow for critical */}
      {isCritical && (
        <div
          className="absolute top-0 right-0 w-32 h-24 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${priorityColor}18, transparent 70%)`,
            borderRadius: "0 16px 0 0",
          }}
        />
      )}

      {/* ── Header: emoji + title + priority badge ─────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Subject / type emoji */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: `${priorityColor}12`,
              border: `1px solid ${priorityColor}22`,
            }}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-[13px] font-black text-white/90 leading-tight truncate">
              {title}
            </p>
            {subjectLabel && (
              <p className="text-[10px] text-white/35 mt-0.5 truncate">
                {subjectLabel}
              </p>
            )}
          </div>
        </div>

        {/* Priority badge */}
        <div
          className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{
            background: `${priorityColor}14`,
            border: `1px solid ${priorityColor}28`,
          }}
        >
          <PriorityIcon size={10} style={{ color: priorityColor }} />
          <span
            className="text-[9px] font-black leading-none"
            style={{ color: priorityColor }}
          >
            {priorityLabel}
          </span>
        </div>
      </div>

      {/* ── Message ────────────────────────────────────────────────────── */}
      <p className="text-[11px] text-white/48 leading-relaxed mb-4">
        {message}
      </p>

      {/* ── CTA button ─────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onAction?.(rec)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black
                   transition-all border"
        style={{
          color: isPositive ? "#0A0A14" : priorityColor,
          background: isPositive ? priorityColor : `${priorityColor}14`,
          borderColor: `${priorityColor}30`,
        }}
      >
        {actionLabel ?? "View"}
        <ChevronRight size={12} />
      </motion.button>
    </motion.div>
  );
}
