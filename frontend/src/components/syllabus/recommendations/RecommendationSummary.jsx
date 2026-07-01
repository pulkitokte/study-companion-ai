import { AlertOctagon, AlertTriangle, Info, TrendingUp } from "lucide-react";
import { PRIORITY_COLORS } from "../../../utils/studyRecommendationEngine.js";

/**
 * RecommendationSummary
 *
 * Four stat pills showing counts per priority level.
 * Prop: { summary } — output of buildRecommendationSummary()
 */

const CARDS = [
  {
    key: "criticalCount",
    label: "Critical",
    icon: AlertOctagon,
    color: PRIORITY_COLORS.CRITICAL,
    sub: "needs immediate action",
  },
  {
    key: "highCount",
    label: "High Priority",
    icon: AlertTriangle,
    color: PRIORITY_COLORS.HIGH,
    sub: "address today",
  },
  {
    key: "mediumCount",
    label: "Medium Priority",
    icon: Info,
    color: PRIORITY_COLORS.MEDIUM,
    sub: "plan this week",
  },
  {
    key: "positiveCount",
    label: "Positive",
    icon: TrendingUp,
    color: PRIORITY_COLORS.POSITIVE,
    sub: "keep it up",
  },
];

export default function RecommendationSummary({ summary }) {
  const s = summary ?? {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {CARDS.map(({ key, label, icon: Icon, color, sub }) => {
        const value = s[key] ?? 0;
        const isEmpty = value === 0;

        return (
          <div
            key={key}
            className="rounded-2xl border p-4 transition-all"
            style={{
              background: isEmpty ? "#0A0A14" : `${color}0C`,
              borderColor: isEmpty ? "rgba(255,255,255,0.06)" : `${color}28`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon
                size={12}
                style={{ color: isEmpty ? "rgba(255,255,255,0.22)" : color }}
              />
              <span
                className="text-[9px] font-black uppercase tracking-widest"
                style={{
                  color: isEmpty ? "rgba(255,255,255,0.22)" : `${color}AA`,
                }}
              >
                {label}
              </span>
            </div>
            <p
              className="text-[26px] font-black leading-none mb-1.5"
              style={{ color: isEmpty ? "rgba(255,255,255,0.18)" : color }}
            >
              {value}
            </p>
            <p className="text-[9px] text-white/22 leading-snug">{sub}</p>
          </div>
        );
      })}
    </div>
  );
}
