import { motion } from "framer-motion";
import { Clock, Zap, Brain } from "lucide-react";

const MODE_META = {
  pomodoro: { emoji: "🍅", color: "#FF6B2B", label: "Pomodoro" },
  deepwork: { emoji: "🧠", color: "#7C6FFF", label: "Deep Work" },
  sprint: { emoji: "⚡", color: "#00FFC8", label: "Sprint" },
};

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function SessionCard({ session, index = 0 }) {
  if (!session) return null;
  const meta = MODE_META[session.mode] ?? {
    emoji: "⏱",
    color: "#888",
    label: session.mode,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {/* Mode icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
        style={{
          background: `${meta.color}12`,
          border: `1px solid ${meta.color}22`,
        }}
      >
        {meta.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-bold text-white/78">
            {meta.label}
          </span>
          {session.subject && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border text-white/35 border-white/[0.08]">
              {session.subject}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-white/22">
            {fmtDate(session.date)}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-white/18">
            <Clock size={9} />
            {session.durationMinutes}m
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 shrink-0">
        <Zap size={10} className="text-[#7C6FFF]" />
        <span className="text-[11px] font-bold text-[#7C6FFF]">
          +{session.xpEarned}
        </span>
      </div>
    </motion.div>
  );
}
