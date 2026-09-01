import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import StudyCalendar from "../components/planner/StudyCalendar.jsx";
import ScheduleBoard from "../components/planner/ScheduleBoard.jsx";
import { getProfile } from "../utils/userProfile.js";
import { getPlanner, generateDefaultTasks } from "../utils/plannerStorage.js";
import { syncTaskCompletionToSyllabus } from "../utils/plannerSyllabusSync.js";

// Phase 37 Batch I.3: must match the key CommandCenter.jsx writes to.
const STUDY_PLAN_PREFILL_KEY = "studymind_study_plan_planner_prefill";
// Small expiry guard so a stale, unconsumed handoff (e.g. the user
// navigated away and returned much later) never silently resurfaces.
const PREFILL_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

/**
 * _readPendingStudyPlanPrefill
 *
 * Defensive, single-consumption reader for the Study Plan → Planner
 * handoff. The sessionStorage key is ALWAYS removed as soon as it is
 * read — whether the payload turns out to be valid, expired, or
 * malformed — so a page refresh, or any later unrelated visit, can never
 * re-trigger or duplicate the prefill.
 *
 * Returns null on any missing/expired/malformed data. Never throws.
 */
function _readPendingStudyPlanPrefill() {
  try {
    const raw = sessionStorage.getItem(STUDY_PLAN_PREFILL_KEY);
    if (!raw) return null;

    // Remove immediately — this is a one-shot handoff, not a persistent
    // record. "Consumed" happens here, at read time, regardless of the
    // outcome below.
    try {
      sessionStorage.removeItem(STUDY_PLAN_PREFILL_KEY);
    } catch {
      /* ignore */
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const createdAtMs = new Date(parsed.createdAt).getTime();
    if (isNaN(createdAtMs) || Date.now() - createdAtMs > PREFILL_MAX_AGE_MS) {
      return null;
    }

    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      subject: typeof parsed.subject === "string" ? parsed.subject : "",
      priority: ["high", "medium", "low"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      provenance:
        parsed.provenance && typeof parsed.provenance === "object"
          ? parsed.provenance
          : null,
    };
  } catch {
    // Malformed JSON or any other failure — ensure the key is gone and
    // return null so Planner simply behaves as if no handoff existed.
    try {
      sessionStorage.removeItem(STUDY_PLAN_PREFILL_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export default function Planner() {
  const today = new Date().toISOString().slice(0, 10);
  const [selDate, setSelDate] = useState(today);

  // Phase 37 Batch I.3: read the pending Study Plan handoff exactly once,
  // on mount. This does NOT create a Planner task — it only makes the
  // prefill values available to ScheduleBoard's existing task-creation
  // flow, which still requires explicit user confirmation.
  const [pendingPrefill, setPendingPrefill] = useState(() =>
    _readPendingStudyPlanPrefill(),
  );

  // Generate default tasks on first visit
  const planner = getPlanner();
  if (planner.tasks.length === 0 && planner.lastGenerated !== today) {
    generateDefaultTasks(getProfile() ?? {});
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarDays size={20} className="text-[#7C6FFF]" />
        <div>
          <h2 className="text-[22px] font-black text-white">Study Planner</h2>
          <p className="text-[11px] text-white/30 mt-0.5">
            Organise your daily study sessions
          </p>
        </div>
      </div>

      {/* Two-column layout on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
        <StudyCalendar selectedDate={selDate} onDateSelect={setSelDate} />
        <ScheduleBoard
          dateStr={selDate}
          pendingPrefill={pendingPrefill}
          onPrefillConsumed={() => setPendingPrefill(null)}
        />
      </div>
    </motion.div>
  );
}
