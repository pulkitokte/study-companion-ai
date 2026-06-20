import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, X, ChevronDown } from "lucide-react";
import {
  getTasks,
  addTask,
  toggleTask,
  deleteTask,
  PRIORITIES,
} from "../../utils/plannerStorage.js";
import TaskCard from "./TaskCard.jsx";
import { useToast } from "../ui/Toast.jsx";
import { syncTaskCompletionToSyllabus } from '../../utils/plannerSyllabusSync.js'

const SUBJECTS = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Science & Tech",
  "Environment",
  "Current Affairs",
  "CSAT",
  "Maths",
  "English",
];

function AddTaskModal({ dateStr, onClose, onAdded }) {
  const { show } = useToast();
  const [title, setTitle] = useState("");
  const [subj, setSubj] = useState("");
  const [time, setTime] = useState("09:00");
  const [dur, setDur] = useState(60);
  const [pri, setPri] = useState("medium");
  const [xp, setXp] = useState(100);

  const handleAdd = () => {
    if (!title.trim()) return;
    const task = addTask({
      title,
      subject: subj,
      date: dateStr,
      startTime: time,
      duration: dur,
      priority: pri,
      xp,
    });
    show({
      type: "mission",
      title: "Task added",
      message: `${title} · ${dur}m`,
      duration: 2000,
    });
    onAdded(task);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
        style={{ background: "#0D0D1A" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[14px] font-bold text-white">Add Task</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-white/[0.03] text-white placeholder-white/20 text-[13px] outline-none"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(0,255,200,0.45)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                Start Time
              </p>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-white/[0.03] text-white/70 text-[12px] outline-none"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
                Duration
              </p>
              <select
                value={dur}
                onChange={(e) => setDur(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border bg-[#0D0D1A] text-white/70 text-[12px] outline-none"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                {[15, 25, 30, 45, 60, 90, 120, 180].map((d) => (
                  <option key={d} value={d}>
                    {d}m
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
              Subject
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECTS.slice(0, 6).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubj(subj === s ? "" : s)}
                  className="px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all"
                  style={{
                    background:
                      subj === s
                        ? "rgba(0,255,200,0.12)"
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      subj === s
                        ? "rgba(0,255,200,0.45)"
                        : "rgba(255,255,255,0.08)",
                    color: subj === s ? "#00FFC8" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">
              Priority
            </p>
            <div className="flex gap-2">
              {Object.entries(PRIORITIES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setPri(k)}
                  className="flex-1 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
                  style={{
                    background: pri === k ? v.bg : "rgba(255,255,255,0.03)",
                    borderColor:
                      pri === k ? `${v.color}45` : "rgba(255,255,255,0.08)",
                    color: pri === k ? v.color : "rgba(255,255,255,0.4)",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/40 hover:text-white/65 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl font-bold text-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#00FFC8,#00A884)",
                color: "#000",
              }}
            >
              Add Task
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScheduleBoard({ dateStr }) {
  const [tasks, setTasks] = useState(() => getTasks(dateStr));
  const [showAdd, setShowAdd] = useState(false);

  const refresh = () => setTasks(getTasks(dateStr));

 const handleToggle = (id) => {
   const task = tasks.find((t) => t.id === id);
   toggleTask(id);
   if (task && !task.done) {
     syncTaskCompletionToSyllabus({ ...task, done: true });
   }
   refresh();
 };
  const handleDelete = (id) => {
    deleteTask(id);
    refresh();
  };

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [tasks],
  );

  const done = sorted.filter((t) => t.done).length;
  const pending = sorted.filter((t) => !t.done);
  const doneTasks = sorted.filter((t) => t.done);

  const label = new Date(dateStr + "T12:00:00").toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <AnimatePresence>
        {showAdd && (
          <AddTaskModal
            dateStr={dateStr}
            onClose={() => setShowAdd(false)}
            onAdded={refresh}
          />
        )}
      </AnimatePresence>

      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div>
            <p className="text-[13px] font-bold text-white">{label}</p>
            <p className="text-[10px] text-white/28 mt-0.5">
              {done}/{sorted.length} tasks done
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all"
            style={{
              background: "rgba(0,255,200,0.12)",
              border: "1px solid rgba(0,255,200,0.35)",
              color: "#00FFC8",
            }}
          >
            <Plus size={13} /> Add Task
          </button>
        </div>

        {/* Tasks */}
        <div className="p-4 space-y-2">
          {sorted.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-3xl">📋</span>
              <p className="text-[13px] text-white/28">
                No tasks for this day.
              </p>
              <p className="text-[11px] text-white/18">
                Click "Add Task" to plan your session.
              </p>
            </div>
          )}

          <AnimatePresence>
            {pending.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>

          {doneTasks.length > 0 && (
            <div className="pt-2 space-y-2">
              <p className="text-[9px] text-white/20 uppercase tracking-widest px-1">
                Completed
              </p>
              <AnimatePresence>
                {doneTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
