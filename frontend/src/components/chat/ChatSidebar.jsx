import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, MessageSquare } from 'lucide-react'
import { useAI } from '../../context/AIContext.jsx'

export default function ChatSidebar({ open, onClose }) {
  const { mode: current, activeMode, switchMode, MODES, messages, clearChat } = useAI()
  const allModes = Object.values(MODES)

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-20 bg-black/65 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed md:relative md:translate-x-0 inset-y-0 left-0 z-30 w-[255px] shrink-0 flex flex-col border-r border-white/[0.06] overflow-hidden"
        style={{ background: '#08080F' }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Sparkles size={12} style={{ color: current.color }} />
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/40">
              Companion
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Active mode hero */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22 }}
            className="mx-3 mt-3 mb-2 rounded-xl p-3.5 border shrink-0"
            style={{ background: current.bg, borderColor: current.border }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: current.avatarBg }}>
                {current.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-white leading-tight">{current.name}</p>
                <p className="text-[9px] mt-0.5 truncate" style={{ color: current.color }}>{current.tagline}</p>
              </div>
            </div>
            <p className="text-[10px] text-white/28 mt-2 leading-relaxed">{current.description}</p>
            {messages.length > 0 && (
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={10} style={{ color: current.color }} />
                  <span className="text-[10px]" style={{ color: current.color }}>
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={clearChat}
                  className="text-[9px] text-white/25 hover:text-red-400/70 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mode list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-none">
          <p className="text-[9px] text-white/18 tracking-[0.22em] uppercase px-1 pb-1.5">Switch Mode</p>

          {allModes.map((m, i) => {
            const isActive = m.id === activeMode
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.22 }}
                whileHover={{ scale: 1.015, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { switchMode(m.id); onClose() }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200"
                style={{
                  background:  isActive ? m.bg    : 'transparent',
                  borderColor: isActive ? m.border : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background   = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.07)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background   = 'transparent'
                    e.currentTarget.style.borderColor  = 'transparent'
                  }
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-all duration-200"
                  style={{ background: isActive ? m.avatarBg : 'rgba(255,255,255,0.05)' }}
                >
                  {m.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold leading-tight"
                    style={{ color: isActive ? m.color : 'rgba(255,255,255,0.5)' }}>
                    {m.name}
                  </p>
                  <p className="text-[9px] text-white/22 truncate mt-0.5">{m.tagline}</p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t border-white/[0.05]">
          <p className="text-[9px] text-white/16 text-center leading-relaxed">
            Each mode keeps its own conversation history
          </p>
        </div>
      </motion.aside>
    </>
  )
}