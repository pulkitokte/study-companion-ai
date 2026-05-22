import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D"];

export default function AnswerOption({
  index,
  text,
  state,
  onClick,
  disabled = false,
  accentColor = "#00FFC8",
}) {
  const isIdle = state === "idle";
  const isCorrect = state === "correct";
  const isWrong = state === "wrong";
  const isReveal = state === "reveal";

  let bg = "rgba(255,255,255,0.025)",
    border = "rgba(255,255,255,0.07)",
    color = "rgba(255,255,255,0.62)";
  if (state === "selected") {
    bg = `${accentColor}12`;
    border = `${accentColor}55`;
    color = accentColor;
  }
  if (isCorrect) {
    bg = "rgba(0,255,100,0.1)";
    border = "rgba(0,255,100,0.45)";
    color = "#00FF64";
  }
  if (isWrong) {
    bg = "rgba(255,60,60,0.1)";
    border = "rgba(255,60,60,0.45)";
    color = "#FF6B6B";
  }
  if (isReveal) {
    bg = "rgba(0,255,100,0.07)";
    border = "rgba(0,255,100,0.28)";
    color = "rgba(0,255,100,0.75)";
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.055, duration: 0.22 }}
      whileHover={!disabled && isIdle ? { scale: 1.015, x: 3 } : {}}
      whileTap={!disabled && isIdle ? { scale: 0.985 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden"
      style={{
        background: bg,
        borderColor: border,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {isCorrect && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute inset-y-0 w-1/2 opacity-15 bg-gradient-to-r from-transparent via-green-400 to-transparent"
        />
      )}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 border"
        style={{ background: `${border}20`, borderColor: border, color }}
      >
        {LETTERS[index]}
      </div>
      <span className="flex-1 text-[13px] leading-snug" style={{ color }}>
        {text}
      </span>
      {isCorrect && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <CheckCircle2 size={16} style={{ color: "#00FF64" }} />
        </motion.div>
      )}
      {isWrong && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <XCircle size={16} style={{ color: "#FF6B6B" }} />
        </motion.div>
      )}
      {isReveal && (
        <CheckCircle2 size={16} style={{ color: "rgba(0,255,100,0.55)" }} />
      )}
    </motion.button>
  );
}
