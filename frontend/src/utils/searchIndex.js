import { getQuizHistory } from "./quizStorage.js";
import { getFocusHistory } from "./focusStorage.js";
import { getPlanner } from "./plannerStorage.js";
import { CATEGORIES } from "../data/mockQuizData.js";

// ─── ROUTE INDEX ──────────────────────────────────────────────────
const ROUTES = [
  {
    type: "route",
    label: "Dashboard",
    desc: "Mission Control & daily stats",
    path: "/dashboard",
    icon: "🎯",
    keywords: ["home", "dashboard", "stats", "xp"],
  },
  {
    type: "route",
    label: "Chat Companion",
    desc: "AI study partner (5 modes)",
    path: "/chat",
    icon: "🤖",
    keywords: ["chat", "ai", "gemini", "companion"],
  },
  {
    type: "route",
    label: "Quiz Arena",
    desc: "Test knowledge across 8 subjects",
    path: "/quiz",
    icon: "⚔️",
    keywords: ["quiz", "test", "mcq", "questions"],
  },
  {
    type: "route",
    label: "Focus Mode",
    desc: "Pomodoro & deep work sessions",
    path: "/focus",
    icon: "⏱️",
    keywords: ["focus", "timer", "pomodoro", "study"],
  },
  {
    type: "route",
    label: "Progress",
    desc: "XP, rank, achievements, missions",
    path: "/progress",
    icon: "📊",
    keywords: ["progress", "xp", "rank", "level"],
  },
  {
    type: "route",
    label: "Planner",
    desc: "Daily study scheduler",
    path: "/planner",
    icon: "📅",
    keywords: ["planner", "tasks", "schedule"],
  },
  {
    type: "route",
    label: "Settings",
    desc: "Profile, theme & data management",
    path: "/settings",
    icon: "⚙️",
    keywords: ["settings", "profile", "theme"],
  },
  {
    type: "route",
    label: "Showcase",
    desc: "Portfolio presentation",
    path: "/showcase",
    icon: "✨",
    keywords: ["showcase", "portfolio", "demo"],
  },
];

// ─── QUIZ CATEGORIES ─────────────────────────────────────────────
const QUIZ_ITEMS = (CATEGORIES ?? []).map((cat) => ({
  type: "quiz_category",
  label: cat.label,
  desc: `Quiz · ${cat.label}`,
  path: "/quiz",
  icon: cat.emoji,
  keywords: [cat.label.toLowerCase(), "quiz", cat.id],
  meta: { category: cat.id },
}));

// ─── ACHIEVEMENTS ────────────────────────────────────────────────
const ACHIEVEMENT_ITEMS = (() => {
  try {
    const raw = localStorage.getItem("studymind_achievements");
    const ids = raw ? JSON.parse(raw) : [];
    return ids.slice(0, 10).map((id) => ({
      type: "achievement",
      label: id.replace(/_/g, " "),
      desc: "Achievement unlocked",
      path: "/progress",
      icon: "🏆",
      keywords: [id, "achievement", "trophy"],
    }));
  } catch {
    return [];
  }
})();

// ─── PLANNER TASKS ────────────────────────────────────────────────
function getPlannerItems() {
  try {
    const { tasks = [] } = getPlanner();
    return tasks.slice(0, 20).map((t) => ({
      type: "task",
      label: t.title,
      desc: `Task · ${t.subject || "Planner"} · ${t.done ? "Done" : "Pending"}`,
      path: "/planner",
      icon: t.done ? "✅" : "📋",
      keywords: [
        t.title.toLowerCase(),
        t.subject?.toLowerCase() ?? "",
        "task",
        "planner",
      ],
      meta: { taskId: t.id },
    }));
  } catch {
    return [];
  }
}

// ─── RECENT ACTIVITY ─────────────────────────────────────────────
function getActivityItems() {
  const items = [];
  try {
    const qH = (getQuizHistory() ?? []).slice(0, 5);
    qH.forEach((q) =>
      items.push({
        type: "activity",
        label: `Quiz · ${q.category ?? "Unknown"} · ${q.accuracy ?? 0}%`,
        desc: `Completed ${new Date(q.date).toLocaleDateString()}`,
        path: "/quiz",
        icon: "⚔️",
        keywords: ["quiz", q.category ?? "", "history"],
      }),
    );
    const fH = (getFocusHistory() ?? []).slice(0, 5);
    fH.forEach((f) =>
      items.push({
        type: "activity",
        label: `Focus · ${f.mode ?? "session"} · ${f.durationMinutes ?? 0}m`,
        desc: `Session ${new Date(f.date).toLocaleDateString()}`,
        path: "/focus",
        icon: "⏱️",
        keywords: ["focus", f.mode ?? "", "session"],
      }),
    );
  } catch {
    /* ignore */
  }
  return items;
}

// ─── MAIN INDEX BUILDER ──────────────────────────────────────────
export function buildSearchIndex() {
  return [
    ...ROUTES,
    ...QUIZ_ITEMS,
    ...ACHIEVEMENT_ITEMS,
    ...getPlannerItems(),
    ...getActivityItems(),
  ];
}

// ─── FUZZY SEARCH ────────────────────────────────────────────────
export function searchIndex(query, index) {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const scored = index
    .map((item) => {
      const labelHit = item.label.toLowerCase().includes(q) ? 3 : 0;
      const descHit = item.desc.toLowerCase().includes(q) ? 1 : 0;
      const keywordHit = item.keywords?.some((k) => k.includes(q)) ? 2 : 0;
      const score = labelHit + descHit + keywordHit;
      return { ...item, score };
    })
    .filter((i) => i.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 8);
}
