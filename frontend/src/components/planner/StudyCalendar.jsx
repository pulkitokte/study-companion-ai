import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthActivity } from "../../utils/plannerStorage.js";

export default function StudyCalendar({ onDateSelect, selectedDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const activity = useMemo(() => getMonthActivity(year, month), [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMon; d++) cells.push(d);

  const toKey = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const monthLabel = viewDate.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "#0A0A14" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-[13px] font-bold text-white">{monthLabel}</p>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/65 hover:bg-white/[0.06] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
          <div key={i} className="text-center text-[9px] text-white/22 py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const key = toKey(d);
          const act = activity[key];
          const isToday = key === today;
          const isSel = key === selectedDate;
          const hasTasks = !!act;

          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDateSelect(key)}
              className="relative aspect-square rounded-lg flex items-center justify-center text-[12px] font-semibold transition-all duration-150"
              style={{
                background: isSel
                  ? "rgba(0,255,200,0.18)"
                  : isToday
                    ? "rgba(0,255,200,0.07)"
                    : hasTasks
                      ? "rgba(124,111,255,0.1)"
                      : "transparent",
                borderRadius: "8px",
                color: isSel
                  ? "#00FFC8"
                  : isToday
                    ? "#00FFC8"
                    : hasTasks
                      ? "#7C6FFF"
                      : "rgba(255,255,255,0.4)",
                boxShadow: isSel ? "0 0 10px rgba(0,255,200,0.25)" : "none",
                outline:
                  isToday && !isSel ? "1px solid rgba(0,255,200,0.35)" : "none",
              }}
            >
              {d}
              {hasTasks && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {act.done > 0 && (
                    <div className="w-1 h-1 rounded-full bg-[#00FFC8]" />
                  )}
                  {act.total - act.done > 0 && (
                    <div className="w-1 h-1 rounded-full bg-[#7C6FFF]/60" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-[9px] text-white/25">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-[#00FFC8]/70" /> Done
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-[#7C6FFF]/50" /> Pending
        </span>
      </div>
    </div>
  );
}
