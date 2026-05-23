import { motion } from "framer-motion";
import { useFocus } from "../../context/FocusContext.jsx";

export default function ModeSelector({ selected, onSelect }) {
  const { FOCUS_MODES } = useFocus();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Object.values(FOCUS_MODES).map((mode, i) => {
        const isActive = selected === mode.id;
        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(mode.id)}
            className="relative flex flex-col gap-3 p-4 rounded-2xl border text-left overflow-hidden transition-all duration-300"
            style={{
              background: isActive
                ? `${mode.color}12`
                : "rgba(255,255,255,0.025)",
              borderColor: isActive
                ? `${mode.color}55`
                : "rgba(255,255,255,0.07)",
              boxShadow: isActive ? `0 0 24px ${mode.color}18` : "none",
            }}
          >
            {/* Top glow on active */}
            {isActive && (
              <div
                className="absolute top-0 left-0 right-0 h-[1.5px]"
                style={{
                  background: `linear-gradient(90deg,transparent,${mode.color},transparent)`,
                }}
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-2xl leading-none">{mode.emoji}</span>
              {isActive && (
                <motion.div
                  layoutId="mode-check"
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: mode.color }}
                >
                  <span className="text-[10px] text-black font-black">✓</span>
                </motion.div>
              )}
            </div>

            <div>
              <p className="text-[14px] font-black text-white mb-1">
                {mode.label}
              </p>
              <p className="text-[10px] text-white/35 leading-relaxed">
                {mode.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span
                className="font-bold"
                style={{
                  color: isActive ? mode.color : "rgba(255,255,255,0.3)",
                }}
              >
                {mode.defaultWork}m work
              </span>
              <span className="text-white/20">{mode.defaultBreak}m break</span>
            </div>

            {/* XP rate */}
            <div
              className="flex items-center gap-1 text-[9px]"
              style={{
                color: isActive ? `${mode.color}AA` : "rgba(255,255,255,0.18)",
              }}
            >
              ⚡ {mode.xpPerMinute} XP/min
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
