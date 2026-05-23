import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw, ChevronRight } from "lucide-react";
import { FocusProvider, useFocus } from "../context/FocusContext.jsx";
import FocusHome from "../components/focus/FocusHome.jsx";
import SessionSetup from "../components/focus/SessionSetup.jsx";
import FocusTimer from "../components/focus/FocusTimer.jsx";

// ─── COMPLETION SCREEN ─────────────────────────────────────────────
function CompletionScreen() {
  const {
    config,
    xpEarned,
    pomodoroCount,
    FOCUS_MODES,
    exitToHome,
    goToSetup,
  } = useFocus();
  const modeData = FOCUS_MODES[config?.mode] ?? FOCUS_MODES.pomodoro;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 max-w-lg mx-auto py-8 text-center"
    >
      {/* Hero icon */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute inset-0 rounded-2xl blur-xl"
          style={{ background: modeData.color }}
        />
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border"
          style={{
            background: `${modeData.color}14`,
            borderColor: `${modeData.color}35`,
          }}
        >
          {modeData.emoji}
        </div>
      </div>

      <div>
        <div className="text-4xl mb-2">🎯</div>
        <h2 className="text-2xl font-black text-white">Session Complete!</h2>
        <p className="text-[12px] text-white/35 mt-1">
          {config?.workMinutes}m {modeData.label}
          {config?.subject ? ` · ${config.subject}` : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          {
            label: "Minutes",
            val: config?.workMinutes ?? 0,
            color: modeData.color,
          },
          { label: "XP Earned", val: `+${xpEarned}`, color: "#7C6FFF" },
          {
            label: "Sessions",
            val: Math.max(pomodoroCount, 1),
            color: "#FFB347",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-[20px] font-black text-white leading-none">
              {s.val}
            </span>
            <span className="text-[9px] text-white/25 uppercase tracking-wider">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* XP banner */}
      {xpEarned > 0 && (
        <div
          className="w-full flex items-center gap-3 px-5 py-3 rounded-xl border"
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
            <p className="text-[10px] text-white/28">
              Every focused session compounds.
            </p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-3 w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={exitToHome}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/48 hover:text-white/75 hover:bg-white/[0.04] transition-all"
        >
          <RotateCcw size={13} /> Home
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={goToSetup}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[12px]"
          style={{
            background: modeData.gradient,
            color: "#000",
            boxShadow: `0 0 22px ${modeData.color}30`,
          }}
        >
          <ChevronRight size={13} /> New Session
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── INNER SHELL ───────────────────────────────────────────────────
function FocusShell() {
  const { phase } = useFocus();

  return (
    <div className="min-h-full pb-10">
      <AnimatePresence mode="wait">
        {phase === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <FocusHome />
          </motion.div>
        )}
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <SessionSetup />
          </motion.div>
        )}
        {(phase === "session" || phase === "break") && (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <FocusTimer />
          </motion.div>
        )}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <CompletionScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PAGE EXPORT ───────────────────────────────────────────────────
export default function Focus() {
  return (
    <FocusProvider>
      <FocusShell />
    </FocusProvider>
  );
}
