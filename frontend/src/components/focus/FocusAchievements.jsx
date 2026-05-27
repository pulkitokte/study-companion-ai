import { useMemo } from "react";
import { motion } from "framer-motion";
import { getFocusHistory, getFocusStats } from "../../utils/focusStorage.js";

const FOCUS_ACHIEVEMENTS = {
  first_session: {
    label: "First Lock-In",
    desc: "Complete your first focus session",
    emoji: "🎯",
    color: "#00FFC8",
  },
  session_5: {
    label: "Warming Up",
    desc: "Complete 5 focus sessions",
    emoji: "🔥",
    color: "#FF6B2B",
  },
  session_25: {
    label: "Dedicated",
    desc: "Complete 25 focus sessions",
    emoji: "💪",
    color: "#7C6FFF",
  },
  session_50: {
    label: "Machine",
    desc: "Complete 50 focus sessions",
    emoji: "⚙️",
    color: "#FFB347",
  },
  hour_club: {
    label: "Hour Club",
    desc: "Complete a 60+ minute session",
    emoji: "🕐",
    color: "#00FFC8",
  },
  two_hour: {
    label: "Marathon Mode",
    desc: "Complete a 2-hour deep work session",
    emoji: "🏃",
    color: "#7C6FFF",
  },
  streak_3: {
    label: "3-Day Focus",
    desc: "3 consecutive days of focus",
    emoji: "📅",
    color: "#00FFC8",
  },
  streak_7: {
    label: "Week Lock-In",
    desc: "7 consecutive days of focus",
    emoji: "🗓️",
    color: "#FFD700",
  },
  early_bird: {
    label: "Early Bird",
    desc: "Start a session before 7 AM",
    emoji: "🌅",
    color: "#FFD700",
  },
  night_owl: {
    label: "Night Owl",
    desc: "Start a session after 11 PM",
    emoji: "🌙",
    color: "#7C6FFF",
  },
  deep_devotee: {
    label: "Deep Devotee",
    desc: "Complete 10 deep work sessions",
    emoji: "🧠",
    color: "#7C6FFF",
  },
  xp_focus_500: {
    label: "Focus Earner",
    desc: "Earn 500 XP from focus sessions",
    emoji: "⭐",
    color: "#FFB347",
  },
  xp_focus_2000: {
    label: "Focus Legend",
    desc: "Earn 2,000 XP from focus",
    emoji: "👑",
    color: "#FFD700",
  },
  pomodoro_pro: {
    label: "Pomodoro Pro",
    desc: "Complete 20 Pomodoro sessions",
    emoji: "🍅",
    color: "#FF6B2B",
  },
};

function getUnlocked(history, stats) {
  const unlocked = new Set();
  const totalSessions = history.length;
  const deepCount = history.filter((s) => s.mode === "deepwork").length;
  const pomCount = history.filter((s) => s.mode === "pomodoro").length;
  const totalXP = stats.totalXP ?? 0;

  if (totalSessions >= 1) unlocked.add("first_session");
  if (totalSessions >= 5) unlocked.add("session_5");
  if (totalSessions >= 25) unlocked.add("session_25");
  if (totalSessions >= 50) unlocked.add("session_50");
  if (deepCount >= 10) unlocked.add("deep_devotee");
  if (pomCount >= 20) unlocked.add("pomodoro_pro");
  if (totalXP >= 500) unlocked.add("xp_focus_500");
  if (totalXP >= 2000) unlocked.add("xp_focus_2000");
  if ((stats.recentStreak ?? 0) >= 3) unlocked.add("streak_3");
  if ((stats.recentStreak ?? 0) >= 7) unlocked.add("streak_7");

  history.forEach((s) => {
    const mins = s.durationMinutes ?? 0;
    if (mins >= 60) unlocked.add("hour_club");
    if (mins >= 120) unlocked.add("two_hour");
    const h = new Date(s.date || 0).getHours();
    if (h >= 0 && h < 7) unlocked.add("early_bird");
    if (h >= 23 || h < 3) unlocked.add("night_owl");
  });

  return unlocked;
}

export default function FocusAchievements({ stats }) {
  const history = getFocusHistory();
  const unlocked = useMemo(() => getUnlocked(history, stats), [history, stats]);
  const total = Object.keys(FOCUS_ACHIEVEMENTS).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/22 uppercase tracking-widest">
          Focus Achievements
        </p>
        <span className="text-[10px] text-white/18">
          {unlocked.size} / {total}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(FOCUS_ACHIEVEMENTS).map(([id, meta], i) => {
          const isUnlocked = unlocked.has(id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
              style={{
                background: isUnlocked
                  ? `${meta.color}0A`
                  : "rgba(255,255,255,0.02)",
                borderColor: isUnlocked
                  ? `${meta.color}28`
                  : "rgba(255,255,255,0.05)",
                opacity: isUnlocked ? 1 : 0.4,
                boxShadow: isUnlocked ? `0 0 12px ${meta.color}08` : "none",
              }}
            >
              <span className="text-xl shrink-0">
                {isUnlocked ? meta.emoji : "🔒"}
              </span>
              <div className="min-w-0">
                <p
                  className="text-[12px] font-bold leading-tight"
                  style={{
                    color: isUnlocked ? meta.color : "rgba(255,255,255,0.25)",
                  }}
                >
                  {meta.label}
                </p>
                <p className="text-[10px] text-white/22 leading-snug">
                  {meta.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
