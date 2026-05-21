// FILE PATH: frontend/src/components/quiz/AnswerOption.jsx

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D"];

export default function AnswerOption({
  index,
  text,
  state, // 'idle' | 'selected' | 'correct' | 'wrong' | 'reveal'
  onClick,
  disabled = false,
  accentColor = "#00FFC8",
}) {
  const isIdle = state === "idle";
  const isSelected = state === "selected";
  const isCorrect = state === "correct";
  const isWrong = state === "wrong";
  const isReveal = state === "reveal"; // correct answer shown after wrong pick

  // Visual config per state
  let bg = "rgba(255,255,255,0.025)";
  let border = "rgba(255,255,255,0.07)";
  let color = "rgba(255,255,255,0.62)";
  let shadow = "none";
  let badgeBg = "rgba(255,255,255,0.05)";
  let badgeColor = "rgba(255,255,255,0.3)";

  if (isSelected) {
    bg = `${accentColor}12`;
    border = `${accentColor}55`;
    color = accentColor;
    shadow = `0 0 18px ${accentColor}1A`;
    badgeBg = `${accentColor}22`;
    badgeColor = accentColor;
  }
  if (isCorrect) {
    bg = "rgba(0,255,100,0.1)";
    border = "rgba(0,255,100,0.45)";
    color = "#00FF64";
    shadow = "0 0 20px rgba(0,255,100,0.18)";
    badgeBg = "rgba(0,255,100,0.2)";
    badgeColor = "#00FF64";
  }
  if (isWrong) {
    bg = "rgba(255,60,60,0.1)";
    border = "rgba(255,60,60,0.45)";
    color = "#FF6B6B";
    shadow = "0 0 18px rgba(255,60,60,0.15)";
    badgeBg = "rgba(255,60,60,0.2)";
    badgeColor = "#FF6B6B";
  }
  if (isReveal) {
    bg = "rgba(0,255,100,0.07)";
    border = "rgba(0,255,100,0.3)";
    color = "rgba(0,255,100,0.8)";
    shadow = "none";
    badgeBg = "rgba(0,255,100,0.12)";
    badgeColor = "rgba(0,255,100,0.7)";
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      whileHover={!disabled && isIdle ? { scale: 1.015, x: 3 } : {}}
      whileTap={!disabled && isIdle ? { scale: 0.985 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden"
      style={{
        background: bg,
        borderColor: border,
        boxShadow: shadow,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {/* Correct glow sweep */}
      {isCorrect && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-0 w-1/2 opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00FF64, transparent)",
          }}
        />
      )}

      {/* Letter badge */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 border transition-all duration-200"
        style={{ background: badgeBg, borderColor: border, color: badgeColor }}
      >
        {LETTERS[index]}
      </div>

      {/* Option text */}
      <span
        className="flex-1 text-[13px] leading-snug transition-colors duration-200"
        style={{ color }}
      >
        {text}
      </span>

      {/* State icon */}
      {isCorrect && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <CheckCircle2
            size={17}
            style={{ color: "#00FF64" }}
            className="shrink-0"
          />
        </motion.div>
      )}
      {isReveal && (
        <CheckCircle2
          size={17}
          style={{ color: "rgba(0,255,100,0.6)" }}
          className="shrink-0"
        />
      )}
      {isWrong && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <XCircle
            size={17}
            style={{ color: "#FF6B6B" }}
            className="shrink-0"
          />
        </motion.div>
      )}
    </motion.button>
  );
}
