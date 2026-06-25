import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, CalendarDays, Activity } from "lucide-react";
import {
  buildHeatmapData,
  getHeatmapStats,
} from "../../../utils/heatmapUtils.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DAYS = 365;
const COLS = Math.ceil(DAYS / 7); // 53 columns
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── INTENSITY → COLOR ────────────────────────────────────────────────────────
function cellColor(intensity, examColor) {
  switch (intensity) {
    case 1:
      return `${examColor}30`;
    case 2:
      return `${examColor}60`;
    case 3:
      return `${examColor}90`;
    case 4:
      return examColor;
    default:
      return "rgba(255,255,255,0.05)";
  }
}

// ─── STAT PILL ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={12} style={{ color }} />
      <span className="text-[13px] font-black text-white">{value}</span>
      <span className="text-[10px] text-white/28">{label}</span>
    </div>
  );
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ day, examColor, cellSize, visible }) {
  if (!visible || !day) return null;

  const dateObj = new Date(day.date + "T00:00:00");
  const label = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="absolute z-[600] pointer-events-none rounded-xl border border-white/[0.12] px-3 py-2.5 shadow-xl"
      style={{
        background: "rgba(10,10,20,0.97)",
        backdropFilter: "blur(12px)",
        minWidth: 140,
        bottom: cellSize + 6,
        left: "50%",
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
      }}
    >
      <p className="text-[11px] font-black text-white mb-1">{label}</p>
      {day.count > 0 ? (
        <>
          <p className="text-[10px]" style={{ color: examColor }}>
            {day.count} action{day.count !== 1 ? "s" : ""}
          </p>
          {day.xp > 0 && (
            <p className="text-[10px] text-[#7C6FFF]">+{day.xp} XP</p>
          )}
        </>
      ) : (
        <p className="text-[10px] text-white/28">No activity</p>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

/**
 * ActivityHeatmap
 *
 * GitHub-style contribution calendar showing syllabus activity over 365 days.
 * Fully prop-driven. No service calls.
 *
 * Props:
 *   activityLog {Array}  syllabusService.getActivityLog(90+) result
 *   examColor   {string} hex color for the active exam (e.g. '#7C6FFF')
 */
export default function ActivityHeatmap({
  activityLog,
  examColor = "#7C6FFF",
}) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  // ── Build data ──────────────────────────────────────────────────────────
  const heatmapData = useMemo(
    () => buildHeatmapData(activityLog, DAYS),
    [activityLog],
  );

  const stats = useMemo(() => getHeatmapStats(heatmapData), [heatmapData]);

  const hasAnyActivity = stats.totalActivities > 0;

  // ── Organise into a 7-row × 53-col grid ─────────────────────────────────
  // Pad the start so the first day falls on the correct weekday column.
  const grid = useMemo(() => {
    if (heatmapData.length === 0) return [];

    const firstDay = new Date(heatmapData[0].date + "T00:00:00");
    const startOffset = firstDay.getDay(); // 0=Sun … 6=Sat

    // Fill a flat array of COLS×7 slots; nulls for padding
    const total = COLS * 7;
    const cells = Array(total).fill(null);

    heatmapData.forEach((day, i) => {
      cells[startOffset + i] = day;
    });

    // Slice into COLS columns of 7 rows each
    const columns = [];
    for (let c = 0; c < COLS; c++) {
      columns.push(cells.slice(c * 7, c * 7 + 7));
    }
    return columns;
  }, [heatmapData]);

  // ── Month label positions ────────────────────────────────────────────────
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;

    grid.forEach((col, colIdx) => {
      const firstNonNull = col.find((d) => d !== null);
      if (!firstNonNull) return;
      const m = new Date(firstNonNull.date + "T00:00:00").getMonth();
      if (m !== lastMonth) {
        labels.push({ col: colIdx, label: MONTHS[m] });
        lastMonth = m;
      }
    });
    return labels;
  }, [grid]);

  // ── Responsive cell size (px) ─────────────────────────────────────────────
  // Desktop: 12px  Mobile: 9px — achieved via CSS, fixed at 11 for SVG calcs
  const CELL = 11;
  const GAP = 2;
  const STEP = CELL + GAP;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "#0A0A14" }}
    >
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} style={{ color: examColor }} />
          <span className="text-[10px] font-black text-white/32 uppercase tracking-widest">
            Activity Heatmap
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 flex-wrap">
          <StatPill
            icon={Activity}
            value={stats.totalActiveDays}
            label="active days"
            color={examColor}
          />
          <StatPill
            icon={Flame}
            value={stats.currentStreak}
            label="streak"
            color="#FF6B2B"
          />
          <StatPill
            icon={Flame}
            value={stats.longestStreak}
            label="best"
            color="#FFD700"
          />
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {!hasAnyActivity && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CalendarDays size={24} className="text-white/12" />
          <p className="text-[11px] text-white/22">
            Complete topics to build your activity heatmap.
          </p>
        </div>
      )}

      {/* ── Heatmap grid ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto scrollbar-none">
        <div style={{ minWidth: COLS * STEP + 32 }}>
          {/* Day-of-week labels */}
          <div className="flex mb-1" style={{ paddingLeft: 28 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((row) => (
              <div
                key={row}
                className="text-[8px] text-white/18 font-bold"
                style={{
                  width: STEP,
                  height: STEP,
                  lineHeight: `${STEP}px`,
                  writingMode: "horizontal-tb",
                  // Only show Mon / Wed / Fri labels to avoid crowding
                  opacity: [1, 3, 5].includes(row) ? 1 : 0,
                }}
              >
                {DAYS_OF_WEEK[row]}
              </div>
            ))}
          </div>

          {/* Month labels + columns */}
          <div className="flex">
            {/* Blank offset for day labels */}
            <div style={{ width: 28 }} />

            <div className="relative flex flex-col">
              {/* Month labels row */}
              <div className="flex mb-1" style={{ height: 14 }}>
                {grid.map((_, colIdx) => {
                  const ml = monthLabels.find((m) => m.col === colIdx);
                  return (
                    <div
                      key={colIdx}
                      className="text-[8px] text-white/25 font-bold shrink-0"
                      style={{ width: STEP }}
                    >
                      {ml ? ml.label : ""}
                    </div>
                  );
                })}
              </div>

              {/* Cell grid — rendered column-by-column */}
              <div className="flex">
                {grid.map((col, colIdx) => (
                  <div
                    key={colIdx}
                    className="flex flex-col"
                    style={{ gap: GAP, marginRight: GAP }}
                  >
                    {col.map((day, rowIdx) => {
                      const isHovered =
                        hoverCol === colIdx && hoverRow === rowIdx;
                      return (
                        <div
                          key={rowIdx}
                          className="relative shrink-0 rounded-[2px] transition-all duration-100"
                          style={{
                            width: CELL,
                            height: CELL,
                            background: day
                              ? cellColor(day.intensity, examColor)
                              : "transparent",
                            cursor: day ? "pointer" : "default",
                            outline:
                              isHovered && day
                                ? `1px solid ${examColor}80`
                                : "none",
                          }}
                          onMouseEnter={() => {
                            if (!day) return;
                            setHoveredDay(day);
                            setHoverCol(colIdx);
                            setHoverRow(rowIdx);
                          }}
                          onMouseLeave={() => {
                            setHoveredDay(null);
                            setHoverCol(null);
                            setHoverRow(null);
                          }}
                        >
                          {/* Tooltip */}
                          {isHovered && (
                            <Tooltip
                              day={day}
                              examColor={examColor}
                              cellSize={CELL}
                              visible={true}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Intensity legend ──────────────────────────────────────────── */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[9px] text-white/20">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="rounded-[2px]"
                style={{
                  width: CELL,
                  height: CELL,
                  background: cellColor(level, examColor),
                }}
              />
            ))}
            <span className="text-[9px] text-white/20">More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
