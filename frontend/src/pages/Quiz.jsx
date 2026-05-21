// FILE PATH: frontend/src/pages/Quiz.jsx
// REPLACES existing Quiz.jsx.
// Now delegates active quiz to QuizEngine, keeping Quiz.jsx as
// a clean phase-switcher: home → active → (result handled inside QuizEngine).

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizHome from "../components/quiz/QuizHome.jsx";
import QuizEngine from "../components/quiz/QuizEngine.jsx";
import { getQuizQuestions } from "../data/mockQuizData.js";

export default function Quiz() {
  const [phase, setPhase] = useState("home"); // 'home' | 'active'
  const [config, setConfig] = useState(null);
  const [questions, setQuestions] = useState([]);

  const handleStart = useCallback((cfg) => {
    const qs = getQuizQuestions(cfg.category, cfg.difficulty, cfg.count);
    if (!qs.length) return;
    setConfig(cfg);
    setQuestions(qs);
    setPhase("active");
  }, []);

  // Called from QuizEngine — 'retry' restarts same config, 'home' goes to selection
  const handleEngineExit = useCallback(
    (action) => {
      if (action === "retry" && config) {
        handleStart(config);
      } else {
        setPhase("home");
        setConfig(null);
        setQuestions([]);
      }
    },
    [config, handleStart],
  );

  return (
    <div className="min-h-full pb-8">
      <AnimatePresence mode="wait">
        {phase === "home" && (
          <motion.div
            key="quiz-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <QuizHome onStart={handleStart} />
          </motion.div>
        )}

        {phase === "active" && questions.length > 0 && (
          <motion.div
            key="quiz-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <QuizEngine
              questions={questions}
              config={config}
              onHome={handleEngineExit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
