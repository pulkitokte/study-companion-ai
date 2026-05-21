import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

function formatTime(date) {
  if (!date) return "";
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatMessage({ message }) {
  const { mode } = useChat();

  if (!message) return null;

  const isUser = message.role === "user";
  const content = message.content ?? "";
  const time = formatTime(message.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 rounded-lg bg-white/[0.07] border border-white/[0.1] flex items-center justify-center shrink-0 mb-0.5">
          <User size={13} className="text-white/45" />
        </div>
      ) : (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mb-0.5 border border-white/[0.08]"
          style={{ background: mode.avatarBg }}
        >
          {mode.emoji}
        </div>
      )}

      {/* Bubble + time */}
      <div
        className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className="relative px-4 py-2.5 text-[13px] leading-relaxed"
          style={
            isUser
              ? {
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: "18px 18px 4px 18px",
                }
              : {
                  background: mode.bg,
                  border: `1px solid ${mode.border}`,
                  color: "rgba(255,255,255,0.82)",
                  borderRadius: "18px 18px 18px 4px",
                  boxShadow: `0 0 20px ${mode.color}08`,
                }
          }
        >
          {/* Left accent bar on AI messages */}
          {!isUser && (
            <div
              className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
              style={{ background: mode.color, opacity: 0.55 }}
            />
          )}

          {/* Content with streaming cursor */}
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {content}
          </span>

          {message.streaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.65 }}
              className="inline-block ml-0.5 w-[7px] h-[13px] align-middle rounded-sm"
              style={{ background: mode.color }}
            />
          )}
        </div>

        {/* Timestamp */}
        {time && <span className="text-[9px] text-white/16 px-1">{time}</span>}
      </div>
    </motion.div>
  );
}
