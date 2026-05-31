import { useMemo } from "react";
import { motion } from "framer-motion";
import { useProgress } from "../../context/ProgressContext.jsx";

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

export default function ProgressRadar() {
  const { stats } = useProgress();

  const axes = useMemo(() => {
    const s = stats;
    const quizAcc = Math.min(s.quizAccuracy ?? 0, 100);
    const focusCons = Math.min(((s.totalFocusSessions ?? 0) / 50) * 100, 100);
    const streakSc = Math.min(((s.streak ?? 0) / 30) * 100, 100);
    const xpSc = Math.min(((s.totalXP ?? 0) / 5000) * 100, 100);
    const levelSc = Math.min(((s.level ?? 1) / 50) * 100, 100);
    const achSc = Math.min(
      ((s.achievementsUnlocked ?? 0) / Object.keys({}).length || 0) * 100,
      100,
    );

    return [
      { label: "Quiz Skill", score: quizAcc, color: "#FFB347" },
      { label: "Focus", score: focusCons, color: "#7C6FFF" },
      { label: "Streak", score: streakSc, color: "#FF6B2B" },
      { label: "XP", score: xpSc, color: "#FFD700" },
      { label: "Level", score: levelSc, color: "#00FFC8" },
      { label: "Achievements", score: achSc, color: "#FF6B9D" },
    ].map((ax, i, arr) => {
      const angle = (360 / arr.length) * i;
      const r = (ax.score / 100) * R;
      return {
        ...ax,
        angle,
        point: polar(angle, r),
        tip: polar(angle, R + 20),
      };
    });
  }, [stats]);

  const hasData = axes.some((a) => a.score > 0);
  const dataPath = hasData ? toPath(axes.map((a) => a.point)) : "";

  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="text-3xl">🕸️</span>
        <p className="text-[12px] text-white/28">
          Complete activities to unlock the radar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
      >
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
        {axes.map((a) => (
          <line
            key={a.label}
            x1={CX}
            y1={CY}
            x2={polar(a.angle, R).x}
            y2={polar(a.angle, R).y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}
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
        {axes.map((a, i) => (
          <motion.circle
            key={a.label}
            cx={a.point.x}
            cy={a.point.y}
            r={4}
            fill={a.color}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            style={{ filter: `drop-shadow(0 0 4px ${a.color})` }}
          />
        ))}
        {axes.map((a) => {
          const dx = a.tip.x - CX,
            dy = a.tip.y - CY;
          const anchor =
            Math.abs(dx) < 10 ? "middle" : dx > 0 ? "start" : "end";
          const yOff = dy < -20 ? -8 : 14;
          return (
            <g key={`lbl-${a.label}`}>
              <text
                x={a.tip.x}
                y={a.tip.y + yOff}
                textAnchor={anchor}
                fontSize="9"
                fill={a.color}
                fontWeight="700"
                fontFamily="inherit"
              >
                {a.label}
              </text>
              <text
                x={a.tip.x}
                y={a.tip.y + yOff + 11}
                textAnchor={anchor}
                fontSize="8"
                fill="rgba(255,255,255,0.28)"
                fontFamily="inherit"
              >
                {Math.round(a.score)}%
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {axes.map((a) => (
          <div
            key={a.label}
            className="flex items-center gap-1.5 text-[9px] text-white/28"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: a.color }}
            />
            {a.label}
          </div>
        ))}
      </div>
    </div>
  );
}
