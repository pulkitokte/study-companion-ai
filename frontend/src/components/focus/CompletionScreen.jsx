import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  RotateCcw,
  ChevronRight,
  Flame,
  Trophy,
  Clock,
} from "lucide-react";
import { useFocus } from "../../context/FocusContext.jsx";
import { getFocusStats } from "../../utils/focusStorage.js";
import { hasActiveFocusSyllabusSession } from "../../utils/focusSyllabusSession.js";
import PostSessionTopicModal from "./PostSessionTopicModal.jsx";

function getMotivation(minutes) {
  if (minutes >= 120)
    return {
      text: "Absolute beast mode. That session was legendary.",
      emoji: "🔥",
    };
  if (minutes >= 90)
    return {
      text: "Deep work mastery. Your brain just leveled up.",
      emoji: "🧠",
    };
  if (minutes >= 60)
    return {
      text: "One hour of focus beats six of distraction. Solid.",
      emoji: "⚡",
    };
  if (minutes >= 30)
    return {
      text: "Consistent sessions build champions. Keep stacking.",
      emoji: "💪",
    };
  return {
    text: "Every focused minute compounds. You showed up.",
    emoji: "🎯",
  };
}

export default function CompletionScreen() {
  const {
    config,
    xpEarned,
    pomodoroCount,
    FOCUS_MODES,
    exitToHome,
    goToSetup,
  } = useFocus();
  const modeData = FOCUS_MODES[config?.mode] ?? FOCUS_MODES.pomodoro;
  const mins = config?.workMinutes ?? 0;
  const stats = getFocusStats();
  const motiv = getMotivation(mins);

  // ── Phase 35 Batch C: Post-session topic modal ────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);

  // Open the modal automatically if a syllabus session context is stored.
  // Runs once on mount (i.e. when CompletionScreen first appears).
  useEffect(() => {
    try {
      if (hasActiveFocusSyllabusSession()) {
        setModalOpen(true);
      }
    } catch {
      // Never crash the completion screen
    }
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const STATS = [
    { label: "Minutes", val: mins, color: modeData.color, icon: Clock },
    { label: "XP Earned", val: `+${xpEarned}`, color: "#7C6FFF", icon: Zap },
    {
      label: "Day Streak",
      val: stats.recentStreak,
      color: "#FF6B2B",
      icon: Flame,
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col items-center gap-6 max-w-lg mx-auto py-6 text-center"
      >
        {/* Glow icon */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl blur-xl"
            style={{ background: modeData.color }}
          />
          <motion.div
            initial={{ rotate: -15, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 16,
              delay: 0.1,
            }}
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border"
            style={{
              background: `${modeData.color}14`,
              borderColor: `${modeData.color}35`,
            }}
          >
            {modeData.emoji}
          </motion.div>
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-4xl mb-2">{motiv.emoji}</div>
          <h2 className="text-[24px] font-black text-white leading-tight">
            Session Complete!
          </h2>
          <p className="text-[12px] text-white/35 mt-1">
            {mins}m {modeData.label}
            {config?.subject ? ` · ${config.subject}` : ""}
            {pomodoroCount > 1 ? ` · ${pomodoroCount} pomodoros` : ""}
          </p>
          <p
            className="text-[12px] mt-3 leading-relaxed max-w-xs mx-auto"
            style={{ color: modeData.color }}
          >
            {motiv.text}
          </p>
        </motion.div>

        {/* Goal shown if set */}
        {config?.goal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]"
          >
            <p className="text-[10px] text-white/22 uppercase tracking-widest mb-1">
              Session Goal
            </p>
            <p className="text-[13px] text-white/65 italic">
              &ldquo;{config.goal}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.4 + i * 0.09,
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                }}
                className="flex flex-col items-center gap-1.5 py-4 rounded-xl border border-white/[0.07]"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <Icon size={14} style={{ color: s.color }} />
                <span className="text-[20px] font-black text-white leading-none">
                  {s.val}
                </span>
                <span className="text-[9px] text-white/22 uppercase tracking-wider">
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* XP banner */}
        {xpEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border"
            style={{
              borderColor: "rgba(124,111,255,0.3)",
              background: "rgba(124,111,255,0.08)",
            }}
          >
            <Zap size={14} className="text-[#7C6FFF] shrink-0" />
            <div className="text-left">
              <p className="text-[13px] font-bold text-white">
                +{xpEarned} XP saved to your profile
              </p>
              <p className="text-[10px] text-white/28 mt-0.5">
                Total focus: {stats.totalMinutes}m ·{" "}
                {stats.totalXP.toLocaleString()} XP all-time
              </p>
            </div>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72 }}
          className="flex gap-3 w-full"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={exitToHome}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/45 hover:text-white/75 hover:bg-white/[0.04] transition-all"
          >
            <RotateCcw size={13} /> Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToSetup}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[12px] relative overflow-hidden"
            style={{
              background: modeData.gradient,
              color: "#000",
              boxShadow: `0 0 24px ${modeData.color}30`,
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
                repeatDelay: 1.5,
              }}
              className="absolute inset-y-0 w-1/3 opacity-20"
              style={{
                background:
                  "linear-gradient(90deg,transparent,white,transparent)",
                transform: "skewX(-20deg)",
              }}
            />
            <span className="relative flex items-center gap-2">
              <ChevronRight size={13} /> New Session
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Phase 35 Batch C: Post-session topic completion modal */}
      <PostSessionTopicModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
