/**
 * heatmapUtils.js
 *
 * Pure utility functions for the Activity Heatmap Calendar.
 *
 * Constraints:
 *   - No React, no JSX, no hooks
 *   - No service calls
 *   - No localStorage access
 *   - No side effects
 */

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

function _localDateStr(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function _intensityFromCount(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildHeatmapData
 *
 * Generates a flat array of day entries covering the last `days` calendar
 * days (oldest first), enriched with activity counts from the log.
 *
 * Every day in the range is present — missing days have count 0 so the
 * grid renders a complete rectangle with no gaps.
 *
 * @param  {Array}  activityLog  getActivityLog() result (any length)
 * @param  {number} days         number of calendar days to cover (default 365)
 * @returns {Array} [{ date, count, xp, intensity }, ...]
 */
export function buildHeatmapData(activityLog, days = 365) {
  try {
    const log = Array.isArray(activityLog) ? activityLog : [];

    // Group TOPIC-level entries by local calendar date
    const byDate = {};

    log.forEach((entry) => {
      // Include all action types — even milestone events show effort
      const ts = entry.timestamp;
      if (!ts) return;

      try {
        const d = new Date(ts);
        const dateStr = _localDateStr(d);

        if (!byDate[dateStr]) {
          byDate[dateStr] = { count: 0, xp: 0 };
        }

        byDate[dateStr].count += 1;
        byDate[dateStr].xp += entry.xp ?? 0;
      } catch {
        /* skip malformed timestamp */
      }
    });

    // Build full date range: today going back `days` days, oldest first
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
      );
      const dateStr = _localDateStr(d);
      const data = byDate[dateStr] ?? { count: 0, xp: 0 };

      result.push({
        date: dateStr,
        count: data.count,
        xp: data.xp,
        intensity: _intensityFromCount(data.count),
      });
    }

    return result;
  } catch {
    return [];
  }
}

/**
 * getHeatmapStats
 *
 * Derives summary statistics from the full heatmap array.
 *
 * @param  {Array} heatmapData  output of buildHeatmapData()
 * @returns {{ totalActiveDays, longestStreak, currentStreak, totalActivities }}
 */
export function getHeatmapStats(heatmapData) {
  const EMPTY = {
    totalActiveDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    totalActivities: 0,
  };

  try {
    if (!Array.isArray(heatmapData) || heatmapData.length === 0) return EMPTY;

    let totalActiveDays = 0;
    let totalActivities = 0;
    let longestStreak = 0;
    let currentRun = 0;

    heatmapData.forEach((day) => {
      if (day.count > 0) {
        totalActiveDays++;
        totalActivities += day.count;
        currentRun++;
        if (currentRun > longestStreak) longestStreak = currentRun;
      } else {
        currentRun = 0;
      }
    });

    // currentStreak: count back from today (last entry) until a gap
    let currentStreak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { totalActiveDays, longestStreak, currentStreak, totalActivities };
  } catch {
    return EMPTY;
  }
}
