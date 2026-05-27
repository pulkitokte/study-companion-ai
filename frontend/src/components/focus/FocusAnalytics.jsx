import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Clock, Zap, Target, Flame, Trash2 } from "lucide-react";
import {
  getFocusHistory,
  getFocusStats,
  clearFocusHistory,
} from "../../utils/focusStorage.js";
import StreakCalendar from "./StreakCalendar.jsx";
import FocusXPBreakdown from "./FocusXPBreakdown.jsx";
import SessionHistory from "./SessionHistory.jsx";
import ProductivityRadar from "./ProductivityRadar.jsx";
import FocusAchievements from "./FocusAchievements.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "sessions", label: "History", icon: Clock },
  { id: "rank", label: "Rank & XP", icon: Zap },
  { id: "achievements", label: "Achievements", icon: Target },
];

export default function FocusAnalytics({ onBack }) {
  const [tab, setTab] = useState("overview");
  const [refresh, setRefresh] = useState(0);

  const stats = useMemo(() => getFocusStats(), [refresh]);
  const history = useMemo(() => getFocusHistory(), [refresh]);

  const handleClear = () => {
    if (!window.confirm("Clear all focus history? Cannot be undone.")) return;
    clearFocusHistory();
    setRefresh((v) => v + 1);
  };

  // Weekly totals (last 7 days)
  const weeklyMins = useMemo(() => {
    const today = new Date();
    let total = 0;
    history.forEach((s) => {
      const d = new Date(s.date || 0);
      const diff = (today - d) / 86400000;
      if (diff < 7) total += s.durationMinutes ?? 0;
    });
    return total;
  }, [history]);

  const prodScore = useMemo(() => {
    if (!stats.totalSessions) return 0;
    const streakPct = Math.min((stats.recentStreak ?? 0) / 30, 1) * 35;
    const sessionsPct = Math.min(stats.totalSessions / 50, 1) * 35;
    const avgPct = Math.min((stats.averageMinutes ?? 0) / 90, 1) * 30;
    return Math.round(streakPct + sessionsPct + avgPct);
  }, [stats]);

  const OVERVIEW_STATS = [
    {
      icon: Clock,
      val: `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`,
      label: "Total Focus",
      color: "#7C6FFF",
    },
    {
      icon: Flame,
      val: `${weeklyMins}m`,
      label: "This Week",
      color: "#FF6B2B",
    },
    {
      icon: Target,
      val: `${stats.averageMinutes}m`,
      label: "Avg Session",
      color: "#00FFC8",
    },
    { icon: Zap, val: `${prodScore}%`, label: "Prod. Score", color: "#FFB347" },
  ];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-black text-white">Focus Analytics</h2>
          <p className="text-[11px] text-white/28 mt-0.5">
            {stats.totalSessions} sessions · {stats.totalXP.toLocaleString()} XP
            · {stats.recentStreak}d streak
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-white/22 hover:text-red-400/65 hover:bg-red-500/[0.07] border border-white/[0.07] hover:border-red-500/18 transition-all"
              title="Clear history"
            >
              <Trash2 size={14} />
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/38 hover:text-white/65 hover:bg-white/[0.05] border border-white/[0.07] transition-all"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border shrink-0 text-[11px] font-bold transition-all duration-200"
              style={{
                background: isActive
                  ? "rgba(124,111,255,0.12)"
                  : "rgba(255,255,255,0.025)",
                borderColor: isActive
                  ? "rgba(124,111,255,0.45)"
                  : "rgba(255,255,255,0.07)",
                color: isActive ? "#7C6FFF" : "rgba(255,255,255,0.32)",
              }}
            >
              <Icon size={11} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "overview" && (
            <div className="space-y-5">
              {/* Stat grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OVERVIEW_STATS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-white/[0.07]"
                      style={{ background: "rgba(255,255,255,0.025)" }}
                    >
                      <Icon size={14} style={{ color: s.color }} />
                      <span className="text-[18px] font-black text-white leading-none">
                        {s.val}
                      </span>
                      <span className="text-[9px] text-white/22 uppercase tracking-wider text-center">
                        {s.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Calendar */}
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <StreakCalendar stats={stats} />
              </div>

              {/* Radar */}
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <p className="text-[10px] text-white/22 uppercase tracking-widest mb-4">
                  Productivity Radar
                </p>
                <ProductivityRadar stats={stats} />
              </div>
            </div>
          )}

          {tab === "sessions" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-white/22 uppercase tracking-widest">
                  Session Log
                </p>
                <span className="text-[10px] text-white/18">
                  {history.length} total
                </span>
              </div>
              <SessionHistory sessions={history} />
            </div>
          )}

          {tab === "rank" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <FocusXPBreakdown stats={stats} />
            </div>
          )}

          {tab === "achievements" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <FocusAchievements stats={stats} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
