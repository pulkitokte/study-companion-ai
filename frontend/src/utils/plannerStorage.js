const KEY = "studymind_planner";

const SUBJECTS = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Science & Tech",
  "Environment",
  "Current Affairs",
  "CSAT",
  "Maths",
  "English",
];

export function getPlanner() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { tasks: [], lastGenerated: null };
  } catch {
    return { tasks: [], lastGenerated: null };
  }
}

function savePlanner(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getTasks(dateStr) {
  const { tasks } = getPlanner();
  if (!dateStr) return tasks;
  return tasks.filter((t) => t.date === dateStr);
}

export function addTask(task) {
  const data = getPlanner();
  const entry = {
    id: `task-${Date.now()}`,
    title: task.title ?? "Study Session",
    subject: task.subject ?? "",
    date: task.date ?? new Date().toISOString().slice(0, 10),
    startTime: task.startTime ?? "09:00",
    duration: task.duration ?? 60,
    priority: task.priority ?? "medium",
    xp: task.xp ?? 50,
    done: false,
    notes: task.notes ?? "",
    createdAt: new Date().toISOString(),
  };
  data.tasks = [entry, ...data.tasks];
  savePlanner(data);
  return entry;
}

export function updateTask(id, updates) {
  const data = getPlanner();
  data.tasks = data.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
  savePlanner(data);
}

export function deleteTask(id) {
  const data = getPlanner();
  data.tasks = data.tasks.filter((t) => t.id !== id);
  savePlanner(data);
}

export function toggleTask(id) {
  const data = getPlanner();
  data.tasks = data.tasks.map((t) =>
    t.id === id
      ? {
          ...t,
          done: !t.done,
          completedAt: !t.done ? new Date().toISOString() : null,
        }
      : t,
  );
  savePlanner(data);
  return data.tasks.find((t) => t.id === id);
}

export function getMonthActivity(year, month) {
  const { tasks } = getPlanner();
  const map = {};
  tasks.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = t.date;
      if (!map[key]) map[key] = { total: 0, done: 0, mins: 0 };
      map[key].total++;
      if (t.done) map[key].done++;
      map[key].mins += t.duration ?? 60;
    }
  });
  return map;
}

export function generateDefaultTasks(profile) {
  const subjects =
    profile?.weakSubjects?.length > 0
      ? profile.weakSubjects.slice(0, 3)
      : SUBJECTS.slice(0, 3);

  const today = new Date().toISOString().slice(0, 10);
  const tasks = [];

  subjects.forEach((subj, i) => {
    const hours = ["09:00", "13:00", "17:00"];
    tasks.push({
      id: `default-${Date.now()}-${i}`,
      title: `Study ${subj}`,
      subject: subj,
      date: today,
      startTime: hours[i] ?? "09:00",
      duration: 60,
      priority: "high",
      xp: 100,
      done: false,
      notes: "",
      createdAt: new Date().toISOString(),
    });
  });

  const data = getPlanner();
  data.tasks = [...tasks, ...data.tasks];
  data.lastGenerated = today;
  savePlanner(data);
  return tasks;
}

export const PRIORITIES = {
  high: { label: "High", color: "#FF6B2B", bg: "rgba(255,107,43,0.1)" },
  medium: { label: "Medium", color: "#FFB347", bg: "rgba(255,179,71,0.1)" },
  low: { label: "Low", color: "#7C6FFF", bg: "rgba(124,111,255,0.1)" },
};
