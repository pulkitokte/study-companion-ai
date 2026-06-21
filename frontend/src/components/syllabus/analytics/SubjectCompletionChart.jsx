import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { BookOpen } from "lucide-react";

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-white/[0.12] px-3 py-2.5 shadow-xl"
      style={{ background: "#0D0D1A", minWidth: 160 }}
    >
      <p className="text-[12px] font-black text-white mb-2">
        {d.emoji} {d.fullName}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-[10px] text-white/40">Done</span>
          <span className="text-[10px] font-bold" style={{ color: d.color }}>
            {d.done} / {d.total}
          </span>
        </div>
        {d.mastered > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-[10px] text-white/40">Mastered</span>
            <span className="text-[10px] font-bold text-[#FFD700]">
              ★ {d.mastered}
            </span>
          </div>
        )}
        {d.revisionNeeded > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-[10px] text-white/40">Review</span>
            <span className="text-[10px] font-bold text-[#FF6B2B]">
              {d.revisionNeeded}
            </span>
          </div>
        )}
        {d.xpEarned > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-[10px] text-white/40">XP</span>
            <span className="text-[10px] font-bold text-[#7C6FFF]">
              {d.xpEarned.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOM Y-AXIS TICK ───────────────────────────────────────────────────────
function YAxisTick({ x, y, payload }) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="rgba(255,255,255,0.45)"
      fontSize={11}
      fontWeight={600}
    >
      {payload.value}
    </text>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SubjectCompletionChart({ subjectBars }) {
  // Empty state
  if (!Array.isArray(subjectBars) || subjectBars.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 py-12 rounded-2xl border border-white/[0.05]"
        style={{ background: "#0A0A14" }}
      >
        <BookOpen size={24} className="text-white/15" />
        <p className="text-[12px] text-white/25">No subject data yet</p>
      </div>
    );
  }

  const BAR_HEIGHT = 28;
  const GAP = 14;
  const chartHeight = subjectBars.length * (BAR_HEIGHT + GAP) + 20;

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "#0A0A14" }}
    >
      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">
        Completion by Subject
      </p>

      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={subjectBars}
            margin={{ top: 0, right: 46, bottom: 0, left: 8 }}
            barCategoryGap={GAP}
          >
            <XAxis type="number" domain={[0, 100]} hide />

            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={<YAxisTick />}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.025)" }}
            />

            <Bar
              dataKey="pct"
              radius={[0, 5, 5, 0]}
              maxBarSize={BAR_HEIGHT}
              background={{
                fill: "rgba(255,255,255,0.04)",
                radius: [0, 5, 5, 0],
              }}
            >
              {subjectBars.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  fillOpacity={entry.pct > 0 ? 0.85 : 0}
                />
              ))}
              <LabelList
                dataKey="pct"
                position="right"
                formatter={(v) => (v > 0 ? `${v}%` : "")}
                style={{
                  fill: "rgba(255,255,255,0.38)",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
