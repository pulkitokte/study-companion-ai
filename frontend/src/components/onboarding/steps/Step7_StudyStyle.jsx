// FILE PATH: frontend/src/components/onboarding/steps/Step7_StudyStyle.jsx
// STEP 7 — Study Style + Session Duration + Revision Method
// These control how the AI generates daily schedules and quiz timing.
// Fully animated selection cards with detailed descriptions.

import { motion } from "framer-motion";
import { Zap, Clock, RefreshCw, BookOpen } from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";

// ─── DATA ──────────────────────────────────────────────────────────
const STUDY_STYLES = [
  {
    id: "pomodoro",
    label: "Pomodoro",
    emoji: "🍅",
    color: "#FF6B2B",
    desc: "25 min focus + 5 min break. Proven for focus and stamina.",
    badge: "Most Popular",
  },
  {
    id: "spaced",
    label: "Spaced Repetition",
    emoji: "🔁",
    color: "#7C6FFF",
    desc: "Review material at increasing intervals for long-term memory.",
    badge: "Best for UPSC",
  },
  {
    id: "marathon",
    label: "Deep Marathon",
    emoji: "🏃",
    color: "#00FFC8",
    desc: "Long uninterrupted blocks of 2–3 hours. For deep topic mastery.",
    badge: "High Discipline",
  },
  {
    id: "mixed",
    label: "Mixed / Flexible",
    emoji: "🎲",
    color: "#FFD700",
    desc: "AI picks the best style per subject and your energy level.",
    badge: "AI-Adaptive",
  },
];

const SESSION_DURATIONS = [
  { value: 25, label: "25 min", sub: "Pomodoro standard" },
  { value: 45, label: "45 min", sub: "Sweet spot for most" },
  { value: 60, label: "1 hour", sub: "Classic deep work" },
  { value: 90, label: "90 min", sub: "Ultradian rhythm" },
  { value: 120, label: "2 hours", sub: "Marathon block" },
];

const REVISION_METHODS = [
  {
    id: "daily",
    label: "Daily Micro-Revision",
    emoji: "📅",
    color: "#00FFC8",
    desc: "10–15 min recap every day. Best retention for factual subjects.",
  },
  {
    id: "weekly",
    label: "Weekly Review",
    emoji: "📆",
    color: "#7C6FFF",
    desc: "Dedicated weekly revision day. Good for busy schedules.",
  },
  {
    id: "flashcard",
    label: "Flashcards",
    emoji: "🃏",
    color: "#FFB347",
    desc: "Digital flashcards with spaced repetition. Excellent for MCQ prep.",
  },
  {
    id: "mindmap",
    label: "Mind Maps",
    emoji: "🧠",
    color: "#FF6B9D",
    desc: "Visual revision webs. Great for interconnected UPSC topics.",
  },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function Step7_StudyStyle({ accentColor }) {
  const { data, update } = useOnboarding();

  return (
    <div className="space-y-6">
      <StepHeader
        step={7}
        title="How do you learn best?"
        subtitle="Your AI companion uses these to build schedules that actually fit your brain — not a generic template."
        accentColor={accentColor}
      />

      {/* Study style */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Zap size={11} style={{ color: accentColor }} />
          Study Technique
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STUDY_STYLES.map((style, i) => {
            const isSelected = data.studyStyle === style.id;
            return (
              <motion.button
                key={style.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ studyStyle: style.id })}
                className="relative flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-200 overflow-hidden"
                style={{
                  background: isSelected
                    ? `${style.color}12`
                    : "rgba(255,255,255,0.02)",
                  borderColor: isSelected
                    ? `${style.color}50`
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isSelected ? `0 0 20px ${style.color}18` : "none",
                }}
              >
                {/* Badge */}
                {style.badge && isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide"
                    style={{
                      background: `${style.color}25`,
                      color: style.color,
                    }}
                  >
                    {style.badge}
                  </motion.div>
                )}
                <span className="text-2xl">{style.emoji}</span>
                <span
                  className="text-[13px] font-bold"
                  style={{
                    color: isSelected ? style.color : "rgba(255,255,255,0.65)",
                  }}
                >
                  {style.label}
                </span>
                <span className="text-[10px] text-white/30 leading-snug">
                  {style.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Session duration */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Clock size={11} style={{ color: accentColor }} />
          Preferred Session Length
        </label>
        <div className="flex flex-wrap gap-2">
          {SESSION_DURATIONS.map((dur) => {
            const isSelected = data.sessionDuration === dur.value;
            return (
              <motion.button
                key={dur.value}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => update({ sessionDuration: dur.value })}
                className="flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all duration-200"
                style={{
                  background: isSelected
                    ? `${accentColor}12`
                    : "rgba(255,255,255,0.03)",
                  borderColor: isSelected
                    ? `${accentColor}50`
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isSelected ? `0 0 14px ${accentColor}15` : "none",
                }}
              >
                <span
                  className="text-[14px] font-black"
                  style={{
                    color: isSelected ? accentColor : "rgba(255,255,255,0.6)",
                  }}
                >
                  {dur.label}
                </span>
                <span className="text-[9px] text-white/25 mt-0.5">
                  {dur.sub}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Visual duration bar */}
        {data.sessionDuration && (
          <motion.div
            key={data.sessionDuration}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.sessionDuration / 120) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
                }}
              />
            </div>
            <span className="text-[10px] text-white/25 shrink-0">
              {data.sessionDuration} min
            </span>
          </motion.div>
        )}
      </div>

      {/* Revision method */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <RefreshCw size={11} style={{ color: accentColor }} />
          Revision Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          {REVISION_METHODS.map((method, i) => {
            const isSelected = data.revisionPreference === method.id;
            return (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ revisionPreference: method.id })}
                className="flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-200"
                style={{
                  background: isSelected
                    ? `${method.color}12`
                    : "rgba(255,255,255,0.02)",
                  borderColor: isSelected
                    ? `${method.color}50`
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isSelected ? `0 0 16px ${method.color}18` : "none",
                }}
              >
                <span className="text-xl">{method.emoji}</span>
                <span
                  className="text-[12px] font-bold"
                  style={{
                    color: isSelected ? method.color : "rgba(255,255,255,0.6)",
                  }}
                >
                  {method.label}
                </span>
                <span className="text-[10px] text-white/30 leading-snug">
                  {method.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Summary chip */}
      {data.studyStyle && data.revisionPreference && data.sessionDuration && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <BookOpen size={11} style={{ color: accentColor }} />
          <span className="text-[11px] text-white/35">
            Your plan: &nbsp;
            <span className="text-white/60 font-semibold">
              {STUDY_STYLES.find((s) => s.id === data.studyStyle)?.label}
            </span>
            &nbsp;·&nbsp;
            <span className="text-white/60 font-semibold">
              {data.sessionDuration}min sessions
            </span>
            &nbsp;·&nbsp;
            <span className="text-white/60 font-semibold">
              {
                REVISION_METHODS.find((r) => r.id === data.revisionPreference)
                  ?.label
              }
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
