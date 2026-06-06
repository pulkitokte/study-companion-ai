import { useMemo } from "react";
import { motion } from "framer-motion";
import { Swords, Timer, CheckCircle2, Zap, Calendar } from "lucide-react";
import { getQuizHistory } from "../../utils/quizStorage.js";
import { getFocusHistory } from "../../utils/focusStorage.js";
import { getPlanner } from "../../utils/plannerStorage.js";
import { CATEGORIES } from "../../data/mockQuizData.js";
import { getLast30Days } from "../../utils/progressStorage.js";

const MODE_META = {
  pomodoro: { emoji: "🍅", color: "#FF6B2B" },
  deepwork: { emoji: "🧠", color: "#7C6FFF" },
  sprint: { emoji: "⚡", color: "#00FFC8" },
};

function fmtAgo(iso) {
  if (!iso) return "";
  try {
    const m = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  } catch {
    return "";
  }
}

export default function ProfileActivity() {
  const feed = useMemo(() => {
    const qH = (getQuizHistory() ?? []).slice(0, 10);
    const fH = (getFocusHistory() ?? []).slice(0, 10);
    const { tasks = [] } = getPlanner();
    const done = tasks.filter((t) => t.done && t.completedAt).slice(0, 5);

    const items = [
      ...qH.map((q) => ({
        date: q.date,
        icon: Swords,
        color: "#FFB347",
        title: `Quiz · ${CATEGORIES.find((c) => c.id === q.category)?.label ?? q.category ?? "General"}`,
        meta: `${q.accuracy ?? 0}% · +${q.totalXP ?? 0} XP`,
      })),
      ...fH.map((f) => {
        const m = MODE_META[f.mode] ?? { emoji: "⏱", color: "#7C6FFF" };
        return {
          date: f.date,
          icon: Timer,
          color: m.color,
          title: `${m.emoji} Focus · ${f.durationMinutes ?? 0}m`,
          meta: `${f.subject || f.mode || "session"} · +${f.xpEarned ?? 0} XP`,
        };
      }),
      ...done.map((t) => ({
        date: t.completedAt,
        icon: CheckCircle2,
        color: "#00FFC8",
        title: `✓ ${t.title}`,
        meta: `${t.subject || "Task"} · +${t.xp ?? 0} XP`,
      })),
    ]
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);

    return items;
  }, []);

  // 30-day heatmap
  const days30 = getLast30Days();

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
        Activity
      </p>

      {/* 30-day heatmap */}
      <div
        className="rounded-2xl border border-white/[0.06] p-4"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={12} className="text-[#7C6FFF]" />
          <span className="text-[10px] text-white/28 uppercase tracking-widest">
            Last 30 Days
          </span>
        </div>
        <div className="grid grid-cols-[repeat(30,1fr)] gap-0.5">
          {days30.map((d, i) => (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.008, duration: 0.15 }}
              title={d.date}
              className="aspect-square rounded-[2px]"
              style={{
                background:
                  d.hasQuiz && d.hasFocus
                    ? "linear-gradient(135deg,#FFB347,#7C6FFF)"
                    : d.hasQuiz
                      ? "#FFB34770"
                      : d.hasFocus
                        ? "#7C6FFF70"
                        : "rgba(255,255,255,0.05)",
                boxShadow: d.active
                  ? `0 0 4px ${d.hasQuiz && d.hasFocus ? "#FFD700" : d.hasQuiz ? "#FFB347" : "#7C6FFF"}60`
                  : "none",
              }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap text-[9px] text-white/22">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#FFB347]/70" />
            Quiz
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#7C6FFF]/70" />
            Focus
          </span>
          <span className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{ background: "linear-gradient(135deg,#FFB347,#7C6FFF)" }}
            />
            Both
          </span>
        </div>
      </div>

      {/* Recent feed */}
      {feed.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 py-8 text-center rounded-2xl border border-white/[0.05]"
          style={{ background: "rgba(255,255,255,0.01)" }}
        >
          <span className="text-3xl">📭</span>
          <p className="text-[12px] text-white/28">No activity yet</p>
          <p className="text-[10px] text-white/18">
            Complete a quiz or focus session to start tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {feed.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={`${item.title}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.05] hover:border-white/[0.09] hover:bg-white/[0.02] transition-all"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${item.color}12`,
                    border: `1px solid ${item.color}20`,
                  }}
                >
                  <Icon size={13} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white/72 truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-white/28">{item.meta}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Zap size={9} className="text-[#7C6FFF]" />
                  <span className="text-[10px] text-white/22">
                    {fmtAgo(item.date)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
