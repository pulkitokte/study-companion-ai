import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Circle, Zap, RefreshCw } from "lucide-react";
import { useProgress } from "../../context/ProgressContext.jsx";
import { saveMissions } from "../../utils/progressStorage.js";

const TYPE_COLORS = {
  quiz: "#FFB347",
  focus: "#7C6FFF",
  mixed: "#00FFC8",
  streak: "#FF6B2B",
};

export default function DailyMissions() {
  const { missions, refreshStats } = useProgress();

  const done = missions.filter((m) => m.done).length;
  const total = missions.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const xpAvailable = missions
    .filter((m) => !m.done)
    .reduce((s, m) => s + (m.xp ?? 0), 0);
  const xpEarned = missions
    .filter((m) => m.done)
    .reduce((s, m) => s + (m.xp ?? 0), 0);

  const handleToggle = (idx) => {
    const updated = missions.map((m, i) =>
      i === idx ? { ...m, done: !m.done } : m,
    );
    saveMissions(updated);
    refreshStats();
  };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
      style={{ background: "#0A0A14" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-[#FFB347]" />
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
            Daily Missions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/25">
            {done}/{total} done
          </span>
          <button
            onClick={refreshStats}
            className="p-1 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-colors"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg,#FFB347,#FF6B2B)",
              boxShadow: "0 0 8px rgba(255,179,71,0.4)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/25">
          <span>+{xpEarned} XP earned</span>
          <span>+{xpAvailable} XP available</span>
        </div>
      </div>

      {/* Mission list */}
      <div className="space-y-2">
        {missions.map((m, i) => {
          const color = TYPE_COLORS[m.type] ?? "#888";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => handleToggle(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                m.done ? "opacity-55" : "hover:bg-white/[0.02]"
              }`}
              style={{
                background: m.done
                  ? "rgba(0,255,100,0.05)"
                  : "rgba(255,255,255,0.02)",
                borderColor: m.done
                  ? "rgba(0,255,100,0.2)"
                  : "rgba(255,255,255,0.07)",
              }}
            >
              <AnimatePresence mode="wait">
                {m.done ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <CheckCircle2 size={18} style={{ color: "#00FF64" }} />
                  </motion.div>
                ) : (
                  <Circle size={18} className="text-white/20 shrink-0" />
                )}
              </AnimatePresence>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-medium leading-snug ${m.done ? "line-through text-white/35" : "text-white/75"}`}
                >
                  {m.label}
                </p>
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                  style={{ color, background: `${color}14` }}
                >
                  {m.type}
                </span>
              </div>

              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg border"
                style={{
                  borderColor: "rgba(124,111,255,0.2)",
                  background: "rgba(124,111,255,0.07)",
                }}
              >
                <Zap size={9} className="text-[#7C6FFF]" />
                <span className="text-[10px] font-bold text-[#7C6FFF]">
                  +{m.xp}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {done === total && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00FFC8]/25 bg-[#00FFC8]/07 text-[12px] font-bold text-[#00FFC8]"
        >
          ✨ All missions complete! Come back tomorrow for new ones.
        </motion.div>
      )}
    </div>
  );
}
