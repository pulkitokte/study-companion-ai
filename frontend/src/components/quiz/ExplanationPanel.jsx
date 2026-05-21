// FILE PATH: frontend/src/components/quiz/ExplanationPanel.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

export default function ExplanationPanel({
  explanation,
  isCorrect,
  accentColor = "#00FFC8",
}) {
  const [open, setOpen] = useState(false);

  if (!explanation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: open ? "rgba(255,215,0,0.25)" : "rgba(255,215,0,0.12)",
        background: open ? "rgba(255,215,0,0.05)" : "rgba(255,215,0,0.03)",
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={13} style={{ color: "#FFD700" }} />
          <span className="text-[11px] font-semibold text-[#FFD700]">
            {isCorrect ? "Why is this correct?" : "Explanation"}
          </span>
        </div>
        {open ? (
          <ChevronUp size={13} className="text-[#FFD700]/60" />
        ) : (
          <ChevronDown size={13} className="text-[#FFD700]/60" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#FFD700]/[0.1]">
              <p className="text-[12px] text-white/50 leading-relaxed pt-3">
                {explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
