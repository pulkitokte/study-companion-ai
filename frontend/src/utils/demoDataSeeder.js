// Generates realistic demo data so the app looks fully lived-in for recruiters / demos

const QUIZ_CATS = [
  "polity",
  "history",
  "geography",
  "economy",
  "science",
  "environment",
  "current_affairs",
];
const FOCUS_MODES = ["pomodoro", "deepwork", "sprint"];
const SUBJS = ["Polity", "History", "Geography", "Economy", "Science & Tech"];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function isDemoMode() {
  return localStorage.getItem("studymind_demo") === "true";
}

export function seedDemoData() {
  // Profile
  localStorage.setItem("studymind_onboarded", "true");
  localStorage.setItem("studymind_demo", "true");
  localStorage.setItem(
    "studymind_profile",
    JSON.stringify({
      name: "Demo User",
      targetExam: "UPSC",
      dreamGoal: "IAS Officer",
      targetRank: "Rank 1-100",
      weakSubjects: ["Economy", "Environment"],
      studyStyle: "visual",
      sessionDuration: 45,
      burnoutLevel: 4,
      stressLevel: 5,
      preferredTime: "Morning",
      whyUpsc: "To serve the nation and drive meaningful policy change.",
      updatedAt: new Date().toISOString(),
    }),
  );

  // Quiz history — last 25 days
  const quizHistory = [];
  for (let i = 0; i < 35; i++) {
    const total = rand(5, 20);
    const correct = rand(Math.floor(total * 0.4), total);
    const accuracy = Math.round((correct / total) * 100);
    const cat = pick(QUIZ_CATS);
    const diff = pick(["easy", "medium", "hard"]);
    const xpMult = diff === "easy" ? 1 : diff === "medium" ? 1.5 : 2;
    quizHistory.push({
      id: `q-demo-${i}`,
      date: daysAgo(rand(0, 25)),
      category: cat,
      difficulty: diff,
      total,
      correct,
      wrong: total - correct,
      accuracy,
      totalXP: Math.round(correct * 50 * xpMult),
      maxStreak: rand(1, 6),
      durationSeconds: rand(120, 900),
    });
  }
  localStorage.setItem("studymind_quiz_history", JSON.stringify(quizHistory));

  // Focus history — last 20 days
  const focusHistory = [];
  for (let i = 0; i < 28; i++) {
    const mode = pick(FOCUS_MODES);
    const mins =
      mode === "deepwork"
        ? rand(60, 120)
        : mode === "pomodoro"
          ? rand(20, 30)
          : rand(12, 20);
    const xpPm = mode === "deepwork" ? 12 : mode === "pomodoro" ? 8 : 6;
    focusHistory.push({
      id: `f-demo-${i}`,
      date: daysAgo(rand(0, 20)),
      mode,
      durationMinutes: mins,
      subject: pick(SUBJS),
      goal: pick([
        "Complete NCERT chapter",
        "Revise notes",
        "Practice MCQs",
        "Read editorials",
      ]),
      xpEarned: Math.round(mins * xpPm),
      pomodoroCount: mode === "pomodoro" ? rand(1, 4) : 0,
      completed: true,
    });
  }
  localStorage.setItem("studymind_focus_history", JSON.stringify(focusHistory));

  // Planner tasks
  const tasks = [];
  const today = new Date().toISOString().slice(0, 10);
  SUBJS.forEach((subj, i) => {
    const hours = ["08:00", "10:00", "13:00", "15:00", "17:00"];
    const done = i < 3;
    tasks.push({
      id: `t-demo-${i}`,
      title: `Study ${subj} — Chapter Review`,
      subject: subj,
      date: today,
      startTime: hours[i] ?? "09:00",
      duration: 60,
      priority: i === 0 ? "high" : i < 3 ? "medium" : "low",
      xp: 100,
      done,
      notes: "",
      createdAt: daysAgo(1),
      completedAt: done ? daysAgo(0) : null,
    });
  });
  localStorage.setItem(
    "studymind_planner",
    JSON.stringify({ tasks, lastGenerated: today }),
  );

  // Achievements
  const achievedIds = [
    "first_quiz",
    "quiz_5",
    "accuracy_master",
    "streak_3",
    "first_focus",
    "focus_marathon",
    "xp_500",
    "streak_3",
    "profile_complete",
    "xp_2000",
  ];
  localStorage.setItem("studymind_achievements", JSON.stringify(achievedIds));

  // Daily missions
  const missionDate = today;
  localStorage.setItem(
    "studymind_missions",
    JSON.stringify({
      date: missionDate,
      missions: [
        {
          id: "quiz_10",
          label: "Answer 10 quiz questions",
          xp: 100,
          type: "quiz",
          done: true,
        },
        {
          id: "focus_25",
          label: "Complete a 25m focus session",
          xp: 150,
          type: "focus",
          done: true,
        },
        {
          id: "both",
          label: "Do both a quiz & focus today",
          xp: 250,
          type: "mixed",
          done: false,
        },
      ],
    }),
  );

  // AI memory
  localStorage.setItem(
    "studymind_ai_memory",
    JSON.stringify([
      {
        id: "m1",
        type: "goal",
        content: "I want to crack UPSC in my first attempt",
        importance: 5,
        modeId: "motivator",
        createdAt: daysAgo(10),
      },
      {
        id: "m2",
        type: "weakness",
        content: "I struggle with Economy and current affairs",
        importance: 4,
        modeId: "chill",
        createdAt: daysAgo(8),
      },
      {
        id: "m3",
        type: "habit",
        content: "I usually study in the morning after exercise",
        importance: 3,
        modeId: "strict",
        createdAt: daysAgo(5),
      },
      {
        id: "m4",
        type: "emotional",
        content: "I'm feeling anxious about the exam timeline",
        importance: 4,
        modeId: "chill",
        createdAt: daysAgo(3),
      },
    ]),
  );

  return true;
}

export function clearDemoData() {
  const keys = [
    "studymind_demo",
    "studymind_quiz_history",
    "studymind_focus_history",
    "studymind_planner",
    "studymind_achievements",
    "studymind_missions",
    "studymind_ai_memory",
    "studymind_chat_history",
  ];
  keys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
  localStorage.removeItem("studymind_onboarded");
  localStorage.removeItem("studymind_profile");
}
