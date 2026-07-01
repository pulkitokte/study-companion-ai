import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";
import {
  generateRecommendations,
  buildRecommendationSummary,
} from "../../../utils/studyRecommendationEngine.js";
import { analyzeKnowledgeGaps } from "../../../utils/gapAnalysisEngine.js";
import RecommendationSummary from "./RecommendationSummary.jsx";
import RecommendationCard from "./RecommendationCard.jsx";

/**
 * RecommendationView
 *
 * Container for the Adaptive Study Recommendation Engine.
 * Stateless — all data passed as props.
 * No service calls inside this component.
 *
 * Props:
 *   subjectProgress  {Array}   syllabusService.getAllSubjectProgress(examId)
 *   examProgress     {object}  syllabusService.getExamProgress(examId)
 *   activityLog      {Array}   syllabusService.getActivityLog(500)
 *   quizHistory      {Array}   getQuizHistory()
 *   revisionQueue    {Array}   syllabusService.getTodayRevisionQueue(examId)
 *   examColor        {string}  accent color for the active exam
 *   onNavigate       {function} (path: string) => void — handle CTA navigation
 */
export default function RecommendationView({
  subjectProgress = [],
  examProgress = null,
  activityLog = [],
  quizHistory = [],
  revisionQueue = [],
  examColor = "#7C6FFF",
  onNavigate,
}) {
  // ── Derive gap items (needed by the recommendation engine) ───────────────
  const gapItems = useMemo(
    () => analyzeKnowledgeGaps(subjectProgress, quizHistory),
    [subjectProgress, quizHistory],
  );

  // ── Generate recommendations ──────────────────────────────────────────────
  const recommendations = useMemo(
    () =>
      generateRecommendations({
        subjectProgress,
        examProgress,
        activityLog,
        quizHistory,
        revisionQueue,
        gapItems,
      }),
    [
      subjectProgress,
      examProgress,
      activityLog,
      quizHistory,
      revisionQueue,
      gapItems,
    ],
  );

  const summary = useMemo(
    () => buildRecommendationSummary(recommendations),
    [recommendations],
  );

  // ── CTA handler — forwards navigation intent to parent page ───────────────
  const handleAction = (rec) => {
    if (rec.actionPath && onNavigate) {
      onNavigate(rec.actionPath);
    }
  };

  // ── Empty state: no data at all ───────────────────────────────────────────
  const hasNoData =
    subjectProgress.length === 0 ||
    subjectProgress.every((s) => (s.progress?.done ?? 0) === 0);

  if (hasNoData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 py-16 text-center px-4"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `${examColor}0C`,
            border: `1px solid ${examColor}22`,
          }}
        >
          <Sparkles size={28} style={{ color: `${examColor}80` }} />
        </div>
        <div>
          <p className="text-[15px] font-black text-white mb-2">
            Recommendations Not Available Yet
          </p>
          <p className="text-[12px] text-white/35 max-w-sm leading-relaxed">
            Complete some syllabus topics to activate personalised study
            recommendations. The engine analyses your progress, revision
            schedule and quiz performance to guide your daily study plan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          <BookOpen size={12} className="text-white/18" />
          Head to Overview to start marking topics done.
        </div>
      </motion.div>
    );
  }

  // ── Empty state: all on track (no issues found) ───────────────────────────
  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 py-14 text-center px-4"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{
            background: "rgba(0,255,200,0.08)",
            border: "1px solid rgba(0,255,200,0.20)",
          }}
        >
          🎯
        </div>
        <div>
          <p className="text-[16px] font-black text-white mb-2">
            You're Fully on Track!
          </p>
          <p className="text-[12px] text-white/35 max-w-sm leading-relaxed">
            No critical actions needed right now. Your revision schedule is up
            to date, coverage is solid and there are no significant knowledge
            gaps detected. Keep up the excellent consistency.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold"
          style={{
            background: "rgba(0,255,200,0.08)",
            border: "1px solid rgba(0,255,200,0.20)",
            color: "#00FFC8",
          }}
        >
          <Sparkles size={13} />
          Check back after your next session
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
      {/* ── Section header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Sparkles size={13} style={{ color: examColor }} />
        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
          {recommendations.length} personalised recommendation
          {recommendations.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Summary stat cards ────────────────────────────────────────── */}
      <RecommendationSummary summary={summary} />

      {/* ── Recommendation cards ──────────────────────────────────────── */}
      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            index={i}
            onAction={handleAction}
          />
        ))}
      </div>
    </motion.div>
  );
}
