// FILE PATH: frontend/src/components/quiz/ScoreScreen.jsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Star,
  TrendingUp,
  Flame,
} from "lucide-react";
import { CATEGORIES, DIFFICULTIES } from "../../data/mockQuizData.js";

function saveHistory(entry) {
  try {
    const raw = localStorage.getItem("studymind_quiz_history");
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({ ...entry, date: new Date().toISOString() });
    localStorage.setItem(
      "studymind_quiz_history",
      JSON.stringify(history.slice(0, 50)),
    );
  } catch {
    /* ignore */
  }
}

function getGrade(accuracy) {
  if (accuracy >= 90)
    return {
      label: "Outstanding!",
      color: "#00FFC8",
      emoji: "🏆",
      msg: "You're UPSC-ready on this topic.",
    };
  if (accuracy >= 75)
    return {
      label: "Excellent!",
      color: "#7C6FFF",
      emoji: "⭐",
      msg: "Strong performance. A few gaps to cover.",
    };
  if (accuracy >= 60)
    return {
      label: "Good Job!",
      color: "#FFB347",
      emoji: "👍",
      msg: "Solid base. Revision will sharpen this.",
    };
  if (accuracy >= 40)
    return {
      label: "Keep Pushing",
      color: "#FF6B2B",
      emoji: "📚",
      msg: "This topic needs more focused attention.",
    };
  return {
    label: "Needs Work",
    color: "#FF6B9D",
    emoji: "💪",
    msg: "Don't stop — every attempt teaches you more.",
  };
}

export default function ScoreScreen({ result, config, onRetry, onHome }) {
  const [saved, setSaved] = useState(false);

  const cat = CATEGORIES.find((c) => c.id === config?.category);
  const diff = DIFFICULTIES.find((d) => d.id === config?.difficulty);
  const grade = getGrade(result.accuracy);

  useEffect(() => {
    if (!saved) {
      saveHistory({
        category: config?.category,
        difficulty: config?.difficulty,
        ...result,
      });
      setSaved(true);
    }
  }, [saved, result, config]);

  const STATS = [
    {
      icon: CheckCircle2,
      val: result.correct,
      label: "Correct",
      color: "#00FF64",
    },
    { icon: XCircle, val: result.wrong, label: "Wrong", color: "#FF6B6B" },
    { icon: Zap, val: `+${result.totalXP}`, label: "XP Won", color: "#7C6FFF" },
    {
      icon: TrendingUp,
      val: `${result.accuracy}%`,
      label: "Accuracy",
      color: "#FFB347",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center gap-6 max-w-lg mx-auto py-4"
    >
      {/* Circular accuracy ring */}
      <div className="relative">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 50 * (1 - result.accuracy / 100),
            }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 10px ${grade.color}70)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">
            {result.accuracy}%
          </span>
          <span className="text-[9px] text-white/28 uppercase tracking-wider">
            accuracy
          </span>
        </div>
      </div>

      {/* Grade + emoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-1.5"
      >
        <div className="text-4xl">{grade.emoji}</div>
        <h2 className="text-2xl font-black text-white">{grade.label}</h2>
        <p className="text-[11px] text-white/30">
          {cat?.emoji} {cat?.label} · {diff?.label}
        </p>
        <p
          className="text-[12px] max-w-xs mx-auto leading-relaxed"
          style={{ color: grade.color }}
        >
          {grade.msg}
        </p>
      </motion.div>

      {/* Stat grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full"
      >
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.45 + i * 0.08,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Icon size={15} style={{ color: s.color }} />
              <span className="text-[20px] font-black text-white leading-none">
                {s.val}
              </span>
              <span className="text-[9px] text-white/25 uppercase tracking-wider">
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* XP banner */}
      <AnimatePresence>
        {result.totalXP > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border"
            style={{
              borderColor: "rgba(124,111,255,0.3)",
              background: "rgba(124,111,255,0.08)",
            }}
          >
            <Star size={15} className="text-[#FFD700] shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-white">
                +{result.totalXP} XP added to your profile
              </p>
              <p className="text-[10px] text-white/28 mt-0.5">
                Consistency compounds — come back tomorrow
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak notice */}
      {result.maxStreak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF6B2B]/25 bg-[#FF6B2B]/06"
        >
          <Flame size={13} className="text-[#FF6B2B] shrink-0" />
          <span className="text-[11px] font-semibold text-[#FF6B2B]">
            {result.maxStreak}-answer streak! Bonus XP included.
          </span>
        </motion.div>
      )}

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="flex gap-3 w-full"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200"
        >
          <RotateCcw size={13} />
          Retry
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[12px] transition-all duration-200 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFB347, #FF6B2B)",
            color: "#000",
            boxShadow: "0 0 24px rgba(255,179,71,0.25)",
          }}
        >
          <Home size={13} />
          New Quiz
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
