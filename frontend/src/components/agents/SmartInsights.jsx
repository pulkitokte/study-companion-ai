import { motion } from "framer-motion";
// FIX: removed malformed first import line (`from 'lucide-search'` — package does not exist,
// syntax was invalid and caused a build-time parse error crashing AICoach → CoachPanel → here).
// FIX: removed unused `useMemo` import (never called in this component).
import {
  TrendingUp as TUp,
  TrendingDown as TDown,
  Minus,
  Brain,
  Timer,
  Trophy,
  Target,
} from "lucide-react";
import { useAgent } from "../../hooks/useAgent.js";

// ─── MINI BAR CHART (pure SVG-free, div-based) ────────────────────
function MiniBar({ data, color }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-1" style={{ height: 70 }}>
      {data.map((d, i) => (
        <motion.div
          key={d.date ?? i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max((d.total / max) * 100, 3)}%` }}
          transition={{ duration: 0.4, delay: i * 0.02, ease: "easeOut" }}
          className="flex-1 rounded-t-sm"
          style={{ background: `${color}60`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

// ─── TREND BADGE ──────────────────────────────────────────────────
function TrendBadge({ trend, change }) {
  const Icon = trend === "up" ? TUp : trend === "down" ? TDown : Minus;
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function SmartInsights() {
  const {
    getCoachAnalysis,
    getFocusAnalysis,
    getProgressForecast,
    getNextAchievements,
  } = useAgent();

  const coach = getCoachAnalysis();
  const focus = getFocusAnalysis();
  const forecast = getProgressForecast();
  const nextAchievements = getNextAchievements();

  // Build bar data — 14 zero-filled slots when no real timeline is available
  // (real XP timeline wired via xpTimeline in Phase 22+ once data layer is unified)
  const barData =
    coach.breakdown?.length > 0
      ? Array.from({ length: 14 }, (_, i) => ({ date: i, total: 0 }))
      : [];

  // Safe trend access — getWeeklyTrend() always returns object, never null
  const weekTrend = coach.trend ?? { trend: "flat", change: 0 };

  return (
    <div className="space-y-5">
      {/* XP trend card */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-[#7C6FFF]" />
            <span className="text-[12px] font-bold text-white">
              Learning Trend
            </span>
          </div>
          <TrendBadge trend={weekTrend.trend} change={weekTrend.change} />
        </div>

        <MiniBar data={barData} color="#7C6FFF" />
        <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
          {coach.summary}
        </p>

        {(coach.weakSubjects?.length > 0 ||
          coach.strongSubjects?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/[0.05]">
            <div>
              <p className="text-[9px] text-white/22 uppercase tracking-wider mb-1.5">
                Needs Work
              </p>
              {!coach.weakSubjects?.length ? (
                <p className="text-[11px] text-white/25">None — nice work!</p>
              ) : (
                coach.weakSubjects.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-[11px] text-white/55">
                      {s.emoji} {s.label}
                    </span>
                    <span className="text-[11px] font-bold text-[#FF6B6B]">
                      {s.accuracy}%
                    </span>
                  </div>
                ))
              )}
            </div>
            <div>
              <p className="text-[9px] text-white/22 uppercase tracking-wider mb-1.5">
                Strengths
              </p>
              {!coach.strongSubjects?.length ? (
                <p className="text-[11px] text-white/25">
                  Keep practicing to build strengths
                </p>
              ) : (
                coach.strongSubjects.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-[11px] text-white/55">
                      {s.emoji} {s.label}
                    </span>
                    <span className="text-[11px] font-bold text-[#00FFC8]">
                      {s.accuracy}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Focus + Forecast row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Focus patterns */}
        <div
          className="rounded-2xl border border-white/[0.06] p-5 space-y-2.5"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Timer size={14} className="text-[#00FFC8]" />
            <span className="text-[12px] font-bold text-white">
              Focus Patterns
            </span>
          </div>
          {!focus.hasData ? (
            <p className="text-[11px] text-white/25">
              No focus sessions logged yet.
            </p>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-[11px] text-white/35">Avg session</span>
                <span className="text-[11px] font-bold text-white/70">
                  {focus.avgSessionMins}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-white/35">
                  Completion rate
                </span>
                <span className="text-[11px] font-bold text-white/70">
                  {focus.completionRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-white/35">
                  Preferred mode
                </span>
                <span className="text-[11px] font-bold text-white/70 capitalize">
                  {focus.preferredMode ?? "—"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Growth forecast */}
        <div
          className="rounded-2xl border border-white/[0.06] p-5 space-y-2.5"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-[#FFB347]" />
            <span className="text-[12px] font-bold text-white">
              Growth Forecast
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/35">Avg daily XP</span>
            <span className="text-[11px] font-bold text-white/70">
              {forecast.avgDailyXP}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/35">Next level in</span>
            <span className="text-[11px] font-bold text-white/70">
              {forecast.daysToNextLevel ? `${forecast.daysToNextLevel}d` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-white/35">30-day projection</span>
            <span className="text-[11px] font-bold text-[#FFB347]">
              +{(forecast.projection30Day ?? 0).toLocaleString()} XP
            </span>
          </div>
          {forecast.nextRank && (
            <div className="flex justify-between">
              <span className="text-[11px] text-white/35">Next rank</span>
              <span
                className="text-[11px] font-bold"
                style={{ color: forecast.nextRank.color }}
              >
                {forecast.nextRank.emoji} {forecast.nextRank.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Near-unlock achievements */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={14} className="text-[#FFD700]" />
          <span className="text-[12px] font-bold text-white">
            Close to Unlocking
          </span>
        </div>
        {nextAchievements.length === 0 ? (
          <p className="text-[11px] text-white/25">
            All achievements unlocked — incredible!
          </p>
        ) : (
          <div className="space-y-2.5">
            {nextAchievements.map((a) => (
              <div key={a.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/55">
                    {a.emoji} {a.label}
                  </span>
                  <span className="text-[10px] text-white/25">
                    {Math.round(a.closeness * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${a.closeness * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: a.color ?? "#FFD700" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
