import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Zap, Clock } from "lucide-react";
import { CATEGORIES, DIFFICULTIES } from "../../data/mockQuizData.js";

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

function fmtDur(secs) {
  if (!secs) return "";
  const m = Math.floor(secs / 60),
    s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function RecentSessions({ sessions = [], limit = 15 }) {
  const visible = sessions.slice(0, limit);

  if (!visible.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="text-4xl">📋</span>
        <p className="text-[13px] text-white/30">No sessions yet.</p>
        <p className="text-[11px] text-white/18">
          Complete your first quiz to see history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((s, i) => {
        const cat = CATEGORIES.find((c) => c.id === s.category);
        const diff = DIFFICULTIES.find((d) => d.id === s.difficulty);
        const acc = s.accuracy ?? 0;
        const gradeColor =
          acc >= 75 ? "#00FFC8" : acc >= 50 ? "#FFB347" : "#FF6B9D";

        return (
          <motion.div
            key={s.id ?? i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            {/* Category icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
              style={{
                background: cat ? `${cat.color}12` : "rgba(255,255,255,0.04)",
                border: `1px solid ${cat?.color ?? "rgba(255,255,255,0.08)"}20`,
              }}
            >
              {cat?.emoji ?? "📝"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-bold text-white/78 truncate">
                  {cat?.label ?? s.category}
                </span>
                {diff && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: diff.color, background: `${diff.color}12` }}
                  >
                    {diff.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-white/22">
                  {fmtDate(s.date)}
                </span>
                {s.durationSeconds > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-white/18">
                    <Clock size={9} />
                    {fmtDur(s.durationSeconds)}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-0.5 text-green-400/65">
                  <CheckCircle2 size={9} />
                  {s.correct ?? 0}
                </span>
                <span className="flex items-center gap-0.5 text-red-400/55">
                  <XCircle size={9} />
                  {s.wrong ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Zap size={9} className="text-[#7C6FFF]" />
                <span className="text-[10px] font-bold text-[#7C6FFF]">
                  +{s.totalXP ?? 0}
                </span>
              </div>
              <div
                className="px-2 py-1 rounded-lg text-[11px] font-black min-w-[42px] text-center"
                style={{ color: gradeColor, background: `${gradeColor}10` }}
              >
                {acc}%
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
