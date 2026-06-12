import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Swords,
  Timer,
} from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin.js";

function MiniBarChart({ data, valueKey, color, height = 100 }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
              className="w-full rounded-t-sm relative"
              style={{ background: `${color}70`, minHeight: 2 }}
            >
              <div
                className="absolute inset-0 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
            </motion.div>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <div
                className="text-[9px] font-bold text-white px-2 py-1 rounded-lg"
                style={{
                  background: "#0D0D1A",
                  border: `1px solid ${color}40`,
                }}
              >
                {d[valueKey]} XP
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendBadge({ trend, change }) {
  const Icon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const color =
    trend === "up" ? "#00FF64" : trend === "down" ? "#FF6B6B" : "#888";
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: `${color}14`, color }}
    >
      <Icon size={11} />
      <span className="text-[10px] font-bold">
        {change > 0 ? "+" : ""}
        {change}%
      </span>
    </div>
  );
}

export default function AnalyticsCharts() {
  const { analytics, overview } = useAdmin();
  const { xpTimeline, categoryBreakdown, focusBreakdown, weeklyTrend, events } =
    analytics;

  const totalCategoryXP = useMemo(
    () => categoryBreakdown.reduce((s, c) => s + c.xp, 0),
    [categoryBreakdown],
  );
  const totalFocusMins = useMemo(
    () => focusBreakdown.reduce((s, f) => s + f.minutes, 0),
    [focusBreakdown],
  );

  return (
    <div className="space-y-5">
      {/* XP Timeline */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[#00FFC8]" />
            <span className="text-[12px] font-bold text-white">
              XP Activity — Last 14 Days
            </span>
          </div>
          <TrendBadge trend={weeklyTrend.trend} change={weeklyTrend.change} />
        </div>
        <MiniBarChart
          data={xpTimeline}
          valueKey="total"
          color="#00FFC8"
          height={90}
        />
        <div className="flex justify-between mt-2 text-[9px] text-white/18">
          <span>{xpTimeline[0]?.date?.slice(5)}</span>
          <span>{xpTimeline[xpTimeline.length - 1]?.date?.slice(5)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.05]">
          <div>
            <p className="text-[9px] text-white/22 uppercase tracking-wider">
              This Week
            </p>
            <p className="text-[18px] font-black text-white">
              {weeklyTrend.thisWeekXP.toLocaleString()} XP
            </p>
          </div>
          <div>
            <p className="text-[9px] text-white/22 uppercase tracking-wider">
              Last Week
            </p>
            <p className="text-[18px] font-black text-white/40">
              {weeklyTrend.lastWeekXP.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Swords size={14} className="text-[#FFB347]" />
          <span className="text-[12px] font-bold text-white">
            Subject Engagement
          </span>
        </div>
        {categoryBreakdown.length === 0 ? (
          <p className="text-[12px] text-white/25 text-center py-6">
            No quiz data yet
          </p>
        ) : (
          <div className="space-y-2.5">
            {categoryBreakdown.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/55">
                    {cat.emoji} {cat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25">
                      {cat.sessions} sessions · {cat.accuracy}% acc
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: cat.color }}
                    >
                      {cat.xp} XP
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        totalCategoryXP > 0
                          ? `${(cat.xp / totalCategoryXP) * 100}%`
                          : "0%",
                    }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Focus mode breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Timer size={14} className="text-[#00FFC8]" />
            <span className="text-[12px] font-bold text-white">
              Focus Mode Usage
            </span>
          </div>
          {focusBreakdown.length === 0 ? (
            <p className="text-[12px] text-white/25 text-center py-6">
              No focus data yet
            </p>
          ) : (
            <div className="space-y-2.5">
              {focusBreakdown.map((f) => (
                <div key={f.mode} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/55 capitalize">
                    {f.mode}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-white/30">
                    <span>{f.sessions} sessions</span>
                    <span>
                      {totalFocusMins > 0
                        ? Math.round((f.minutes / totalFocusMins) * 100)
                        : 0}
                      %
                    </span>
                    <span className="font-bold text-[#00FFC8]">{f.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Local event tracking */}
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-[#7C6FFF]" />
            <span className="text-[12px] font-bold text-white">
              Top Routes Visited
            </span>
          </div>
          {events.byPath.length === 0 ? (
            <p className="text-[12px] text-white/25 text-center py-6">
              No route data yet
            </p>
          ) : (
            <div className="space-y-2">
              {events.byPath.slice(0, 5).map(([path, count]) => (
                <div key={path} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50 font-mono truncate">
                    {path || "/"}
                  </span>
                  <span className="text-[11px] font-bold text-[#7C6FFF]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Engagement summary */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[10px] text-white/22 uppercase tracking-widest mb-3">
          Engagement Snapshot
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Quiz Sessions",
              val: overview.counts.quizSessions,
              color: "#FFB347",
            },
            {
              label: "Focus Sessions",
              val: overview.counts.focusSessions,
              color: "#00FFC8",
            },
            {
              label: "Planner Tasks",
              val: overview.counts.plannerTasks,
              color: "#7C6FFF",
            },
            {
              label: "Achievements",
              val: overview.counts.achievements,
              color: "#FFD700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center py-3 rounded-xl border border-white/[0.05]"
              style={{ background: `${s.color}06` }}
            >
              <p className="text-[20px] font-black text-white">{s.val}</p>
              <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
