import { useMemo } from "react";
import { motion } from "framer-motion";

const SIZE = { w: 700, h: 420 };
const CENTER = { x: 350, y: 210 };
const R = 140;

const NODES = [
  {
    id: "core",
    label: "Global State",
    sub: "globalStats.js",
    x: 350,
    y: 210,
    r: 38,
    color: "#00FFC8",
    primary: true,
  },
  {
    id: "quiz",
    label: "Quiz Arena",
    sub: "quizStorage.js",
    angle: -90,
    color: "#FFB347",
  },
  {
    id: "focus",
    label: "Focus Mode",
    sub: "focusStorage.js",
    angle: -18,
    color: "#B5FF47",
  },
  {
    id: "progress",
    label: "Progress",
    sub: "progressStorage",
    angle: 54,
    color: "#7C6FFF",
  },
  {
    id: "planner",
    label: "Planner",
    sub: "plannerStorage.js",
    angle: 126,
    color: "#4FC3F7",
  },
  {
    id: "chat",
    label: "AI Companion",
    sub: "Gemini API",
    angle: 198,
    color: "#FF6B9D",
  },
].map((n) => {
  if (n.primary) return n;
  const rad = (n.angle * Math.PI) / 180;
  return {
    ...n,
    x: CENTER.x + R * Math.cos(rad),
    y: CENTER.y + R * Math.sin(rad),
    r: 28,
  };
});

const EDGES = NODES.filter((n) => !n.primary).map((n) => ({
  from: "core",
  to: n.id,
}));

export default function SystemArchitecture() {
  const nodeMap = useMemo(
    () => Object.fromEntries(NODES.map((n) => [n.id, n])),
    [],
  );

  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <p className="text-[13px] font-bold text-white">
          Ecosystem Architecture
        </p>
        <p className="text-[11px] text-white/28 mt-0.5">
          How the modules connect via the global stats engine
        </p>
      </div>
      <div className="overflow-x-auto">
        <svg
          width={SIZE.w}
          height={SIZE.h}
          viewBox={`0 0 ${SIZE.w} ${SIZE.h}`}
          className="mx-auto block"
          style={{ minWidth: 340 }}
        >
          {/* Ambient glow */}
          <defs>
            {NODES.map((n) => (
              <radialGradient
                key={`g-${n.id}`}
                id={`grd-${n.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={n.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={n.color} stopOpacity="0" />
              </radialGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring */}
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Edges */}
          {EDGES.map(({ from, to }, i) => {
            const a = nodeMap[from],
              b = nodeMap[to];
            return (
              <g key={`e-${to}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={b.color}
                  strokeWidth="1"
                  strokeOpacity="0.2"
                />
                <motion.circle
                  r={3}
                  fill={b.color}
                  initial={false}
                  animate={{
                    cx: [a.x, b.x, a.x],
                    cy: [a.y, b.y, a.y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    delay: i * 0.4,
                    ease: "linear",
                  }}
                  style={{ filter: `drop-shadow(0 0 4px ${b.color})` }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((n, i) => (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2 + i * 0.1,
                duration: 0.4,
                type: "spring",
              }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            >
              {/* Glow backdrop */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r + 16}
                fill={`url(#grd-${n.id})`}
              />
              {/* Pulse */}
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="none"
                stroke={n.color}
                strokeWidth="1"
                animate={{ r: [n.r, n.r + 8, n.r], opacity: [0.4, 0, 0.4] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8 + i * 0.3,
                  ease: "easeInOut",
                }}
              />
              {/* Main circle */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={`${n.color}18`}
                stroke={n.color}
                strokeWidth={n.primary ? 2 : 1.5}
                style={{
                  filter: `drop-shadow(0 0 ${n.primary ? 12 : 6}px ${n.color}60)`,
                }}
              />
              {/* Label */}
              <text
                x={n.x}
                y={n.y - 4}
                textAnchor="middle"
                fontSize={n.primary ? 11 : 10}
                fill={n.color}
                fontWeight="700"
                fontFamily="inherit"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 9}
                textAnchor="middle"
                fontSize="8"
                fill="rgba(255,255,255,0.3)"
                fontFamily="inherit"
              >
                {n.sub}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-5 pb-4 justify-center">
        {NODES.filter((n) => !n.primary).map((n) => (
          <div
            key={n.id}
            className="flex items-center gap-1.5 text-[9px] text-white/30"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: n.color }}
            />
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
}
