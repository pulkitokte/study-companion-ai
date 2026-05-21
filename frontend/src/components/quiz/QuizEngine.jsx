// FILE PATH: frontend/src/components/quiz/QuizEngine.jsx
// Orchestrates the active quiz session.
// Manages: current question index, answers array, streak, XP accumulation,
// timer expiry, and transition to ScoreScreen on completion.

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, X } from "lucide-react";
import QuestionCard from "./QuestionCard.jsx";
import QuizProgress from "./QuizProgress.jsx";
import TimerBar from "./TimerBar.jsx";
import ScoreScreen from "./ScoreScreen.jsx";
import { CATEGORIES, DIFFICULTIES } from "../../data/mockQuizData.js";

const STREAK_BONUS_XP = 25; // extra XP per correct answer when streak >= 3

export default function QuizEngine({ questions, config, onHome }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // { selected, isCorrect, xp }
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState("quiz"); // 'quiz' | 'result'
  const [timedOut, setTimedOut] = useState(false);

  const timerKey = useRef(0); // increment to reset timer on each new question

  const cat = CATEGORIES.find((c) => c.id === config?.category);
  const diff = DIFFICULTIES.find((d) => d.id === config?.difficulty);
  const accentColor = cat?.color ?? "#FFB347";

  const currentQ = questions[currentIdx];
  const isLast = currentIdx >= questions.length - 1;

  const handleAnswer = useCallback(
    (selectedIdx, isCorrect, xpEarned) => {
      // Streak calc
      const newStreak = isCorrect ? streak + 1 : 0;
      const bonusXP = isCorrect && newStreak >= 3 ? STREAK_BONUS_XP : 0;
      const finalXP = xpEarned + bonusXP;
      const newMaxStreak = Math.max(maxStreak, newStreak);

      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setTotalXP((prev) => prev + finalXP);
      if (isCorrect) setCorrectCount((prev) => prev + 1);

      const newAnswers = [
        ...answers,
        { selected: selectedIdx, isCorrect, xp: finalXP },
      ];
      setAnswers(newAnswers);
      setTimedOut(false);
      timerKey.current++;

      if (isLast) {
        const total = newAnswers.length;
        const correct = newAnswers.filter((a) => a.isCorrect).length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        setPhase("result");
      } else {
        setCurrentIdx((i) => i + 1);
      }
    },
    [streak, maxStreak, answers, isLast],
  );

  const handleTimerExpire = useCallback(() => {
    setTimedOut(true);
  }, []);

  // Build result object for ScoreScreen
  const result = {
    correct: correctCount,
    wrong: answers.length - correctCount,
    totalXP,
    accuracy:
      answers.length > 0
        ? Math.round((correctCount / answers.length) * 100)
        : 0,
    total: questions.length,
    maxStreak,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ── ACTIVE QUIZ ── */}
        {phase === "quiz" && currentQ && (
          <motion.div
            key="quiz-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat?.emoji}</span>
                <span className="text-[11px] text-white/35 font-semibold">
                  {cat?.label}
                </span>
                <span className="text-white/15 text-[10px]">·</span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: diff?.color }}
                >
                  {diff?.label}
                </span>
              </div>
              <button
                onClick={onHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/25 hover:text-white/55 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all duration-200"
              >
                <X size={12} />
                Quit
              </button>
            </div>

            {/* Progress tracker */}
            <QuizProgress
              current={currentIdx + 1}
              total={questions.length}
              correctCount={correctCount}
              streak={streak}
              xpEarned={totalXP}
              accentColor={accentColor}
            />

            {/* Timer */}
            {diff && (
              <TimerBar
                key={`${timerKey.current}-${currentIdx}`}
                duration={diff.timePerQ}
                onExpire={handleTimerExpire}
                paused={timedOut}
                accentColor={accentColor}
              />
            )}

            {/* Question card */}
            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQ.id}
                question={currentQ}
                questionNumber={currentIdx + 1}
                total={questions.length}
                onAnswer={handleAnswer}
                accentColor={accentColor}
                timedOut={timedOut}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SCORE SCREEN ── */}
        {phase === "result" && (
          <motion.div
            key="quiz-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScoreScreen
              result={result}
              config={config}
              onRetry={() => onHome("retry")}
              onHome={() => onHome("home")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
