import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";

const BOOT_LINES = [
  "Initializing StudyMind OS...",
  "Loading knowledge graph...",
  "Syncing study profile...",
  "Calibrating AI companion...",
  "Activating focus engine...",
  "System ready.",
];

export default function LoadingScreen({ onComplete }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIdx((i) => {
        const next = i + 1;
        setProgress(Math.round((next / BOOT_LINES.length) * 100));
        if (next >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(() => {
            setDone(true);
            setTimeout(onComplete, 500);
          }, 500);
        }
        return Math.min(next, BOOT_LINES.length - 1);
      });
    }, 320);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508]"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04] }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle,#7C6FFF,#00FFC8)" }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-8"
          >
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-2xl blur-xl"
              style={{ background: "linear-gradient(135deg,#00FFC8,#7C6FFF)" }}
            />
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center border border-white/[0.1]"
              style={{
                background: "linear-gradient(135deg,#00FFC840,#7C6FFF40)",
              }}
            >
              <Brain size={36} className="text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-10"
          >
            <p className="text-2xl font-black tracking-[0.25em] text-white uppercase">
              StudyMind
            </p>
            <p className="text-[11px] tracking-[0.4em] text-[#00FFC8]/50 uppercase mt-1">
              AI Companion
            </p>
          </motion.div>

          {/* Boot terminal */}
          <div className="w-[320px] space-y-4">
            <div
              className="rounded-xl border border-white/[0.06] overflow-hidden font-mono"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <div
                className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                {["#FF3C3C", "#FFB347", "#00FF64"].map((c, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c, opacity: 0.7 }}
                  />
                ))}
              </div>
              <div className="p-4 space-y-1.5 min-h-[120px]">
                {BOOT_LINES.slice(0, lineIdx + 1).map((line, i) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: i === lineIdx ? 1 : 0.3 }}
                    className="text-[11px] leading-relaxed"
                    style={{
                      color:
                        i === lineIdx ? "#00FFC8" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {">"} {line}
                    {i === lineIdx && i < BOOT_LINES.length - 1 && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="inline-block ml-0.5 w-[7px] h-[11px] align-middle"
                        style={{ background: "#00FFC8" }}
                      />
                    )}
                  </motion.p>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[9px] text-white/25 mb-1.5">
                <span>Loading system</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg,#00FFC8,#7C6FFF)",
                    boxShadow: "0 0 8px rgba(0,255,200,0.5)",
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
