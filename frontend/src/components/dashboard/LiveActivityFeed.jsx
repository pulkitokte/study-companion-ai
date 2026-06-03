import { useMemo } from "react";
import { motion } from "framer-motion";
import { Swords, Timer, CheckCircle2, Trophy, Zap } from "lucide-react";
import { getQuizHistory } from "../../utils/quizStorage.js";
import { getFocusHistory } from "../../utils/focusStorage.js";
import { getPlanner } from "../../utils/plannerStorage.js";
import { CATEGORIES } from "../../data/mockQuizData.js";

const MODE_META = {
  pomodoro: { emoji: "🍅", color: "#FF6B2B" },
  deepwork: { emoji: "🧠", color: "#7C6FFF" },
  sprint: { emoji: "⚡", color: "#00FFC8" },
};

function fmtAgo(iso) {
  if (!iso) return "";
  try {
    const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  } catch {
    return "";
  }
}

export default function LiveActivityFeed({ limit = 8 }) {
  const feed = useMemo(() => {
    const qH = (getQuizHistory() ?? []).slice(0, 20);
    const fH = (getFocusHistory() ?? []).slice(0, 20);
    const { tasks = [] } = getPlanner();
    const doneTasks = tasks.filter((t) => t.done && t.completedAt).slice(0, 10);

    const items = [
      ...qH.map((q) => ({
        id: q.id ?? q.date,
        date: q.date,
        type: "quiz",
        icon: Swords,
        title: `Quiz · ${CATEGORIES.find((c) => c.id === q.category)?.label ?? q.category ?? "Unknown"}`,
        sub: `${q.accuracy ?? 0}% accuracy`,
        xp: q.totalXP ?? 0,
        color: "#FFB347",
      })),
      ...fH.map((f) => {
        const meta = MODE_META[f.mode] ?? { emoji: "⏱", color: "#7C6FFF" };
        return {
          id: f.id ?? f.date,
          date: f.date,
          type: "focus",
          icon: Timer,
          title: `${meta.emoji} Focus · ${f.durationMinutes ?? 0}m`,
          sub: f.subject || f.mode || "Session",
          xp: f.xpEarned ?? 0,
          color: meta.color,
        };
      }),
      ...doneTasks.map((t) => ({
        id: t.id,
        date: t.completedAt,
        type: "planner",
        icon: CheckCircle2,
        title: `✓ ${t.title}`,
        sub: t.subject || "Planner task",
        xp: t.xp ?? 0,
        color: "#00FFC8",
      })),
    ];

    return items
      .filter((e) => e.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [limit]);

  if (!feed.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-3xl">📭</span>
        <p className="text-[13px] text-white/28">No activity yet.</p>
        <p className="text-[11px] text-white/18">
          Complete a quiz or focus session to start your feed.
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
            key={`${item.id}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.05] hover:border-white/[0.09] hover:bg-white/[0.02] transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${item.color}12`,
                border: `1px solid ${item.color}20`,
              }}
            >
              <Icon size={12} style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/72 truncate">
                {item.title}
              </p>
              <p className="text-[10px] text-white/28">{item.sub}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              {item.xp > 0 && (
                <div className="flex items-center gap-0.5">
                  <Zap size={9} className="text-[#7C6FFF]" />
                  <span className="text-[10px] font-bold text-[#7C6FFF]">
                    +{item.xp}
                  </span>
                </div>
              )}
              <span className="text-[9px] text-white/18">
                {fmtAgo(item.date)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
