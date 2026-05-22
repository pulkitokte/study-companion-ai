import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CATEGORIES } from "../../data/mockQuizData.js";

export default function CategoryStats({ categoryStats = {} }) {
  const rows = CATEGORIES.map((cat) => ({
    ...cat,
    sessions: categoryStats[cat.id]?.sessions ?? 0,
    accuracy: categoryStats[cat.id]?.accuracy ?? null,
    correct: categoryStats[cat.id]?.correct ?? 0,
    total: categoryStats[cat.id]?.total ?? 0,
  })).sort((a, b) => b.sessions - a.sessions);

  const attempted = rows.filter((r) => r.sessions > 0);
  const pending = rows.filter((r) => r.sessions === 0);

  const best = attempted.reduce(
    (b, r) => (!b || r.accuracy > b.accuracy ? r : b),
    null,
  );
  const worst =
    attempted.length > 1
      ? attempted.reduce(
          (w, r) => (!w || r.accuracy < w.accuracy ? r : w),
          null,
        )
      : null;

  if (!attempted.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="text-4xl">📊</span>
        <p className="text-[13px] text-white/30">No data yet.</p>
        <p className="text-[11px] text-white/20">
          Complete quizzes to see subject breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Best / Worst row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {best && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{
              borderColor: `${best.color}22`,
              background: `${best.color}08`,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${best.color}14` }}
            >
              <TrendingUp size={14} style={{ color: "#00FFC8" }} />
            </div>
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-wider">
                Strongest
              </p>
              <p className="text-[13px] font-bold text-white">{best.label}</p>
              <p className="text-[10px]" style={{ color: best.color }}>
                {best.accuracy}% · {best.sessions} sessions
              </p>
            </div>
          </div>
        )}
        {worst && worst.id !== best?.id && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{
              borderColor: "rgba(255,107,157,0.22)",
              background: "rgba(255,107,157,0.06)",
            }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#FF6B9D]/14">
              <TrendingDown size={14} style={{ color: "#FF6B9D" }} />
            </div>
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-wider">
                Needs Focus
              </p>
              <p className="text-[13px] font-bold text-white">{worst.label}</p>
              <p className="text-[10px] text-[#FF6B9D]">
                {worst.accuracy}% · {worst.sessions} sessions
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Accuracy bars */}
      <div className="space-y-3">
        <p className="text-[10px] text-white/22 tracking-widest uppercase">
          Accuracy by Subject
        </p>
        {attempted.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{row.emoji}</span>
                <span className="text-[12px] font-semibold text-white/68">
                  {row.label}
                </span>
                <span className="text-[9px] text-white/22">
                  {row.sessions}×
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-black"
                  style={{ color: row.color }}
                >
                  {row.accuracy}%
                </span>
                <span className="text-[9px] text-white/18">
                  {row.correct}/{row.total}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${row.accuracy}%` }}
                transition={{
                  delay: 0.1 + i * 0.07,
                  duration: 0.7,
                  ease: "easeOut",
                }}
                className="h-full rounded-full group-hover:brightness-125 transition-all"
                style={{
                  background: `linear-gradient(90deg,${row.color}60,${row.color})`,
                  boxShadow: `0 0 6px ${row.color}40`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending subjects */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-white/18 tracking-widest uppercase">
            Not Attempted
          </p>
          <div className="flex flex-wrap gap-2">
            {pending.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02] text-[10px] text-white/22"
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
