import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Zap, Trophy } from "lucide-react";
import syllabusService from "../../services/syllabusService.js";
import { getExam } from "../../data/syllabusData.js";
import SyllabusProgressRing from "./SyllabusProgressRing.jsx";

export default function SyllabusDashboardWidget() {
  const navigate = useNavigate();

  const [examDef, setExamDef] = useState(null);
  const [examProgress, setExamProgress] = useState(null);
  const [nextTopic, setNextTopic] = useState(null);

  useEffect(() => {
    const examId = syllabusService.getActiveExam();
    const progress = syllabusService.getExamProgress(examId);
    const next = syllabusService.getNextTopic(examId);
    const def = getExam(examId);

    setExamDef(def);
    setExamProgress(progress);
    setNextTopic(next);
  }, []);

  const pct = examProgress?.pct ?? 0;
  const done = examProgress?.done ?? 0;
  const total = examProgress?.total ?? 0;
  const mastered = examProgress?.mastered ?? 0;
  const xpEarned = examProgress?.xpEarned ?? 0;
  const accent = examDef?.color ?? "#7C6FFF";
  const isEmpty = done === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate("/syllabus")}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 cursor-pointer group transition-all select-none"
      style={{ background: `linear-gradient(135deg, ${accent}0B, #0A0A14)` }}
    >
      {/* Top hover accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg,transparent,${accent},transparent)`,
        }}
      />

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={13} style={{ color: accent }} />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Syllabus Tracker
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-white/20 group-hover:text-white/55 transition-colors"
        />
      </div>

      {/* Main content row */}
      <div className="flex items-center gap-4">
        {/* Progress ring */}
        <div className="shrink-0">
          <SyllabusProgressRing pct={pct} color={accent} size={84} />
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          {/* Exam name */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-lg leading-none">{examDef?.emoji}</span>
            <span className="text-[14px] font-black text-white truncate">
              {examDef?.shortLabel}
            </span>
          </div>

          {/* Topics done */}
          <p className="text-[11px] text-white/38 mb-2">
            {done} of {total} topics done
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-3">
            {xpEarned > 0 && (
              <div className="flex items-center gap-1">
                <Zap size={11} className="text-[#7C6FFF]" />
                <span className="text-[11px] font-bold text-[#7C6FFF]">
                  {xpEarned.toLocaleString()} XP
                </span>
              </div>
            )}
            {mastered > 0 && (
              <div className="flex items-center gap-1">
                <Trophy size={11} className="text-[#FFD700]" />
                <span className="text-[11px] font-bold text-[#FFD700]">
                  {mastered} mastered
                </span>
              </div>
            )}
          </div>

          {/* Next topic or empty prompt */}
          {!isEmpty && nextTopic ? (
            <div
              className="px-2.5 py-1.5 rounded-lg text-[10px] text-white/48 font-medium truncate mb-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              Next: {nextTopic.topic?.label}
            </div>
          ) : isEmpty ? (
            <p className="text-[10px] text-white/22 italic mb-3">
              No topics completed yet — start tracking!
            </p>
          ) : (
            <p className="text-[11px] font-bold mb-3" style={{ color: accent }}>
              🎉 All topics complete!
            </p>
          )}

          {/* CTA button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate("/syllabus");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
            style={{
              background: `${accent}18`,
              color: accent,
              border: `1px solid ${accent}30`,
            }}
          >
            {isEmpty ? "Start Tracking" : "Continue Studying"}
            <ChevronRight size={11} />
          </motion.button>
        </div>
      </div>

      {/* Bottom progress bar */}
      {total > 0 && (
        <div className="mt-4 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
            style={{ background: accent }}
          />
        </div>
      )}
    </motion.div>
  );
}
