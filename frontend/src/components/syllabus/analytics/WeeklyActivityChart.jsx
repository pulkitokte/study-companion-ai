import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ACCENT = "#00FFC8";
const GRADIENT_ID = "syllabusWeeklyGradient";

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ActivityTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-white/[0.12] px-3 py-2.5 shadow-xl"
      style={{ background: "#0D0D1A", minWidth: 120 }}
    >
      <p className="text-[11px] font-black text-white mb-1.5">{d.label}</p>
      {d.topics > 0 ? (
        <>
          <p style={{ color: ACCENT }} className="text-[11px] font-bold">
            {d.topics} topic{d.topics !== 1 ? "s" : ""}
          </p>
          {d.xp > 0 && (
            <p className="text-[10px] text-[#7C6FFF] mt-0.5">+{d.xp} XP</p>
          )}
        </>
      ) : (
        <p className="text-[11px] text-white/25">No activity</p>
      )}
    </div>
  );
}

// ─── CUSTOM DOT ───────────────────────────────────────────────────────────────
// Renders a visible dot only on days with activity; invisible otherwise.
function ActiveDot(props) {
  const { cx, cy, payload } = props;
  if (!payload?.topics) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={ACCENT}
      stroke="#0A0A14"
      strokeWidth={2}
    />
  );
}

function InactiveDot() {
  return null;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WeeklyActivityChart({ weeklyData }) {
  const data =
    Array.isArray(weeklyData) && weeklyData.length > 0 ? weeklyData : [];

  // Determine if there's any activity at all
  const hasActivity = data.some((d) => d.topics > 0);

  // Y-axis max: at least 3 so empty chart isn't compressed to a line at zero
  const maxTopics = Math.max(...data.map((d) => d.topics), 3);
  const yMax = Math.ceil(maxTopics * 1.25);

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
          14-Day Activity
        </p>
        {!hasActivity && (
          <p className="text-[10px] text-white/22 italic">
            Complete topics to build your streak
          </p>
        )}
      </div>

      <div style={{ width: "100%", height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 8, bottom: 0, left: -18 }}
          >
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fill: "rgba(255,255,255,0.28)",
                fontSize: 10,
                fontWeight: 600,
              }}
              axisLine={false}
              tickLine={false}
              // Show every other label to avoid crowding on mobile
              interval={1}
            />

            <YAxis
              allowDecimals={false}
              domain={[0, yMax]}
              tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip
              content={<ActivityTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.08)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="topics"
              stroke={ACCENT}
              strokeWidth={2}
              fill={`url(#${GRADIENT_ID})`}
              dot={<InactiveDot />}
              activeDot={<ActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
