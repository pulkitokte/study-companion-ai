import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  computeReadinessScore,
  getReadinessGrade,
  getReadinessBreakdown,
  getReadinessRecommendation,
} from "../../utils/readinessCalculator.js";

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, color, size = 88 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = _clamp01(score / 100) * circ;
  const cx = size / 2;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[20px] font-black text-white leading-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-white/30 mt-0.5">/100</span>
      </div>
    </div>
  );
}

function _clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// ─── BREAKDOWN ROW ────────────────────────────────────────────────────────────
function BreakdownRow({ label, score, weight, color }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/28 font-bold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[9px] font-black" style={{ color }}>
          {score}%
          <span className="text-white/20 font-normal ml-1">×{weight}</span>
        </span>
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            background:
              score >= 70 ? color : score >= 40 ? "#FFB347" : "#FF6B2B",
          }}
        />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

/**
 * ExamReadinessCard
 *
 * Displays a computed readiness score for the active exam.
 * No service calls. Fully prop-driven.
 *
 * Props:
 *   examProgress {object}      syllabusService.getExamProgress() result
 *   quizStats    {object|null} { totalQuestions, correctAnswers } or null
 *   examDef      {object}      getExam(activeExam) metadata
 */
export default function ExamReadinessCard({
  examProgress,
  quizStats,
  examDef,
}) {
  const score = useMemo(
    () => computeReadinessScore(examProgress, quizStats),
    [examProgress, quizStats],
  );
  const grade = useMemo(() => getReadinessGrade(score), [score]);
  const breakdown = useMemo(
    () => getReadinessBreakdown(examProgress, quizStats),
    [examProgress, quizStats],
  );
  const recommendation = useMemo(
    () => getReadinessRecommendation(examProgress, quizStats),
    [examProgress, quizStats],
  );

  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
      style={{
        background: `linear-gradient(135deg, ${grade.color}08, #0A0A14)`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg,transparent,${grade.color},transparent)`,
        }}
      />

      {/* Main row */}
      <div className="flex items-center gap-5">
        {/* Score ring */}
        <ScoreRing score={score} color={grade.color} size={88} />

        {/* Info column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-base leading-none">{grade.emoji}</span>
            <span
              className="text-[13px] font-black"
              style={{ color: grade.color }}
            >
              {grade.label}
            </span>
            {examDef && (
              <>
                <span className="text-white/15 text-[11px]">·</span>
                <span className="text-[11px] text-white/30 font-bold">
                  {examDef.emoji} {examDef.shortLabel}
                </span>
              </>
            )}
          </div>

          {/* Progress bar (overall) */}
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-2.5">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
              style={{ background: grade.color }}
            />
          </div>

          {/* Recommendation */}
          <p className="text-[11px] text-white/42 leading-snug mb-3">
            {recommendation}
          </p>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-bold transition-colors"
            style={{ color: grade.color + "99" }}
          >
            <TrendingUp size={11} />
            {expanded ? "Hide breakdown" : "View breakdown"}
          </button>
        </div>
      </div>

      {/* Expandable breakdown */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5"
        >
          <BreakdownRow
            label="Completion"
            score={breakdown.completion}
            weight="0.4"
            color={grade.color}
          />
          <BreakdownRow
            label="Mastery"
            score={breakdown.mastery}
            weight="0.2"
            color="#FFD700"
          />
          <BreakdownRow
            label="Revision"
            score={breakdown.revision}
            weight="0.2"
            color="#7C6FFF"
          />
          <BreakdownRow
            label="Quiz Perf."
            score={breakdown.quiz}
            weight="0.2"
            color="#4FC3F7"
          />
          <p className="text-[9px] text-white/18 pt-1">
            Quiz score shows 50/100 when no quizzes have been taken.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── useState must be imported ─────────────────────────────────────────────────
// (added here as a reminder — the import is at the top of the file)
import { useState } from "react";
