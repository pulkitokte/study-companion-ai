// Planner ↔ Syllabus sync utility.
// Call this whenever a planner task is toggled to done:true.
// Silently skips every non-syllabus task — zero impact on normal planner flow.
// Idempotent: syllabusService.markComplete returns 0 XP if topic is already
// completed, so calling this more than once never produces duplicate XP.

import syllabusService from "../services/syllabusService.js";

/**
 * @param {object} task - The planner task in its NEW state (after toggle).
 *                        task.done must already be true when passed here.
 * @returns {object|null} Result from syllabusService.markComplete, or null.
 */
export function syncTaskCompletionToSyllabus(task) {
  // Guard: only process tasks that are now done
  if (!task?.done) return null;

  // Guard: only process syllabus-sourced tasks
  if (task.source !== "syllabus") return null;

  // Guard: syllabusRef must have all three required fields
  const ref = task.syllabusRef;
  if (
    !ref ||
    typeof ref.exam !== "string" ||
    typeof ref.subject !== "string" ||
    typeof ref.topic !== "string"
  )
    return null;

  try {
    // markComplete is idempotent — safe to call even if already completed.
    // It internally calls notifyStatsUpdate() when XP > 0, so the Dashboard
    // widget and global XP counter update automatically.
    return syllabusService.markComplete(ref.exam, ref.subject, ref.topic);
  } catch {
    // Never crash the planner on sync failure
    return null;
  }
}
