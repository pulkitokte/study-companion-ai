import { useMemo } from "react";
import { motion } from "framer-motion";
import { Command } from "lucide-react";
import {
  buildTodayProgress,
  buildFocusScore,
} from "../../utils/dashboardMissionEngine.js";
import { useStudyPlan } from "../../hooks/useStudyPlan.js";
import syllabusService from "../../services/syllabusService.js";
import MissionCard from "./MissionCard.jsx";
import TodayProgressCard from "./TodayProgressCard.jsx";
import QuickActionsCard from "./QuickActionsCard.jsx";
import FocusMeterCard from "./FocusMeterCard.jsx";

/**
 * Phase 37 Batch E.2 — Command Center Migration to Unified Study Plan
 *
 * The "what should I study now?" mission decision is sourced from
 * useStudyPlan(examId).topPriorityItem — the canonical orchestration
 * result of studyRecommendationEngine → recommendationPrioritization →
 * studyPlanEngine.
 *
 * Phase 37 Batch I.3 — Study Plan → Planner Handoff
 *
 * Adds an ADDITIVE secondary action, "Add to Planner", rendered
 * alongside (not inside) the existing MissionCard. Clicking it does NOT
 * create a Planner task — it writes a small, namespaced sessionStorage
 * handoff (containing only title/subject/priority/provenance — never
 * duration, XP, date, or time, none of which the Study Plan has any
 * opinion about) and navigates to the existing /planner route via the
 * same `onNavigate` prop the existing mission CTA already uses. Planner
 * itself remains solely responsible for scheduling and requires
 * explicit user confirmation before any task is actually created.
 *
 * MissionCard.jsx is NOT modified — this new action lives entirely in
 * CommandCenter's own markup.
 */

// Phase 37 Batch I.3: namespaced sessionStorage key for the one-shot
// Study Plan → Planner handoff. Matches the existing "studymind_" prefix
// convention already used elsewhere (e.g. studymind_syllabus_initial_tab).
const STUDY_PLAN_PLANNER_PREFILL_KEY = "studymind_study_plan_planner_prefill";

// ─── PRESENTATION-ONLY FALLBACK ────────────────────────────────────────────
// Mirrors the shape (not the logic) of studyPlanEngine's own internal
// FALLBACK_ITEM / dashboardMissionEngine's legacy FALLBACK, so MissionCard
// always has a safe, non-null mission to render — including on the very
// first render before useStudyPlan's initial build completes.
const FALLBACK_MISSION = {
  emoji: "📘",
  title: "Start Your Study Session",
  explanation: "Open your syllabus and mark the first topic for today.",
  ctaLabel: "Open Syllabus",
  actionPath: "/syllabus",
  actionTab: "overview",
  urgencyLevel: "medium",
  color: "#7C6FFF",
};

/**
 * _adaptPlanItemToMission
 *
 * Presentation-only adapter — maps a studyPlanEngine PlanItem
 * (icon/title/description/actionLabel/actionPath/actionTab/urgencyLevel/color)
 * into the exact mission shape MissionCard already renders
 * (emoji/title/explanation/ctaLabel/actionPath/actionTab/urgencyLevel/color).
 * No recommendation selection, ranking, or scoring occurs here — every
 * field is taken verbatim from the already-resolved plan item.
 */
function _adaptPlanItemToMission(item) {
  if (!item) return FALLBACK_MISSION;

  return {
    emoji: item.icon ?? FALLBACK_MISSION.emoji,
    title: item.title || FALLBACK_MISSION.title,
    explanation: item.description || FALLBACK_MISSION.explanation,
    ctaLabel: item.actionLabel || FALLBACK_MISSION.ctaLabel,
    actionPath: item.actionPath || FALLBACK_MISSION.actionPath,
    actionTab: item.actionTab ?? FALLBACK_MISSION.actionTab,
    urgencyLevel: (
      item.urgencyLevel ?? FALLBACK_MISSION.urgencyLevel
    ).toLowerCase(),
    color: item.color ?? FALLBACK_MISSION.color,
  };
}

/**
 * _mapUrgencyToPlannerPriority
 *
 * Small, local, conservative mapping from the Study Plan's urgency tiers
 * to Planner's existing three priority values. Does not touch, alter, or
 * duplicate any canonical recommendation/prioritization weighting — this
 * is purely a presentation-layer conversion for the handoff payload.
 */
function _mapUrgencyToPlannerPriority(urgencyLevel) {
  switch (urgencyLevel) {
    case "CRITICAL":
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    case "POSITIVE":
    default:
      return "low";
  }
}

/**
 * CommandCenter
 *
 * Central composition component for the Dashboard Command Center.
 * Orchestrates all four cards. Today Progress and Focus Meter remain
 * fully prop-driven (unrelated to the Study Plan). The mission card is
 * powered by useStudyPlan(examId) internally.
 *
 * Props:
 *   revisionQueue    {Array}   syllabusService.getTodayRevisionQueue(examId)
 *                               — still used by Focus Meter's revision
 *                               component; no longer used for mission
 *                               selection (useStudyPlan sources its own
 *                               revision queue via useRevisionQueue).
 *   recommendations  {Array}   agent-pipeline recommendations (lib/recommendationEngine.js)
 *                               — no longer consumed here; the canonical
 *                               studyRecommendationEngine pipeline (via
 *                               useStudyPlan) is now the sole mission
 *                               authority. Retained as an accepted prop
 *                               for backward compatibility with
 *                               Dashboard.jsx, which is left unmodified.
 *   subjectProgress  {Array}   syllabusService.getAllSubjectProgress(examId)
 *                               — no longer used directly here (useStudyPlan
 *                               fetches its own copy internally); retained
 *                               as an accepted prop for the same reason.
 *   examProgress     {object}  syllabusService.getExamProgress(examId)
 *                               — no longer used directly here for the same
 *                               reason; retained as an accepted prop.
 *   activityLog      {Array}   syllabusService.getActivityLog(500)
 *                               — still used by Today Progress and Focus
 *                               Meter; unrelated to the migrated mission.
 *   onNavigate       {function} (path: string, tab?: string) => void
 */
export default function CommandCenter({
  revisionQueue = [],
  subjectProgress: _subjectProgress = [],
  examProgress: _examProgress = null,
  activityLog = [],
  onNavigate,
}) {
  // ── Active exam — reused via the same lightweight pattern Dashboard.jsx
  // already uses for its own activeExam (syllabusService.getActiveExam()),
  // rather than introducing a new prop chain or context. ──────────────────
  const examId = useMemo(() => {
    try {
      return syllabusService.getActiveExam();
    } catch {
      return "upsc";
    }
  }, []);

  // ── Phase 37 Batch E.2: the Unified Study Plan is the sole source of
  // the mission decision. useStudyPlan already reuses useRevisionQueue +
  // useSyllabusSyncListener internally — no new sync mechanism is added
  // here, and the plan refreshes automatically through that existing
  // architecture. `topPriorityItem` (the raw hook value, before
  // adaptation) is also reused below to validate the "Add to Planner"
  // action — no second Study Plan read is introduced. ─────────────────────
  const { topPriorityItem, loading: planLoading } = useStudyPlan(examId);

  const mission = useMemo(
    () => _adaptPlanItemToMission(topPriorityItem),
    [topPriorityItem],
  );

  // ── Today Progress / Focus Meter — unrelated to the Study Plan,
  // unchanged from before this migration. ──────────────────────────────
  const todayProgress = useMemo(
    () => buildTodayProgress(activityLog),
    [activityLog],
  );

  const focusScore = useMemo(
    () => buildFocusScore(todayProgress, activityLog, revisionQueue.length),
    [todayProgress, activityLog, revisionQueue.length],
  );

  // ── Mission CTA handler (existing, unchanged) ─────────────────────────
  const handleMissionAction = (m) => {
    onNavigate?.(m.actionPath, m.actionTab);
  };

  // ── Phase 37 Batch I.3: "Add to Planner" — additive secondary action.
  // Never creates a Planner task directly. Writes only the minimal
  // prefill/provenance payload the Planner needs, then navigates to the
  // existing /planner route. Fails safely (no fatal UI error) if
  // sessionStorage is unavailable — navigation still proceeds, and
  // Planner simply shows its normal, un-prefilled flow in that case. ────
  const canAddToPlanner = !planLoading && !!topPriorityItem;

  const handleAddToPlanner = () => {
    if (!topPriorityItem) return;

    try {
      const priority = _mapUrgencyToPlannerPriority(
        topPriorityItem.urgencyLevel,
      );

      const payload = {
        title: topPriorityItem.title || FALLBACK_MISSION.title,
        subject: topPriorityItem.subjectLabel ?? "",
        priority,
        provenance: {
          source: "studyPlan",
          studyPlanRef: {
            type: topPriorityItem.type ?? null,
            examId: examId ?? null,
            subjectId: topPriorityItem.subjectId ?? null,
            // studyPlanEngine's PlanItem shape does not currently carry a
            // topicId — never invented here, always null.
            topicId: null,
          },
        },
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem(
        STUDY_PLAN_PLANNER_PREFILL_KEY,
        JSON.stringify(payload),
      );
    } catch {
      // sessionStorage unavailable or serialization failed — fail safely.
      // Navigation still proceeds below; Planner will simply open without
      // a prefill in that case.
    }

    onNavigate?.("/planner");
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
        <div className="sm:col-span-2 space-y-2">
          <MissionCard
            mission={mission}
            onAction={handleMissionAction}
            loading={planLoading}
          />
          {canAddToPlanner && (
            <div className="flex justify-end">
              <button
                onClick={handleAddToPlanner}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  borderColor: "rgba(124,111,255,0.30)",
                  color: "#7C6FFF",
                  background: "rgba(124,111,255,0.06)",
                }}
              >
                Add to Planner
              </button>
            </div>
          )}
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
