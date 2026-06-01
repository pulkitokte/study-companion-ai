import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, PanelLeftOpen, Zap } from "lucide-react";
import { useAI } from "../../context/AIContext.jsx";
import ChatMessage from "./ChatMessage.jsx";
import ChatInput from "./ChatInput.jsx";

// Typing indicator
function TypingIndicator() {
  const { mode } = useAI();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="flex items-end gap-2.5"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border border-white/[0.08]"
        style={{ background: mode.avatarBg }}
      >
        {mode.emoji}
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 border"
        style={{
          background: mode.bg,
          borderColor: mode.border,
          borderRadius: "18px 18px 18px 4px",
          boxShadow: `0 0 16px ${mode.color}08`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: mode.color }}
            animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
            transition={{
              repeat: Infinity,
              duration: 0.85,
              delay: i * 0.17,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Empty state with suggested prompts
function EmptyState({ onSelect }) {
  const { mode, SUGGESTED_PROMPTS, activeMode } = useAI();
  const prompts = SUGGESTED_PROMPTS[activeMode] ?? [];

  return (
    <motion.div
      key={activeMode}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col items-center gap-5 px-4 py-8"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute inset-0 rounded-2xl blur-xl"
          style={{ background: mode.color }}
        />
        <div
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border"
          style={{
            background: mode.bg,
            borderColor: mode.border,
            boxShadow: `0 0 30px ${mode.color}12`,
          }}
        >
          {mode.emoji}
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[15px] font-bold text-white">{mode.name} is ready</p>
        <p className="text-[11px] font-semibold" style={{ color: mode.color }}>
          {mode.tagline}
        </p>
        <p className="text-[11px] text-white/28 max-w-xs leading-relaxed">
          {mode.description}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={10} style={{ color: mode.color }} />
          <span className="text-[9px] text-white/22 tracking-[0.22em] uppercase">
            Try asking
          </span>
        </div>
        {prompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
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
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Mode switcher strip
function ModeStrip() {
  const { activeMode, switchMode, MODES } = useAI();
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
      {Object.values(MODES).map((m, i) => {
        const isActive = m.id === activeMode;
        return (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => switchMode(m.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 text-[11px] font-semibold transition-all duration-200"
            style={{
              background: isActive ? m.bg : "rgba(255,255,255,0.03)",
              borderColor: isActive ? m.border : "rgba(255,255,255,0.07)",
              color: isActive ? m.color : "rgba(255,255,255,0.32)",
              boxShadow: isActive ? `0 0 14px ${m.color}1A` : "none",
            }}
          >
            <span className="text-sm leading-none">{m.emoji}</span>
            <span>{m.name}</span>
            {isActive && (
              <motion.div
                layoutId="strip-dot"
                className="w-1 h-1 rounded-full"
                style={{ background: m.color, boxShadow: `0 0 4px ${m.color}` }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function ChatWindow({ onOpenSidebar }) {
  const { mode, messages, isTyping, sendMessage, clearChat, activeMode } =
    useAI();
  const bottomRef = useRef(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.05]"
        style={{
          background: "rgba(5,5,12,0.92)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="md:hidden shrink-0 p-2 rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-colors"
          >
            <PanelLeftOpen size={16} />
          </button>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0"
            style={{ background: mode.bg, borderColor: mode.border }}
          >
            <span className="text-base leading-none">{mode.emoji}</span>
            <span
              className="text-[12px] font-bold"
              style={{ color: mode.color }}
            >
              {mode.name}
            </span>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: mode.color }}
            />
          </div>
        </div>

        <AnimatePresence>
          {!isEmpty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/28 hover:text-red-400/70 hover:bg-red-500/[0.07] border border-transparent hover:border-red-500/18 transition-all shrink-0"
            >
              <Trash2 size={12} />{" "}
              <span className="hidden sm:inline">Clear</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Mode strip */}
      <div
        className="shrink-0 px-4 py-2.5 border-b border-white/[0.04]"
        style={{ background: "rgba(8,8,15,0.7)" }}
      >
        <ModeStrip />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key={`empty-${activeMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState onSelect={sendMessage} />
            </motion.div>
          ) : (
            <motion.div
              key={`msgs-${activeMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 px-4 py-5"
            >
              {/* Session start banner */}
              <div className="flex items-center justify-center">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px]"
                  style={{ borderColor: mode.border, background: mode.bg }}
                >
                  <span>{mode.emoji}</span>
                  <span style={{ color: mode.color }} className="font-semibold">
                    {mode.name}
                  </span>
                  <span className="text-white/22">· session</span>
                </div>
              </div>

              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              <AnimatePresence>
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>

              <div ref={bottomRef} className="h-1 w-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
