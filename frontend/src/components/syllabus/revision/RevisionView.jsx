import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import syllabusService from "../../../services/syllabusService.js";
import { buildRevisionQueue } from "../../../utils/revisionEngine.js";
import { useToast } from "../../ui/Toast.jsx";
import RevisionStats from "./RevisionStats.jsx";
import RevisionQueue from "./RevisionQueue.jsx";

/**
 * RevisionView
 *
 * Container for the Smart Revision System.
 * Owns all service calls and queue state.
 * Passes pre-built data down to stateless child components.
 *
 * Props:
 *   activeExam       {string}   Current exam id
 *   onProgressChange {function} Called after any topic action so SyllabusTracker
 *                               can reload its hero stats without a full remount
 */
export default function RevisionView({ activeExam, onProgressChange }) {
  const { show } = useToast();

  const [queue, setQueue] = useState(null); // null = not yet loaded
  const [loading, setLoading] = useState(true);

  // ── Load / rebuild queue ──────────────────────────────────────────────────
  const buildQueue = useCallback(() => {
    try {
      const subjects = syllabusService.getAllSubjectProgress(activeExam);
      const progressData = syllabusService.getSyllabusData();
      const built = buildRevisionQueue(subjects, progressData, activeExam);
      setQueue(built);
    } catch {
      setQueue({
        overdue: [],
        dueToday: [],
        upcoming: [],
        totalDue: 0,
        totalOverdue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [activeExam]);

  useEffect(() => {
    setLoading(true);
    buildQueue();
  }, [buildQueue]);

  // ── Action handler ────────────────────────────────────────────────────────
  const handleAction = useCallback(
    (item, actionType) => {
      let result;

      if (actionType === "revise") {
        result = syllabusService.markRevised(
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
            message:
              actionType === "revise" ? "Topic revised" : "Topic mastered",
            duration: 2000,
          });
        }
      } else {
        show({
          type: "info",
          title:
            actionType === "revise"
              ? "Marked as revised"
              : "Marked as mastered",
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

      // Rebuild queue so the acted-on card disappears from the list
      buildQueue();

      // Refresh hero stats + subject grid on the parent page
      onProgressChange?.();
    },
    [buildQueue, onProgressChange, show],
  );

  // ── Loading state ─────────────────────────────────────────────────────────
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

  // ── Fully caught up empty state ────────────────────────────────────────────
  const allEmpty = queue.totalDue === 0 && (queue.upcoming?.length ?? 0) === 0;

  if (allEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-14 text-center px-4"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: "rgba(0,255,200,0.08)",
            border: "1px solid rgba(0,255,200,0.18)",
          }}
        >
          🎉
        </div>
        <div>
          <p className="text-[15px] font-black text-white mb-2">
            You're fully caught up!
          </p>
          <p className="text-[12px] text-white/35 max-w-xs leading-relaxed">
            Complete more topics to generate future revisions. Topics appear
            here after their scheduled review interval.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-white/22">
          <BookOpen size={13} className="text-white/20" />
          Head to the Overview tab to mark more topics done.
        </div>
      </motion.div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <RevisionStats queue={queue} />
      <RevisionQueue queue={queue} onAction={handleAction} />
    </motion.div>
  );
}
