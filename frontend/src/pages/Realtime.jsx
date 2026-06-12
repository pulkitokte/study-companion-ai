import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Wifi,
  Smartphone,
  Users,
  Trophy,
  Activity,
  Boxes,
} from "lucide-react";
import { useRealtime } from "../hooks/useRealtime.js";
import DevicePanel from "../components/realtime/DevicePanel.jsx";
import PresenceIndicator from "../components/realtime/PresenceIndicator.jsx";
import LiveSyncFeed from "../components/realtime/LiveSyncFeed.jsx";
import CollaborationRoom from "../components/realtime/CollaborationRoom.jsx";
import RealtimeConsole from "../components/realtime/RealtimeConsole.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "devices", label: "Devices", icon: Smartphone },
  { id: "rooms", label: "Collaboration", icon: Users },
  { id: "team", label: "Team", icon: Trophy },
];

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export default function Realtime() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const { presence, devices, team, leaderboard, engineStatus } = useRealtime();

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-5xl mx-auto pb-16"
    >
      {/* Header */}
      <motion.div
        variants={I}
        className="flex items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="flex items-center gap-1.5">
          <div className="relative w-2 h-2">
            {engineStatus.connected && (
              <motion.div
                animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute inset-0 rounded-full bg-[#00FFC8]"
              />
            )}
            <div
              className="relative w-2 h-2 rounded-full"
              style={{
                background: engineStatus.connected ? "#00FFC8" : "#FFB347",
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold"
            style={{ color: engineStatus.connected ? "#00FFC8" : "#FFB347" }}
          >
            {engineStatus.connected ? "Realtime Engine Live" : "Connecting…"}
          </span>
        </div>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.06),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-1">
          <Boxes size={15} className="text-[#7C6FFF]" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C6FFF]">
            Enterprise Preview
          </span>
        </div>
        <h2 className="text-[24px] font-black text-white">
          Multi-Device & Collaboration Ecosystem
        </h2>
        <p className="text-[12px] text-white/35 mt-1 max-w-lg">
          Preview of StudyMind&apos;s future real-time architecture — device
          sync, presence, shared study rooms, co-study sessions, and team
          leaderboards.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              icon: Wifi,
              val: engineStatus.connected ? "Online" : "Connecting",
              label: "Engine",
              color: "#00FFC8",
            },
            {
              icon: Smartphone,
              val: devices.length,
              label: "Devices",
              color: "#7C6FFF",
            },
            {
              icon: Users,
              val: presence.online,
              label: "Presence",
              color: "#FFB347",
            },
            {
              icon: Trophy,
              val: leaderboard.length,
              label: "Team Size",
              color: "#FF6B9D",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/[0.06]"
                style={{ background: `${s.color}06` }}
              >
                <Icon size={14} style={{ color: s.color }} />
                <span className="text-[16px] font-black text-white leading-none">
                  {s.val}
                </span>
                <span className="text-[9px] text-white/25 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={I}
        className="flex gap-1.5 overflow-x-auto scrollbar-none"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0 text-[12px] font-bold transition-all duration-200"
              style={{
                background: on
                  ? "rgba(124,111,255,0.12)"
                  : "rgba(255,255,255,0.025)",
                borderColor: on
                  ? "rgba(124,111,255,0.45)"
                  : "rgba(255,255,255,0.07)",
                color: on ? "#7C6FFF" : "rgba(255,255,255,0.35)",
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
              <LiveSyncFeed limit={15} />
              <div className="space-y-4">
                <div
                  className="rounded-2xl border border-white/[0.06] p-4"
                  style={{ background: "#0A0A14" }}
                >
                  <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest mb-3">
                    Active Presence
                  </p>
                  <PresenceIndicator compact={false} />
                </div>
                <RealtimeConsole />
              </div>
            </div>
          )}

          {tab === "devices" && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{ background: "#0A0A14" }}
            >
              <DevicePanel />
            </div>
          )}

          {tab === "rooms" && <CollaborationRoom />}

          {tab === "team" && (
            <div className="space-y-4">
              {/* Team header */}
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <p className="text-[16px] font-black text-white">{team.name}</p>
                <p className="text-[12px] text-white/35 mt-1">🎯 {team.goal}</p>
              </div>

              {/* Leaderboard */}
              <div
                className="rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ background: "#0A0A14" }}
              >
                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
                  <Trophy size={13} className="text-[#FFD700]" />
                  <span className="text-[12px] font-bold text-white">
                    Team Leaderboard
                  </span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {leaderboard.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-4 py-3 ${m.isSelf ? "bg-[#00FFC8]/04" : ""}`}
                    >
                      <span
                        className="text-[13px] font-black w-6 text-center"
                        style={{
                          color:
                            i === 0
                              ? "#FFD700"
                              : i === 1
                                ? "#C0C0C0"
                                : i === 2
                                  ? "#CD7F32"
                                  : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {i === 0
                          ? "🥇"
                          : i === 1
                            ? "🥈"
                            : i === 2
                              ? "🥉"
                              : `#${m.rank}`}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-black shrink-0"
                        style={{ background: m.color }}
                      >
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white/72 truncate">
                          {m.name}
                          {m.isSelf ? " (You)" : ""}
                        </p>
                        <p className="text-[10px] text-white/22">
                          🔥 {m.streak}d streak
                        </p>
                      </div>
                      <span className="text-[13px] font-black text-[#7C6FFF]">
                        {m.xp.toLocaleString()} XP
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
