import { useMemo } from "react";
import { motion } from "framer-motion";
import { Command } from "lucide-react";
import {
  buildDashboardMission,
  buildTodayProgress,
  buildFocusScore,
} from "../../utils/dashboardMissionEngine.js";
import MissionCard from "./MissionCard.jsx";
import TodayProgressCard from "./TodayProgressCard.jsx";
import QuickActionsCard from "./QuickActionsCard.jsx";
import FocusMeterCard from "./FocusMeterCard.jsx";

/**
 * CommandCenter
 *
 * Central composition component for the Dashboard Command Center.
 * Orchestrates all four cards and the pure engine functions.
 * Fully prop-driven — no service calls.
 *
 * Props:
 *   revisionQueue    {Array}   syllabusService.getTodayRevisionQueue(examId)
 *   recommendations  {Array}   generateRecommendations({...}) output
 *   subjectProgress  {Array}   syllabusService.getAllSubjectProgress(examId)
 *   examProgress     {object}  syllabusService.getExamProgress(examId)
 *   activityLog      {Array}   syllabusService.getActivityLog(500)
 *   onNavigate       {function} (path: string, tab?: string) => void
 */
export default function CommandCenter({
  revisionQueue = [],
  recommendations = [],
  subjectProgress = [],
  examProgress = null,
  activityLog = [],
  onNavigate,
}) {
  // ── Pure engine calls — all useMemo so they only recompute on prop change
  const mission = useMemo(
    () =>
      buildDashboardMission({
        revisionQueue,
        recommendations,
        subjectProgress,
        examProgress,
      }),
    [revisionQueue, recommendations, subjectProgress, examProgress],
  );

  const todayProgress = useMemo(
    () => buildTodayProgress(activityLog),
    [activityLog],
  );

  const focusScore = useMemo(
    () => buildFocusScore(todayProgress, activityLog, revisionQueue.length),
    [todayProgress, activityLog, revisionQueue.length],
  );

  // ── Mission CTA handler ────────────────────────────────────────────────────
  const handleMissionAction = (m) => {
    onNavigate?.(m.actionPath, m.actionTab);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-4"
    >
      {/* ── Section header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(124,111,255,0.14)",
            border: "1px solid rgba(124,111,255,0.25)",
          }}
        >
          <Command size={13} className="text-[#7C6FFF]" />
        </div>
        <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">
          Today's Command Center
        </p>
      </div>

      {/* ── Card grid ─────────────────────────────────────────────────── */}
      {/* Row 1: Mission (full width on mobile, 2/3 on larger) + Focus Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <MissionCard mission={mission} onAction={handleMissionAction} />
        </div>
        <div className="sm:col-span-1">
          <FocusMeterCard focusScore={focusScore} />
        </div>
      </div>

      {/* Row 2: Today's Progress + Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TodayProgressCard progress={todayProgress} />
        <QuickActionsCard onNavigate={onNavigate} />
      </div>
    </motion.div>
  );
}
