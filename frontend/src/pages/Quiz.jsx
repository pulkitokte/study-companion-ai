// FILE PATH: frontend/src/pages/Quiz.jsx
// REPLACES: existing Quiz.jsx
// Adds: history/analytics view tab, achievement popup wiring,
// and clean phase switching between home → active → result → history.

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, BarChart3 } from 'lucide-react'
import QuizHome    from '../components/quiz/QuizHome.jsx'
import QuizEngine  from '../components/quiz/QuizEngine.jsx'
import QuizHistory from '../components/quiz/QuizHistory.jsx'
import { getQuizQuestions } from '../data/mockQuizData.js'

// 'home'    → category/difficulty/count selection
// 'active'  → quiz in progress  (QuizEngine handles result screen internally)
// 'history' → analytics + history hub

export default function Quiz() {
  const [phase,     setPhase]     = useState('home')
  const [config,    setConfig]    = useState(null)
  const [questions, setQuestions] = useState([])

  const handleStart = useCallback((cfg) => {
    const qs = getQuizQuestions(cfg.category, cfg.difficulty, cfg.count)
    if (!qs.length) return
    setConfig(cfg)
    setQuestions(qs)
    setPhase('active')
  }, [])

  // Called from QuizEngine when user clicks Retry or New Quiz
  const handleEngineExit = useCallback((action) => {
    if (action === 'retry' && config) {
      // Restart same config immediately
      const qs = getQuizQuestions(config.category, config.difficulty, config.count ?? 10)
      if (qs.length) {
        setQuestions(qs)
        setPhase('active')
      } else {
        setPhase('home')
      }
    } else {
      setPhase('home')
      setConfig(null)
      setQuestions([])
    }
  }, [config])

  return (
    <div className="min-h-full pb-10">

      {/* ── TOP NAV TABS (home and history only — not shown during active quiz) ── */}
      <AnimatePresence>
        {phase !== 'active' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            {[
              { id: 'home',    label: 'Quiz Arena',     icon: Swords   },
              { id: 'history', label: 'Performance Hub', icon: BarChart3 },
            ].map(tab => {
              const Icon     = tab.icon
              const isActive = phase === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setPhase(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-bold transition-all duration-200"
                  style={{
                    background:  isActive ? 'rgba(255,179,71,0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: isActive ? 'rgba(255,179,71,0.45)' : 'rgba(255,255,255,0.07)',
                    color:       isActive ? '#FFB347'                : 'rgba(255,255,255,0.35)',
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE CONTENT ── */}
      <AnimatePresence mode="wait">

        {phase === 'home' && (
          <motion.div
            key="quiz-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuizHome onStart={handleStart} />
          </motion.div>
        )}

        {phase === 'active' && questions.length > 0 && (
          <motion.div
            key="quiz-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuizEngine
              questions={questions}
              config={config}
              onHome={handleEngineExit}
            />
          </motion.div>
        )}

        {phase === 'history' && (
          <motion.div
            key="quiz-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuizHistory onBack={() => setPhase('home')} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}