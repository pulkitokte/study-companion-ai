// FILE PATH: frontend/src/components/quiz/QuizHome.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Zap,
  Flame,
  Trophy,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";
import CategorySelector from "./CategorySelector.jsx";
import { DIFFICULTIES, CATEGORIES } from "../../data/mockQuizData.js";

const QUESTION_COUNTS = [5, 10, 15, 20];

// Load quiz history summary from localStorage
function loadStats() {
  try {
    const raw = localStorage.getItem("studymind_quiz_history");
    if (!raw) return { totalQuizzes: 0, totalXP: 0, bestAccuracy: 0 };
    const history = JSON.parse(raw);
    if (!Array.isArray(history) || history.length === 0)
      return { totalQuizzes: 0, totalXP: 0, bestAccuracy: 0 };
    const totalXP = history.reduce((s, q) => s + (q.totalXP ?? 0), 0);
    const bestAccuracy = Math.max(...history.map((q) => q.accuracy ?? 0));
    return { totalQuizzes: history.length, totalXP, bestAccuracy };
  } catch {
    return { totalQuizzes: 0, totalXP: 0, bestAccuracy: 0 };
  }
}

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const ITEM = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function QuizHome({ onStart }) {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [qCount, setQCount] = useState(10);
  const stats = loadStats();

  const selectedCat = CATEGORIES.find((c) => c.id === category);
  const selectedDiff = DIFFICULTIES.find((d) => d.id === difficulty);
  const canStart = !!category && !!difficulty;

  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* ── HERO ── */}
      <motion.div
        variants={ITEM}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,179,71,0.08), rgba(255,107,43,0.05), rgba(5,5,12,0))",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[280px] h-[180px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(255,179,71,0.15), transparent 70%)",
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Swords size={16} className="text-[#FFB347]" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#FFB347] uppercase">
                Quiz Arena
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              Test Your{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #FFB347, #FF6B2B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Knowledge
              </span>
            </h2>
            <p className="text-[12px] text-white/35 max-w-sm leading-relaxed">
              UPSC-standard questions. Adaptive difficulty. XP rewards. Level up
              your preparation.
            </p>
          </div>

          {/* Stats cluster */}
          <div className="flex gap-3 shrink-0">
            {[
              {
                icon: Trophy,
                val: stats.totalQuizzes,
                label: "Quizzes",
                color: "#FFD700",
              },
              {
                icon: Zap,
                val: stats.totalXP,
                label: "Total XP",
                color: "#7C6FFF",
              },
              {
                icon: Star,
                val: `${stats.bestAccuracy}%`,
                label: "Best",
                color: "#00FFC8",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03]"
                >
                  <Icon size={13} style={{ color: item.color }} />
                  <span className="text-[16px] font-black text-white leading-none">
                    {item.val}
                  </span>
                  <span className="text-[9px] text-white/25 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── CATEGORY ── */}
      <motion.div
        variants={ITEM}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <CategorySelector selected={category} onSelect={setCategory} />
      </motion.div>

      {/* ── DIFFICULTY ── */}
      <motion.div
        variants={ITEM}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[11px] text-white/35 tracking-widest uppercase mb-3">
          Difficulty
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DIFFICULTIES.map((diff, i) => {
            const isActive = difficulty === diff.id;
            return (
              <motion.button
                key={diff.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setDifficulty(diff.id)}
                className="flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all duration-200"
                style={{
                  background: isActive
                    ? `${diff.color}10`
                    : "rgba(255,255,255,0.025)",
                  borderColor: isActive
                    ? `${diff.color}50`
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isActive ? `0 0 16px ${diff.color}15` : "none",
                }}
              >
                <span
                  className="text-[14px] font-black"
                  style={{
                    color: isActive ? diff.color : "rgba(255,255,255,0.6)",
                  }}
                >
                  {diff.label}
                </span>
                <span className="text-[9px] text-white/28 leading-snug">
                  {diff.description}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={9} style={{ color: diff.color, opacity: 0.7 }} />
                  <span
                    className="text-[9px]"
                    style={{ color: `${diff.color}80` }}
                  >
                    {diff.timePerQ}s / question
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── QUESTION COUNT ── */}
      <motion.div
        variants={ITEM}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[11px] text-white/35 tracking-widest uppercase mb-3">
          Number of Questions
        </p>
        <div className="flex gap-2 flex-wrap">
          {QUESTION_COUNTS.map((n) => {
            const isActive = qCount === n;
            return (
              <motion.button
                key={n}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setQCount(n)}
                className="px-5 py-2.5 rounded-xl border text-[13px] font-black transition-all duration-200"
                style={{
                  background: isActive
                    ? "rgba(124,111,255,0.12)"
                    : "rgba(255,255,255,0.03)",
                  borderColor: isActive
                    ? "rgba(124,111,255,0.5)"
                    : "rgba(255,255,255,0.08)",
                  color: isActive ? "#7C6FFF" : "rgba(255,255,255,0.45)",
                  boxShadow: isActive
                    ? "0 0 14px rgba(124,111,255,0.2)"
                    : "none",
                }}
              >
                {n}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── START CTA ── */}
      <motion.div
        variants={ITEM}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <motion.button
          whileHover={canStart ? { scale: 1.03 } : {}}
          whileTap={canStart ? { scale: 0.97 } : {}}
          onClick={() =>
            canStart && onStart({ category, difficulty, count: qCount })
          }
          disabled={!canStart}
          className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-[14px] tracking-widest uppercase transition-all duration-300"
          style={{
            background: canStart
              ? "linear-gradient(135deg, #FFB347, #FF6B2B)"
              : "rgba(255,255,255,0.05)",
            color: canStart ? "#000" : "rgba(255,255,255,0.2)",
            boxShadow: canStart ? "0 0 40px rgba(255,179,71,0.3)" : "none",
            cursor: canStart ? "pointer" : "not-allowed",
          }}
        >
          {canStart && (
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
                  "linear-gradient(90deg, transparent, white, transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          )}
          <Flame size={16} className="relative" />
          <span className="relative">
            {canStart ? `Start ${qCount} Questions` : "Select Category First"}
          </span>
          {canStart && <ChevronRight size={16} className="relative" />}
        </motion.button>

        {/* Preview */}
        {canStart && selectedCat && selectedDiff && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[11px] text-white/30"
          >
            <span>{selectedCat.emoji}</span>
            <span>{selectedCat.label}</span>
            <span className="text-white/15">·</span>
            <span style={{ color: selectedDiff.color }}>
              {selectedDiff.label}
            </span>
            <span className="text-white/15">·</span>
            <span>
              ~{Math.round((qCount * selectedDiff.timePerQ) / 60)} min
            </span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
