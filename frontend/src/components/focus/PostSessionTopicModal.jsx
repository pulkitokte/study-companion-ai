import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckSquare, Square, Loader2, Check } from "lucide-react";
import {
  getCurrentFocusSyllabusSession,
  clearFocusSyllabusSession,
} from "../../utils/focusSyllabusSession.js";
import syllabusService from "../../services/syllabusService.js";
import { getTopics } from "../../data/syllabusData.js";

// ─── TOPIC ROW ────────────────────────────────────────────────────────────────

function TopicRow({ topic, checked, onChange }) {
  const isAlreadyDone = ["completed", "revised", "mastered"].includes(
    topic.currentStatus,
  );

  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => !isAlreadyDone && onChange(topic.id)}
      disabled={isAlreadyDone}
      className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all"
      style={{
        background: checked
          ? "rgba(0,255,200,0.06)"
          : isAlreadyDone
            ? "rgba(255,255,255,0.02)"
            : "rgba(255,255,255,0.025)",
        borderColor: checked
          ? "rgba(0,255,200,0.28)"
          : isAlreadyDone
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.07)",
        opacity: isAlreadyDone ? 0.45 : 1,
        cursor: isAlreadyDone ? "default" : "pointer",
      }}
    >
      {/* Checkbox icon */}
      <div className="shrink-0 mt-0.5">
        {isAlreadyDone ? (
          <div
            className="w-4 h-4 rounded flex items-center justify-center"
            style={{ background: "#00FFC828", border: "1px solid #00FFC850" }}
          >
            <Check size={10} className="text-[#00FFC8]" />
          </div>
        ) : checked ? (
          <CheckSquare size={16} className="text-[#00FFC8]" />
        ) : (
          <Square size={16} className="text-white/25" />
        )}
      </div>

      {/* Label + badges */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[12px] font-semibold leading-snug"
          style={{
            color: isAlreadyDone
              ? "rgba(255,255,255,0.35)"
              : checked
                ? "rgba(255,255,255,0.88)"
                : "rgba(255,255,255,0.68)",
          }}
        >
          {topic.label}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Difficulty */}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              color:
                topic.difficulty === "hard"
                  ? "#FF6B2B"
                  : topic.difficulty === "medium"
                    ? "#FFB347"
                    : "#00FF64",
              background:
                topic.difficulty === "hard"
                  ? "#FF6B2B12"
                  : topic.difficulty === "medium"
                    ? "#FFB34712"
                    : "#00FF6412",
            }}
          >
            {topic.difficulty
              ? topic.difficulty.charAt(0).toUpperCase() +
                topic.difficulty.slice(1)
              : ""}
          </span>
          {/* XP */}
          {topic.xp > 0 && (
            <span className="text-[9px] text-[#7C6FFF]/60 font-bold">
              +{topic.xp} XP
            </span>
          )}
          {/* Already done label */}
          {isAlreadyDone && (
            <span className="text-[9px] text-[#00FFC8]/55 font-bold">
              Already done
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

/**
 * PostSessionTopicModal
 *
 * Shown after a Focus session completes when a syllabus session context exists.
 * Lets the user mark topics as completed without leaving the Completion screen.
 *
 * Props:
 *   isOpen    {boolean}   controls visibility
 *   onClose   {function}  called after Skip or successful Confirm
 */
export default function PostSessionTopicModal({ isOpen, onClose }) {
  const [session, setSession] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  // Phase 35 Batch G: synchronous guard against double-submission.
  // `submitting` is React state and updates asynchronously — a fast
  // double-click (or duplicate programmatic call) before the next render
  // could otherwise slip past the `submitting` check in handleConfirm and
  // process the same topic batch twice (duplicate XP, duplicate
  // studymind:syllabus-updated dispatch). This ref is checked/set
  // synchronously, before any state update or async work, so a second
  // call in the same tick is rejected immediately.
  const submitLockRef = useRef(false);

  // ── Load session + topics when modal opens ─────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Reset state on each open
    setSelectedIds(new Set());
    setSubmitDone(false);
    setTotalXP(0);
    setSubmitting(false);
    submitLockRef.current = false;

    try {
      // getCurrentFocusSyllabusSession is now self-expiring (Phase 35
      // Batch G) — if the session is stale (e.g. left over from a tab
      // that was closed/refreshed mid-flow days ago), this already
      // returns null and the modal simply renders nothing, exactly as
      // if no syllabus context had ever been set.
      const currentSession = getCurrentFocusSyllabusSession();
      if (!currentSession) {
        setSession(null);
        setTopics([]);
        return;
      }
      setSession(currentSession);

      // Load static topic definitions
      const rawTopics =
        getTopics(currentSession.examId, currentSession.subjectId) ?? [];

      // Enrich each topic with its current syllabus status
      const enriched = rawTopics.map((t) => {
        let currentStatus = "not_started";
        try {
          const progress = syllabusService.getTopicProgress(
            currentSession.examId,
            currentSession.subjectId,
            t.id,
          );
          currentStatus = progress?.status ?? "not_started";
        } catch {}
        return { ...t, currentStatus };
      });

      setTopics(enriched);
    } catch {
      setSession(null);
      setTopics([]);
    }
  }, [isOpen]);

  // ── Toggle a topic in the selection set ───────────────────────────────
  const toggleTopic = (topicId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  // ── Confirm: mark selected topics completed ───────────────────────────
  const handleConfirm = async () => {
    // Phase 35 Batch G: synchronous re-entrancy guard — must be the very
    // first thing checked, before any state reads/writes or early returns,
    // so a second overlapping call can never race past this point.
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    if (!session || selectedIds.size === 0) {
      submitLockRef.current = false;
      handleSkip();
      return;
    }

    setSubmitting(true);
    let earned = 0;

    selectedIds.forEach((topicId) => {
      try {
        const result = syllabusService.markComplete(
          session.examId,
          session.subjectId,
          topicId,
        );
        if (result?.ok) {
          earned += (result.xpEarned ?? 0) + (result.bonusXP ?? 0);
        }
      } catch {}
    });

    // Phase 35 Batch D: emit global cross-system sync event.
    // Emitted only after ALL topics have been processed — never on partial updates.
    // Every system that subscribes to this event (SyllabusTracker, Dashboard,
    // Analytics, RevisionQueue, ReadinessScore, Countdown) will reload
    // its data automatically without requiring a page refresh.
    // UNCHANGED in Batch G — event name, payload shape, and dispatch timing
    // are exactly as Batch D left them.
    try {
      window.dispatchEvent(
        new CustomEvent("studymind:syllabus-updated", {
          detail: {
            examId: session.examId,
            subjectId: session.subjectId,
            completedTopics: [...selectedIds],
            xpEarned: earned,
            timestamp: new Date().toISOString(),
          },
        }),
      );
    } catch {
      // Never let event dispatch crash the completion flow
    }

    setTotalXP(earned);
    setSubmitDone(true);
    setSubmitting(false);

    // Auto-close after showing success state
    setTimeout(() => {
      clearFocusSyllabusSession();
      onClose?.();
    }, 1800);
  };

  // ── Skip: clear session and close ────────────────────────────────────
  const handleSkip = () => {
    clearFocusSyllabusSession();
    onClose?.();
  };

  // ── Derived ───────────────────────────────────────────────────────────
  const selectableTopics = useMemo(
    () =>
      topics.filter(
        (t) => !["completed", "revised", "mastered"].includes(t.currentStatus),
      ),
    [topics],
  );

  const selectedCount = selectedIds.size;

  // ── If no valid session exists, render nothing (caller controls isOpen) ─
  if (!session && isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && session && (
        <>
          {/* Backdrop */}
          <motion.div
            key="psm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-[3px]"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            key="psm-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed z-[501] inset-x-4 bottom-6 sm:inset-auto sm:left-1/2
                       sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2
                       sm:w-full sm:max-w-md
                       flex flex-col rounded-2xl border border-white/[0.10]
                       shadow-2xl shadow-black/70 overflow-hidden"
            style={{ background: "rgba(8,8,18,0.98)", maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ────────────────────────────────────────────── */}
            <div
              className="shrink-0 px-5 pt-5 pb-4 border-b border-white/[0.07]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,111,255,0.08), transparent)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[18px] font-black text-white leading-tight mb-1">
                    🎯 Session Reflection
                  </p>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Did you complete any{" "}
                    <span className="text-[#7C6FFF]/80 font-bold">
                      {session.subjectLabel}
                    </span>{" "}
                    topics during this session?
                  </p>
                </div>
                <button
                  onClick={handleSkip}
                  className="shrink-0 p-1.5 rounded-xl text-white/25
                             hover:text-white/60 hover:bg-white/[0.06] transition-all"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Selection counter */}
              {selectedCount > 0 && !submitDone && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <div
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black"
                    style={{
                      background: "rgba(0,255,200,0.10)",
                      color: "#00FFC8",
                      border: "1px solid rgba(0,255,200,0.22)",
                    }}
                  >
                    {selectedCount} topic{selectedCount !== 1 ? "s" : ""}{" "}
                    selected
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Success state ─────────────────────────────────────── */}
            {submitDone ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 py-10 px-6 text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(0,255,200,0.10)",
                    border: "1px solid rgba(0,255,200,0.25)",
                  }}
                >
                  ✅
                </div>
                <div>
                  <p className="text-[15px] font-black text-white mb-1">
                    Progress Saved!
                  </p>
                  <p className="text-[12px] text-white/40 leading-relaxed">
                    {selectedCount} topic{selectedCount !== 1 ? "s" : ""} marked
                    as completed.
                    {totalXP > 0 && (
                      <span className="text-[#7C6FFF] font-bold">
                        {" "}
                        +{totalXP} XP earned.
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* ── Topic list ──────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-none">
                  {topics.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <p className="text-[12px] text-white/28">
                        No topics found for this subject.
                      </p>
                    </div>
                  ) : (
                    topics.map((topic, i) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <TopicRow
                          topic={topic}
                          checked={selectedIds.has(topic.id)}
                          onChange={toggleTopic}
                        />
                      </motion.div>
                    ))
                  )}
                </div>

                {/* ── Footer ──────────────────────────────────────── */}
                <div
                  className="shrink-0 px-4 py-4 border-t border-white/[0.07] flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {/* Skip */}
                  <button
                    onClick={handleSkip}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08]
                               text-[12px] font-bold text-white/35
                               hover:text-white/60 hover:bg-white/[0.04]
                               transition-all disabled:opacity-40"
                  >
                    Skip
                  </button>

                  {/* Confirm */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConfirm}
                    disabled={submitting || selectedCount === 0}
                    className="flex-[2] flex items-center justify-center gap-2
                               px-4 py-2.5 rounded-xl text-[12px] font-black
                               transition-all disabled:opacity-40"
                    style={{
                      background:
                        selectedCount > 0
                          ? "linear-gradient(135deg,#00FFC8,#7C6FFF)"
                          : "rgba(255,255,255,0.06)",
                      color:
                        selectedCount > 0
                          ? "#050508"
                          : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckSquare size={13} />
                        Confirm Completed Topics
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
