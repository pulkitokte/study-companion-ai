// FILE PATH: frontend/src/components/quiz/CategorySelector.jsx

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CATEGORIES } from "../../data/mockQuizData.js";

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-white/35 tracking-widest uppercase">
        Select Subject
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CATEGORIES.map((cat, i) => {
          const isSelected = selected === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(cat.id)}
              className="relative flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all duration-200 overflow-hidden"
              style={{
                background: isSelected
                  ? `${cat.color}10`
                  : "rgba(255,255,255,0.025)",
                borderColor: isSelected
                  ? `${cat.color}50`
                  : "rgba(255,255,255,0.07)",
                boxShadow: isSelected ? `0 0 20px ${cat.color}15` : "none",
              }}
            >
              {/* Top glow when selected */}
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${cat.color}80, transparent)`,
                  }}
                />
              )}

              {/* Check mark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: cat.color }}
                >
                  <Check size={9} className="text-black" strokeWidth={3} />
                </motion.div>
              )}

              <span className="text-2xl leading-none">{cat.emoji}</span>

              <div className="min-w-0">
                <p
                  className="text-[12px] font-bold leading-tight"
                  style={{
                    color: isSelected ? cat.color : "rgba(255,255,255,0.7)",
                  }}
                >
                  {cat.label}
                </p>
                <p className="text-[9px] text-white/25 leading-snug mt-0.5">
                  {cat.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
