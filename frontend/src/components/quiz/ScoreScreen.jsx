import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Star,
  Flame,
} from "lucide-react";
import { CATEGORIES, DIFFICULTIES } from "../../data/mockQuizData.js";
import {
  getGrade,
  generateMotivationMessage,
  getRank,
  ACHIEVEMENTS,
} from "../../utils/quizCalculations.js";

export default function ScoreScreen({
  result,
  config,
  onRetry,
  onHome,
  newAchievements = [],
}) {
  const cat = CATEGORIES.find((c) => c.id === config?.category);
  const diff = DIFFICULTIES.find((d) => d.id === config?.difficulty);
  const grade = getGrade(result.accuracy);
  const rank = getRank(result.totalXP);
  const msg = generateMotivationMessage(result.accuracy);

  const STATS = [
    {
      icon: CheckCircle2,
      val: result.correct,
      label: "Correct",
      color: "#00FF64",
    },
    { icon: XCircle, val: result.wrong, label: "Wrong", color: "#FF6B6B" },
    { icon: Zap, val: `+${result.totalXP}`, label: "XP Won", color: "#7C6FFF" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className="flex flex-col items-center gap-5 max-w-lg mx-auto py-4"
    >
      {/* Accuracy ring */}
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
            transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 10px ${grade.color}55)` }}
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

      {/* Grade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.28 }}
        className="text-center space-y-1"
      >
        <div className="text-4xl">{grade.emoji}</div>
        <h2 className="text-[22px] font-black text-white">{grade.label}</h2>
        <p className="text-[11px] text-white/28">
          {cat?.emoji} {cat?.label} · {diff?.label}
        </p>
        <p
          className="text-[12px] max-w-xs mx-auto leading-relaxed"
          style={{ color: grade.color }}
        >
          {msg}
        </p>
      </motion.div>

      {/* Rank earned */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
        style={{
          borderColor: `${rank.color}30`,
          background: `${rank.color}0A`,
        }}
      >
        <span className="text-xl">{rank.emoji}</span>
        <div>
          <p className="text-[11px] font-black" style={{ color: rank.color }}>
            {rank.label}
          </p>
          <p className="text-[9px] text-white/28">{rank.description}</p>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="grid grid-cols-3 gap-2.5 w-full"
      >
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.42 + i * 0.09,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Icon size={14} style={{ color: s.color }} />
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
      {result.totalXP > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-xl border"
          style={{
            borderColor: "rgba(124,111,255,0.3)",
            background: "rgba(124,111,255,0.08)",
          }}
        >
          <Star size={13} className="text-[#FFD700] shrink-0" />
          <div>
            <p className="text-[13px] font-bold text-white">
              +{result.totalXP} XP saved to profile
            </p>
            <p className="text-[10px] text-white/28">
              Consistency compounds — keep going
            </p>
          </div>
        </motion.div>
      )}

      {/* Streak notice */}
      {(result.maxStreak ?? 0) >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF6B2B]/22 bg-[#FF6B2B]/06"
        >
          <Flame size={12} className="text-[#FF6B2B] shrink-0" />
          <span className="text-[11px] font-semibold text-[#FF6B2B]">
            {result.maxStreak}-answer streak — bonus XP included!
          </span>
        </motion.div>
      )}

      {/* New achievements */}
      {newAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78 }}
          className="w-full space-y-2"
        >
          <p className="text-[10px] text-white/22 uppercase tracking-widest">
            Unlocked
          </p>
          {newAchievements.map((id) => {
            const meta = ACHIEVEMENTS[id];
            if (!meta) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border"
                style={{
                  borderColor: `${meta.color}28`,
                  background: `${meta.color}0A`,
                }}
              >
                <span className="text-lg">{meta.emoji}</span>
                <div>
                  <p
                    className="text-[12px] font-bold"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </p>
                  <p className="text-[10px] text-white/28">{meta.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.88 }}
        className="flex gap-3 w-full"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/48 hover:text-white/78 hover:bg-white/[0.04] transition-all"
        >
          <RotateCcw size={13} /> Retry
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[12px]"
          style={{
            background: "linear-gradient(135deg,#FFB347,#FF6B2B)",
            color: "#000",
            boxShadow: "0 0 22px rgba(255,179,71,0.25)",
          }}
        >
          <Home size={13} /> New Quiz
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
