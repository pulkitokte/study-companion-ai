import { motion } from "framer-motion";
import { useChat } from "../../context/ChatContext.jsx";

export default function ModeSelector() {
  const { activeMode, switchMode, MODES } = useChat();

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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 transition-all duration-200 text-[11px] font-semibold"
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
                layoutId="strip-active"
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
