import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-white/[0.12] px-3 py-2 shadow-xl"
      style={{ background: "#0D0D1A" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-[11px] font-bold text-white">{name}</span>
      </div>
      <p className="text-[10px] text-white/45 pl-4">
        {value} topic{value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * @param {Array}  statusSlices - from buildStatusSlices()
 * @param {number} examPct      - from examProgress.pct (0–100)
 */
export default function TopicStatusDonut({ statusSlices, examPct = 0 }) {
  const slices =
    Array.isArray(statusSlices) && statusSlices.length > 0
      ? statusSlices
      : [{ name: "Not Started", value: 1, color: "rgba(255,255,255,0.12)" }];

  const DONUT_HEIGHT = 220;
  const INNER_RADIUS = 62;
  const OUTER_RADIUS = 88;

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "#0A0A14" }}
    >
      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">
        Topic Status Distribution
      </p>

      {/* Chart + centre label overlay */}
      <div style={{ position: "relative", height: DONUT_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              dataKey="value"
              paddingAngle={slices.length > 1 ? 2 : 0}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {slices.map((slice, i) => (
                <Cell key={`${slice.name}-${i}`} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label — positioned over the donut hole */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p className="text-[28px] font-black text-white leading-none">
            {examPct}%
          </p>
          <p className="text-[10px] text-white/32 mt-1">complete</p>
        </div>
      </div>

      {/* Custom legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
        {slices.map((slice) => (
          <div key={slice.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: slice.color }}
            />
            <span className="text-[10px] text-white/38">{slice.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
