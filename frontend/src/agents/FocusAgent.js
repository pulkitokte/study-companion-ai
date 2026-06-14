// FIX: replaced `import { FOCUS_MODES } from '../context/FocusContext.jsx'`
// with import from the standalone data constants file.
// Agents must not depend on React context layer — doing so risks circular deps
// and breaks server-side / test-environment imports.
import { getFocusHistory, getFocusStats } from "../utils/focusStorage.js";
import { getFocusModeBreakdown } from "../lib/analyticsEngine.js";
import { FOCUS_MODES } from "../data/focusModes.js";

// ─── PATTERN ANALYSIS ─────────────────────────────────────────────
function analyzeFocusPatterns() {
  const history = getFocusHistory() ?? [];
  const breakdown = getFocusModeBreakdown();
  const stats = getFocusStats();

  if (history.length === 0) {
    return {
      hasData: false,
      avgSessionMins: 0,
      completionRate: 0,
      preferredMode: null,
      preferredHour: null,
      breakdown,
      stats,
    };
  }

  const avgSessionMins = Math.round(
    history.reduce((s, f) => s + (f.durationMinutes ?? 0), 0) / history.length,
  );

  const completed = history.filter((f) => f.completed !== false).length;
  const completionRate = Math.round((completed / history.length) * 100);

  // Most-used mode
  const preferredMode = breakdown.length
    ? [...breakdown].sort((a, b) => b.sessions - a.sessions)[0].mode
    : null;

  // Most common hour of day
  const hourCounts = {};
  history.forEach((f) => {
    try {
      const hour = new Date(f.date).getHours();
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    } catch {
      /* ignore bad dates */
    }
  });
  const preferredHour =
    Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    hasData: true,
    avgSessionMins,
    completionRate,
    preferredMode,
    preferredHour,
    breakdown,
    stats,
  };
}

// ─── IMPROVEMENT SUGGESTIONS ──────────────────────────────────────
function suggestImprovements() {
  const analysis = analyzeFocusPatterns();
  const tips = [];

  if (!analysis.hasData) {
    tips.push({
      title: "Try your first focus session",
      detail:
        "Start with a 25-minute Pomodoro to see how it feels — short sessions build the habit fast.",
      icon: "🍅",
      color: "#FF6B2B",
    });
    return tips;
  }

  if (analysis.avgSessionMins < 20) {
    tips.push({
      title: "Try longer sessions",
      detail: `Your average session is ${analysis.avgSessionMins} minutes. Gradually working up to 25–45 minutes can deepen focus.`,
      icon: "⏱️",
      color: "#00FFC8",
    });
  } else if (analysis.avgSessionMins > 60) {
    tips.push({
      title: "Consider shorter bursts",
      detail: `Sessions average ${analysis.avgSessionMins} minutes. Try Sprint mode (15 min) for high-intensity review between long sessions.`,
      icon: "⚡",
      color: "#FFB347",
    });
  }

  if (analysis.completionRate < 70) {
    tips.push({
      title: "Improve session completion",
      detail: `Only ${analysis.completionRate}% of sessions are completed. Try removing your phone or choosing a quieter time slot.`,
      icon: "🎯",
      color: "#FF6B6B",
    });
  } else if (analysis.completionRate >= 90) {
    tips.push({
      title: "Excellent consistency",
      detail: `${analysis.completionRate}% completion rate — your focus discipline is paying off.`,
      icon: "🏆",
      color: "#FFD700",
    });
  }

  if (analysis.preferredHour !== null) {
    const hour = parseInt(analysis.preferredHour);
    const label =
      hour < 12
        ? `${hour === 0 ? 12 : hour} AM`
        : `${hour === 12 ? 12 : hour - 12} PM`;
    tips.push({
      title: `Your peak hour: ${label}`,
      detail: `Most focus sessions happen around ${label}. Schedule your hardest topics during this window.`,
      icon: "🧠",
      color: "#7C6FFF",
    });
  }

  if (analysis.preferredMode) {
    tips.push({
      title: `${analysis.preferredMode} is your go-to`,
      detail: `You've gravitated toward ${analysis.preferredMode} mode. Try mixing in a different mode this week for variety.`,
      icon: "🔄",
      color: "#4FC3F7",
    });
  }

  return tips.slice(0, 4);
}

// ─── DISTRACTION ANALYSIS ─────────────────────────────────────────
function getDistractionAnalysis() {
  const history = getFocusHistory() ?? [];
  if (history.length === 0) return { riskLevel: "unknown", signals: [] };

  const incomplete = history.filter((f) => f.completed === false).length;
  const incompleteRate = Math.round((incomplete / history.length) * 100);

  const signals = [];
  if (incompleteRate > 30) {
    signals.push(
      `${incompleteRate}% of sessions ended early — possible distractions interrupting focus.`,
    );
  }
  if (history.length < 3) {
    signals.push("Limited data — log more sessions for deeper analysis.");
  }

  const riskLevel =
    incompleteRate > 40 ? "high" : incompleteRate > 15 ? "moderate" : "low";
  return { riskLevel, incompleteRate, signals };
}

// ─── RECOMMENDATIONS ──────────────────────────────────────────────
function getRecommendations() {
  const tips = suggestImprovements();
  return tips.map((t, i) => ({
    agent: "focus",
    title: t.title,
    description: t.detail,
    category: "focus",
    priority: 70 - i * 8,
    icon: t.icon,
    color: t.color,
    action: { label: "Open Focus Mode", path: "/focus" },
  }));
}

// ─── PUBLIC API ───────────────────────────────────────────────────
export default {
  analyzeFocusPatterns,
  suggestImprovements,
  getDistractionAnalysis,
  getRecommendations,
  getModes: () => FOCUS_MODES, // now reads from data layer, not context
};
