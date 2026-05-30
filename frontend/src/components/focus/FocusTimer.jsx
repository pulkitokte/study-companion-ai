import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

function fmt(s) {
  const m = Math.floor(Math.max(s, 0) / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;
}

const C = 2 * Math.PI * 88;

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
    finishEarly,
  } = useFocus();

  const isBreak = phase === "break";
  const mode = FOCUS_MODES[activeMode] ?? FOCUS_MODES.pomodoro;
  const color = isBreak ? "#00FFC8" : mode.color;
  const dashOff = C * (1 - Math.max(pct, 0) / 100);

  useEffect(() => {
    if (!running) return;
    const t = document.title;
    document.title = `${fmt(secondsLeft)} — ${isBreak ? "Break" : mode.label} | StudyMind`;
    return () => {
      document.title = t;
    };
  }, [secondsLeft, running, isBreak, mode.label]);

  return (
    <div
      className={`flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#050508] overflow-auto"
          : "rounded-2xl border border-white/[0.06] overflow-hidden"
      }`}
      style={!isFullscreen ? { background: "#0A0A14" } : {}}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.09, 0.04] }}
          transition={{
            repeat: Infinity,
            duration: isBreak ? 4 : 2.5,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: color }}
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
              {pomodoroCount > 0 ? `${pomodoroCount} done` : "Session active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Main */}
      <div
        className={`relative flex flex-col ${isFullscreen ? "flex-1" : ""} items-center justify-center gap-8 px-6 py-8`}
      >
        {/* Ring */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.65, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: running ? 2 : 4,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: `${color}80` }}
          />
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="-rotate-90"
          >
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: dashOff }}
              transition={{ duration: 0.9, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 10px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              key={Math.floor(secondsLeft / 60)}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-[44px] font-black text-white leading-none tabular-nums"
            >
              {fmt(secondsLeft)}
            </motion.p>
            <p className="text-[11px] font-semibold mt-1" style={{ color }}>
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={resetSession}
            className="w-11 h-11 rounded-full flex items-center justify-center border border-white/[0.09] text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-all"
          >
            <RotateCcw size={15} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={pauseResume}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: isBreak
                ? "linear-gradient(135deg,#00FFC8,#00A884)"
                : mode.gradient,
              boxShadow: `0 0 30px ${color}50`,
            }}
          >
            {running ? (
              <Pause size={22} className="text-black" />
            ) : (
              <Play size={22} className="text-black ml-0.5" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={finishEarly}
            title="End session"
            className="w-11 h-11 rounded-full flex items-center justify-center border border-white/[0.09] text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-all"
          >
            <Coffee size={15} />
          </motion.button>
        </div>

        <p className="text-[9px] text-white/18">
          Space to pause · Esc to exit fullscreen
        </p>
        <div className="w-full max-w-sm">
          <AmbientPanel />
        </div>
      </div>
    </div>
  );
}
