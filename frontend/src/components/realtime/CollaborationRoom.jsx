import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Crown, Play, Square, Timer } from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime.js";
import {
  startLiveSession,
  endLiveSession,
  getLiveSessionProgress,
} from "../../lib/liveSessionManager.js";
import SharedPlanner from "./SharedPlanner.jsx";
import { useToast } from "../ui/Toast.jsx";

export default function CollaborationRoom() {
  const { rooms, initRoom, liveSession, refreshAll, pushEvent } = useRealtime();
  const { show } = useToast();
  const room = rooms[0];

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard?.writeText(room.inviteCode).catch(() => {});
    show({
      type: "info",
      title: "Invite code copied",
      message: room.inviteCode,
      duration: 2000,
    });
  };

  const handleStartSession = () => {
    startLiveSession({
      mode: "pomodoro",
      durationMinutes: 25,
      subject: room?.subject ?? "Group Study",
    });
    refreshAll();
    pushEvent("room", "Started a co-study session · 25m Pomodoro");
    show({
      type: "mission",
      title: "Co-study session started!",
      message: "Synced with room members",
      duration: 2500,
    });
  };

  const handleEndSession = () => {
    endLiveSession();
    refreshAll();
    pushEvent("room", "Co-study session ended");
  };

  const progress =
    liveSession?.status === "active" ? getLiveSessionProgress() : null;

  if (!room) {
    return (
      <div
        className="rounded-2xl border border-white/[0.06] p-8 text-center space-y-4"
        style={{ background: "#0A0A14" }}
      >
        <span className="text-4xl">🏛️</span>
        <div>
          <p className="text-[14px] font-bold text-white">
            No active study rooms
          </p>
          <p className="text-[12px] text-white/30 mt-1">
            Create a demo collaboration room to preview shared planning,
            presence, and co-study sessions.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={initRoom}
          className="px-5 py-2.5 rounded-xl font-bold text-[12px]"
          style={{
            background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
            color: "#000",
          }}
        >
          Create Demo Room
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Room header */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-5"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.05),rgba(5,5,12,0))",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{room.emoji}</span>
            <div>
              <p className="text-[16px] font-black text-white">{room.name}</p>
              <p className="text-[11px] text-white/35">
                {room.subject} · {room.members.length} members
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] text-white/45 hover:text-white/75 hover:bg-white/[0.05] transition-all"
          >
            <Copy size={12} /> {room.inviteCode}
          </button>
        </div>

        {/* Members */}
        <div className="flex flex-wrap gap-2 mt-4">
          {room.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.025]"
            >
              {m.role === "owner" && (
                <Crown size={10} className="text-[#FFD700]" />
              )}
              <span className="text-[10px] text-white/55">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Co-study session */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-[#00FFC8]" />
            <span className="text-[12px] font-bold text-white">
              Synchronized Focus Session
            </span>
          </div>
          {liveSession?.status === "active" ? (
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/06 text-[11px] font-bold text-red-400/70 hover:bg-red-500/12 transition-all"
            >
              <Square size={11} /> End Session
            </button>
          ) : (
            <button
              onClick={handleStartSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px]"
              style={{
                background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
                color: "#000",
              }}
            >
              <Play size={11} /> Start Co-Study
            </button>
          )}
        </div>

        {liveSession?.status === "active" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/35">
                {liveSession.subject} · {liveSession.durationMinutes}m Pomodoro
              </span>
              <span className="text-[18px] font-black text-white tabular-nums">
                {progress
                  ? `${Math.floor(progress.remainingSec / 60)}:${String(progress.remainingSec % 60).padStart(2, "0")}`
                  : "--:--"}
              </span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress?.pct ?? 0}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg,#00FFC8,#7C6FFF)",
                  boxShadow: "0 0 8px rgba(0,255,200,0.5)",
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Users size={12} className="text-white/30" />
              <div className="flex -space-x-2">
                {liveSession.participants.map((p) => (
                  <div
                    key={p.id}
                    className="w-6 h-6 rounded-full border-2 border-[#0A0A14] flex items-center justify-center text-[8px] font-bold text-black"
                    style={{ background: p.color }}
                  >
                    {p.avatar}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-white/30">
                {liveSession.participants.length} studying together
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-white/28">
            Start a synchronized session — all room members will see a shared
            countdown timer.
          </p>
        )}
      </div>

      {/* Shared planner + notes */}
      <SharedPlanner room={room} />
    </div>
  );
}
