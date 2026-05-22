import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

export default function ExplanationPanel({ explanation, isCorrect }) {
  const [open, setOpen] = useState(false);
  if (!explanation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="rounded-xl border overflow-hidden transition-colors duration-200"
      style={{
        borderColor: open ? "rgba(255,215,0,0.25)" : "rgba(255,215,0,0.1)",
        background: open ? "rgba(255,215,0,0.05)" : "rgba(255,215,0,0.025)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={12} style={{ color: "#FFD700" }} />
          <span className="text-[11px] font-semibold text-[#FFD700]">
            {isCorrect ? "Why is this correct?" : "See explanation"}
          </span>
        </div>
        {open ? (
          <ChevronUp size={12} className="text-[#FFD700]/50" />
        ) : (
          <ChevronDown size={12} className="text-[#FFD700]/50" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pt-2 text-[12px] text-white/48 leading-relaxed border-t border-[#FFD700]/10">
              {explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
