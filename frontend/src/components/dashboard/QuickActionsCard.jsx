import { motion } from "framer-motion";
import {
  RotateCcw,
  Swords,
  BookOpen,
  BarChart2,
  Search,
  Sparkles,
} from "lucide-react";

/**
 * QuickActionsCard
 *
 * Six navigation shortcuts for the most commonly needed views.
 * Fully prop-driven. No service calls.
 *
 * Props:
 *   onNavigate {function} (path: string, tab?: string) => void
 */

const ACTIONS = [
  {
    icon: RotateCcw,
    label: "Resume Revision",
    path: "/syllabus",
    tab: "revision",
    color: "#FF8C42",
  },
  {
    icon: Swords,
    label: "Open Quiz",
    path: "/quiz",
    tab: null,
    color: "#FF4D6D",
  },
  {
    icon: BookOpen,
    label: "Syllabus",
    path: "/syllabus",
    tab: "overview",
    color: "#7C6FFF",
  },
  {
    icon: BarChart2,
    label: "Analytics",
    path: "/syllabus",
    tab: "analytics",
    color: "#4FC3F7",
  },
  {
    icon: Search,
    label: "Gap Analysis",
    path: "/syllabus",
    tab: "gap-analysis",
    color: "#FFD166",
  },
  {
    icon: Sparkles,
    label: "Recommendations",
    path: "/syllabus",
    tab: "recommendations",
    color: "#00FFC8",
  },
];

export default function QuickActionsCard({ onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.1 }}
      className="rounded-2xl border border-white/[0.07] p-5"
      style={{ background: "#0A0A14" }}
    >
      <p className="text-[9px] font-black text-white/28 uppercase tracking-widest mb-3">
        Quick Actions
      </p>

      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map(({ icon: Icon, label, path, tab, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate?.(path, tab)}
            className="flex flex-col items-center gap-2 px-2 py-3 rounded-xl border
                       transition-all text-center"
            style={{
              background: `${color}08`,
              borderColor: `${color}18`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: `${color}14`,
                border: `1px solid ${color}22`,
              }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <span
              className="text-[9px] font-black leading-tight"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
