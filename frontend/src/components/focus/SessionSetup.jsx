import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Target, BookOpen, Zap } from "lucide-react";
import { useFocus } from "../../context/FocusContext.jsx";
import ModeSelector from "./ModeSelector.jsx";

const DURATIONS = {
  pomodoro: [15, 25, 30, 45],
  deepwork: [60, 90, 120, 180],
  sprint: [10, 15, 20, 25],
};

const SUBJECTS = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Science & Tech",
  "Environment",
  "Current Affairs",
  "CSAT",
  "Maths",
  "Reasoning",
  "General",
];

export default function SessionSetup() {
  const { FOCUS_MODES, startSession, exitToHome } = useFocus();

  const [mode, setMode] = useState("pomodoro");
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");

  const modeData = FOCUS_MODES[mode];

  const handleModeChange = (m) => {
    setMode(m);
    setWorkMins(FOCUS_MODES[m].defaultWork);
    setBreakMins(FOCUS_MODES[m].defaultBreak);
  };

  const handleStart = () => {
    startSession({
      mode,
      workMinutes: workMins,
      breakMinutes: breakMins,
      subject,
      goal,
    });
  };

  const estXP = Math.round(workMins * modeData.xpPerMinute);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div>
        <button
          onClick={exitToHome}
          className="text-[11px] text-white/28 hover:text-white/55 transition-colors mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h2 className="text-[24px] font-black text-white">Configure Session</h2>
        <p className="text-[12px] text-white/30 mt-1">
          Set up your deep work environment.
        </p>
      </div>

      {/* Mode selector */}
      <div className="space-y-2">
        <p className="text-[11px] text-white/30 uppercase tracking-widest">
          Session Mode
        </p>
        <ModeSelector selected={mode} onSelect={handleModeChange} />
      </div>

      {/* Duration config */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5 space-y-5"
        style={{ background: "#0A0A14" }}
      >
        {/* Work duration */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] text-white/35 uppercase tracking-widest">
            <Target size={11} style={{ color: modeData.color }} />
            Work Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS[mode].map((mins) => {
              const isActive = workMins === mins;
              return (
                <motion.button
                  key={mins}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWorkMins(mins)}
                  className="px-4 py-2 rounded-xl border text-[13px] font-black transition-all duration-200"
                  style={{
                    background: isActive
                      ? `${modeData.color}14`
                      : "rgba(255,255,255,0.03)",
                    borderColor: isActive
                      ? `${modeData.color}55`
                      : "rgba(255,255,255,0.08)",
                    color: isActive ? modeData.color : "rgba(255,255,255,0.4)",
                    boxShadow: isActive
                      ? `0 0 14px ${modeData.color}1A`
                      : "none",
                  }}
                >
                  {mins}m
                </motion.button>
              );
            })}
            {/* Custom input */}
            <input
              type="number"
              min={1}
              max={300}
              value={workMins}
              onChange={(e) =>
                setWorkMins(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-20 px-3 py-2 rounded-xl border bg-white/[0.03] text-white/60 text-[12px] outline-none text-center"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
        </div>

        {/* Break duration (not for sprint) */}
        {mode !== "sprint" && (
          <div className="space-y-3">
            <label className="text-[11px] text-white/30 uppercase tracking-widest flex items-center gap-2">
              ☕ Break Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {[3, 5, 10, 15, 20].map((mins) => {
                const isActive = breakMins === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => setBreakMins(mins)}
                    className="px-3 py-1.5 rounded-xl border text-[12px] font-bold transition-all duration-200"
                    style={{
                      background: isActive
                        ? "rgba(0,255,200,0.1)"
                        : "rgba(255,255,255,0.03)",
                      borderColor: isActive
                        ? "rgba(0,255,200,0.4)"
                        : "rgba(255,255,255,0.08)",
                      color: isActive ? "#00FFC8" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Subject + Goal */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
        style={{ background: "#0A0A14" }}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] text-white/30 uppercase tracking-widest">
            <BookOpen size={11} style={{ color: modeData.color }} />
            Subject (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const isActive = subject === s;
              return (
                <button
                  key={s}
                  onClick={() => setSubject(isActive ? "" : s)}
                  className="px-3 py-1.5 rounded-full border text-[11px] transition-all duration-200"
                  style={{
                    background: isActive
                      ? `${modeData.color}12`
                      : "rgba(255,255,255,0.025)",
                    borderColor: isActive
                      ? `${modeData.color}45`
                      : "rgba(255,255,255,0.07)",
                    color: isActive ? modeData.color : "rgba(255,255,255,0.35)",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] text-white/30 uppercase tracking-widest">
            Session Goal (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Complete Chapter 4 of Polity NCERT"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-white/[0.03] text-white placeholder-white/18 text-[13px] outline-none transition-all duration-200"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => {
              e.target.style.borderColor = `${modeData.color}45`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
        </div>
      </div>

      {/* XP preview + Start */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-[14px] tracking-widest uppercase"
          style={{
            background: modeData.gradient,
            color: "#000",
            boxShadow: `0 0 40px ${modeData.color}30`,
          }}
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: "linear",
              repeatDelay: 1,
            }}
            className="absolute inset-y-0 w-1/3 opacity-20"
            style={{
              background:
                "linear-gradient(90deg,transparent,white,transparent)",
              transform: "skewX(-20deg)",
            }}
          />
          <span className="relative">
            {modeData.emoji} Start {workMins}m Session
          </span>
          <ChevronRight size={16} className="relative" />
        </motion.button>

        <div className="flex items-center gap-1.5 text-[11px] text-white/28">
          <Zap size={11} className="text-[#7C6FFF]" />
          <span>
            Earn up to{" "}
            <span className="font-bold text-[#7C6FFF]">+{estXP} XP</span> on
            completion
          </span>
        </div>
      </div>
    </motion.div>
  );
}
