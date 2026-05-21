// FILE PATH: frontend/src/components/onboarding/steps/Step5_Burnout.jsx
// STEP 5 — Burnout Level + Stress Level + Consistency Level
// Three interactive sliders with emoji feedback and smart AI notes.
// The AI companion uses these values to decide when to be strict vs gentle.

import { motion } from "framer-motion";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";
import { Brain, Flame, Shield, Zap } from "lucide-react";

// ─── SLIDER CONFIGS ────────────────────────────────────────────────
const SLIDERS = [
  {
    key: "burnoutLevel",
    icon: Flame,
    label: "Current Burnout Level",
    sublabel: "How exhausted do you feel with studying right now?",
    lowText: "😌 Totally fresh and motivated",
    highText: "💀 Completely drained and overwhelmed",
    color: "#FF6B2B",
    getNote: (v) => {
      if (v <= 2)
        return {
          text: "You're full of energy! Your plan will be ambitious to match your momentum.",
          emoji: "⚡",
        };
      if (v <= 4)
        return {
          text: "Mild fatigue. Your AI plan will include smart breaks and variety.",
          emoji: "😊",
        };
      if (v <= 6)
        return {
          text: "Moderate burnout detected. Recovery sessions will be woven into your plan.",
          emoji: "🌿",
        };
      if (v <= 8)
        return {
          text: "High burnout. Your companion will prioritize gentle re-engagement over grinding.",
          emoji: "🫂",
        };
      return {
        text: "Critical burnout. Rest is the first lesson. Short sessions, big encouragement.",
        emoji: "💙",
      };
    },
  },
  {
    key: "stressLevel",
    icon: Brain,
    label: "Exam Stress Level",
    sublabel: "How stressed are you about the exam right now?",
    lowText: "😎 Completely calm and confident",
    highText: "😰 Extremely anxious and overwhelmed",
    color: "#7C6FFF",
    getNote: (v) => {
      if (v <= 2)
        return {
          text: "Excellent calm. You'll perform at your best from this headspace.",
          emoji: "🧘",
        };
      if (v <= 4)
        return {
          text: "Healthy pressure. Your companion will keep you focused and grounded.",
          emoji: "🎯",
        };
      if (v <= 6)
        return {
          text: "Moderate anxiety. Daily affirmations and progress tracking will help.",
          emoji: "📈",
        };
      if (v <= 8)
        return {
          text: "High stress. Regular check-ins and mindset resets built into your plan.",
          emoji: "🤝",
        };
      return {
        text: "Maximum stress. Your companion will focus on confidence-building first.",
        emoji: "💪",
      };
    },
  },
  {
    key: "consistencyLevel",
    icon: Shield,
    label: "Past Consistency",
    sublabel: "How consistent have you been with studying in the last month?",
    lowText: "😔 Barely studied at all",
    highText: "🔥 Studied every single day",
    color: "#00FFC8",
    getNote: (v) => {
      if (v <= 2)
        return {
          text: "Starting fresh. No judgment — your companion won't let you slip again.",
          emoji: "🚀",
        };
      if (v <= 4)
        return {
          text: "Inconsistent but trying. Streak system will create powerful daily habits.",
          emoji: "⚙️",
        };
      if (v <= 6)
        return {
          text: "Average consistency. Small daily wins will compound into big results.",
          emoji: "📅",
        };
      if (v <= 8)
        return {
          text: "Good discipline! Your companion will push you to the next level.",
          emoji: "⬆️",
        };
      return {
        text: "Exceptional! You have the discipline. Now we sharpen the strategy.",
        emoji: "🏆",
      };
    },
  },
];

export default function Step5_Burnout({ accentColor }) {
  const { data, update } = useOnboarding();

  return (
    <div className="space-y-6">
      <StepHeader
        step={5}
        title="Your mental state"
        subtitle="Your AI companion adapts its personality based on how you're really feeling. Be honest — this is just between you two."
        accentColor={accentColor}
      />

      <div className="space-y-6">
        {SLIDERS.map((slider, si) => {
          const Icon = slider.icon;
          const value = data[slider.key];
          const note = slider.getNote(value);

          return (
            <motion.div
              key={slider.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: si * 0.1, duration: 0.4 }}
              className="space-y-3"
            >
              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: slider.color }} />
                  <span className="text-[12px] font-bold text-white/70">
                    {slider.label}
                  </span>
                </div>
                <motion.span
                  key={value}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[22px] font-black tabular-nums"
                  style={{ color: slider.color }}
                >
                  {value}
                  <span className="text-[13px] text-white/20 font-normal">
                    /10
                  </span>
                </motion.span>
              </div>

              <p className="text-[10px] text-white/30">{slider.sublabel}</p>

              {/* Slider track */}
              <div className="relative">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={value}
                  onChange={(e) =>
                    update({ [slider.key]: parseInt(e.target.value) })
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, ${slider.color} ${((value - 1) / 9) * 100}%, rgba(255,255,255,0.07) ${((value - 1) / 9) * 100}%)`,
                    accentColor: slider.color,
                  }}
                />
                {/* Tick marks */}
                <div className="flex justify-between mt-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <div key={n} className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-0.5 h-1 rounded-full transition-all duration-200"
                        style={{
                          background:
                            n <= value ? slider.color : "rgba(255,255,255,0.1)",
                        }}
                      />
                      {(n === 1 || n === 5 || n === 10) && (
                        <span className="text-[8px] text-white/15">{n}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Low/high labels */}
              <div className="flex justify-between text-[9px] text-white/20">
                <span>{slider.lowText}</span>
                <span>{slider.highText}</span>
              </div>

              {/* AI note */}
              <motion.div
                key={`${slider.key}-${note.emoji}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 border"
                style={{
                  borderColor: `${slider.color}20`,
                  background: `${slider.color}07`,
                }}
              >
                <span className="text-base shrink-0">{note.emoji}</span>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {note.text}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Combined insight */}
      <motion.div
        key={`${data.burnoutLevel}-${data.stressLevel}-${data.consistencyLevel}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border px-4 py-3 flex items-start gap-3"
        style={{
          borderColor: `${accentColor}20`,
          background: `${accentColor}06`,
        }}
      >
        <Zap
          size={13}
          style={{ color: accentColor }}
          className="shrink-0 mt-0.5"
        />
        <div>
          <p
            className="text-[11px] font-bold mb-0.5"
            style={{ color: accentColor }}
          >
            AI Companion Mode:{" "}
            {getCompanionMode(
              data.burnoutLevel,
              data.stressLevel,
              data.consistencyLevel,
            )}
          </p>
          <p className="text-[10px] text-white/35 leading-relaxed">
            {getCompanionDesc(
              data.burnoutLevel,
              data.stressLevel,
              data.consistencyLevel,
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── COMPANION MODE LOGIC ──────────────────────────────────────────
function getCompanionMode(burnout, stress, consistency) {
  const avg = (burnout + stress) / 2;
  if (avg >= 8) return "🫂 Gentle Supporter";
  if (avg >= 6) return "🌱 Mindful Coach";
  if (avg <= 3 && consistency >= 7) return "🔥 Strict Drill Sergeant";
  if (consistency <= 3) return "⚙️ Habit Builder";
  return "⚡ Balanced Mentor";
}

function getCompanionDesc(burnout, stress, consistency) {
  const avg = (burnout + stress) / 2;
  if (avg >= 8)
    return "Your companion will be warm, patient, and recovery-focused. Rest is progress.";
  if (avg >= 6)
    return "Balanced support with gentle accountability. No harsh pushing.";
  if (avg <= 3 && consistency >= 7)
    return "You can handle it. Expect high standards, detailed plans, and zero tolerance for excuses.";
  if (consistency <= 3)
    return "Focus is on building unbreakable daily habits. Small wins, every single day.";
  return "A mix of motivation, strategy, and accountability. Adapts day by day.";
}
