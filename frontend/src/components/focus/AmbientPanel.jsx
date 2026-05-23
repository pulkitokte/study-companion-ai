import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocus } from "../../context/FocusContext.jsx";

const TERMINAL_LINES = [
  "> FOCUS_CORE initialized...",
  "> Neural pathways: ACTIVE",
  "> Distraction shield: ENABLED",
  "> Loading study modules...",
  "> Memory consolidation: RUNNING",
  "> Cognitive boost: 94%",
  "> Deep work state: ENGAGED",
  "> Processing knowledge graph...",
  "> Synaptic efficiency: OPTIMAL",
  "> Anti-procrastination layer: ON",
  "> Flow state probability: HIGH",
  "> Session integrity: MAINTAINED",
];

const QUOTES = [
  "The successful warrior is the average person with laser-like focus.",
  "Deep work is not a skill. It's a superpower in a distracted world.",
  "Clarity comes from engagement, not thought.",
  "Do the hard thing first. Every other thing gets easier.",
  "One hour of focused work > six hours of scattered effort.",
  "Your environment is a product of your habits. Shape it deliberately.",
  "The ability to focus is the beginning of all achievement.",
];

export default function AmbientPanel() {
  const { phase, activeMode, FOCUS_MODES } = useFocus();
  const mode = FOCUS_MODES[activeMode] ?? FOCUS_MODES.pomodoro;

  const [visibleLines, setVisibleLines] = useState([]);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const lineIdxRef = useRef(0);

  // Drip in terminal lines
  useEffect(() => {
    if (phase !== "session" && phase !== "break") return;
    setVisibleLines([]);
    lineIdxRef.current = 0;
    const interval = setInterval(() => {
      const idx = lineIdxRef.current % TERMINAL_LINES.length;
      setVisibleLines((prev) => [...prev.slice(-5), TERMINAL_LINES[idx]]);
      lineIdxRef.current++;
    }, 3200);
    return () => clearInterval(interval);
  }, [phase]);

  // Rotate quotes
  useEffect(() => {
    const t = setInterval(
      () => setQuoteIdx((i) => (i + 1) % QUOTES.length),
      12000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none select-none space-y-3">
      {/* Terminal lines */}
      <div
        className="rounded-xl border border-white/[0.05] overflow-hidden"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]"
          style={{ background: "rgba(255,255,255,0.025)" }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: mode.color, opacity: 0.7 }}
          />
          <span className="text-[9px] text-white/18 tracking-widest uppercase font-mono">
            focus.core
          </span>
        </div>
        <div className="p-3 space-y-1 min-h-[80px] font-mono">
          <AnimatePresence>
            {visibleLines.map((line, i) => (
              <motion.p
                key={`${line}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: i === visibleLines.length - 1 ? 1 : 0.28 }}
                className="text-[10px] leading-relaxed"
                style={{
                  color:
                    i === visibleLines.length - 1
                      ? mode.color
                      : "rgba(255,255,255,0.28)",
                }}
              >
                {line}
                {i === visibleLines.length - 1 && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block ml-0.5 w-1.5 h-3 align-middle"
                    style={{ background: mode.color }}
                  />
                )}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Rotating quote */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.6 }}
          className="px-4 py-3 rounded-xl border border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-[11px] text-white/38 leading-relaxed italic">
            &ldquo;{QUOTES[quoteIdx]}&rdquo;
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
