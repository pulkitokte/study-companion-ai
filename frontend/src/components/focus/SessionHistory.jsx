import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, ChevronDown } from "lucide-react";

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

const PAGE_SIZE = 10;

export default function SessionHistory({ sessions = [] }) {
  const [page, setPage] = useState(1);
  const visible = sessions.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < sessions.length;

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="text-4xl">📋</span>
        <p className="text-[13px] text-white/28">
          No focus sessions recorded yet.
        </p>
        <p className="text-[11px] text-white/18">
          Complete your first session to see history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((s, i) => {
        const meta = MODE_META[s.mode] ?? {
          emoji: "⏱",
          color: "#888",
          label: s.mode,
        };
        return (
          <motion.div
            key={s.id ?? i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all"
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
                {s.subject && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/[0.08] text-white/30">
                    {s.subject}
                  </span>
                )}
                {s.pomodoroCount > 1 && (
                  <span className="text-[9px] text-white/22">
                    🍅 ×{s.pomodoroCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-white/20">
                  {fmtDate(s.date)}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-white/18">
                  <Clock size={9} />
                  {s.durationMinutes}m
                </span>
              </div>
            </div>

            {/* XP + completed badge */}
            <div className="flex items-center gap-2 shrink-0">
              {s.completed && (
                <span className="text-[8px] px-1.5 py-0.5 rounded font-bold text-[#00FFC8] bg-[#00FFC8]/10 border border-[#00FFC8]/20">
                  ✓
                </span>
              )}
              <div className="flex items-center gap-0.5">
                <Zap size={10} className="text-[#7C6FFF]" />
                <span className="text-[11px] font-bold text-[#7C6FFF]">
                  +{s.xpEarned}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Load more */}
      {hasMore && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPage((p) => p + 1)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.07] text-[11px] text-white/30 hover:text-white/55 hover:bg-white/[0.03] transition-all"
        >
          <ChevronDown size={13} />
          Load more ({sessions.length - visible.length} remaining)
        </motion.button>
      )}
    </div>
  );
}
