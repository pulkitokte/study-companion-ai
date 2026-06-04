import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  X,
  Swords,
  Timer,
  BarChart3,
  Zap,
  MessageSquareHeart,
} from "lucide-react";
import { aggregateAll } from "../../utils/globalStats.js";

const PROMPTS = [
  "Ready to crush today's quiz? 🎯",
  "Your streak is counting on you. ⚡",
  "A 25-minute focus session beats 3 hours of distraction.",
  "Check your weak subjects — one targeted session changes everything.",
  "You're closer to the next rank than you think. 💪",
];

const SHORTCUTS = [
  { label: "Start Quiz", icon: Swords, color: "#FFB347", path: "/quiz" },
  { label: "Focus Session", icon: Timer, color: "#00FFC8", path: "/focus" },
  {
    label: "Chat with AI",
    icon: MessageSquareHeart,
    color: "#FF6B9D",
    path: "/chat",
  },
  { label: "Progress", icon: BarChart3, color: "#7C6FFF", path: "/progress" },
];

export default function FloatingAssistant() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const stats = aggregateAll();
  const panelRef = useRef(null);

  useEffect(() => {
    const t = setInterval(
      () => setTipIdx((i) => (i + 1) % PROMPTS.length),
      8000,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[150] flex flex-col items-end gap-3"
    >
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-[260px] rounded-2xl border border-white/[0.09] overflow-hidden"
            style={{
              background: "rgba(8,8,15,0.97)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
              style={{ background: "rgba(0,255,200,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full blur-sm bg-[#00FFC8]"
                  />
                  <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                    <Brain size={12} className="text-black" />
                  </div>
                </div>
                <span className="text-[12px] font-bold text-white">
                  StudyMind AI
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/25 hover:text-white/55 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.05]">
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-[#7C6FFF]" />
                <span className="text-[11px] font-bold text-[#7C6FFF]">
                  {(stats.totalXP ?? 0).toLocaleString()} XP
                </span>
              </div>
              <span className="text-white/15">·</span>
              <span className="text-[11px] text-white/40">
                Lv.{stats.level ?? 1} {stats.rank?.emoji ?? "🥉"}
              </span>
            </div>

            {/* Tip */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="px-4 py-3 border-b border-white/[0.05]"
              >
                <p className="text-[11px] text-white/50 leading-relaxed">
                  {PROMPTS[tipIdx]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Shortcuts */}
            <div className="p-3 grid grid-cols-2 gap-1.5">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.label}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      navigate(s.path);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
                    style={{ background: `${s.color}08` }}
                  >
                    <Icon size={13} style={{ color: s.color }} />
                    <span className="text-[11px] font-semibold text-white/55">
                      {s.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((o) => !o)}
        className="relative w-13 h-13 rounded-full flex items-center justify-center"
        style={{
          width: 52,
          height: 52,
          background: open
            ? "linear-gradient(135deg,#FF6B9D,#7C6FFF)"
            : "linear-gradient(135deg,#00FFC8,#7C6FFF)",
          boxShadow: `0 0 30px ${open ? "#7C6FFF" : "#00FFC8"}50`,
        }}
      >
        {/* Pulse */}
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 rounded-full"
            style={{ background: "#00FFC8" }}
          />
        )}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {open ? (
            <X size={20} className="text-white" />
          ) : (
            <Brain size={20} className="text-black" strokeWidth={2.5} />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
