import { motion } from "framer-motion";
import XPCard from "./XPCard.jsx";
import LevelCard from "./LevelCard.jsx";
import StreakPanel from "./StreakPanel.jsx";
import DailyMissions from "./DailyMissions.jsx";
import ProgressRadar from "./ProgressRadar.jsx";
import RankJourney from "./RankJourney.jsx";
import AchievementGrid from "./AchievementGrid.jsx";
import RecentActivity from "./RecentActivity.jsx";
import { useProgress } from "../../context/ProgressContext.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const I = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};

export default function ProgressHome() {
  const { stats } = useProgress();

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Hero bar */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.05),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right,rgba(0,255,200,0.12),transparent 70%)",
          }}
        />
        <div className="relative">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#00FFC8] uppercase mb-1">
            Performance OS
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Level {stats.level ?? 1} · {stats.rank?.label ?? "Rookie"}{" "}
            {stats.rank?.emoji ?? "🥉"}
          </h2>
          <p className="text-[12px] text-white/35 mt-1">
            {stats.rank?.description ?? ""}
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3 shrink-0">
          {[
            {
              val: (stats.totalXP ?? 0).toLocaleString(),
              label: "Total XP",
              color: "#FFD700",
            },
            { val: stats.streak ?? 0, label: "Day Streak", color: "#FF6B2B" },
            {
              val: stats.achievementsUnlocked ?? 0,
              label: "Achievements",
              color: "#7C6FFF",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center px-4 py-2 rounded-xl border border-white/[0.07] bg-white/[0.03]"
            >
              <span
                className="text-[20px] font-black text-white leading-none"
                style={{ color: s.color }}
              >
                {s.val}
              </span>
              <span className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top row: XP + Level */}
      <motion.div
        variants={I}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <XPCard />
        <LevelCard />
      </motion.div>

      {/* Streak */}
      <motion.div variants={I}>
        <StreakPanel />
      </motion.div>

      {/* Daily Missions */}
      <motion.div variants={I}>
        <DailyMissions />
      </motion.div>

      {/* Radar + Rank Journey */}
      <motion.div
        variants={I}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <p className="text-[10px] text-white/22 uppercase tracking-widest mb-4">
            Performance Radar
          </p>
          <ProgressRadar />
        </div>
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <RankJourney />
          <div className="mt-5 space-y-2">
            <p className="text-[10px] text-white/22 uppercase tracking-widest">
              Quick Stats
            </p>
            {[
              { label: "Total Quizzes", val: stats.totalQuizzes ?? 0 },
              { label: "Focus Sessions", val: stats.totalFocusSessions ?? 0 },
              { label: "Focus Time", val: `${stats.focusMinutes ?? 0}m` },
              {
                label: "Avg Quiz Accuracy",
                val: `${stats.quizAccuracy ?? 0}%`,
              },
            ].map((s) => (
              <div key={s.label} className="flex justify-between text-[12px]">
                <span className="text-white/38">{s.label}</span>
                <span className="font-bold text-white/75">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <AchievementGrid />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[10px] text-white/22 uppercase tracking-widest mb-4">
          Recent Activity
        </p>
        <RecentActivity limit={8} />
      </motion.div>
    </motion.div>
  );
}
