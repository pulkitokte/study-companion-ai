// ── PATCH 1 ───────────────────────────────────────────────────────────────────
// In TopicRow, add highlightedTopicId to props and wire scroll + pulse.
// Replace the existing TopicRow function with this version:
// Phase 29: Added Notes & Resources collapsible section per TopicRow.

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  RotateCcw,
  Star,
  AlertTriangle,
  BookOpen,
  Zap,
  ChevronDown,
} from "lucide-react";
import syllabusService, {
  TOPIC_STATUS,
} from "../../services/syllabusService.js";
import { getTopics } from "../../data/syllabusData.js";
import { useToast } from "../ui/Toast.jsx";
import TopicNotesPanel from "./TopicNotesPanel.jsx";

// ─── STATIC CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  [TOPIC_STATUS.NOT_STARTED]: {
    color: "rgba(255,255,255,0.20)",
    label: "Not Started",
  },
  [TOPIC_STATUS.IN_PROGRESS]: { color: "#FFB347", label: "In Progress" },
  [TOPIC_STATUS.COMPLETED]: { color: "#00FFC8", label: "Done" },
  [TOPIC_STATUS.REVISION_NEEDED]: { color: "#FF6B2B", label: "Review" },
  [TOPIC_STATUS.REVISED]: { color: "#7C6FFF", label: "Revised" },
  [TOPIC_STATUS.MASTERED]: { color: "#FFD700", label: "Mastered" },
};

const DIFFICULTY_CONFIG = {
  easy: { color: "#00FF64", label: "Easy" },
  medium: { color: "#FFB347", label: "Medium" },
  hard: { color: "#FF6B2B", label: "Hard" },
};

const DONE_SET = new Set([
  TOPIC_STATUS.COMPLETED,
  TOPIC_STATUS.REVISION_NEEDED,
  TOPIC_STATUS.REVISED,
  TOPIC_STATUS.MASTERED,
]);

const FILTERS = [
  { id: "all", label: "All" },
  { id: "todo", label: "To Do" },
  { id: "done", label: "Done" },
  { id: "review", label: "Review" },
  { id: "mastered", label: "Mastered" },
];

// ─── ACTION LOGIC ─────────────────────────────────────────────────────────────

function getActions(status) {
  switch (status) {
    case TOPIC_STATUS.NOT_STARTED:
    case TOPIC_STATUS.IN_PROGRESS:
      return [
        {
          key: "complete",
          label: "Mark Done",
          icon: CheckCircle2,
          color: "#00FFC8",
        },
      ];
    case TOPIC_STATUS.COMPLETED:
      return [
        {
          key: "revise",
          label: "Mark Revised",
          icon: RotateCcw,
          color: "#7C6FFF",
        },
        {
          key: "flag",
          label: "Flag for Review",
          icon: AlertTriangle,
          color: "#FF6B2B",
        },
      ];
    case TOPIC_STATUS.REVISION_NEEDED:
      return [
        {
          key: "revise",
          label: "Mark Revised",
          icon: RotateCcw,
          color: "#7C6FFF",
        },
        {
          key: "complete",
          label: "Clear Flag",
          icon: CheckCircle2,
          color: "rgba(255,255,255,0.35)",
        },
      ];
    case TOPIC_STATUS.REVISED:
      return [
        { key: "master", label: "Mark Mastered", icon: Star, color: "#FFD700" },
      ];
    case TOPIC_STATUS.MASTERED:
    default:
      return [];
  }
}

// ─── TOPIC ROW ────────────────────────────────────────────────────────────────

function TopicRow({
  examId,
  subjectId,
  topicDef,
  progress,
  subjectColor,
  onAction,
  onProgressRefresh,
  isHighlighted,
}) {
  const rowRef = useRef(null);
  const [pulse, setPulse] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);

  // Keep local progress in sync when parent provides updates
  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const status = localProgress?.status ?? TOPIC_STATUS.NOT_STARTED;
  const statusCfg =
    STATUS_CONFIG[status] ?? STATUS_CONFIG[TOPIC_STATUS.NOT_STARTED];
  const diffCfg =
    DIFFICULTY_CONFIG[topicDef.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const actions = getActions(status);

  const hasNotes = !!localProgress?.notes?.trim();
  const hasResources = (localProgress?.resources ?? []).length > 0;
  const hasContent = hasNotes || hasResources;

  // Scroll into view and pulse when highlighted by search
  useEffect(() => {
    if (!isHighlighted) return;
    const el = rowRef.current;
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setPulse(true);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [isHighlighted]);

  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, [pulse]);

  // Called by TopicNotesPanel after a save — re-read from service
  const handleNotesUpdate = useCallback(() => {
    const fresh = syllabusService.getTopicProgress(
      examId,
      subjectId,
      topicDef.id,
    );
    setLocalProgress(fresh);
    if (onProgressRefresh) onProgressRefresh();
  }, [examId, subjectId, topicDef.id, onProgressRefresh]);

  return (
    <div
      ref={rowRef}
      className="border-b border-white/[0.04] last:border-0 transition-all"
      style={{
        background: pulse
          ? "rgba(124,111,255,0.10)"
          : status === TOPIC_STATUS.MASTERED
            ? "rgba(255,215,0,0.04)"
            : "transparent",
        boxShadow: pulse ? "inset 0 0 0 1.5px rgba(124,111,255,0.35)" : "none",
        borderRadius: pulse ? 12 : 0,
        transition: "background 0.4s, box-shadow 0.4s",
      }}
    >
      {/* ── Main row content ── */}
      <div className="px-4 py-3.5">
        {/* Top row: status dot + label + diff + xp */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 w-3 h-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: statusCfg.color,
                boxShadow: DONE_SET.has(status)
                  ? `0 0 5px ${statusCfg.color}60`
                  : "none",
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-[12px] font-semibold leading-snug ${
                status === TOPIC_STATUS.MASTERED
                  ? "text-white/60 line-through"
                  : "text-white/78"
              }`}
            >
              {topicDef.label}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  color: statusCfg.color,
                  background: `${statusCfg.color}14`,
                }}
              >
                {statusCfg.label}
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                style={{
                  color: diffCfg.color,
                  borderColor: `${diffCfg.color}28`,
                  background: `${diffCfg.color}08`,
                }}
              >
                {diffCfg.label}
              </span>
              <div className="flex items-center gap-0.5">
                <Zap size={9} className="text-[#7C6FFF]/60" />
                <span className="text-[9px] text-[#7C6FFF]/60 font-bold">
                  {topicDef.xp} XP
                </span>
              </div>
              {/* Notes/resource indicator dot */}
              {hasContent && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: "#7C6FFF",
                    background: "rgba(124,111,255,0.12)",
                  }}
                  title={`${hasNotes ? "Has notes" : ""}${hasNotes && hasResources ? " · " : ""}${hasResources ? `${(localProgress?.resources ?? []).length} resource${(localProgress?.resources ?? []).length !== 1 ? "s" : ""}` : ""}`}
                >
                  📝
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5 ml-6 flex-wrap">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.key}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onAction(topicDef.id, action.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all"
                  style={{
                    color: action.color,
                    borderColor: `${action.color}28`,
                    background: `${action.color}0C`,
                  }}
                >
                  <Icon size={11} />
                  {action.label}
                </motion.button>
              );
            })}
          </div>
        )}

        {actions.length === 0 && status === TOPIC_STATUS.MASTERED && (
          <div className="flex items-center gap-1.5 mt-2 ml-6">
            <Star size={12} className="text-[#FFD700]" />
            <span className="text-[10px] font-bold text-[#FFD700]/70">
              Mastered
            </span>
          </div>
        )}

        {/* ── Notes & Resources toggle ── */}
        <div className="mt-3 ml-6">
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-bold transition-colors duration-150"
            style={{
              color: notesOpen ? "#7C6FFF" : "rgba(255,255,255,0.28)",
            }}
          >
            <span>📝 Notes & Resources</span>
            {hasContent && !notesOpen && (
              <span
                className="px-1 py-0.5 rounded text-[8px]"
                style={{
                  background: "rgba(124,111,255,0.15)",
                  color: "#7C6FFF",
                }}
              >
                {[
                  hasNotes && "note",
                  hasResources &&
                    `${(localProgress?.resources ?? []).length} link${(localProgress?.resources ?? []).length !== 1 ? "s" : ""}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
            <motion.span
              animate={{ rotate: notesOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-0.5"
            >
              <ChevronDown size={11} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {notesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3">
                  <TopicNotesPanel
                    examId={examId}
                    subjectId={subjectId}
                    topicId={topicDef.id}
                    progress={localProgress}
                    onUpdate={handleNotesUpdate}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PANEL ───────────────────────────────────────────────────────────────

export default function TopicPanel({
  examId,
  subject,
  onClose,
  onProgressChange,
  highlightedTopicId = null,
}) {
  const { show } = useToast();

  const [topicProgress, setTopicProgress] = useState({});
  const [subjectProgress, setSubjectProgress] = useState(null);
  const [filter, setFilter] = useState("all");

  const topicDefs = useMemo(
    () => getTopics(examId, subject.id),
    [examId, subject.id],
  );

  const loadProgress = useCallback(() => {
    const progresses = {};
    topicDefs.forEach((td) => {
      progresses[td.id] = syllabusService.getTopicProgress(
        examId,
        subject.id,
        td.id,
      );
    });
    setTopicProgress(progresses);
    setSubjectProgress(syllabusService.getSubjectProgress(examId, subject.id));
  }, [examId, subject.id, topicDefs]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // When highlightedTopicId is set, force filter to 'all' so the topic is visible
  useEffect(() => {
    if (highlightedTopicId) setFilter("all");
  }, [highlightedTopicId]);

  const filterCounts = useMemo(() => {
    const counts = {
      all: topicDefs.length,
      todo: 0,
      done: 0,
      review: 0,
      mastered: 0,
    };
    topicDefs.forEach((td) => {
      const s = topicProgress[td.id]?.status ?? TOPIC_STATUS.NOT_STARTED;
      if (s === TOPIC_STATUS.NOT_STARTED || s === TOPIC_STATUS.IN_PROGRESS)
        counts.todo++;
      if (DONE_SET.has(s)) counts.done++;
      if (s === TOPIC_STATUS.REVISION_NEEDED) counts.review++;
      if (s === TOPIC_STATUS.MASTERED) counts.mastered++;
    });
    return counts;
  }, [topicDefs, topicProgress]);

  const filteredTopics = useMemo(() => {
    return topicDefs.filter((td) => {
      const s = topicProgress[td.id]?.status ?? TOPIC_STATUS.NOT_STARTED;
      switch (filter) {
        case "todo":
          return (
            s === TOPIC_STATUS.NOT_STARTED || s === TOPIC_STATUS.IN_PROGRESS
          );
        case "done":
          return DONE_SET.has(s);
        case "review":
          return s === TOPIC_STATUS.REVISION_NEEDED;
        case "mastered":
          return s === TOPIC_STATUS.MASTERED;
        default:
          return true;
      }
    });
  }, [topicDefs, topicProgress, filter]);

  const handleAction = useCallback(
    (topicId, actionKey) => {
      let result;
      switch (actionKey) {
        case "complete":
          result = syllabusService.markComplete(examId, subject.id, topicId);
          break;
        case "revise":
          result = syllabusService.markRevised(examId, subject.id, topicId);
          break;
        case "master":
          result = syllabusService.markMastered(examId, subject.id, topicId);
          break;
        case "flag":
          result = syllabusService.flagForRevision(examId, subject.id, topicId);
          break;
        default:
          return;
      }

      if (!result.ok) {
        show({
          type: "info",
          title: "Error",
          message: result.error ?? "Could not update topic",
          duration: 2500,
        });
        return;
      }

      const totalXP = (result.xpEarned ?? 0) + (result.bonusXP ?? 0);
      if (totalXP > 0) {
        if ((result.bonusXP ?? 0) > 0) {
          show({
            type: "mission",
            title: `🎯 Milestone! +${totalXP} XP`,
            message: `+${result.bonusXP} bonus XP unlocked!`,
            duration: 3500,
          });
        } else {
          show({
            type: "xp",
            title: `+${result.xpEarned} XP`,
            message: "Progress saved",
            duration: 2000,
          });
        }
      } else {
        show({ type: "info", title: "Topic updated", duration: 1500 });
      }

      if (result.newAchievements?.length > 0) {
        show({
          type: "achievement",
          title: "🏆 Achievement Unlocked!",
          message: "Check your Profile page",
          duration: 3500,
        });
      }

      loadProgress();
      onProgressChange?.();
    },
    [examId, subject.id, loadProgress, onProgressChange, show],
  );

  const pct = subjectProgress?.pct ?? 0;
  const done = subjectProgress?.done ?? 0;
  const total = subjectProgress?.total ?? 0;
  const xpEarned = subjectProgress?.xpEarned ?? 0;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="fixed top-0 right-0 h-full w-full md:w-[480px] z-[300] flex flex-col border-l border-white/[0.08] shadow-2xl shadow-black/60"
      style={{ background: "rgba(5,5,12,0.98)", backdropFilter: "blur(20px)" }}
    >
      {/* Header */}
      <div
        className="relative shrink-0 px-5 py-4 border-b border-white/[0.07]"
        style={{ background: `${subject.color}09` }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background: `linear-gradient(90deg,transparent,${subject.color},transparent)`,
          }}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl leading-none shrink-0">
              {subject.emoji}
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-black text-white leading-tight truncate">
                {subject.label}
              </h2>
              <p className="text-[11px] text-white/35 mt-0.5">
                {done} of {total} topics done · {pct}% complete
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-xl text-white/30 hover:text-white/65 hover:bg-white/[0.07] transition-all"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ background: subject.color }}
          />
        </div>
        {xpEarned > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Zap size={11} className="text-[#7C6FFF]" />
            <span className="text-[10px] font-bold text-[#7C6FFF]">
              {xpEarned.toLocaleString()} XP earned from this subject
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="shrink-0 px-4 py-2.5 border-b border-white/[0.05] flex gap-1 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => {
          const count = filterCounts[f.id] ?? 0;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-150"
              style={{
                background: active
                  ? `${subject.color}14`
                  : "rgba(255,255,255,0.03)",
                borderColor: active
                  ? `${subject.color}40`
                  : "rgba(255,255,255,0.07)",
                color: active ? subject.color : "rgba(255,255,255,0.30)",
              }}
            >
              {f.label}
              <span
                className="ml-1.5 text-[9px]"
                style={{ opacity: active ? 1 : 0.6 }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Topic List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center px-6">
            <BookOpen size={28} className="text-white/15" />
            <p className="text-[12px] text-white/28">
              {filter === "todo" && "All topics completed — great work!"}
              {filter === "done" && "No completed topics yet."}
              {filter === "review" && "No topics flagged for review."}
              {filter === "mastered" && "No mastered topics yet — keep going!"}
              {filter === "all" && "No topics found."}
            </p>
          </div>
        ) : (
          filteredTopics.map((topicDef) => (
            <TopicRow
              key={topicDef.id}
              examId={examId}
              subjectId={subject.id}
              topicDef={topicDef}
              progress={topicProgress[topicDef.id]}
              subjectColor={subject.color}
              onAction={handleAction}
              onProgressRefresh={loadProgress}
              isHighlighted={highlightedTopicId === topicDef.id}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-5 py-3 border-t border-white/[0.07] flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-4 text-[10px] text-white/30">
          <span style={{ color: STATUS_CONFIG[TOPIC_STATUS.COMPLETED].color }}>
            ● {subjectProgress?.completed ?? 0} done
          </span>
          <span style={{ color: STATUS_CONFIG[TOPIC_STATUS.REVISED].color }}>
            ● {subjectProgress?.revised ?? 0} revised
          </span>
          <span style={{ color: STATUS_CONFIG[TOPIC_STATUS.MASTERED].color }}>
            ● {subjectProgress?.mastered ?? 0} mastered
          </span>
          {(subjectProgress?.revisionNeeded ?? 0) > 0 && (
            <span
              style={{
                color: STATUS_CONFIG[TOPIC_STATUS.REVISION_NEEDED].color,
              }}
            >
              ● {subjectProgress.revisionNeeded} review
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[11px] font-bold text-white/28 hover:text-white/55 transition-colors flex items-center gap-1"
        >
          Close <X size={11} />
        </button>
      </div>
    </motion.div>
  );
}
