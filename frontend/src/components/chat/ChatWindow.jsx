import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, PanelLeftOpen } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";
import ChatMessage from "./ChatMessage.jsx";
import ChatInput from "./ChatInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import SuggestedPrompts from "./SuggestedPrompts.jsx";
import ModeSelector from "./ModeSelector.jsx";

export default function ChatWindow({ onOpenSidebar }) {
  const { mode, messages, isTyping, sendMessage, clearChat } = useChat();
  const bottomRef = useRef(null);
  const isEmpty = messages.length === 0;

  // Auto-scroll whenever messages or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      {/* ── TOP BAR ── */}
      <div
        className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.05]"
        style={{
          background: "rgba(5,5,12,0.92)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={onOpenSidebar}
            className="md:hidden shrink-0 p-2 rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-colors"
          >
            <PanelLeftOpen size={16} />
          </button>

          {/* Active mode pill */}
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
            {/* Live pulse */}
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

        {/* Clear button */}
        <AnimatePresence>
          {!isEmpty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-white/28 hover:text-red-400/70 hover:bg-red-500/[0.07] border border-transparent hover:border-red-500/18 transition-all duration-200 shrink-0"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Clear</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODE STRIP ── */}
      <div
        className="shrink-0 px-4 py-2.5 border-b border-white/[0.04]"
        style={{ background: "rgba(8,8,15,0.7)" }}
      >
        <ModeSelector />
      </div>

      {/* ── MESSAGES AREA ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        <AnimatePresence mode="wait">
          {/* Empty state with suggested prompts */}
          {isEmpty ? (
            <motion.div
              key={`empty-${mode.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SuggestedPrompts onSelect={sendMessage} />
            </motion.div>
          ) : (
            <motion.div
              key={`msgs-${mode.id}`}
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
                  <span className="text-white/22">· session start</span>
                </div>
              </div>

              {/* Message bubbles */}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>

              {/* Scroll anchor */}
              <div ref={bottomRef} className="h-1 w-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── INPUT ── */}
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
