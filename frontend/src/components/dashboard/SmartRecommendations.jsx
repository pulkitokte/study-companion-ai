import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Swords,
  Timer,
  Brain,
  Flame,
  Zap,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  getSmartRecommendations,
  getFirstName,
} from "../../utils/userProfile.js";
import { aggregateAll } from "../../utils/globalStats.js";

const TYPE_META = {
  quiz: { icon: Swords, color: "#FFB347", path: "/quiz" },
  focus: { icon: Timer, color: "#7C6FFF", path: "/focus" },
  streak: { icon: Flame, color: "#FF6B2B", path: "/focus" },
  general: { icon: Brain, color: "#00FFC8", path: "/chat" },
  xp: { icon: Zap, color: "#FFD700", path: "/progress" },
  alert: { icon: AlertTriangle, color: "#FF3C3C", path: "/progress" },
};

const URGENCY_ORDER = { high: 0, medium: 1, positive: 2, low: 3 };

export default function SmartRecommendations() {
  const navigate = useNavigate();
  const recs = useMemo(() => getSmartRecommendations(), []);
  const stats = useMemo(() => aggregateAll(), []);
  const name = getFirstName();

  // Inject extra stat-based recommendations
  const all = useMemo(() => {
    const extras = [];

    if (stats.avgQuizAcc < 50 && stats.totalQuizzes > 3) {
      extras.push({
        type: "quiz",
        urgency: "medium",
        text: `Quiz accuracy at ${stats.avgQuizAcc}% — a focused revision session would help significantly.`,
        action: "quiz",
      });
    }
    if (stats.todayFocusMins === 0 && stats.totalFocusSessions > 0) {
      extras.push({
        type: "focus",
        urgency: "medium",
        text: "No focus session today. Even 25 minutes builds the habit.",
        action: "focus",
      });
    }
    if (stats.prodScore >= 80) {
      extras.push({
        type: "xp",
        urgency: "positive",
        text: `${stats.prodScore}% productivity score — you're in the top tier. Keep the momentum.`,
        action: "progress",
      });
    }

    return [...recs, ...extras]
      .sort(
        (a, b) =>
          (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9),
      )
      .slice(0, 4);
  }, [recs, stats]);

  if (!all.length) return null;

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
        <TrendingUp size={14} className="text-[#7C6FFF]" />
        <h3 className="text-[13px] font-bold text-white">
          Smart Recommendations
        </h3>
        <span className="ml-auto text-[10px] text-white/20">for {name}</span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {all.map((rec, i) => {
          const meta = TYPE_META[rec.type] ?? TYPE_META.general;
          const Icon = meta.icon;
          const urgColor =
            rec.urgency === "high"
              ? "#FF3C3C"
              : rec.urgency === "positive"
                ? "#00FFC8"
                : rec.urgency === "medium"
                  ? "#FFB347"
                  : "rgba(255,255,255,0.3)";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.25 }}
              onClick={() => navigate(`/${rec.action}`)}
              className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `${meta.color}12`,
                  border: `1px solid ${meta.color}20`,
                }}
              >
                <Icon size={14} style={{ color: meta.color }} />
              </div>
              <p className="flex-1 text-[12px] text-white/60 group-hover:text-white/80 leading-snug transition-colors">
                {rec.text}
              </p>
              <ArrowRight
                size={12}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: urgColor }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
