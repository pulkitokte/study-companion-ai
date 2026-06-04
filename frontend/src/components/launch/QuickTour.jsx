import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

const STEPS = [
  {
    title: "Welcome to StudyMind! 🧠",
    desc: "You're looking at the Mission Control dashboard. Everything updates live — your XP, streak, rank, and daily missions all reflect your real activity.",
    hint: "This is your home base.",
    color: "#00FFC8",
    position: "center",
  },
  {
    title: "AI Companion — 5 Modes 🤖",
    desc: "Click Chat in the sidebar. Choose from Motivator, Chill, Strict, Roast, or UPSC Interviewer mode. The AI remembers your profile and progress.",
    hint: "Each mode has its own persistent conversation.",
    color: "#FF6B9D",
    position: "center",
  },
  {
    title: "Quiz Arena ⚔️",
    desc: "8 UPSC subjects with real timers, XP rewards, and streak bonuses. Complete quizzes to unlock achievements and climb the rank ladder.",
    hint: "Your accuracy feeds into the AI personalization.",
    color: "#FFB347",
    position: "center",
  },
  {
    title: "Focus Mode ⏱️",
    desc: "Start a Pomodoro, Deep Work, or Sprint session. The ambient terminal and focus quotes keep you locked in. XP is earned on completion.",
    hint: "Use Space to pause, Esc to exit fullscreen.",
    color: "#B5FF47",
    position: "center",
  },
  {
    title: "Progress OS 📊",
    desc: "Your unified XP from quiz + focus + planner drives your level and rank. Daily missions auto-complete from your activity. No manual tracking needed.",
    hint: "500 XP = 1 level. 6 ranks total.",
    color: "#7C6FFF",
    position: "center",
  },
  {
    title: "You're ready! ⚡",
    desc: "Every action you take syncs across the entire ecosystem. Complete a quiz and watch your sidebar XP bar update, your dashboard refresh, and your rank progress.",
    hint: "Everything is connected.",
    color: "#FFD700",
    position: "center",
  },
];

const TOUR_KEY = "studymind_tour_done";

export default function QuickTour({ forceShow = false }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (forceShow || !done) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(TOUR_KEY, "true");
  };
  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };
  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-sm rounded-3xl border overflow-hidden"
            style={{
              background: `linear-gradient(135deg,${current.color}12,rgba(5,5,12,0.97))`,
              borderColor: `${current.color}30`,
              boxShadow: `0 0 60px ${current.color}18, 0 20px 60px rgba(0,0,0,0.6)`,
            }}
          >
            {/* Top bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[1.5px]"
              style={{
                background: `linear-gradient(90deg,transparent,${current.color},transparent)`,
              }}
            />

            {/* Step indicator */}
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ width: i === step ? 20 : 6 }}
                    transition={{ duration: 0.3 }}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      background:
                        i <= step ? current.color : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={dismiss}
                className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.07] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 pt-4 space-y-4">
              <div className="space-y-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl"
                >
                  {current.title.split(" ").pop()}
                </motion.div>
                <h3 className="text-[17px] font-black text-white leading-snug">
                  {current.title.split(" ").slice(0, -1).join(" ")}
                </h3>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {current.desc}
                </p>
              </div>

              {/* Hint */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{
                  borderColor: `${current.color}20`,
                  background: `${current.color}08`,
                }}
              >
                <Sparkles
                  size={11}
                  style={{ color: current.color }}
                  className="shrink-0"
                />
                <p className="text-[11px]" style={{ color: current.color }}>
                  {current.hint}
                </p>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/38 hover:text-white/65 hover:bg-white/[0.05] transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={13} /> Back
                </button>

                <span className="text-[10px] text-white/22">
                  {step + 1} / {STEPS.length}
                </span>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={next}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[12px]"
                  style={{
                    background: `linear-gradient(135deg,${current.color},${current.color}BB)`,
                    color: "#000",
                  }}
                >
                  {step === STEPS.length - 1 ? "Get Started!" : "Next"}
                  <ChevronRight size={13} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
