import { useMemo } from "react";
import { motion } from "framer-motion";
import { Swords, Timer, CheckCircle2, Zap } from "lucide-react";
import { getQuizHistory } from "../../utils/quizStorage.js";
import { getFocusHistory } from "../../utils/focusStorage.js";
import { getPlanner } from "../../utils/plannerStorage.js";
import { CATEGORIES } from "../../data/mockQuizData.js";

const MODE_META = {
  pomodoro: { emoji: "🍅", color: "#FF6B2B" },
  deepwork: { emoji: "🧠", color: "#7C6FFF" },
  sprint: { emoji: "⚡", color: "#00FFC8" },
};

function fmtTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function groupByDay(items) {
  const map = {};
  items.forEach((item) => {
    const day = item.date?.slice(0, 10) ?? "unknown";
    if (!map[day]) map[day] = [];
    map[day].push(item);
  });
  return Object.entries(map)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .slice(0, 7);
}

function dayLabel(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ActivityTimeline({ limit = 30 }) {
  const feed = useMemo(() => {
    const qH = (getQuizHistory() ?? []).slice(0, 20);
    const fH = (getFocusHistory() ?? []).slice(0, 20);
    const { tasks = [] } = getPlanner();
    const done = tasks.filter((t) => t.done && t.completedAt).slice(0, 10);

    const items = [
      ...qH.map((q) => ({
        type: "quiz",
        date: q.date,
        icon: Swords,
        color: "#FFB347",
        title: `Quiz — ${CATEGORIES.find((c) => c.id === q.category)?.label ?? q.category ?? "Unknown"}`,
        meta: `${q.accuracy ?? 0}% · ${q.total ?? 0}q · +${q.totalXP ?? 0} XP`,
      })),
      ...fH.map((f) => {
        const m = MODE_META[f.mode] ?? { emoji: "⏱", color: "#7C6FFF" };
        return {
          type: "focus",
          date: f.date,
          icon: Timer,
          color: m.color,
          title: `${m.emoji} Focus — ${f.durationMinutes ?? 0}m ${f.mode ?? ""}`,
          meta: f.subject
            ? `Subject: ${f.subject} · +${f.xpEarned ?? 0} XP`
            : `+${f.xpEarned ?? 0} XP`,
        };
      }),
      ...done.map((t) => ({
        type: "planner",
        date: t.completedAt,
        icon: CheckCircle2,
        color: "#00FFC8",
        title: `✓ ${t.title}`,
        meta: `${t.subject || "Task"} · +${t.xp ?? 0} XP`,
      })),
    ]
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    return items;
  }, [limit]);

  const groups = groupByDay(feed);

  if (!feed.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="text-4xl">📭</span>
        <p className="text-[13px] text-white/28">No activity yet</p>
        <p className="text-[11px] text-white/18">
          Complete a quiz or focus session to start your timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([day, items]) => (
        <div key={day}>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
              {dayLabel(day)}
            </p>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-white/20">
              {items.length} events
            </span>
          </div>

          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-white/[0.06]" />

            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={`${item.type}-${item.date}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22 }}
                  className="relative flex items-start gap-3 pl-0 py-2"
                >
                  {/* Timeline dot */}
                  <div
                    className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${item.color}12`,
                      border: `1px solid ${item.color}20`,
                    }}
                  >
                    <Icon size={14} style={{ color: item.color }} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1.5">
                    <p className="text-[12px] font-semibold text-white/75 leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-white/28 mt-0.5">
                      {item.meta} · {fmtTime(item.date)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
