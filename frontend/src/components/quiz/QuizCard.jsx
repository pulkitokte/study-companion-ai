// FILE PATH: frontend/src/components/quiz/QuizCard.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from "lucide-react";

export default function QuizCard({
  question,
  questionNumber,
  total,
  onAnswer,
  accentColor = "#00FFC8",
}) {
  const [selected, setSelected] = useState(null); // index of chosen option
  const [showResult, setShowResult] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  if (!question) return null;

  const isCorrect = selected === question.correct;

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
  };

  const handleNext = () => {
    onAnswer(selected);
    setSelected(null);
    setShowResult(false);
    setShowExplain(false);
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-2xl mx-auto space-y-5"
    >
      {/* Question header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] text-white/30">
          <span className="tracking-widest uppercase">
            Question {questionNumber} of {total}
          </span>
          <span
            className="px-2 py-0.5 rounded font-bold"
            style={{
              color:
                question.difficulty === "easy"
                  ? "#00FFC8"
                  : question.difficulty === "medium"
                    ? "#FFB347"
                    : "#FF6B2B",
              background:
                question.difficulty === "easy"
                  ? "rgba(0,255,200,0.1)"
                  : question.difficulty === "medium"
                    ? "rgba(255,179,71,0.1)"
                    : "rgba(255,107,43,0.1)",
            }}
          >
            {question.difficulty?.toUpperCase()} · +{question.xp} XP
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${((questionNumber - 1) / total) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Question text */}
        <p className="text-[15px] md:text-[16px] font-semibold text-white leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((option, idx) => {
          const isChosen = selected === idx;
          const isRight = showResult && idx === question.correct;
          const isWrong = showResult && isChosen && !isCorrect;

          let bg = "rgba(255,255,255,0.03)";
          let border = "rgba(255,255,255,0.08)";
          let color = "rgba(255,255,255,0.65)";
          let shadow = "none";

          if (isRight) {
            bg = "rgba(0,255,100,0.1)";
            border = "rgba(0,255,100,0.4)";
            color = "#00FF64";
            shadow = "0 0 16px rgba(0,255,100,0.15)";
          }
          if (isWrong) {
            bg = "rgba(255,60,60,0.1)";
            border = "rgba(255,60,60,0.4)";
            color = "#FF3C3C";
            shadow = "0 0 16px rgba(255,60,60,0.15)";
          }
          if (!showResult && isChosen) {
            bg = `${accentColor}10`;
            border = `${accentColor}50`;
            color = accentColor;
          }

          return (
            <motion.button
              key={idx}
              whileHover={!showResult ? { scale: 1.015, x: 4 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200"
              style={{
                background: bg,
                borderColor: border,
                boxShadow: shadow,
                color,
                cursor: showResult ? "default" : "pointer",
              }}
            >
              {/* Letter badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 border transition-all duration-200"
                style={{
                  background: showResult ? "transparent" : `${accentColor}10`,
                  borderColor: showResult ? border : `${accentColor}30`,
                  color,
                }}
              >
                {["A", "B", "C", "D"][idx]}
              </div>

              <span className="flex-1 text-[13px] leading-snug">{option}</span>

              {/* Result icons */}
              <AnimatePresence>
                {isRight && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle2 size={18} style={{ color: "#00FF64" }} />
                  </motion.div>
                )}
                {isWrong && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <XCircle size={18} style={{ color: "#FF3C3C" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Correct / Wrong banner */}
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
              {isCorrect ? (
                <>
                  <CheckCircle2 size={14} /> Correct! +{question.xp} XP earned
                </>
              ) : (
                <>
                  <XCircle size={14} /> Incorrect — correct answer:{" "}
                  {["A", "B", "C", "D"][question.correct]}
                </>
              )}
            </div>

            {/* Explanation toggle */}
            <button
              onClick={() => setShowExplain((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 transition-colors"
            >
              <Lightbulb size={12} style={{ color: "#FFD700" }} />
              {showExplain ? "Hide" : "Show"} explanation
            </button>

            <AnimatePresence>
              {showExplain && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 rounded-xl border border-[#FFD700]/15 bg-[#FFD700]/05 text-[12px] text-white/50 leading-relaxed">
                    {question.explanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] tracking-wide transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
                color: "#000",
                boxShadow: `0 0 20px ${accentColor}30`,
              }}
            >
              {questionNumber < total ? "Next Question" : "View Results"}
              <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
