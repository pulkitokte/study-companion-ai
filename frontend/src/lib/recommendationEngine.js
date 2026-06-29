import StudyCoachAgent from "../agents/StudyCoachAgent.js";
import PlannerAgent from "../agents/PlannerAgent.js";
import FocusAgent from "../agents/FocusAgent.js";
import ProgressAgent from "../agents/ProgressAgent.js";
import { aggregateAll } from "../utils/globalStats.js";
import {
  logRecommendation,
  getActiveRecommendations,
  markRecommendationFeedback,
} from "./agentMemory.js";

const MAX_RECS = 8;

// ─── CORE GENERATOR ───────────────────────────────────────────────────────────
function generateRecommendations() {
  const stats = aggregateAll();

  const all = [
    // Phase 31: Spaced revision recommendations — highest priority slot.
    // Overdue revisions (priority ~95) and due-today (priority ~88) must
    // surface above all other recommendations when present.
    ...safeCall(() => StudyCoachAgent.getSpacedRevisionRecommendations()),

    // Quiz / study coaching (priority 80–50)
    ...safeCall(() => StudyCoachAgent.getRecommendations(stats)),

    // Syllabus coverage awareness — Batch 9 (priority 83–60)
    ...safeCall(() => StudyCoachAgent.getSyllabusRecommendations()),

    // Planner-based nudges
    ...safeCall(() => PlannerAgent.getRecommendations()),

    // Focus pattern insights
    ...safeCall(() => FocusAgent.getRecommendations()),

    // Progress / rank milestones
    ...safeCall(() => ProgressAgent.getRecommendations(stats)),
  ];

  // Deduplicate by title (same recommendation from multiple agents)
  const seen = new Set();
  const deduped = all.filter((rec) => {
    const key = rec.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped
    .sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50))
    .slice(0, MAX_RECS);
}

// ─── FILTERED (respects dismiss history) ──────────────────────────────────────
function getRankedRecommendations() {
  try {
    const active = getActiveRecommendations() ?? [];
    const dismissed = new Set(
      active.filter((r) => r.status === "dismissed").map((r) => r.title),
    );
    return generateRecommendations().filter((r) => !dismissed.has(r.title));
  } catch {
    return generateRecommendations();
  }
}

// ─── FEEDBACK ACTIONS ─────────────────────────────────────────────────────────
function acceptRecommendation(rec) {
  try {
    logRecommendation({
      ...rec,
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    });
  } catch {}
}

function dismissRecommendation(rec) {
  try {
    markRecommendationFeedback(rec, "dismissed");
  } catch {}
}

function completeRecommendation(rec) {
  try {
    markRecommendationFeedback(rec, "completed");
  } catch {}
}

// ─── SAFE CALL WRAPPER ────────────────────────────────────────────────────────
// Prevents one broken agent from crashing the entire recommendation feed.
function safeCall(fn) {
  try {
    const result = fn();
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

export {
  generateRecommendations,
  getRankedRecommendations,
  acceptRecommendation,
  dismissRecommendation,
  completeRecommendation,
  getActiveRecommendations, // re-exported so AgentContext can import from one place
};

export default {
  generateRecommendations,
  getRankedRecommendations,
  acceptRecommendation,
  dismissRecommendation,
  completeRecommendation,
  getActiveRecommendations, // mirrors named export
};
