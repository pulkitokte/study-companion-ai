import { motion } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";
import { useChat, SUGGESTED_PROMPTS } from "../../context/ChatContext.jsx";

export default function SuggestedPrompts({ onSelect }) {
  const { activeMode, mode } = useChat();
  const prompts = SUGGESTED_PROMPTS?.[activeMode] ?? [];

  return (
    <motion.div
      key={activeMode}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-5 px-4 py-8"
    >
      {/* Mode icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.05,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border"
        style={{
          background: mode.bg,
          borderColor: mode.border,
          boxShadow: `0 0 30px ${mode.color}12`,
        }}
      >
        {mode.emoji}
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-1"
      >
        <p className="text-[15px] font-bold text-white">{mode.name} is ready</p>
        <p className="text-[11px] font-semibold" style={{ color: mode.color }}>
          {mode.tagline}
        </p>
        <p className="text-[11px] text-white/28 max-w-xs leading-relaxed mt-1">
          {mode.description}
        </p>
      </motion.div>

      {/* Prompt chips */}
      {prompts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="w-full max-w-sm space-y-2"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={10} style={{ color: mode.color }} />
            <span className="text-[9px] text-white/22 tracking-[0.22em] uppercase">
              Try asking
            </span>
          </div>

          {prompts.map((prompt, i) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(prompt)}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 rounded-xl border text-[12px] text-white/50 hover:text-white/80 transition-all duration-200 group"
              style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = mode.bg;
                e.currentTarget.style.borderColor = mode.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              }}
            >
              <span>{prompt}</span>
              <ChevronRight
                size={12}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: mode.color }}
              />
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
