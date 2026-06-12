import { useState } from "react";
import { motion } from "framer-motion";
import {
  ToggleLeft,
  RotateCcw,
  Sparkles,
  Brain,
  Swords,
  Timer,
  CalendarDays,
  Users,
  Boxes,
  Bell,
} from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useToast } from "../ui/Toast.jsx";

const FLAG_META = {
  aiChat: {
    label: "AI Chat Companion",
    icon: Brain,
    color: "#FF6B9D",
    desc: "Gemini-powered chat with 5 personality modes",
  },
  quizArena: {
    label: "Quiz Arena",
    icon: Swords,
    color: "#FFB347",
    desc: "8-subject quiz engine with XP rewards",
  },
  focusMode: {
    label: "Focus Mode",
    icon: Timer,
    color: "#00FFC8",
    desc: "Pomodoro / Deep Work / Sprint sessions",
  },
  planner: {
    label: "Study Planner",
    icon: CalendarDays,
    color: "#7C6FFF",
    desc: "Calendar + task scheduling system",
  },
  collaboration: {
    label: "Collaboration Rooms",
    icon: Users,
    color: "#4FC3F7",
    desc: "Shared study rooms and co-study sessions",
  },
  realtimeBeta: {
    label: "Realtime Engine",
    icon: Boxes,
    color: "#B5FF47",
    desc: "Multi-device sync + presence (beta)",
  },
  demoMode: {
    label: "Demo Mode",
    icon: Sparkles,
    color: "#FFD700",
    desc: "Seeded demo data for recruiters/testing",
  },
  notifications: {
    label: "Notifications",
    icon: Bell,
    color: "#FF6B2B",
    desc: "Toast + notification center system",
  },
};

// Simulated rollout percentages — future: per-flag gradual rollout control
const DEFAULT_ROLLOUTS = {
  aiChat: 100,
  quizArena: 100,
  focusMode: 100,
  planner: 100,
  collaboration: 75,
  realtimeBeta: 40,
  demoMode: 100,
  notifications: 100,
};

function Toggle({ value, onChange, color }) {
  return (
    <button onClick={onChange}>
      <div
        className="w-10 h-5 rounded-full relative transition-all duration-300"
        style={{ background: value ? color : "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
        />
      </div>
    </button>
  );
}

export default function FeatureFlagsPanel() {
  const { flags, toggleFlag, resetFlags } = useAdmin();
  const { show } = useToast();
  const [rollouts] = useState(DEFAULT_ROLLOUTS);

  const handleToggle = (key, label) => {
    const updated = toggleFlag(key);
    show({
      type: "info",
      title: `${label} ${updated[key] ? "enabled" : "disabled"}`,
      message: "Feature flag updated",
      duration: 2000,
    });
  };

  const handleReset = () => {
    resetFlags();
    show({
      type: "info",
      title: "Flags reset",
      message: "All feature flags restored to defaults",
      duration: 2000,
    });
  };

  const enabledCount = Object.values(flags).filter(Boolean).length;
  const totalCount = Object.keys(flags).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ToggleLeft size={14} className="text-[#7C6FFF]" />
          <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
            Feature Flags
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/28">
            {enabledCount}/{totalCount} enabled
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] text-[10px] font-bold text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <RotateCcw size={10} /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {Object.entries(FLAG_META).map(([key, meta], i) => {
          const Icon = meta.icon;
          const enabled = !!flags[key];
          const rollout = rollouts[key] ?? 100;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200"
              style={{
                background: enabled
                  ? `${meta.color}07`
                  : "rgba(255,255,255,0.015)",
                borderColor: enabled
                  ? `${meta.color}22`
                  : "rgba(255,255,255,0.05)",
                opacity: enabled ? 1 : 0.55,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${meta.color}14`,
                  border: `1px solid ${meta.color}24`,
                }}
              >
                <Icon size={15} style={{ color: meta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-white/75 truncate">
                  {meta.label}
                </p>
                <p className="text-[10px] text-white/28 leading-snug truncate">
                  {meta.desc}
                </p>
                {rollout < 100 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${rollout}%`, background: meta.color }}
                      />
                    </div>
                    <span className="text-[9px] text-white/22 shrink-0">
                      {rollout}% rollout
                    </span>
                  </div>
                )}
              </div>
              <Toggle
                value={enabled}
                onChange={() => handleToggle(key, meta.label)}
                color={meta.color}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
