import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import AnswerOption from "./AnswerOption.jsx";
import ExplanationPanel from "./ExplanationPanel.jsx";

export default function QuestionCard({
  question,
  questionNumber,
  total,
  onAnswer,
  accentColor = "#00FFC8",
  timedOut = false,
}) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [question?.id]);

  useEffect(() => {
    if (timedOut && !revealed) setRevealed(true);
  }, [timedOut, revealed]);

  const handleSelect = useCallback(
    (idx) => {
      if (revealed) return;
      setSelected(idx);
      setRevealed(true);
    },
    [revealed],
  );

  useEffect(() => {
    const handler = (e) => {
      if (revealed) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 4 && question?.options?.[n - 1] !== undefined)
        handleSelect(n - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, handleSelect, question]);

  if (!question) return null;

  const isCorrect = selected === question.correct;
  const xpEarned = revealed && isCorrect ? (question.xp ?? 50) : 0;

  const getState = (idx) => {
    if (!revealed) return selected === idx ? "selected" : "idle";
    if (idx === question.correct) return "correct";
    if (idx === selected && !isCorrect) return "wrong";
    return "idle";
  };

  const diffColor =
    question.difficulty === "easy"
      ? "#00FFC8"
      : question.difficulty === "medium"
        ? "#FFB347"
        : "#FF6B2B";

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-5"
    >
      {/* Question header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] md:text-[16px] font-semibold text-white leading-relaxed flex-1">
            {question.question}
          </p>
          <span
            className="shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold uppercase"
            style={{ color: diffColor, background: `${diffColor}12` }}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={10} className="text-[#7C6FFF]" />
          <span className="text-[10px] text-[#7C6FFF]/65">
            +{question.xp ?? 50} XP on correct
          </span>
          <span className="text-white/15 mx-1">·</span>
          <span className="text-[10px] text-white/22">Keys 1–4 to select</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            index={idx}
            text={opt}
            state={getState(idx)}
            onClick={() => handleSelect(idx)}
            disabled={revealed}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Post-reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
          >
            {/* Result banner */}
            {!timedOut && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[12px] font-bold"
                style={
                  isCorrect
                    ? {
                        background: "rgba(0,255,100,0.08)",
                        borderColor: "rgba(0,255,100,0.28)",
                        color: "#00FF64",
                      }
                    : {
                        background: "rgba(255,60,60,0.08)",
                        borderColor: "rgba(255,60,60,0.28)",
                        color: "#FF6B6B",
                      }
                }
              >
                {isCorrect
                  ? `✓ Correct! +${question.xp ?? 50} XP`
                  : `✗ Wrong — correct: ${["A", "B", "C", "D"][question.correct]}`}
              </div>
            )}
            {timedOut && selected === null && (
              <div className="px-4 py-2.5 rounded-xl border border-[#FFB347]/25 bg-[#FFB347]/08 text-[12px] font-bold text-[#FFB347]">
                ⏱ Time&apos;s up — correct:{" "}
                {["A", "B", "C", "D"][question.correct]}
              </div>
            )}

            {question.explanation && (
              <ExplanationPanel
                explanation={question.explanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAnswer(selected, isCorrect, xpEarned)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-[13px] tracking-widest uppercase relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg,${accentColor}CC,${accentColor})`,
                color: "#000",
                boxShadow: `0 0 24px ${accentColor}30`,
              }}
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear",
                  repeatDelay: 1.5,
                }}
                className="absolute inset-y-0 w-1/3 opacity-20"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,white,transparent)",
                  transform: "skewX(-20deg)",
                }}
              />
              <span className="relative">
                {questionNumber >= total ? "View Results" : "Next Question"}
              </span>
              <ChevronRight size={15} className="relative" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
