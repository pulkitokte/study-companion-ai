import { motion } from "framer-motion";
import { BookOpen, Trophy, Calendar, AlertTriangle, Clock } from "lucide-react";
import syllabusService from "../../../services/syllabusService.js";
import { useToast } from "../../ui/Toast.jsx";
import RevisionQueue from "./RevisionQueue.jsx";
import { useRevisionQueue } from "../../../hooks/useRevisionQueue.js";

/**
 * RevisionView — Phase 31 update, Phase 36 Batch A consolidation
 *
 * Now powered by the shared useRevisionQueue(examId) hook, which wraps
 * syllabusService.getTodayRevisionQueue() / getRevisionStats() and the
 * existing Phase 35 sync architecture. Previously this component owned
 * its own duplicated loader + useSyllabusSyncListener wiring — that has
 * been consolidated into the hook, with identical behavior and identical
 * returned data shapes. All existing toast / XP / achievement logic is
 * preserved unchanged.
 *
 * Props:
 *   activeExam       {string}   current exam id
 *   onProgressChange {function} called after any mutation to reload parent stats
 */
export default function RevisionView({ activeExam, onProgressChange }) {
  const { show } = useToast();

  const {
    queue,
    stats: revisionStats,
    loading,
    refresh: loadRevisionData,
  } = useRevisionQueue(activeExam);

  // ── Action handler ────────────────────────────────────────────────────────
  const handleAction = (item, actionType) => {
    let result;

    if (actionType === "revise") {
      // Phase 31: use markTopicRevised — advances spaced repetition level
      result = syllabusService.markTopicRevised(
        item.examId,
        item.subjectId,
        item.topicId,
      );
    } else if (actionType === "master") {
      result = syllabusService.markMastered(
        item.examId,
        item.subjectId,
        item.topicId,
      );
    } else {
      return;
    }

    if (!result?.ok) {
      show({
        type: "info",
        title: "Could not update topic",
        message: result?.error ?? "Please try again.",
        duration: 2000,
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
          message: actionType === "revise" ? "Topic revised" : "Topic mastered",
          duration: 2000,
        });
      }
    } else {
      show({
        type: "info",
        title:
          actionType === "revise" ? "Marked as revised" : "Marked as mastered",
        duration: 1500,
      });
    }

    if (result.newAchievements?.length > 0) {
      show({
        type: "achievement",
        title: "🏆 Achievement Unlocked!",
        message: "Check your Profile page",
        duration: 3500,
      });
    }

    // Rebuild queue so acted-on card disappears; refresh parent hero stats
    loadRevisionData();
    onProgressChange?.();
  };

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading || queue === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF6B2B] to-[#7C6FFF]"
        />
      </div>
    );
  }

  const nothingScheduled = (revisionStats?.totalScheduled ?? 0) === 0;
  const nothingDueToday = queue.length === 0;

  // ── No topics ever scheduled yet ──────────────────────────────────────────
  if (nothingScheduled) {
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
          📅
        </div>
        <div>
          <p className="text-[15px] font-black text-white mb-2">
            No revisions scheduled yet
          </p>
          <p className="text-[12px] text-white/35 max-w-xs leading-relaxed">
            Complete topics from the Overview tab. Each completed topic
            automatically enters the spaced repetition schedule.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-white/22">
          <BookOpen size={13} className="text-white/20" />
          Head to Overview to start tracking topics.
        </div>
      </motion.div>
    );
  }

  // ── Spaced repetition stats helper ───────────────────────────────────────
  const nextDueDateLabel = revisionStats?.nextDueDate
    ? new Date(revisionStats.nextDueDate + "T00:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      )
    : "—";

  const STAT_PILLS = [
    {
      icon: AlertTriangle,
      label: "Overdue",
      value: revisionStats?.overdueCount ?? 0,
      color: "#FF6B2B",
      sub: "need attention",
    },
    {
      icon: Clock,
      label: "Due Today",
      value: revisionStats?.dueToday ?? 0,
      color: "#FFB347",
      sub: "scheduled today",
    },
    {
      icon: Trophy,
      label: "Graduated",
      value: revisionStats?.graduatedCount ?? 0,
      color: "#FFD700",
      sub: "fully revised",
    },
    {
      icon: Calendar,
      label: "Next Due",
      value: nextDueDateLabel,
      color: "#4FC3F7",
      sub: "upcoming",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* ── Spaced repetition stats row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_PILLS.map(({ icon: Icon, label, value, color, sub }) => {
          const isEmpty = value === 0 || value === "—";
          return (
            <div
              key={label}
              className="rounded-2xl border p-4 transition-all"
              style={{
                background: isEmpty ? "#0A0A14" : `${color}0C`,
                borderColor: isEmpty ? "rgba(255,255,255,0.06)" : `${color}28`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  size={12}
                  style={{
                    color: isEmpty ? "rgba(255,255,255,0.22)" : color,
                  }}
                />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {label}
                </span>
              </div>
              <p
                className="text-[22px] font-black leading-none mb-1"
                style={{ color: isEmpty ? "rgba(255,255,255,0.20)" : color }}
              >
                {value}
              </p>
              <p className="text-[9px] text-white/22">{sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── All caught up for today ──────────────────────────────────────── */}
      {nothingDueToday ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-10 text-center px-4
                     rounded-2xl border border-white/[0.06]"
          style={{ background: "rgba(0,255,200,0.03)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: "rgba(0,255,200,0.08)",
              border: "1px solid rgba(0,255,200,0.18)",
            }}
          >
            🎉
          </div>
          <div>
            <p className="text-[14px] font-black text-white mb-1.5">
              No revisions due today
            </p>
            <p className="text-[11px] text-white/35 max-w-xs leading-relaxed">
              {revisionStats?.nextDueDate
                ? `Your next scheduled revision is on ${new Date(
                    revisionStats.nextDueDate + "T00:00:00",
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}.`
                : "Keep completing topics to grow your revision pipeline."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/20">
            <BookOpen size={12} className="text-white/18" />
            Continue to Overview to mark more topics done.
          </div>
        </motion.div>
      ) : (
        /* ── Today's revision queue ─────────────────────────────────────── */
        <RevisionQueue queue={queue} onAction={handleAction} />
      )}
    </motion.div>
  );
}
