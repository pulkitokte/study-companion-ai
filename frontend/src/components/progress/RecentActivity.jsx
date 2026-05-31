import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, Timer, Trophy } from "lucide-react";
import { getQuizHistory } from "../../utils/quizStorage.js";
import { getFocusHistory } from "../../utils/focusStorage.js";
import { CATEGORIES } from "../../data/mockQuizData.js";

function fmtDate(iso) {
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

const MODE_META = {
  pomodoro: { emoji: "🍅", color: "#FF6B2B" },
  deepwork: { emoji: "🧠", color: "#7C6FFF" },
  sprint: { emoji: "⚡", color: "#00FFC8" },
};

export default function RecentActivity({ limit = 10 }) {
  const feed = useMemo(() => {
    const quiz = (getQuizHistory() ?? []).slice(0, 20).map((q) => ({
      type: "quiz",
      date: q.date,
      title: `Quiz · ${CATEGORIES.find((c) => c.id === q.category)?.label ?? q.category ?? "Unknown"}`,
      sub: `${q.accuracy ?? 0}% accuracy · ${q.total ?? 0} questions`,
      xp: q.totalXP ?? 0,
      color: "#FFB347",
      icon: CheckCircle2,
    }));
    const focus = (getFocusHistory() ?? []).slice(0, 20).map((f) => {
      const meta = MODE_META[f.mode] ?? { emoji: "⏱", color: "#888" };
      return {
        type: "focus",
        date: f.date,
        title: `${meta.emoji} Focus · ${f.mode ?? ""}`,
        sub: `${f.durationMinutes ?? 0} minutes${f.subject ? ` · ${f.subject}` : ""}`,
        xp: f.xpEarned ?? 0,
        color: meta.color,
        icon: Timer,
      };
    });
    return [...quiz, ...focus]
      .filter((e) => e.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [limit]);

  if (!feed.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-4xl">📭</span>
        <p className="text-[13px] text-white/28">No activity yet.</p>
        <p className="text-[11px] text-white/18">
          Complete a quiz or focus session to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feed.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={`${item.type}-${item.date}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${item.color}12`,
                border: `1px solid ${item.color}22`,
              }}
            >
              <Icon size={13} style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white/75 truncate">
                {item.title}
              </p>
              <p className="text-[10px] text-white/25 mt-0.5">
                {item.sub} · {fmtDate(item.date)}
              </p>
            </div>
            {item.xp > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Zap size={9} className="text-[#7C6FFF]" />
                <span className="text-[11px] font-bold text-[#7C6FFF]">
                  +{item.xp}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
