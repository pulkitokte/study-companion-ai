import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic } from 'lucide-react'
import { useAI } from '../../context/AIContext.jsx'

export default function ChatInput({ onSend }) {
  const { mode, isTyping } = useAI()
  const [text, setText]   = useState('')
  const ref               = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [text])

  const handleSend = () => {
    const t = text.trim()
    if (!t || isTyping) return
    onSend(t)
    setText('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const canSend = text.trim().length > 0 && !isTyping

  return (
    <div
      className="shrink-0 border-t border-white/[0.05] px-4 py-3"
      style={{ background: 'rgba(5,5,12,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <AnimatePresence>
        {isTyping && (
          <motion.p
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] mb-2 px-1 font-semibold"
            style={{ color: mode.color }}
          >
            {mode.name} is thinking…
          </motion.p>
        )}
      </AnimatePresence>

      <div
        className="flex items-end gap-2 rounded-2xl border p-2 transition-all duration-300"
        style={{
          background:  'rgba(255,255,255,0.03)',
          borderColor: text.trim() ? mode.border : 'rgba(255,255,255,0.08)',
          boxShadow:   text.trim() ? `0 0 0 1px ${mode.color}14` : 'none',
        }}
      >
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={isTyping}
          placeholder={`Message ${mode.name}…`}
          rows={1}
          className="flex-1 bg-transparent text-[13px] text-white placeholder-white/18 outline-none resize-none leading-relaxed py-1.5 px-1 scrollbar-none"
          style={{ maxHeight: 140 }}
        />

        <div className="flex items-center gap-1 shrink-0 self-end">
          {!canSend && (
            <button className="p-2 rounded-xl text-white/18 hover:text-white/38 hover:bg-white/[0.05] transition-colors">
              <Mic size={15} />
            </button>
          )}
          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.1 }  : {}}
            whileTap={canSend   ? { scale: 0.92 } : {}}
            className="p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center"
            style={{
              background: canSend ? `linear-gradient(135deg,${mode.color},${mode.color}BB)` : 'rgba(255,255,255,0.05)',
              boxShadow:  canSend ? `0 0 18px ${mode.color}30` : 'none',
              cursor:     canSend ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={14} style={{ color: canSend ? '#000' : 'rgba(255,255,255,0.18)' }} />
          </motion.button>
        </div>
      </div>

      <p className="text-[9px] text-white/12 text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}