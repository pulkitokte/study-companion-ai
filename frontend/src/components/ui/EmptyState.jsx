import { motion } from "framer-motion";

export default function EmptyState({
  emoji = "📭",
  title = "Nothing here yet",
  subtitle = "Your activity will appear here once you get started.",
  action = null, // { label, onClick }
  color = "#7C6FFF",
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center text-center ${compact ? "gap-2 py-6" : "gap-4 py-12"}`}
    >
      {/* Emoji with glow */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: color }}
        />
        <span
          className={`relative select-none ${compact ? "text-3xl" : "text-5xl"}`}
        >
          {emoji}
        </span>
      </div>

      <div className={compact ? "space-y-0.5" : "space-y-1.5"}>
        <p
          className={`font-bold text-white/60 ${compact ? "text-[13px]" : "text-[15px]"}`}
        >
          {title}
        </p>
        <p
          className={`text-white/28 leading-relaxed ${compact ? "text-[11px]" : "text-[12px]"} max-w-[260px]`}
        >
          {subtitle}
        </p>
      </div>

      {action && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={action.onClick}
          className="mt-1 px-5 py-2 rounded-xl font-bold text-[12px] transition-all"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}38`,
            color,
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
