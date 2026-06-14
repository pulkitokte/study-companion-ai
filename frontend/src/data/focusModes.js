// Single source of truth for FOCUS_MODES.
// Previously leaked into context/FocusContext.jsx — now extracted so agents,
// services, and contexts all import from here with no React dependency.
// If FocusContext.jsx exports its own FOCUS_MODES, replace it with:
//   export { FOCUS_MODES, DEFAULT_MODE_ID } from '../data/focusModes.js'

export const FOCUS_MODES = [
  {
    id: "pomodoro",
    label: "Pomodoro",
    emoji: "🍅",
    color: "#FF6B2B",
    description: "25-minute focused bursts with short breaks",
    workMinutes: 25,
    breakMinutes: 5,
    longBreak: 15,
    cycles: 4,
    xpPerMinute: 3,
  },
  {
    id: "deepwork",
    label: "Deep Work",
    emoji: "🧠",
    color: "#7C6FFF",
    description: "Extended 90-minute deep-flow state sessions",
    workMinutes: 90,
    breakMinutes: 15,
    longBreak: 20,
    cycles: 2,
    xpPerMinute: 5,
  },
  {
    id: "sprint",
    label: "Sprint",
    emoji: "⚡",
    color: "#00FFC8",
    description: "Rapid 15-minute high-intensity review bursts",
    workMinutes: 15,
    breakMinutes: 3,
    longBreak: 5,
    cycles: 6,
    xpPerMinute: 4,
  },
];

export const DEFAULT_MODE_ID = "pomodoro";

// Lookup helpers
export function getModeById(id) {
  return FOCUS_MODES.find((m) => m.id === id) ?? FOCUS_MODES[0];
}

export function getModeColor(id) {
  return getModeById(id)?.color ?? "#7C6FFF";
}

export function getModeEmoji(id) {
  return getModeById(id)?.emoji ?? "⏱️";
}

export default FOCUS_MODES;
