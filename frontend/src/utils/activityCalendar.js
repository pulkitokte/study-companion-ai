// Provides getLast30Days for ProfileActivity heatmap.
//
// STATUS: This file was created because progressStorage.js (built in Phase 2–4)
// cannot be safely audited from transcript — its source is not visible.
//
// ACTION REQUIRED (one-time, choose one):
//   A) Verify progressStorage.js already exports getLast30Days.
//      If it does: delete this file and update ProfileActivity.jsx import back to
//      `from '../../utils/progressStorage.js'`
//   B) If getLast30Days is NOT in progressStorage.js: keep this file.
//      ProfileActivity.jsx has been updated to import from here.

import { getQuizHistory } from "./quizStorage.js";
import { getFocusHistory } from "./focusStorage.js";

/**
 * Returns a 30-entry array covering the last 30 calendar days (oldest first).
 * Each entry: { date: 'YYYY-MM-DD', hasQuiz: bool, hasFocus: bool, active: bool }
 */
export function getLast30Days() {
  const qH = getQuizHistory() ?? [];
  const fH = getFocusHistory() ?? [];

  const quizDays = new Set(qH.map((q) => q.date?.slice(0, 10)).filter(Boolean));
  const focusDays = new Set(
    fH.map((f) => f.date?.slice(0, 10)).filter(Boolean),
  );

  const result = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const hasQuiz = quizDays.has(dateStr);
    const hasFocus = focusDays.has(dateStr);
    result.push({
      date: dateStr,
      hasQuiz,
      hasFocus,
      active: hasQuiz || hasFocus,
    });
  }

  return result;
}
