import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart2, BookOpen } from "lucide-react";
import {
  analyzeKnowledgeGaps,
  buildGapSummary,
} from "../../../utils/gapAnalysisEngine.js";
import GapSummaryCards from "./GapSummaryCards.jsx";
import GapInsightCard from "./GapInsightCard.jsx";

/**
 * GapAnalysisView
 *
 * Container for Phase 32 Gap Analysis.
 * Stateless — all data passed as props.
 * No service calls inside this component.
 *
 * Props:
 *   subjectProgress  {Array}   syllabusService.getAllSubjectProgress(examId)
 *   quizHistory      {Array}   getQuizHistory() result (may be empty)
 *   examColor        {string}  accent color for active exam
 */
export default function GapAnalysisView({
  subjectProgress,
  quizHistory,
  examColor,
}) {
  const accent = examColor ?? "#7C6FFF";

  // ── Compute gap items ─────────────────────────────────────────────────────
  const gapItems = useMemo(
    () => analyzeKnowledgeGaps(subjectProgress ?? [], quizHistory ?? []),
    [subjectProgress, quizHistory],
  );

  const summary = useMemo(() => buildGapSummary(gapItems), [gapItems]);

  const hasQuizHistory = Array.isArray(quizHistory) && quizHistory.length > 0;
  const hasAnyData = gapItems.length > 0;

  // ── Empty state: no quiz data at all ─────────────────────────────────────
  if (!hasQuizHistory) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 py-16 text-center px-4"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `${accent}0C`,
            border: `1px solid ${accent}22`,
          }}
        >
          <BarChart2 size={28} style={{ color: `${accent}80` }} />
        </div>

        <div>
          <p className="text-[15px] font-black text-white mb-2">
            Gap Analysis Not Available Yet
          </p>
          <p className="text-[12px] text-white/35 max-w-sm leading-relaxed">
            Take quizzes to unlock intelligent gap analysis. The system will
            automatically compare your syllabus coverage against quiz
            performance and surface hidden weak areas.
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold"
          style={{
            background: `${accent}10`,
            border: `1px solid ${accent}22`,
            color: accent,
          }}
        >
          <BookOpen size={13} />
          Head to Quiz Arena to begin
        </div>
      </motion.div>
    );
  }

  // ── Empty state: quiz data exists but no syllabus started ─────────────────
  if (!hasAnyData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-14 text-center px-4"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: "rgba(124,111,255,0.08)",
            border: "1px solid rgba(124,111,255,0.18)",
          }}
        >
          📊
        </div>
        <div>
          <p className="text-[14px] font-black text-white mb-2">
            No Subjects to Analyse Yet
          </p>
          <p className="text-[11px] text-white/35 max-w-xs leading-relaxed">
            Complete some syllabus topics so the gap engine can compare your
            coverage against quiz performance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          <BookOpen size={12} className="text-white/18" />
          Mark topics done in the Overview tab to begin.
        </div>
      </motion.div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* ── Section label ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <BarChart2 size={13} style={{ color: accent }} />
        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
          Knowledge Gap Analysis — {gapItems.length} subject
          {gapItems.length !== 1 ? "s" : ""} analysed
        </span>
      </div>

      {/* ── Summary stat cards ────────────────────────────────────────── */}
      <GapSummaryCards summary={summary} />

      {/* ── Insight cards — sorted High → Medium → Low → Unattempted ─── */}
      <div className="space-y-4">
        {gapItems.map((item, i) => (
          <GapInsightCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
