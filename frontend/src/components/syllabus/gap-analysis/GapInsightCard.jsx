import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  RISK_LEVEL,
  RISK_COLORS,
  RISK_LABELS,
} from "../../../utils/gapAnalysisEngine.js";

/**
 * GapInsightCard
 *
 * Displays a single subject gap analysis result.
 * Fully prop-driven — no service calls.
 *
 * Props:
 *   item  {object}  gap item from analyzeKnowledgeGaps()
 *   index {number}  animation stagger index
 */

const RISK_ICONS = {
  [RISK_LEVEL.HIGH]: AlertTriangle,
  [RISK_LEVEL.MEDIUM]: TrendingUp,
  [RISK_LEVEL.LOW]: CheckCircle2,
  [RISK_LEVEL.UNATTEMPTED]: HelpCircle,
};

// ─── MINI PROGRESS BAR ────────────────────────────────────────────────────────

function MiniBar({ label, pct, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-white/30 font-bold w-14 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span
        className="text-[10px] font-black w-8 text-right shrink-0"
        style={{ color }}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function GapInsightCard({ item, index = 0 }) {
  if (!item) return null;

  const {
    subject,
    emoji,
    color,
    completionPct,
    quizAccuracy,
    totalQuizQuestions,
    hasQuizData,
    riskLevel,
    riskColor,
    riskLabel,
    recommendation,
    actionMessage,
  } = item;

  const Icon = RISK_ICONS[riskLevel] ?? HelpCircle;
  const isHighRisk = riskLevel === RISK_LEVEL.HIGH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="relative rounded-2xl border border-white/[0.06] p-5 overflow-hidden"
      style={{
        background: isHighRisk
          ? `linear-gradient(135deg, ${riskColor}08, #0A0A14)`
          : "#0A0A14",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, ${riskColor}, transparent)`,
          opacity: isHighRisk ? 0.75 : 0.38,
        }}
      />

      {/* ── Header row ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Subject identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl leading-none shrink-0">{emoji}</span>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-white/88 leading-tight truncate">
              {subject}
            </p>
            {hasQuizData && (
              <p className="text-[9px] text-white/28 mt-0.5">
                {totalQuizQuestions} question
                {totalQuizQuestions !== 1 ? "s" : ""} attempted
              </p>
            )}
          </div>
        </div>

        {/* Risk badge */}
        <div
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
          style={{
            background: `${riskColor}14`,
            border: `1px solid ${riskColor}28`,
          }}
        >
          <Icon size={11} style={{ color: riskColor }} />
          <span className="text-[10px] font-black" style={{ color: riskColor }}>
            {riskLabel}
          </span>
        </div>
      </div>

      {/* ── Progress comparison bars ───────────────────────────────────── */}
      <div className="space-y-2 mb-4">
        <MiniBar
          label="Syllabus"
          pct={completionPct}
          color={color ?? "#7C6FFF"}
        />
        <MiniBar
          label="Quiz"
          pct={hasQuizData ? quizAccuracy : 0}
          color={riskColor}
        />
      </div>

      {/* ── Gap delta indicator (only when both data points exist) ─────── */}
      {hasQuizData && completionPct > 0 && (
        <div
          className="mb-3 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {completionPct > quizAccuracy ? (
            <p className="text-[10px] text-white/45 leading-snug">
              <span style={{ color: riskColor }} className="font-black">
                {completionPct - quizAccuracy}pt gap
              </span>{" "}
              between syllabus coverage and quiz performance
            </p>
          ) : (
            <p className="text-[10px] text-white/45 leading-snug">
              Quiz accuracy{" "}
              <span
                style={{ color: RISK_COLORS[RISK_LEVEL.LOW] }}
                className="font-black"
              >
                matches
              </span>{" "}
              or exceeds syllabus coverage — strong foundation.
            </p>
          )}
        </div>
      )}

      {/* ── Recommendation text ────────────────────────────────────────── */}
      <p className="text-[11px] text-white/42 leading-relaxed mb-3">
        {recommendation}
      </p>

      {/* ── Action message pill ────────────────────────────────────────── */}
      <div
        className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold"
        style={{
          color: riskColor,
          background: `${riskColor}0F`,
          border: `1px solid ${riskColor}22`,
        }}
      >
        {actionMessage}
      </div>
    </motion.div>
  );
}
