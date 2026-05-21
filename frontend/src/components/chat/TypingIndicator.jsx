import { motion } from "framer-motion";
import { useChat } from "../../context/ChatContext.jsx";

export default function TypingIndicator() {
  const { mode } = useChat();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="flex items-end gap-2.5"
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 border border-white/[0.08]"
        style={{ background: mode.avatarBg }}
      >
        {mode.emoji}
      </div>

      {/* Dot bubble */}
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
            animate={{
              y: [0, -5, 0],
              opacity: [0.35, 1, 0.35],
              scale: [1, 1.2, 1],
            }}
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
