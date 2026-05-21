// FILE PATH: frontend/src/components/quiz/QuestionCard.jsx

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import AnswerOption from "./AnswerOption.jsx";
import ExplanationPanel from "./ExplanationPanel.jsx";

export default function QuestionCard({
  question,
  questionNumber,
  total,
  onAnswer, // (selectedIndex, isCorrect, xpEarned) => void
  accentColor = "#00FFC8",
  timedOut = false,
}) {
  const [selected, setSelected] = useState(null); // chosen option index
  const [revealed, setRevealed] = useState(false); // answer shown

  // Reset state when question changes
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [question?.id]);

  // Auto-reveal on timeout
  useEffect(() => {
    if (timedOut && !revealed) {
      setRevealed(true);
    }
  }, [timedOut, revealed]);

  const handleSelect = useCallback(
    (idx) => {
      if (revealed) return;
      setSelected(idx);
      setRevealed(true);
    },
    [revealed],
  );

  // Keyboard shortcuts: press 1–4 to select
  useEffect(() => {
    const handler = (e) => {
      if (revealed) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4 && question?.options?.[num - 1] !== undefined) {
        handleSelect(num - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, handleSelect, question]);

  if (!question) return null;

  const isCorrect = selected === question.correct;
  const xpEarned = revealed && isCorrect ? (question.xp ?? 50) : 0;

  const getOptionState = (idx) => {
    if (!revealed) return selected === idx ? "selected" : "idle";
    if (idx === question.correct) return "correct";
    if (idx === selected && !isCorrect) return "wrong";
    return "idle";
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-5"
    >
      {/* Question text */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] md:text-[16px] font-semibold text-white leading-relaxed flex-1">
            {question.question}
          </p>
          <div
            className="shrink-0 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
            style={{
              color:
                question.difficulty === "easy"
                  ? "#00FFC8"
                  : question.difficulty === "medium"
                    ? "#FFB347"
                    : "#FF6B2B",
              background:
                question.difficulty === "easy"
                  ? "rgba(0,255,200,0.08)"
                  : question.difficulty === "medium"
                    ? "rgba(255,179,71,0.08)"
                    : "rgba(255,107,43,0.08)",
            }}
          >
            {question.difficulty}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={10} className="text-[#7C6FFF]" />
          <span className="text-[10px] text-[#7C6FFF]/70">
            +{question.xp ?? 50} XP on correct
          </span>
          <span className="text-white/15 mx-1">·</span>
          <span className="text-[10px] text-white/25">Press 1–4 to select</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            index={idx}
            text={opt}
            state={getOptionState(idx)}
            onClick={() => handleSelect(idx)}
            disabled={revealed}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Post-answer area */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
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
                        borderColor: "rgba(0,255,100,0.25)",
                        color: "#00FF64",
                      }
                    : {
                        background: "rgba(255,60,60,0.08)",
                        borderColor: "rgba(255,60,60,0.25)",
                        color: "#FF6B6B",
                      }
                }
              >
                {isCorrect
                  ? `✓ Correct! +${question.xp ?? 50} XP`
                  : `✗ Wrong — correct answer: ${["A", "B", "C", "D"][question.correct]}`}
              </div>
            )}
            {timedOut && selected === null && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FFB347]/25 bg-[#FFB347]/08 text-[12px] font-bold text-[#FFB347]">
                ⏱ Time&apos;s up — correct answer:{" "}
                {["A", "B", "C", "D"][question.correct]}
              </div>
            )}

            {/* Explanation */}
            {question.explanation && (
              <ExplanationPanel
                explanation={question.explanation}
                isCorrect={isCorrect}
                accentColor={accentColor}
              />
            )}

            {/* Next button */}
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAnswer(selected, isCorrect, xpEarned)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-[13px] tracking-widest uppercase transition-all duration-200 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
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
                    "linear-gradient(90deg, transparent, white, transparent)",
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
