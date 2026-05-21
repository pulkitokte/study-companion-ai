    // FILE PATH: frontend/src/components/onboarding/StepNavigation.jsx

import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'
import { useOnboarding } from '../../context/OnboardingContext.jsx'

function canStepProceed(step, data) {
  switch (step) {
    case 0: return data.name.trim().length >= 2 && data.targetExam !== ''
    case 1: return data.wakeTime !== '' && data.sleepTime !== ''
    case 2: return true
    case 3: return data.preferredTime !== '' && data.dailyStudyHours >= 1
    case 4: return true
    case 5: return data.dreamGoal.trim().length >= 2
    case 6: return data.studyStyle !== '' && data.revisionPreference !== ''
    case 7: return true
    default: return true
  }
}

export default function StepNavigation({ steps, accentColor }) {
  const { step, next, prev, data, TOTAL_STEPS } = useOnboarding()

  const isFirst    = step === 0
  const isLast     = step === TOTAL_STEPS - 1
  const canProceed = canStepProceed(step, data)

  return (
    <div
      className="shrink-0 border-t border-white/[0.05] px-4 md:px-8 py-4"
      style={{ background: 'rgba(5,5,12,0.9)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex items-center justify-between max-w-xl mx-auto gap-4">

        {/* ── BACK BUTTON ── */}
        <motion.button
          onClick={prev}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold tracking-wide border transition-all duration-200"
          style={{
            color:       'rgba(255,255,255,0.4)',
            borderColor: 'rgba(255,255,255,0.08)',
            background:  'rgba(255,255,255,0.02)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color       = 'rgba(255,255,255,0.7)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.background  = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color       = 'rgba(255,255,255,0.4)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.background  = 'rgba(255,255,255,0.02)'
          }}
        >
          <ArrowLeft size={14} />
          {isFirst ? 'Welcome' : 'Back'}
        </motion.button>

        {/* ── STEP DOTS ── */}
        <div className="hidden sm:flex items-center gap-1.5 flex-1 justify-center">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width:      i === step ? 20 : 6,
                background: i < step
                  ? accentColor
                  : i === step
                  ? accentColor
                  : 'rgba(255,255,255,0.1)',
                boxShadow: i === step ? `0 0 8px ${accentColor}` : 'none',
              }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        {/* ── NEXT / COMPLETE BUTTON ── */}
        <motion.button
          onClick={next}
          disabled={!canProceed}
          whileHover={canProceed ? { x: 2 } : {}}
          whileTap={canProceed ? { scale: 0.96 } : {}}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold tracking-widest uppercase transition-all duration-300 relative overflow-hidden"
          style={{
            background:  canProceed
              ? `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`
              : 'rgba(255,255,255,0.05)',
            color:       canProceed ? '#000' : 'rgba(255,255,255,0.2)',
            boxShadow:   canProceed ? `0 0 20px ${accentColor}40` : 'none',
            cursor:      canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          {/* Shimmer when active */}
          {canProceed && (
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
              className="absolute inset-y-0 w-1/3 opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent, white, transparent)',
                transform:  'skewX(-20deg)',
              }}
            />
          )}

          <span className="relative">
            {isLast ? 'Complete' : 'Next'}
          </span>

          {isLast
            ? <Zap size={14} className="relative" />
            : <ArrowRight size={14} className="relative" />
          }
        </motion.button>

      </div>

      {/* Validation hint */}
      {!canProceed && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[10px] text-white/20 mt-2"
        >
          {getHint(step, data)}
        </motion.p>
      )}
    </div>
  )
}

function getHint(step, data) {
  switch (step) {
    case 0:
      if (data.name.trim().length < 2) return 'Enter your name to continue'
      if (!data.targetExam)            return 'Select your target exam'
      return ''
    case 1: return 'Set your wake and sleep times'
    case 3:
      if (!data.preferredTime) return 'Select your peak productivity window'
      return ''
    case 5: return 'Select your dream post to continue'
    case 6:
      if (!data.studyStyle)          return 'Choose a study technique'
      if (!data.revisionPreference)  return 'Choose a revision method'
      return ''
    default: return ''
  }
}