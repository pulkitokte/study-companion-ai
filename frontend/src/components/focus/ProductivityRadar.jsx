import { useMemo } from "react";
import { motion } from "framer-motion";
import { getFocusHistory } from "../../utils/focusStorage.js";

const SIZE = 220,
  CX = 110,
  CY = 110,
  R = 80;

function polar(deg, r) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function toPath(pts) {
  return (
    pts
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
      )
      .join(" ") + "Z"
  );
}

const AXES = [
  { id: "consistency", label: "Consistency", color: "#00FFC8" },
  { id: "deepwork", label: "Deep Work", color: "#7C6FFF" },
  { id: "streak", label: "Streak", color: "#FF6B2B" },
  { id: "xpRate", label: "XP Rate", color: "#FFB347" },
  { id: "duration", label: "Endurance", color: "#FF6B9D" },
  { id: "morningPct", label: "Early Bird", color: "#FFD700" },
];

export default function ProductivityRadar({ stats }) {
  const history = getFocusHistory();

  const scores = useMemo(() => {
    if (!history.length) return AXES.map(() => 0);

    const totalSessions = history.length;
    const avgMins = stats.averageMinutes ?? 0;
    const deepCount = history.filter((s) => s.mode === "deepwork").length;
    const streak = Math.min(stats.recentStreak ?? 0, 30);
    const totalXP = stats.totalXP ?? 0;

    const morningCount = history.filter((s) => {
      const h = new Date(s.date || 0).getHours();
      return h >= 5 && h < 10;
    }).length;

    const activeDays = new Set(
      history.map((s) => s.date?.slice(0, 10)).filter(Boolean),
    );
    const daysSinceFirst = history.length
      ? Math.max(
          1,
          Math.round(
            (Date.now() - new Date(history[history.length - 1].date)) /
              86400000,
          ),
        )
      : 1;
    const consistency = Math.min((activeDays.size / daysSinceFirst) * 100, 100);

    return [
      Math.round(consistency), // Consistency
      Math.round(Math.min((deepCount / totalSessions) * 100, 100)), // Deep Work ratio
      Math.round(Math.min((streak / 30) * 100, 100)), // Streak (max 30)
      Math.round(Math.min((totalXP / 5000) * 100, 100)), // XP rate
      Math.round(Math.min((avgMins / 90) * 100, 100)), // Duration endurance
      Math.round(Math.min((morningCount / totalSessions) * 100, 100)), // Morning %
    ];
  }, [history, stats]);

  const points = AXES.map((ax, i) => {
    const angle = (360 / AXES.length) * i;
    const r = (scores[i] / 100) * R;
    return {
      ...ax,
      angle,
      score: scores[i],
      point: polar(angle, r),
      tip: polar(angle, R + 18),
    };
  });

  const hasData = scores.some((s) => s > 0);
  const dataPath = hasData ? toPath(points.map((p) => p.point)) : "";

  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-3xl">🕸️</span>
        <p className="text-[12px] text-white/28">
          Complete more sessions to unlock the radar.
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
      >
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((lvl) => (
          <circle
            key={lvl}
            cx={CX}
            cy={CY}
            r={R * lvl}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {points.map((p) => (
          <line
            key={p.id}
            x1={CX}
            y1={CY}
            x2={polar(p.angle, R).x}
            y2={polar(p.angle, R).y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}
        {/* Data polygon */}
        {dataPath && (
          <motion.path
            d={dataPath}
            fill="rgba(0,255,200,0.12)"
            stroke="#00FFC8"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
        )}
        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={p.id}
            cx={p.point.x}
            cy={p.point.y}
            r={4}
            fill={p.color}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            style={{ filter: `drop-shadow(0 0 4px ${p.color})` }}
          />
        ))}
        {/* Labels */}
        {points.map((p) => {
          const dx = p.tip.x - CX;
          const dy = p.tip.y - CY;
          const anchor =
            Math.abs(dx) < 10 ? "middle" : dx > 0 ? "start" : "end";
          const yOff = dy < -20 ? -8 : 14;
          return (
            <g key={`lbl-${p.id}`}>
              <text
                x={p.tip.x}
                y={p.tip.y + yOff}
                textAnchor={anchor}
                fontSize="9"
                fill={p.color}
                fontWeight="700"
                fontFamily="inherit"
              >
                {p.label}
              </text>
              <text
                x={p.tip.x}
                y={p.tip.y + yOff + 11}
                textAnchor={anchor}
                fontSize="8"
                fill="rgba(255,255,255,0.28)"
                fontFamily="inherit"
              >
                {p.score}%
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {points.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1.5 text-[9px] text-white/28"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}
