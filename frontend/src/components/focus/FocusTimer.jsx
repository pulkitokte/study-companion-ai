import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Coffee,
  Zap,
} from "lucide-react";
import { useFocus } from "../../context/FocusContext.jsx";
import AmbientPanel from "./AmbientPanel.jsx";

function fmtTime(secs) {
  const m = Math.floor(secs / 60),
    s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const CIRCUMFERENCE = 2 * Math.PI * 88;

export default function FocusTimer() {
  const {
    phase,
    config,
    activeMode,
    FOCUS_MODES,
    secondsLeft,
    totalSeconds,
    pct,
    running,
    pomodoroCount,
    xpEarned,
    isFullscreen,
    setIsFullscreen,
    pauseResume,
    resetSession,
    exitToHome,
    finishSession,
  } = useFocus();

  const mode = FOCUS_MODES[activeMode] ?? FOCUS_MODES.pomodoro;
  const isBreak = phase === "break";
  const dashOffset = CIRCUMFERENCE * (1 - pct / 100);

  // Pulse document title
  useEffect(() => {
    const orig = document.title;
    if (!running) return;
    document.title = `${fmtTime(secondsLeft)} — ${isBreak ? "Break" : mode.label} | StudyMind`;
    return () => {
      document.title = orig;
    };
  }, [secondsLeft, running, isBreak, mode.label]);

  return (
    <motion.div
      animate={isFullscreen ? { position: "fixed", inset: 0, zIndex: 50 } : {}}
      transition={{ duration: 0.3 }}
      className={`
        flex flex-col
        ${
          isFullscreen
            ? "fixed inset-0 z-50 bg-[#050508] overflow-auto"
            : "relative rounded-2xl border border-white/[0.06] overflow-hidden"
        }
      `}
      style={!isFullscreen ? { background: "#0A0A14" } : {}}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{
            repeat: Infinity,
            duration: isBreak ? 4 : 2.5,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: isBreak ? "#00FFC8" : mode.color }}
        />
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">{mode.emoji}</span>
          <div>
            <p className="text-[12px] font-black text-white">
              {isBreak ? "☕ Break Time" : mode.label}
            </p>
            <p className="text-[10px] text-white/28">
              {config?.subject ? `${config.subject} · ` : ""}
              {pomodoroCount > 0
                ? `${pomodoroCount} sessions done`
                : "Session active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* XP counter */}
          {xpEarned > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#7C6FFF]/25 bg-[#7C6FFF]/08">
              <Zap size={10} className="text-[#7C6FFF]" />
              <span className="text-[10px] font-bold text-[#7C6FFF]">
                +{xpEarned}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-2 rounded-lg text-white/25 hover:text-white/55 hover:bg-white/[0.06] transition-colors"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={exitToHome}
            className="p-2 rounded-lg text-white/25 hover:text-red-400/65 hover:bg-red-500/[0.07] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div
        className={`relative flex flex-col ${isFullscreen ? "flex-1" : ""} items-center justify-center gap-8 px-6 py-8`}
      >
        {/* Circular timer */}
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: running ? 2 : 4,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: isBreak ? "#00FFC880" : `${mode.color}80` }}
          />

          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress */}
            <motion.circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={isBreak ? "#00FFC8" : mode.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.9, ease: "linear" }}
              style={{
                filter: `drop-shadow(0 0 10px ${isBreak ? "#00FFC8" : mode.color})`,
              }}
            />
            {/* Tick marks */}
            {Array.from({ length: 12 }, (_, i) => {
              const ang = ((i / 12) * 360 - 90) * (Math.PI / 180);
              const r1 = 96,
                r2 = 100;
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.cos(ang)}
                  y1={100 + r1 * Math.sin(ang)}
                  x2={100 + r2 * Math.cos(ang)}
                  y2={100 + r2 * Math.sin(ang)}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Center time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              key={Math.floor(secondsLeft / 60)}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-[44px] font-black text-white leading-none tabular-nums"
            >
              {fmtTime(secondsLeft)}
            </motion.p>
            <p
              className="text-[11px] font-semibold mt-1"
              style={{ color: isBreak ? "#00FFC8" : mode.color }}
            >
              {isBreak
                ? "Rest & recover"
                : running
                  ? "stay locked in"
                  : "paused"}
            </p>
            {config?.goal && (
              <p className="text-[10px] text-white/22 mt-1.5 text-center max-w-[120px] leading-snug">
                {config.goal}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Reset */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={resetSession}
            className="w-11 h-11 rounded-full flex items-center justify-center border border-white/[0.09] text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-all"
          >
            <RotateCcw size={15} />
          </motion.button>

          {/* Play/Pause — primary */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={pauseResume}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: isBreak
                ? "linear-gradient(135deg,#00FFC8,#00A884)"
                : mode.gradient,
              boxShadow: `0 0 30px ${isBreak ? "#00FFC8" : mode.color}50`,
            }}
          >
            {running ? (
              <Pause size={22} className="text-black" />
            ) : (
              <Play size={22} className="text-black ml-0.5" />
            )}
          </motion.button>

          {/* Finish early */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => finishSession(0)}
            className="w-11 h-11 rounded-full flex items-center justify-center border border-white/[0.09] text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-all"
            title="End session"
          >
            <Coffee size={15} />
          </motion.button>
        </div>

        <p className="text-[9px] text-white/18">
          Space to pause · Esc to exit fullscreen
        </p>

        {/* Ambient panel (only in session/break) */}
        {(phase === "session" || phase === "break") && (
          <div className="w-full max-w-sm">
            <AmbientPanel />
          </div>
        )}
      </div>
    </motion.div>
  );
}
