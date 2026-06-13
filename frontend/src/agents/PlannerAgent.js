import { getPlanner } from "../utils/plannerStorage.js";
import { aggregateAll } from "../utils/globalStats.js";

const PRIORITY_WEIGHTS = { high: 3, medium: 2, low: 1 };

// ─── TASK PRIORITIZATION ────────────────────────────────────────────
function prioritizeTasks() {
  const { tasks = [] } = getPlanner();
  const pending = tasks.filter((t) => !t.done);
  const now = new Date();

  return pending
    .map((t) => {
      let score = PRIORITY_WEIGHTS[t.priority] ?? 2;

      // Boost score for tasks due today or overdue
      if (t.date) {
        const due = new Date(t.date);
        const diffDays = Math.floor((due - now) / 86400000);
        if (diffDays < 0)
          score += 5; // overdue
        else if (diffDays === 0)
          score += 3; // due today
        else if (diffDays === 1) score += 1; // due tomorrow
      }

      return { ...t, urgencyScore: score };
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);
}

// ─── SCHEDULE RECOMMENDATIONS ────────────────────────────────────────
function suggestSchedule() {
  const prioritized = prioritizeTasks();
  const stats = aggregateAll();

  const blocks = [];
  const slots = ["Morning (9-11 AM)", "Afternoon (2-4 PM)", "Evening (7-9 PM)"];

  prioritized.slice(0, 3).forEach((task, i) => {
    blocks.push({
      slot: slots[i % slots.length],
      task: task.title,
      subject: task.subject ?? "General",
      reason:
        task.urgencyScore >= 5
          ? "Overdue — handle first"
          : task.urgencyScore >= 3
            ? "Due soon"
            : "High priority",
      xp: task.xp ?? 20,
    });
  });

  if (blocks.length === 0) {
    blocks.push({
      slot: slots[0],
      task: "Add a planner task to get scheduling suggestions",
      subject: "Planning",
      reason: "Your planner is currently empty",
      xp: 0,
    });
  }

  return {
    blocks,
    dailyXPGoal: stats.dailyXPGoal ?? 500,
    pendingCount: prioritized.length,
  };
}

// ─── STUDY PLANNING ──────────────────────────────────────────────────
function getStudyPlan() {
  const prioritized = prioritizeTasks();
  const overdue = prioritized.filter((t) => t.urgencyScore >= 5);
  const dueToday = prioritized.filter(
    (t) => t.urgencyScore >= 3 && t.urgencyScore < 5,
  );
  const upcoming = prioritized.filter((t) => t.urgencyScore < 3);

  return {
    overdue,
    dueToday,
    upcoming,
    total: prioritized.length,
    completionRate: (() => {
      const { tasks = [] } = getPlanner();
      if (tasks.length === 0) return 0;
      return Math.round(
        (tasks.filter((t) => t.done).length / tasks.length) * 100,
      );
    })(),
  };
}

// ─── RECOMMENDATIONS (for recommendationEngine) ─────────────────────
function getRecommendations() {
  const plan = getStudyPlan();
  const recs = [];

  if (plan.overdue.length > 0) {
    recs.push({
      agent: "planner",
      title: `${plan.overdue.length} overdue task${plan.overdue.length > 1 ? "s" : ""}`,
      description: `"${plan.overdue[0].title}" is overdue. Tackle it first to clear the backlog.`,
      category: "planning",
      priority: 95,
      icon: "⏰",
      color: "#FF6B6B",
      action: { label: "Open Planner", path: "/planner" },
    });
  }

  if (plan.dueToday.length > 0) {
    recs.push({
      agent: "planner",
      title: `${plan.dueToday.length} task${plan.dueToday.length > 1 ? "s" : ""} due today`,
      description: `"${plan.dueToday[0].title}" needs attention today.`,
      category: "planning",
      priority: 75,
      icon: "📅",
      color: "#FFB347",
      action: { label: "Open Planner", path: "/planner" },
    });
  }

  if (plan.total === 0) {
    recs.push({
      agent: "planner",
      title: "Build your study plan",
      description:
        "Your planner is empty. Add a few tasks to get personalized scheduling.",
      category: "planning",
      priority: 50,
      icon: "🗂️",
      color: "#7C6FFF",
      action: { label: "Open Planner", path: "/planner" },
    });
  }

  if (plan.completionRate >= 80 && plan.total > 0) {
    recs.push({
      agent: "planner",
      title: "Almost done!",
      description: `${plan.completionRate}% of your planned tasks are complete. Finish strong!`,
      category: "planning",
      priority: 40,
      icon: "✅",
      color: "#00FFC8",
      action: { label: "Open Planner", path: "/planner" },
    });
  }

  return recs;
}

export default {
  prioritizeTasks,
  suggestSchedule,
  getStudyPlan,
  getRecommendations,
};
