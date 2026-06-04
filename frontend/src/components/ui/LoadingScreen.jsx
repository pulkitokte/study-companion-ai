import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2 } from "lucide-react";

const BOOT = [
  {
    text: "Initializing StudyMind OS…",
    tip: "Zero-backend · 100% local · Blazing fast",
  },
  {
    text: "Loading knowledge engine…",
    tip: "8 UPSC subjects · Adaptive difficulty",
  },
  {
    text: "Syncing user profile…",
    tip: "Onboarding data personalizes your experience",
  },
  {
    text: "Calibrating Gemini AI…",
    tip: "5 personality modes · Real streaming",
  },
  {
    text: "Activating focus engine…",
    tip: "Pomodoro · Deep Work · Sprint modes",
  },
  {
    text: "Wiring XP ecosystem…",
    tip: "Quiz + Focus + Planner → unified progression",
  },
  { text: "System ready.", tip: "Welcome to StudyMind." },
];

export default function LoadingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const progress = Math.round((step / (BOOT.length - 1)) * 100);

  const finish = useCallback(() => {
    setDone(true);
    setTimeout(onComplete, 520);
  }, [onComplete]);

  useEffect(() => {
    if (step >= BOOT.length - 1) {
      setTimeout(finish, 500);
      return;
    }
    const delay = step === 0 ? 300 : 260 + Math.random() * 80;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, finish]);

  const current = BOOT[Math.min(step, BOOT.length - 1)];
  const isDone = step >= BOOT.length - 1;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508] overflow-hidden"
        >
          {/* Ambient rings */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[0.06, 0.04, 0.025].map((op, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1 + 0.1 * (i + 1), 1],
                  opacity: [op, op * 2, op],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4 + i,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  width: `${400 + i * 150}px`,
                  height: `${400 + i * 150}px`,
                  background:
                    i === 0
                      ? "radial-gradient(circle,#7C6FFF,transparent 70%)"
                      : i === 1
                        ? "radial-gradient(circle,#00FFC8,transparent 70%)"
                        : "radial-gradient(circle,#FF6B9D,transparent 70%)",
                }}
              />
            ))}
            {/* Horizontal scan line */}
            <motion.div
              animate={{ y: ["-10%", "110%"] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
                repeatDelay: 0.8,
              }}
              className="absolute left-0 right-0 h-[1px] opacity-[0.06]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#00FFC8 30%,#7C6FFF 70%,transparent)",
              }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.75 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.55,
              type: "spring",
              stiffness: 180,
              damping: 18,
            }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ opacity: [0.35, 0.8, 0.35] }}
              transition={{
                repeat: Infinity,
                duration: 2.8,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-[22px] blur-xl"
              style={{ background: "linear-gradient(135deg,#00FFC8,#7C6FFF)" }}
            />
            <div
              className="relative w-20 h-20 rounded-[22px] flex items-center justify-center border border-white/[0.12]"
              style={{
                background:
                  "linear-gradient(135deg,rgba(0,255,200,0.22),rgba(124,111,255,0.22))",
              }}
            >
              <Brain size={36} className="text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-10 space-y-0.5"
          >
            <p className="text-[28px] font-black tracking-[0.22em] text-white uppercase">
              StudyMind
            </p>
            <p className="text-[11px] tracking-[0.45em] text-[#00FFC8]/42 uppercase">
              AI Companion · v1.0
            </p>
          </motion.div>

          {/* Terminal */}
          <div className="w-[340px] max-w-[90vw] space-y-4">
            <div
              className="rounded-xl border border-white/[0.06] overflow-hidden font-mono"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.028)" }}
              >
                {["#FF5F56", "#FFBD2E", "#27C93F"].map((c, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c, opacity: 0.7 }}
                  />
                ))}
                <span className="text-[9px] text-white/15 ml-2 tracking-widest uppercase">
                  studymind.core
                </span>
              </div>

              <div className="p-4 space-y-1.5 min-h-[150px]">
                {BOOT.slice(0, step + 1).map((s, i) => {
                  const isCurrent = i === step;
                  const isDoneStep = i < step;
                  return (
                    <motion.div
                      key={s.text}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 text-[11px]"
                      style={{
                        color: isCurrent ? "#00FFC8" : "rgba(255,255,255,0.25)",
                      }}
                    >
                      <span className="shrink-0 text-[#00FFC8]/35">›</span>
                      <span>{s.text}</span>
                      {isCurrent && !isDone && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 0.65 }}
                          className="inline-block w-[7px] h-[12px] rounded-sm shrink-0"
                          style={{ background: "#00FFC8" }}
                        />
                      )}
                      {(isDoneStep || (isCurrent && isDone)) && (
                        <CheckCircle2
                          size={11}
                          style={{ color: "rgba(0,255,200,0.5)" }}
                          className="shrink-0"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-[9px] text-white/20 mb-1.5">
                <span className="truncate max-w-[70%]">{current.tip}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg,#00FFC8,#7C6FFF)",
                    boxShadow: "0 0 10px rgba(0,255,200,0.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
