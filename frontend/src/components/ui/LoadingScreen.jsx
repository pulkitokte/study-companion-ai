import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";

const BOOT_SEQUENCE = [
  {
    text: "Initializing StudyMind OS…",
    tip: "Your data is stored locally — 100% private.",
  },
  {
    text: "Loading knowledge graph…",
    tip: "Quiz, focus, and planner data auto-sync.",
  },
  {
    text: "Syncing user profile…",
    tip: "Onboarding data personalizes your AI.",
  },
  {
    text: "Calibrating AI companion…",
    tip: "Gemini AI with 5 personality modes.",
  },
  {
    text: "Activating focus engine…",
    tip: "Pomodoro, Deep Work, Sprint modes ready.",
  },
  {
    text: "Wiring global XP system…",
    tip: "Quiz + Focus + Planner XP unify here.",
  },
  { text: "System ready.", tip: "Welcome to StudyMind." },
];

export default function LoadingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  const finish = useCallback(() => {
    setExiting(true);
    setTimeout(onComplete, 550);
  }, [onComplete]);

  useEffect(() => {
    if (step >= BOOT_SEQUENCE.length - 1) {
      setTimeout(finish, 600);
      return;
    }
    const t = setTimeout(
      () => {
        setStep((s) => s + 1);
        setProgress(
          Math.round(((step + 1) / (BOOT_SEQUENCE.length - 1)) * 100),
        );
      },
      280 + Math.random() * 80,
    );
    return () => clearTimeout(t);
  }, [step, finish]);

  const current = BOOT_SEQUENCE[Math.min(step, BOOT_SEQUENCE.length - 1)];

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508]"
        >
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.05, 0.12, 0.05] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle,#7C6FFF 0%,#00FFC8 60%,transparent 80%)",
              }}
            />
            {/* Scan line */}
            <motion.div
              animate={{ y: ["-100%", "200%"] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "linear",
                repeatDelay: 0.5,
              }}
              className="absolute left-0 right-0 h-[1px] opacity-[0.07]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#00FFC8,transparent)",
              }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{ background: "linear-gradient(135deg,#00FFC8,#7C6FFF)" }}
            />
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center border border-white/[0.12]"
              style={{
                background:
                  "linear-gradient(135deg,rgba(0,255,200,0.25),rgba(124,111,255,0.25))",
              }}
            >
              <Brain size={36} className="text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-center mb-10"
          >
            <p className="text-[26px] font-black tracking-[0.22em] text-white uppercase mb-1">
              StudyMind
            </p>
            <p className="text-[11px] tracking-[0.4em] text-[#00FFC8]/45 uppercase">
              AI Companion · v1.0
            </p>
          </motion.div>

          {/* Terminal */}
          <div className="w-[340px] space-y-4">
            <div
              className="rounded-xl border border-white/[0.06] overflow-hidden font-mono"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                {["#FF5F56", "#FFBD2E", "#27C93F"].map((c, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c, opacity: 0.7 }}
                  />
                ))}
                <span className="text-[9px] text-white/15 ml-2 tracking-widest uppercase">
                  studymind.sys
                </span>
              </div>

              {/* Lines */}
              <div className="p-4 space-y-1.5 min-h-[140px]">
                {BOOT_SEQUENCE.slice(0, step + 1).map((s, i) => (
                  <motion.p
                    key={s.text}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: i === step ? 1 : 0.28 }}
                    className="text-[11px] leading-relaxed flex items-center gap-2"
                    style={{
                      color: i === step ? "#00FFC8" : "rgba(255,255,255,0.28)",
                    }}
                  >
                    <span className="text-[#00FFC8]/40">›</span>
                    {s.text}
                    {i === step && step < BOOT_SEQUENCE.length - 1 && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.65 }}
                        className="inline-block w-[7px] h-[12px] align-middle rounded-sm"
                        style={{ background: "#00FFC8" }}
                      />
                    )}
                  </motion.p>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-[9px] text-white/22 mb-1.5">
                <span>{current.tip}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
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
