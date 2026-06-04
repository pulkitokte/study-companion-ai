import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Flame,
  Brain,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { aggregateAll } from "../../utils/globalStats.js";
import { getQuizHistory } from "../../utils/quizStorage.js";
import { CATEGORIES } from "../../data/mockQuizData.js";

function InsightCard({ icon: Icon, label, value, sub, color, trend = null }) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "#00FF64" : trend === "down" ? "#FF6B6B" : "#888";
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.1] transition-colors"
      style={{ background: `${color}06` }}
    >
      <div className="flex items-center justify-between">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}14` }}>
          <Icon size={13} style={{ color }} />
        </div>
        {trend && <TrendIcon size={11} style={{ color: trendColor }} />}
      </div>
      <div>
        <p className="text-[20px] font-black text-white leading-none">
          {value}
        </p>
        <p className="text-[10px] text-white/35 mt-0.5 uppercase tracking-wider">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-white/22 mt-1 leading-snug">{sub}</p>
        )}
      </div>
    </div>
  );
}

function generateInsightText(stats, catMap) {
  const insights = [];

  // Streak
  if (stats.streak >= 7)
    insights.push({
      type: "positive",
      text: `${stats.streak}-day streak — elite consistency. You're building the habit that creates toppers.`,
    });
  else if (stats.streak === 0)
    insights.push({
      type: "warning",
      text: "Streak broken. Start fresh today — even one session restores momentum.",
    });
  else
    insights.push({
      type: "neutral",
      text: `${stats.streak}-day streak building. Aim for 7 consecutive days to build a true habit.`,
    });

  // Quiz accuracy
  if (stats.avgQuizAcc >= 80)
    insights.push({
      type: "positive",
      text: `${stats.avgQuizAcc}% average accuracy — your knowledge retention is strong. Push harder topics.`,
    });
  else if (stats.avgQuizAcc < 50 && stats.totalQuizzes > 5)
    insights.push({
      type: "warning",
      text: `${stats.avgQuizAcc}% quiz accuracy signals conceptual gaps. More revision, fewer questions.`,
    });

  // Focus
  if (stats.totalFocusMins >= 60)
    insights.push({
      type: "positive",
      text: `${Math.floor(stats.totalFocusMins / 60)}h total focused — your deep work capacity is growing.`,
    });

  // Category-specific
  const entries = Object.entries(catMap);
  if (entries.length > 0) {
    const [best] = entries.sort((a, b) => b[1].accuracy - a[1].accuracy);
    const [worst] = entries.sort((a, b) => a[1].accuracy - b[1].accuracy);
    const bestCat = CATEGORIES.find((c) => c.id === best?.[0]);
    const worstCat = CATEGORIES.find((c) => c.id === worst?.[0]);
    if (bestCat)
      insights.push({
        type: "positive",
        text: `${bestCat.label} is your strongest subject — use it to build confidence before exams.`,
      });
    if (worstCat && worstCat.id !== bestCat?.id)
      insights.push({
        type: "warning",
        text: `${worstCat?.label} needs attention — prioritize it in your next study block.`,
      });
  }

  return insights.slice(0, 3);
}

export default function ProductivityInsights() {
  const stats = useMemo(() => aggregateAll(), []);
  const qH = useMemo(() => getQuizHistory() ?? [], []);

  const catMap = useMemo(() => {
    const map = {};
    qH.forEach((q) => {
      const c = q.category ?? "unknown";
      if (!map[c]) map[c] = { total: 0, count: 0 };
      map[c].total += q.accuracy ?? 0;
      map[c].count++;
    });
    Object.keys(map).forEach((k) => {
      map[k].accuracy = Math.round(map[k].total / map[k].count);
    });
    return map;
  }, [qH]);

  const insights = useMemo(
    () => generateInsightText(stats, catMap),
    [stats, catMap],
  );

  const CARDS = [
    {
      icon: Flame,
      label: "Day Streak",
      value: stats.streak,
      sub: stats.streak >= 3 ? "Bonus XP active" : "Keep going",
      color: "#FF6B2B",
      trend: stats.streak >= 3 ? "up" : null,
    },
    {
      icon: Target,
      label: "Quiz Accuracy",
      value: `${stats.avgQuizAcc}%`,
      sub: `${stats.totalQuizzes} quizzes done`,
      color: "#FFB347",
      trend:
        stats.avgQuizAcc >= 70 ? "up" : stats.avgQuizAcc < 50 ? "down" : null,
    },
    {
      icon: Clock,
      label: "Focus Hours",
      value: `${Math.floor(stats.totalFocusMins / 60)}h ${stats.totalFocusMins % 60}m`,
      sub: `${stats.totalFocusSessions} sessions`,
      color: "#7C6FFF",
      trend: stats.totalFocusSessions > 5 ? "up" : null,
    },
    {
      icon: Brain,
      label: "Prod. Score",
      value: `${stats.prodScore}%`,
      sub:
        stats.prodScore >= 70
          ? "Excellent"
          : stats.prodScore >= 40
            ? "Building"
            : "Start today",
      color: "#00FFC8",
      trend: stats.prodScore >= 60 ? "up" : null,
    },
  ];

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
        <BarChart3 size={14} className="text-[#FFB347]" />
        <h3 className="text-[13px] font-bold text-white">
          Productivity Insights
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.28 }}
            >
              <InsightCard {...c} />
            </motion.div>
          ))}
        </div>

        {/* Text insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-white/22 uppercase tracking-widest">
              Analysis
            </p>
            {insights.map((ins, i) => {
              const color =
                ins.type === "positive"
                  ? "#00FFC8"
                  : ins.type === "warning"
                    ? "#FFB347"
                    : "#888";
              const Icon =
                ins.type === "positive"
                  ? TrendingUp
                  : ins.type === "warning"
                    ? TrendingDown
                    : Minus;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border"
                  style={{
                    borderColor: `${color}20`,
                    background: `${color}06`,
                  }}
                >
                  <Icon
                    size={12}
                    style={{ color }}
                    className="shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-white/55 leading-relaxed">
                    {ins.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
