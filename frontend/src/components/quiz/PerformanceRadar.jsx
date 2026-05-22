import { useMemo } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../../data/mockQuizData.js";

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 78;

function polar(angleDeg, r) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function toPath(pts) {
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      )
      .join(" ") + " Z"
  );
}

export default function PerformanceRadar({
  categoryStats = {},
  accentColor = "#00FFC8",
}) {
  const cats = useMemo(() => {
    const active = CATEGORIES.filter(
      (c) => (categoryStats[c.id]?.total ?? 0) >= 3,
    );
    return (active.length >= 3 ? active : CATEGORIES.slice(0, 6)).map(
      (cat, i, arr) => {
        const angle = (360 / arr.length) * i;
        const accuracy = categoryStats[cat.id]?.accuracy ?? 0;
        const r = (accuracy / 100) * RADIUS;
        return {
          ...cat,
          angle,
          accuracy,
          point: polar(angle, r),
          gridTip: polar(angle, RADIUS),
          labelTip: polar(angle, RADIUS + 20),
        };
      },
    );
  }, [categoryStats]);

  const hasData = cats.some((c) => c.accuracy > 0);
  const dataPath = cats.length >= 3 ? toPath(cats.map((c) => c.point)) : "";
  const LEVELS = [0.25, 0.5, 0.75, 1];

  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-3xl">🕸️</span>
        <p className="text-[12px] text-white/28">
          Complete 3+ questions in 3+ subjects to unlock radar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
        aria-label="Performance radar chart"
      >
        {/* Grid rings */}
        {LEVELS.map((lvl) => (
          <circle
            key={lvl}
            cx={CX}
            cy={CY}
            r={RADIUS * lvl}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {cats.map((c) => (
          <line
            key={c.id}
            x1={CX}
            y1={CY}
            x2={c.gridTip.x}
            y2={c.gridTip.y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon */}
        {dataPath && (
          <motion.path
            d={dataPath}
            fill={`${accentColor}1A`}
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
        )}

        {/* Data points */}
        {cats.map((c, i) => (
          <motion.circle
            key={c.id}
            cx={c.point.x}
            cy={c.point.y}
            r={4}
            fill={accentColor}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 4, opacity: 1 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
          />
        ))}

        {/* Labels */}
        {cats.map((c) => {
          const dx = c.labelTip.x - CX;
          const dy = c.labelTip.y - CY;
          const anchor =
            Math.abs(dx) < 12 ? "middle" : dx > 0 ? "start" : "end";
          const yOff = dy < -20 ? -8 : 14;
          return (
            <g key={`lbl-${c.id}`}>
              <text
                x={c.labelTip.x}
                y={c.labelTip.y + yOff}
                textAnchor={anchor}
                fontSize="9"
                fill={c.color}
                fontWeight="700"
                fontFamily="inherit"
              >
                {c.emoji} {c.label.split(" ")[0]}
              </text>
              <text
                x={c.labelTip.x}
                y={c.labelTip.y + yOff + 11}
                textAnchor={anchor}
                fontSize="8"
                fill="rgba(255,255,255,0.28)"
                fontFamily="inherit"
              >
                {c.accuracy}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2">
        {cats.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-1.5 text-[9px] text-white/30"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: c.color }}
            />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
