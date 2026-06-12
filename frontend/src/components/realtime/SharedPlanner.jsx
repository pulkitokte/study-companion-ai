import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, MessageSquare, Send } from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime.js";
import {
  addRoomTask,
  toggleRoomTask,
  addRoomNote,
} from "../../lib/collaborationManager.js";
import { useToast } from "../ui/Toast.jsx";

function fmtAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function SharedPlanner({ room }) {
  const { refreshAll, pushEvent } = useRealtime();
  const { show } = useToast();
  const [newTask, setNewTask] = useState("");
  const [newNote, setNewNote] = useState("");

  if (!room) return null;

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addRoomTask(room.id, { title: newTask.trim(), assignee: "You" });
    setNewTask("");
    refreshAll();
    pushEvent("room", `Added task: "${newTask.trim()}"`);
    show({ type: "mission", title: "Task added to room", duration: 1800 });
  };

  const handleToggle = (taskId, title, done) => {
    toggleRoomTask(room.id, taskId);
    refreshAll();
    pushEvent("room", `${!done ? "Completed" : "Reopened"}: "${title}"`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addRoomNote(room.id, newNote.trim());
    setNewNote("");
    refreshAll();
    pushEvent("room", "New note shared in room");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Shared tasks */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <span className="text-[12px] font-bold text-white">Shared Tasks</span>
          <span className="text-[10px] text-white/25">
            {room.tasks.filter((t) => t.done).length}/{room.tasks.length} done
          </span>
        </div>
        <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto scrollbar-none">
          <AnimatePresence initial={false}>
            {room.tasks.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/[0.05] ${t.done ? "opacity-50" : ""}`}
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <button onClick={() => handleToggle(t.id, t.title, t.done)}>
                  {t.done ? (
                    <CheckCircle2 size={15} className="text-[#00FFC8]" />
                  ) : (
                    <Circle size={15} className="text-white/22" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[11px] font-medium ${t.done ? "line-through text-white/35" : "text-white/72"}`}
                  >
                    {t.title}
                  </p>
                  <p className="text-[9px] text-white/22">
                    Assigned to {t.assignee}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="p-3 border-t border-white/[0.05] flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Add a shared task…"
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#00FFC8]/40"
          />
          <button
            onClick={handleAddTask}
            className="px-3 py-2 rounded-xl bg-[#00FFC8]/12 border border-[#00FFC8]/30 text-[#00FFC8] hover:bg-[#00FFC8]/20 transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Shared notes */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
          <MessageSquare size={13} className="text-[#7C6FFF]" />
          <span className="text-[12px] font-bold text-white">Shared Notes</span>
        </div>
        <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto scrollbar-none">
          {room.notes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-2xl">📝</span>
              <p className="text-[11px] text-white/25">
                No notes yet — share something with the group.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {room.notes.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-3 py-2 rounded-xl border border-white/[0.05]"
                  style={{ background: "rgba(124,111,255,0.04)" }}
                >
                  <p className="text-[11px] text-white/65 leading-relaxed">
                    {n.content}
                  </p>
                  <p className="text-[9px] text-white/22 mt-1">
                    {n.author} · {fmtAgo(n.createdAt)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <div className="p-3 border-t border-white/[0.05] flex gap-2">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            placeholder="Share a note with the room…"
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#7C6FFF]/40"
          />
          <button
            onClick={handleAddNote}
            className="px-3 py-2 rounded-xl bg-[#7C6FFF]/12 border border-[#7C6FFF]/30 text-[#7C6FFF] hover:bg-[#7C6FFF]/20 transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
