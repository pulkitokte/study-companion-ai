import {
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { RISK_COLORS } from "../../../utils/gapAnalysisEngine.js";

/**
 * GapSummaryCards
 *
 * Four stat pills: High Risk / Needs Practice / Strong Areas / No Quiz Data
 * Prop: { summary } — output of buildGapSummary()
 */

const CARDS = [
  {
    key: "highRiskCount",
    label: "High Risk",
    icon: AlertTriangle,
    color: RISK_COLORS.high,
    sub: "completed but low accuracy",
  },
  {
    key: "mediumRiskCount",
    label: "Needs Practice",
    icon: TrendingUp,
    color: RISK_COLORS.medium,
    sub: "moderate quiz performance",
  },
  {
    key: "lowRiskCount",
    label: "Strong Areas",
    icon: CheckCircle2,
    color: RISK_COLORS.low,
    sub: "high accuracy confirmed",
  },
  {
    key: "unattemptedCount",
    label: "No Quiz Data",
    icon: HelpCircle,
    color: RISK_COLORS.unattempted,
    sub: "quiz not attempted yet",
  },
];

export default function GapSummaryCards({ summary }) {
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
              background: isEmpty ? "#0A0A14" : `${color}0D`,
              borderColor: isEmpty ? "rgba(255,255,255,0.06)" : `${color}2A`,
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
