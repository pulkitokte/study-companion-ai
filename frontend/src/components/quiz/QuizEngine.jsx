import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import QuestionCard from "./QuestionCard.jsx";
import QuizProgress from "./QuizProgress.jsx";
import TimerBar from "./TimerBar.jsx";
import ScoreScreen from "./ScoreScreen.jsx";
import AchievementPopup from "./AchievementPopup.jsx";
import { CATEGORIES, DIFFICULTIES } from "../../data/mockQuizData.js";
import {
  saveQuizSession,
  getPerformanceStats,
  checkAndUnlockAchievements,
} from "../../utils/quizStorage.js";

const STREAK_BONUS = 25;

export default function QuizEngine({ questions, config, onHome }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState("quiz"); // 'quiz' | 'result'
  const [timedOut, setTimedOut] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const timerKey = useRef(0);
  const startTime = useRef(Date.now());

  const cat = CATEGORIES.find((c) => c.id === config?.category);
  const diff = DIFFICULTIES.find((d) => d.id === config?.difficulty);
  const accentColor = cat?.color ?? "#FFB347";
  const currentQ = questions[currentIdx];
  const isLast = currentIdx >= questions.length - 1;

  const handleAnswer = useCallback(
    (selectedIdx, isCorrect, xpEarned) => {
      const newStreak = isCorrect ? streak + 1 : 0;
      const bonusXP = isCorrect && newStreak >= 3 ? STREAK_BONUS : 0;
      const finalXP = (xpEarned ?? 0) + bonusXP;
      const newMaxStreak = Math.max(maxStreak, newStreak);
      const newCorrect = isCorrect ? correctCount + 1 : correctCount;

      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setTotalXP((p) => p + finalXP);
      if (isCorrect) setCorrectCount(newCorrect);

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
        const sessionXP = totalXP + finalXP;
        const duration = Math.round((Date.now() - startTime.current) / 1000);

        const session = {
          category: config.category,
          difficulty: config.difficulty,
          total,
          correct,
          wrong: total - correct,
          accuracy,
          totalXP: sessionXP,
          maxStreak: newMaxStreak,
          durationSeconds: duration,
        };

        saveQuizSession(session);
        const stats = getPerformanceStats();
        const newly = checkAndUnlockAchievements(session, stats);

        if (newly.length > 0) {
          setNewAchievements(newly);
          setShowPopup(true);
        }
        setPhase("result");
      } else {
        setCurrentIdx((i) => i + 1);
      }
    },
    [streak, maxStreak, answers, isLast, correctCount, totalXP, config],
  );

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
      {/* Achievement popup */}
      {showPopup && (
        <AchievementPopup
          achievementIds={newAchievements}
          onDismiss={() => setShowPopup(false)}
        />
      )}

      <AnimatePresence mode="wait">
        {phase === "quiz" && currentQ && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat?.emoji}</span>
                <span className="text-[11px] text-white/35 font-semibold">
                  {cat?.label}
                </span>
                <span className="text-white/15">·</span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: diff?.color }}
                >
                  {diff?.label}
                </span>
              </div>
              <button
                onClick={onHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/25 hover:text-white/55 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all"
              >
                <X size={12} /> Quit
              </button>
            </div>

            <QuizProgress
              current={currentIdx + 1}
              total={questions.length}
              correctCount={correctCount}
              streak={streak}
              xpEarned={totalXP}
              accentColor={accentColor}
            />

            {diff && (
              <TimerBar
                key={`${timerKey.current}-${currentIdx}`}
                duration={diff.timePerQ}
                onExpire={() => setTimedOut(true)}
                paused={timedOut}
                accentColor={accentColor}
              />
            )}

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

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <ScoreScreen
              result={result}
              config={config}
              newAchievements={newAchievements}
              onRetry={() => onHome("retry")}
              onHome={() => onHome("home")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
