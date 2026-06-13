import { PERSONALITY_MODES } from "../utils/personalityModes.js";

// ─── AGENT ROLE DESCRIPTIONS ──────────────────────────────────────
const AGENT_ROLES = {
  coach: `You are the StudyMind Coach Agent — a personalized AI study mentor. You analyze a
student's overall learning patterns across quizzes, focus sessions, and planner activity,
and provide warm, specific, actionable guidance. Always reference real numbers from the
student's data when possible. Keep responses concise (2-4 sentences) unless asked to elaborate.`,

  planner: `You are the StudyMind Planner Agent — a scheduling specialist. You help the student
prioritize tasks, balance subjects, and design realistic daily/weekly study schedules based on
their current workload, deadlines, and energy patterns. Be practical and time-aware.`,

  focus: `You are the StudyMind Focus Agent — a productivity coach specializing in deep work,
distraction management, and Pomodoro/Deep Work/Sprint optimization. Analyze the student's focus
session history and suggest concrete adjustments to session length, timing, or environment.`,

  progress: `You are the StudyMind Progress Agent — a growth analyst. You track XP trends, level
progression, achievement completion, and forecast future growth. Celebrate wins specifically and
frame setbacks as opportunities with a clear next step.`,
};

// ─── CONTEXT SUMMARIZER ───────────────────────────────────────────
function summarizeContext(stats = {}, context = {}) {
  const lines = [];
  if (stats.totalXP !== undefined) lines.push(`Total XP: ${stats.totalXP}`);
  if (stats.level !== undefined) lines.push(`Level: ${stats.level}`);
  if (stats.streak !== undefined)
    lines.push(`Current streak: ${stats.streak} days`);
  if (stats.avgQuizAcc !== undefined)
    lines.push(`Quiz accuracy: ${stats.avgQuizAcc}%`);
  if (stats.totalFocusMins !== undefined)
    lines.push(`Total focus time: ${stats.totalFocusMins} minutes`);
  if (stats.rank?.label) lines.push(`Rank: ${stats.rank.label}`);
  if (context.weakSubjects?.length)
    lines.push(`Weak subjects: ${context.weakSubjects.join(", ")}`);
  if (context.strongSubjects?.length)
    lines.push(`Strong subjects: ${context.strongSubjects.join(", ")}`);
  if (context.targetExam) lines.push(`Target exam: ${context.targetExam}`);
  if (context.pendingTasks !== undefined)
    lines.push(`Pending planner tasks: ${context.pendingTasks}`);
  return lines.join("\n");
}

// ─── BUILD AGENT SYSTEM PROMPT ─────────────────────────────────────
export function buildAgentSystemPrompt(
  agentType,
  { personalityId = "mentor", stats = {}, context = {} } = {},
) {
  const role = AGENT_ROLES[agentType] ?? AGENT_ROLES.coach;
  const personality =
    PERSONALITY_MODES?.[personalityId] ?? PERSONALITY_MODES?.mentor ?? null;

  const personalityNote = personality
    ? `Adopt this tone: ${personality.label ?? personalityId} — ${personality.description ?? personality.tagline ?? ""}`
    : "";

  const contextBlock = summarizeContext(stats, context);

  return [
    role,
    personalityNote,
    contextBlock ? `\nCurrent student data:\n${contextBlock}` : "",
    `\nRespond directly to the student in second person ("you"). Be encouraging but honest.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─── BUILD USER-FACING REQUEST PROMPT ──────────────────────────────
export function buildAgentUserPrompt(
  agentType,
  question,
  { stats = {}, context = {} } = {},
) {
  const contextBlock = summarizeContext(stats, context);
  const intro =
    {
      coach: "Based on my study data, give me personalized guidance.",
      planner: "Help me plan and prioritize my study schedule.",
      focus: "Help me improve my focus and productivity.",
      progress: "Analyze my progress and growth trajectory.",
    }[agentType] ?? "Help me with my studies.";

  return [
    question?.trim() || intro,
    contextBlock
      ? `\n\n(My current stats: ${contextBlock.replace(/\n/g, " · ")})`
      : "",
  ].join("");
}

export default { buildAgentSystemPrompt, buildAgentUserPrompt };
