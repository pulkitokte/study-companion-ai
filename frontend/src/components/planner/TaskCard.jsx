import { motion } from "framer-motion";
import { Clock, Zap, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { PRIORITIES } from "../../utils/plannerStorage.js";

export default function TaskCard({ task, onToggle, onDelete }) {
  if (!task) return null;
  const p = PRIORITIES[task.priority] ?? PRIORITIES.medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: task.done ? 0.55 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!task.done ? { x: 3 } : {}}
      transition={{ duration: 0.2 }}
      className="group relative flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200"
      style={{
        background: task.done
          ? "rgba(255,255,255,0.01)"
          : "rgba(255,255,255,0.03)",
        borderColor: task.done
          ? "rgba(255,255,255,0.05)"
          : p.bg.replace("0.1", "0.2"),
      }}
    >
      {/* Priority left bar */}
      {!task.done && (
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ background: p.color, opacity: 0.6 }}
        />
      )}

      {/* Checkbox */}
      <button onClick={() => onToggle(task.id)} className="shrink-0 mt-0.5">
        {task.done ? (
          <CheckCircle2 size={18} style={{ color: "#00FF64" }} />
        ) : (
          <Circle
            size={18}
            className="text-white/25 hover:text-white/55 transition-colors"
          />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] font-medium leading-snug ${task.done ? "line-through text-white/30" : "text-white/80"}`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {task.subject && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: p.color, background: p.bg }}
            >
              {task.subject}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[10px] text-white/25">
            <Clock size={9} />
            {task.duration}m
          </span>
          <span className="text-[10px] text-white/22">{task.startTime}</span>
          {!task.done && (
            <span className="flex items-center gap-0.5 text-[10px] text-[#7C6FFF]/65">
              <Zap size={9} />+{task.xp} XP
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400/65 hover:bg-red-500/[0.07] transition-all"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}
