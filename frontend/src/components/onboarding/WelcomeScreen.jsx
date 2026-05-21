// FILE PATH: frontend/src/components/onboarding/WelcomeScreen.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, ArrowRight, Shield, Target, Flame } from "lucide-react";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

const BOOT_LINES = [
  { text: "> STUDYMIND OS v2.6 — BOOT SEQUENCE INITIATED", delay: 300 },
  { text: "> LOADING AI NEURAL MODULES .................. OK", delay: 1000 },
  { text: "> CALIBRATING STUDY ALGORITHMS .............. OK", delay: 1700 },
  { text: "> SYNCING KNOWLEDGE BASE .................... OK", delay: 2400 },
  { text: "> BUILDING PERSONALIZED COMPANION ........... OK", delay: 3100 },
  { text: "> ALL SYSTEMS NOMINAL. COMPANION READY. ⚡", delay: 3800 },
];

const FEATURES = [
  { icon: Brain, text: "AI Study Plan", color: "#00FFC8" },
  { icon: Target, text: "Adaptive Quizzes", color: "#7C6FFF" },
  { icon: Shield, text: "Burnout Protection", color: "#FF6B9D" },
  { icon: Flame, text: "Gamified Progress", color: "#FFB347" },
];

export default function WelcomeScreen() {
  const { startOnboarding } = useOnboarding();
  const [visibleLines, setVisible] = useState([]);
  const [showCTA, setShowCTA] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const timers = [];

    BOOT_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisible((prev) => [...prev, line.text]);
        }, line.delay),
      );
    });

    timers.push(setTimeout(() => setShowCTA(true), 4500));

    // Periodic glitch on title
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-4 gap-8 md:gap-10"
    >
      {/* ── LOGO BLOCK ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Glow orb behind icon */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-2xl blur-2xl"
            style={{
              background:
                "radial-gradient(circle, #00FFC8 0%, #7C6FFF 60%, transparent 100%)",
              opacity: 0.35,
            }}
          />
          <motion.div
            animate={{
              boxShadow: [
                "0 0 30px rgba(0,255,200,0.3)",
                "0 0 60px rgba(124,111,255,0.4)",
                "0 0 30px rgba(0,255,200,0.3)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center border"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,255,200,0.12), rgba(124,111,255,0.12))",
              borderColor: "rgba(0,255,200,0.25)",
            }}
          >
            <Brain size={40} style={{ color: "#00FFC8" }} strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1
            className="text-4xl md:text-5xl font-black tracking-[0.15em] uppercase select-none"
            style={{
              background: "linear-gradient(90deg, #00FFC8, #7C6FFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: glitch ? "blur(0.8px)" : "none",
              textShadow: glitch ? "3px 0 #FF6B9D, -3px 0 #00FFC8" : "none",
              transition: "filter 0.05s",
            }}
          >
            STUDYMIND
          </h1>
          <p className="text-[10px] tracking-[0.45em] text-white/25 uppercase mt-1.5">
            AI-Powered Exam Companion
          </p>
        </div>
      </motion.div>

      {/* ── BOOT TERMINAL ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="w-full max-w-lg rounded-xl border border-white/[0.07] overflow-hidden"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)" }}
      >
        {/* Terminal chrome */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.025)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#00FFC8", opacity: 0.5 }}
          />
          <span className="ml-2 text-[9px] text-white/20 tracking-widest uppercase font-mono">
            studymind — system init
          </span>
        </div>

        {/* Boot output */}
        <div className="p-5 space-y-2 min-h-[152px] font-mono">
          <AnimatePresence>
            {visibleLines.map((line, i) => {
              const isLast = i === visibleLines.length - 1;
              const isDone = isLast && showCTA;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1"
                >
                  <p
                    className="text-[11px] md:text-[12px] leading-relaxed"
                    style={{
                      color: isDone
                        ? "#00FFC8"
                        : isLast
                          ? "#ffffff"
                          : "rgba(255,255,255,0.38)",
                    }}
                  >
                    {line}
                  </p>
                  {/* Blinking cursor on last line while typing */}
                  {isLast && !showCTA && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.75 }}
                      className="inline-block w-[7px] h-[13px] align-middle"
                      style={{ background: "#00FFC8" }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── CTA ── */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Headline */}
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Ready to <span style={{ color: "#00FFC8" }}>dominate</span> your
                exam?
              </h2>
              <p className="text-[12px] text-white/30">
                2 minutes to build your personalised AI study system.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {FEATURES.map(({ icon: Icon, text, color }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-semibold tracking-wide"
                  style={{
                    borderColor: `${color}28`,
                    background: `${color}0A`,
                    color,
                  }}
                >
                  <Icon size={10} />
                  {text}
                </div>
              ))}
            </div>

            {/* CTA button */}
            <motion.button
              onClick={startOnboarding}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative group flex items-center gap-3 px-8 py-4 rounded-xl font-black text-[13px] tracking-widest uppercase overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #00FFC8, #7C6FFF)",
                boxShadow:
                  "0 0 40px rgba(0,255,200,0.28), 0 0 80px rgba(124,111,255,0.14)",
                color: "#000",
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute inset-y-0 w-1/3 opacity-20"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, white, transparent)",
                  transform: "skewX(-20deg)",
                }}
              />
              <Zap size={15} className="relative" />
              <span className="relative">Initialize Companion</span>
              <ArrowRight size={15} className="relative" />
            </motion.button>

            <p className="text-[10px] text-white/18 tracking-wider">
              No account required · Free forever
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
