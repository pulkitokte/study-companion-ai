import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Trophy, Clock, Trash2, RefreshCw } from "lucide-react";
import {
  getQuizHistory,
  clearQuizHistory,
  getPerformanceStats,
} from "../../utils/quizStorage.js";
import { ACHIEVEMENTS, getRank } from "../../utils/quizCalculations.js";
import { getUnlockedAchievements } from "../../utils/quizStorage.js";
import StreakTracker from "./StreakTracker.jsx";
import XPBreakdown from "./XPBreakdown.jsx";
import CategoryStats from "./CategoryStats.jsx";
import PerformanceRadar from "./PerformanceRadar.jsx";
import RecentSessions from "./RecentSessions.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "subjects", label: "Subjects", icon: Trophy },
  { id: "sessions", label: "History", icon: Clock },
  { id: "rank", label: "Rank", icon: Trophy },
];

export default function QuizHistory({ onBack }) {
  const [tab, setTab] = useState("overview");
  const [refresh, setRefresh] = useState(0);

  const stats = useMemo(() => getPerformanceStats(), [refresh]);
  const history = useMemo(() => getQuizHistory(), [refresh]);
  const unlocked = useMemo(() => getUnlockedAchievements(), [refresh]);
  const rank = getRank(stats.totalXP);

  const handleClear = () => {
    if (!window.confirm("Clear all quiz history? Cannot be undone.")) return;
    clearQuizHistory();
    setRefresh((v) => v + 1);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{rank.emoji}</span>
            <span
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: rank.color }}
            >
              {rank.label}
            </span>
          </div>
          <h2 className="text-[22px] font-black text-white leading-tight">
            Performance Hub
          </h2>
          <p className="text-[11px] text-white/28 mt-0.5">
            {stats.totalQuizzes} quizzes · {stats.totalXP.toLocaleString()} XP
            total
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setRefresh((v) => v + 1)}
            className="p-2 rounded-lg text-white/22 hover:text-white/55 hover:bg-white/[0.05] border border-white/[0.07] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
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
              <StreakTracker stats={stats} />
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <p className="text-[10px] text-white/22 uppercase tracking-widest mb-4">
                  Performance Radar
                </p>
                <PerformanceRadar
                  categoryStats={stats.categoryStats}
                  accentColor="#7C6FFF"
                />
              </div>
              {/* Achievements grid */}
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-white/22 uppercase tracking-widest">
                    Achievements
                  </p>
                  <span className="text-[10px] text-white/18">
                    {unlocked.length} / {Object.keys(ACHIEVEMENTS).length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(ACHIEVEMENTS).map(([id, meta]) => {
                    const isUnlocked = unlocked.includes(id);
                    return (
                      <motion.div
                        key={id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200"
                        style={{
                          background: isUnlocked
                            ? `${meta.color}0A`
                            : "rgba(255,255,255,0.02)",
                          borderColor: isUnlocked
                            ? `${meta.color}28`
                            : "rgba(255,255,255,0.05)",
                          opacity: isUnlocked ? 1 : 0.42,
                        }}
                      >
                        <span className="text-xl">
                          {isUnlocked ? meta.emoji : "🔒"}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-[11px] font-bold leading-tight truncate"
                            style={{
                              color: isUnlocked
                                ? meta.color
                                : "rgba(255,255,255,0.28)",
                            }}
                          >
                            {meta.label}
                          </p>
                          <p className="text-[9px] text-white/20 leading-snug">
                            {meta.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "subjects" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <CategoryStats categoryStats={stats.categoryStats} />
            </div>
          )}

          {tab === "sessions" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-white/22 uppercase tracking-widest">
                  Quiz Sessions
                </p>
                <span className="text-[10px] text-white/18">
                  {history.length} total
                </span>
              </div>
              <RecentSessions sessions={history} limit={30} />
            </div>
          )}

          {tab === "rank" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <XPBreakdown
                totalXP={stats.totalXP}
                categoryStats={stats.categoryStats}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
