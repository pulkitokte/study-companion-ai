import {
  getAllMemories,
  getTopMemories,
  getConversationHistory,
} from "./aiMemory.js";
import { PERSONALITY_MODES } from "./personalityModes.js";

// ─── PROFILE LOADER ────────────────────────────────────────────────
function loadProfile() {
  try {
    const raw = localStorage.getItem("studymind_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── PROGRESS LOADER ───────────────────────────────────────────────
function loadProgressSnapshot() {
  try {
    // Lightweight inline calculation to avoid circular imports
    const qRaw = localStorage.getItem("studymind_quiz_history");
    const fRaw = localStorage.getItem("studymind_focus_history");
    const quizH = qRaw ? JSON.parse(qRaw) : [];
    const focusH = fRaw ? JSON.parse(fRaw) : [];

    const quizXP = quizH.reduce((s, q) => s + (q.totalXP ?? 0), 0);
    const focusXP = focusH.reduce((s, f) => s + (f.xpEarned ?? 0), 0);
    const totalXP = quizXP + focusXP;
    const level = Math.floor(totalXP / 500) + 1;

    const today = new Date().toISOString().slice(0, 10);
    const allDays = new Set(
      [
        ...quizH.map((q) => q.date?.slice(0, 10)),
        ...focusH.map((f) => f.date?.slice(0, 10)),
      ].filter(Boolean),
    );
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (allDays.has(d.toISOString().slice(0, 10))) streak++;
      else break;
    }

    const avgAcc = quizH.length
      ? Math.round(
          quizH.reduce((s, q) => s + (q.accuracy ?? 0), 0) / quizH.length,
        )
      : 0;

    const recentQuiz = quizH
      .slice(0, 3)
      .map((q) => `${q.category ?? "quiz"} (${q.accuracy ?? 0}%)`)
      .join(", ");
    const recentFocus = focusH
      .slice(0, 2)
      .map((f) => `${f.mode ?? "focus"} ${f.durationMinutes ?? 0}m`)
      .join(", ");

    return {
      totalXP,
      level,
      streak,
      totalQuizzes: quizH.length,
      totalFocusSessions: focusH.length,
      avgAccuracy: avgAcc,
      recentQuiz: recentQuiz || "None yet",
      recentFocus: recentFocus || "None yet",
    };
  } catch {
    return null;
  }
}

// ─── SYSTEM PROMPT BUILDER ─────────────────────────────────────────
// Assembles the layered prompt injected before every user message.
export function buildSystemPrompt(modeId) {
  const mode = PERSONALITY_MODES[modeId] ?? PERSONALITY_MODES.motivator;
  const profile = loadProfile();
  const progress = loadProgressSnapshot();
  const memories = getTopMemories(6);

  const parts = [];

  // LAYER 1 — Identity
  parts.push(`You are StudyMind AI, a highly intelligent, emotionally aware study companion for Indian competitive exam aspirants (UPSC, SSC, Banking, Railway, Insurance).
You are NOT a generic chatbot. You are a dedicated academic partner who knows the student personally.
Always be specific, actionable, and relevant to Indian government exams.
Never give generic advice. Always tailor to the student's context.`);

  // LAYER 2 — Student Profile
  if (profile) {
    parts.push(`
STUDENT PROFILE:
- Name: ${profile.name || "Scholar"}
- Target Exam: ${profile.targetExam || "Government Exam"}
- Dream Goal: ${profile.dreamGoal || "Not set"}
- Target Rank/Post: ${profile.targetRank || "Not set"}
- Weak Subjects: ${Array.isArray(profile.weakSubjects) ? profile.weakSubjects.join(", ") : "Not specified"}
- Study Style: ${profile.studyStyle || "Not set"}
- Session Duration: ${profile.sessionDuration || 45} minutes
- Burnout Level: ${profile.burnoutLevel || 5}/10
- Stress Level: ${profile.stressLevel || 5}/10
- Preferred Study Time: ${profile.preferredTime || "Flexible"}
- Why they want this: ${profile.whyUpsc ? `"${profile.whyUpsc.slice(0, 150)}"` : "Not shared"}
`);
  } else {
    parts.push(
      `\nSTUDENT PROFILE: New user — onboarding not yet completed. Encourage them to set up their profile.`,
    );
  }

  // LAYER 3 — Progress Snapshot
  if (progress) {
    parts.push(`
CURRENT PROGRESS:
- Level: ${progress.level} · Total XP: ${progress.totalXP.toLocaleString()}
- Daily Streak: ${progress.streak} days
- Quizzes Completed: ${progress.totalQuizzes} · Avg Accuracy: ${progress.avgAccuracy}%
- Focus Sessions: ${progress.totalFocusSessions}
- Recent Quiz Activity: ${progress.recentQuiz}
- Recent Focus Activity: ${progress.recentFocus}
`);
  }

  // LAYER 4 — AI Memory
  if (memories.length > 0) {
    const memoryLines = memories
      .map((m) => `- [${m.type}] ${m.content}`)
      .join("\n");
    parts.push(`
THINGS YOU REMEMBER ABOUT THIS STUDENT:
${memoryLines}
Use this context naturally — don't list it back robotically.`);
  }

  // LAYER 5 — Mode personality
  parts.push(`
CURRENT MODE — ${mode.name.toUpperCase()}:
${mode.systemPrompt}`);

  // LAYER 6 — Response rules
  parts.push(`
RESPONSE RULES:
- Always address the student by name if known.
- Never mention that you are built on any specific AI model.
- Do not say "As an AI..." or "I don't have feelings..."
- If asked about your identity, say you are StudyMind AI.
- Keep responses focused and relevant to exam preparation.
- If the student seems to be struggling emotionally, acknowledge it before jumping to advice.`);

  return parts.join("\n");
}

// ─── FULL MESSAGE ARRAY BUILDER ────────────────────────────────────
// Returns the messages array to send to Gemini API.
export function buildMessages(modeId, conversationHistory, newUserMessage) {
  // Gemini uses 'user' and 'model' roles
  const history = Array.isArray(conversationHistory) ? conversationHistory : [];

  // Convert stored messages to Gemini format
  const converted = history
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content ?? "" }],
    }))
    .filter((m) => m.parts[0].text);

  // Add the new user message
  converted.push({
    role: "user",
    parts: [{ text: newUserMessage }],
  });

  return converted;
}

// ─── SUGGESTED PROMPTS ─────────────────────────────────────────────
export const SUGGESTED_PROMPTS = {
  motivator: [
    "I'm feeling lazy today. Push me hard.",
    "I have 6 months left. What should I do?",
    "I keep procrastinating. Fix me.",
    "Give me a battle cry for today.",
  ],
  chill: [
    "I'm really burnt out. What do I do?",
    "Can we talk about my prep strategy?",
    "I'm anxious about the exam. Help me.",
    "What's a light topic I can cover today?",
  ],
  strict: [
    "Review my study schedule strictly.",
    "I've been inconsistent. Hold me accountable.",
    "Give me a strict 7-day recovery plan.",
    "What should I have finished this week?",
  ],
  roast: [
    "Roast my study habits honestly.",
    "I haven't studied in 3 days.",
    "I keep choosing YouTube over books.",
    "Make me feel bad enough to actually study.",
  ],
  interviewer: [
    "Start my UPSC mock interview.",
    "Ask me about current governance issues.",
    "Test me on the Constitution.",
    "Give me a tough ethical dilemma.",
  ],
};
