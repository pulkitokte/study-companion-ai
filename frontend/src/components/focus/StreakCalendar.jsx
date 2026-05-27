import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Calendar } from "lucide-react";
import { getFocusHistory } from "../../utils/focusStorage.js";

function getLast56Days() {
  return Array.from({ length: 56 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (55 - i));
    return d.toISOString().slice(0, 10);
  });
}

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakCalendar({ stats }) {
  const history = getFocusHistory();
  const days = getLast56Days();
  const today = new Date().toISOString().slice(0, 10);

  const dayMap = useMemo(() => {
    const map = {};
    history.forEach((s) => {
      const d = s.date?.slice(0, 10);
      if (!d) return;
      if (!map[d]) map[d] = { count: 0, minutes: 0 };
      map[d].count++;
      map[d].minutes += s.durationMinutes ?? 0;
    });
    return map;
  }, [history]);

  // Split 56 days into 8 weeks of 7
  const weeks = Array.from({ length: 8 }, (_, wi) =>
    days.slice(wi * 7, wi * 7 + 7),
  );

  const getColor = (day) => {
    const data = dayMap[day];
    if (!data) return "rgba(255,255,255,0.05)";
    const mins = data.minutes;
    if (mins >= 120) return "#FFD700";
    if (mins >= 60) return "#00FFC8";
    if (mins >= 30) return "rgba(0,255,200,0.55)";
    return "rgba(0,255,200,0.25)";
  };

  const getGlow = (day) => {
    const data = dayMap[day];
    if (!data) return "none";
    return `0 0 6px ${getColor(day)}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-[#00FFC8]" />
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Focus Calendar
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={11} className="text-[#FF6B2B]" />
          <span className="text-[10px] text-[#FF6B2B] font-bold">
            {stats.recentStreak}d streak
          </span>
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1">
        {/* Spacer for week column */}
        <div className="w-6 shrink-0" />
        <div className="flex-1 grid grid-cols-7 gap-1">
          {WEEK_LABELS.map((l, i) => (
            <div key={i} className="text-center text-[8px] text-white/20">
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex items-center gap-1">
            {/* Week indicator */}
            <div className="w-6 shrink-0 text-[7px] text-white/15 text-right pr-1">
              {wi === 0 ? "8w" : wi === 4 ? "4w" : wi === 7 ? "1w" : ""}
            </div>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                const data = dayMap[day];
                const isToday = day === today;
                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.005, duration: 0.2 }}
                    title={
                      data
                        ? `${day}: ${data.minutes}m, ${data.count} session(s)`
                        : day
                    }
                    className="aspect-square rounded-sm cursor-default relative"
                    style={{
                      background: getColor(day),
                      boxShadow: getGlow(day),
                      outline: isToday
                        ? "1px solid rgba(0,255,200,0.7)"
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[9px] text-white/20">Less</span>
        {[
          { color: "rgba(255,255,255,0.05)", label: "None" },
          { color: "rgba(0,255,200,0.25)", label: "<30m" },
          { color: "rgba(0,255,200,0.55)", label: "30m+" },
          { color: "#00FFC8", label: "60m+" },
          { color: "#FFD700", label: "2h+" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: l.color }}
            />
            <span className="text-[8px] text-white/18">{l.label}</span>
          </div>
        ))}
        <span className="text-[9px] text-white/20">More</span>
      </div>
    </div>
  );
}
