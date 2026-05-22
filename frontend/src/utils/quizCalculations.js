export const RANKS = [
  {
    id: "rookie",
    label: "Rookie",
    minXP: 0,
    color: "#888888",
    emoji: "🥉",
    description: "Just getting started",
  },
  {
    id: "cadet",
    label: "Cadet",
    minXP: 500,
    color: "#4FC3F7",
    emoji: "🎖️",
    description: "Building momentum",
  },
  {
    id: "operator",
    label: "Operator",
    minXP: 2000,
    color: "#00FFC8",
    emoji: "⚡",
    description: "Sharp and consistent",
  },
  {
    id: "strategist",
    label: "Strategist",
    minXP: 5000,
    color: "#7C6FFF",
    emoji: "🧠",
    description: "Tactical preparation",
  },
  {
    id: "elite",
    label: "Elite",
    minXP: 10000,
    color: "#FFB347",
    emoji: "🔱",
    description: "Exceptional performer",
  },
  {
    id: "apex_scholar",
    label: "Apex Scholar",
    minXP: 20000,
    color: "#FFD700",
    emoji: "👑",
    description: "UPSC Legend",
  },
];

export const ACHIEVEMENTS = {
  first_quiz: {
    label: "First Blood",
    desc: "Complete your first quiz",
    emoji: "🎯",
    color: "#00FFC8",
  },
  quiz_5: {
    label: "Getting Started",
    desc: "Complete 5 quizzes",
    emoji: "📚",
    color: "#4FC3F7",
  },
  quiz_25: {
    label: "Grinder",
    desc: "Complete 25 quizzes",
    emoji: "⚙️",
    color: "#7C6FFF",
  },
  quiz_50: {
    label: "Veteran",
    desc: "Complete 50 quizzes",
    emoji: "🏛️",
    color: "#FFD700",
  },
  accuracy_master: {
    label: "Accuracy Master",
    desc: "Score 90%+ in a quiz",
    emoji: "🎖️",
    color: "#00FFC8",
  },
  perfect_score: {
    label: "Perfect Score",
    desc: "Score 100% in any quiz",
    emoji: "💎",
    color: "#FFD700",
  },
  streak_3: {
    label: "On Fire",
    desc: "3-answer streak",
    emoji: "🔥",
    color: "#FF6B2B",
  },
  streak_5: {
    label: "Unstoppable",
    desc: "5-answer streak",
    emoji: "⚡",
    color: "#FF6B2B",
  },
  xp_1000: {
    label: "XP Hunter",
    desc: "Earn 1,000 total XP",
    emoji: "⭐",
    color: "#FFB347",
  },
  xp_5000: {
    label: "XP Legend",
    desc: "Earn 5,000 total XP",
    emoji: "👑",
    color: "#FFD700",
  },
  speed_demon: {
    label: "Speed Demon",
    desc: "Average under 15s per question",
    emoji: "💨",
    color: "#B5FF47",
  },
  daily_3: {
    label: "Consistent",
    desc: "Quiz for 3 consecutive days",
    emoji: "📅",
    color: "#7C6FFF",
  },
  daily_7: {
    label: "Week Warrior",
    desc: "Quiz for 7 consecutive days",
    emoji: "🗓️",
    color: "#FF6B9D",
  },
  night_grinder: {
    label: "Night Grinder",
    desc: "Complete a quiz after 11 PM",
    emoji: "🌙",
    color: "#7C6FFF",
  },
};

export function getRank(totalXP = 0) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalXP >= r.minXP) rank = r;
    else break;
  }
  return rank;
}

export function getNextRank(totalXP = 0) {
  for (let i = 0; i < RANKS.length - 1; i++) {
    if (totalXP < RANKS[i + 1].minXP) return RANKS[i + 1];
  }
  return null;
}

export function getRankProgress(totalXP = 0) {
  const current = getRank(totalXP);
  const next = getNextRank(totalXP);
  if (!next) return { pct: 100, current, next: null, xpToNext: 0 };
  const range = next.minXP - current.minXP;
  const gained = totalXP - current.minXP;
  return {
    pct: Math.round((gained / range) * 100),
    current,
    next,
    xpToNext: next.minXP - totalXP,
  };
}

export function calculateXP({
  baseXP = 50,
  difficultyMultiplier = 1,
  streak = 0,
  timedBonus = false,
}) {
  let xp = Math.round(baseXP * difficultyMultiplier);
  if (streak >= 3) xp += 25;
  if (timedBonus) xp += 10;
  return xp;
}

export function calculateAccuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function generateMotivationMessage(accuracy) {
  if (accuracy === 100) return "Perfect score. Absolute dominance. 🏆";
  if (accuracy >= 90) return "You're operating at elite level. Keep it up. ⚡";
  if (accuracy >= 75) return "Strong performance. A few gaps left to cover. 💪";
  if (accuracy >= 60)
    return "Solid base. Revision will sharpen this further. 📚";
  if (accuracy >= 40)
    return "This topic needs focused attention. You know what to do. 🎯";
  if (accuracy >= 20)
    return "Rough round — honest data. Revise the basics and return. 🔥";
  return "This is your baseline. The only way from here is up. 🚀";
}

export function getGrade(accuracy) {
  if (accuracy >= 90)
    return { label: "Outstanding!", color: "#00FFC8", emoji: "🏆" };
  if (accuracy >= 75)
    return { label: "Excellent!", color: "#7C6FFF", emoji: "⭐" };
  if (accuracy >= 60)
    return { label: "Good Job!", color: "#FFB347", emoji: "👍" };
  if (accuracy >= 40)
    return { label: "Keep Pushing", color: "#FF6B2B", emoji: "📚" };
  return { label: "Needs Work", color: "#FF6B9D", emoji: "💪" };
}
