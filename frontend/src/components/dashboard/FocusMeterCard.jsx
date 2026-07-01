import { motion } from "framer-motion";
import { Target } from "lucide-react";

/**
 * FocusMeterCard
 *
 * Displays a 0–100 focus score for today with a circular arc meter,
 * label and colour-coded indicator.
 *
 * Props:
 *   focusScore {object}  output of buildFocusScore()
 */

// ─── ARC METER (SVG) ─────────────────────────────────────────────────────────
function ArcMeter({ score, color, size = 120 }) {
  // Half-circle arc from left to right (180°)
  const r = (size - 14) / 2;
  const cx = size / 2;
  const cy = size / 2 + r * 0.25; // shift center down so arc sits nicely
  const circ = Math.PI * r; // half circumference
  const dash = Math.max(0, Math.min(1, score / 100)) * circ;

  // Arc starts at 180° (left) and sweeps clockwise to 0° (right)
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;
  const path = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size * 0.65 }}
    >
      <svg
        width={size}
        height={size * 0.65}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        overflow="visible"
      >
        {/* Track */}
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Fill */}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
        />
      </svg>

      {/* Centre score label */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <p className="text-[30px] font-black leading-none" style={{ color }}>
          {score}
        </p>
        <p className="text-[9px] text-white/28 font-bold">/100</p>
      </div>
    </div>
  );
}

// ─── BREAKDOWN ROW ────────────────────────────────────────────────────────────
function BreakdownRow({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-white/28 font-bold w-16 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span
        className="text-[9px] font-black w-7 text-right shrink-0"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FocusMeterCard({ focusScore }) {
  const fs = focusScore ?? {
    score: 0,
    label: "Poor",
    color: "#FF6B2B",
    components: {},
  };

  const { score, label, color, components } = fs;

  const BREAKDOWN = [
    { label: "XP", value: components?.xp ?? 0, color: "#7C6FFF" },
    { label: "Topics", value: components?.topics ?? 0, color: "#00FFC8" },
    { label: "Revisions", value: components?.revisions ?? 0, color: "#FFB347" },
    {
      label: "Consistency",
      value: components?.consistency ?? 0,
      color: "#4FC3F7",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.15 }}
      className="rounded-2xl border border-white/[0.07] p-5"
      style={{ background: "#0A0A14" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Target size={12} style={{ color }} />
        <p className="text-[9px] font-black text-white/28 uppercase tracking-widest">
          Focus Meter
        </p>
      </div>

      {/* Arc meter */}
      <div className="flex justify-center mb-1">
        <ArcMeter score={score} color={color} size={130} />
      </div>

      {/* Label badge */}
      <div className="flex justify-center mb-4">
        <span
          className="text-[11px] font-black px-3 py-1 rounded-xl"
          style={{
            color,
            background: `${color}14`,
            border: `1px solid ${color}28`,
          }}
        >
          {label}
        </span>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2">
        {BREAKDOWN.map((row) => (
          <BreakdownRow key={row.label} {...row} />
        ))}
      </div>
    </motion.div>
  );
}
