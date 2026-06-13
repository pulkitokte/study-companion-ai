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

// ─── UNIFIED RECOMMENDATION GENERATION ───────────────────────────────
export function generateRecommendations({ persist = true, limit = 6 } = {}) {
  const stats = aggregateAll();

  const all = [
    ...StudyCoachAgent.getRecommendations(stats),
    ...PlannerAgent.getRecommendations(stats),
    ...FocusAgent.getRecommendations(stats),
    ...ProgressAgent.getRecommendations(stats),
  ];

  // Deduplicate by title, keep highest priority
  const byTitle = new Map();
  all.forEach((r) => {
    const existing = byTitle.get(r.title);
    if (!existing || r.priority > existing.priority) byTitle.set(r.title, r);
  });

  const sorted = [...byTitle.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);

  if (persist) {
    sorted.forEach((r) => logRecommendation(r));
  }

  return sorted;
}

// ─── STUDY PATH GENERATION ────────────────────────────────────────────
// A simple ordered sequence of next-best-actions across the ecosystem
export function generateStudyPath() {
  const stats = aggregateAll();
  const plan = PlannerAgent.getStudyPlan();
  const focus = FocusAgent.analyzeFocusPatterns();
  const coach = StudyCoachAgent.analyzeLearning(stats);

  const path = [];

  if (plan.overdue.length > 0) {
    path.push({
      step: 1,
      label: `Clear overdue task: "${plan.overdue[0].title}"`,
      path: "/planner",
      icon: "⏰",
    });
  }

  if (coach.weakSubjects.length > 0) {
    path.push({
      step: path.length + 1,
      label: `Quiz session: ${coach.weakSubjects[0].label}`,
      path: "/quiz",
      icon: coach.weakSubjects[0].emoji ?? "📘",
    });
  }

  if (!focus.hasData || focus.completionRate < 80) {
    path.push({
      step: path.length + 1,
      label: "Run a focused study session",
      path: "/focus",
      icon: "🍅",
    });
  }

  if (plan.dueToday.length > 0) {
    path.push({
      step: path.length + 1,
      label: `Complete: "${plan.dueToday[0].title}"`,
      path: "/planner",
      icon: "📅",
    });
  }

  if (path.length === 0) {
    path.push({
      step: 1,
      label: "Review your progress and set a new goal",
      path: "/progress",
      icon: "🎯",
    });
  }

  return path.slice(0, 4);
}

// ─── FEEDBACK PASSTHROUGH ─────────────────────────────────────────────
export function acceptRecommendation(id) {
  return markRecommendationFeedback(id, "accepted");
}

export function dismissRecommendation(id) {
  return markRecommendationFeedback(id, "dismissed");
}

export function completeRecommendation(id) {
  return markRecommendationFeedback(id, "completed");
}

export { getActiveRecommendations };

export default {
  generateRecommendations,
  generateStudyPath,
  acceptRecommendation,
  dismissRecommendation,
  completeRecommendation,
  getActiveRecommendations,
};
