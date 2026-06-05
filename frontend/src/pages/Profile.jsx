import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Flame,
  Trophy,
  Clock,
  BarChart3,
  Download,
  Star,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useGlobalStats } from "../hooks/useGlobalStats.js";
import { downloadBackup } from "../utils/appBackup.js";
import { useToast } from "../components/ui/Toast.jsx";
import SyncStatusBadge from "../components/ui/SyncStatus.jsx";
import env from "../lib/env.js";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, openAuthModal, isMockMode } =
    useAuth();
  const { stats } = useGlobalStats();
  const { show } = useToast();

  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("studymind_profile") ?? "{}");
    } catch {
      return {};
    }
  }, []);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        month: "long",
        year: "numeric",
      })
    : "Local session";

  const name = user?.name || profile.name || "Scholar";
  const email = user?.email || "Not signed in";
  const exam = profile.targetExam || "Not set";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";

  const handleExport = () => {
    const { ok, filename } = downloadBackup();
    if (ok)
      show({
        type: "mission",
        title: "Data exported",
        message: filename,
        duration: 3000,
      });
    else
      show({
        type: "info",
        title: "Export failed",
        message: "Could not create backup file",
        duration: 2500,
      });
  };

  const STAT_PILLS = [
    {
      icon: Zap,
      val: (stats.totalXP ?? 0).toLocaleString(),
      label: "Total XP",
      color: "#7C6FFF",
    },
    {
      icon: Flame,
      val: `${stats.streak ?? 0}d`,
      label: "Day Streak",
      color: "#FF6B2B",
    },
    {
      icon: Star,
      val: `Lv.${stats.level ?? 1}`,
      label: "Level",
      color: "#FFB347",
    },
    {
      icon: Trophy,
      val: stats.achievementsUnlocked ?? 0,
      label: "Achievements",
      color: "#FFD700",
    },
    {
      icon: Clock,
      val: `${stats.totalFocusMins ?? 0}m`,
      label: "Focus Time",
      color: "#00FFC8",
    },
    {
      icon: BarChart3,
      val: `${stats.avgQuizAcc ?? 0}%`,
      label: "Quiz Accuracy",
      color: "#4FC3F7",
    },
  ];

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl mx-auto pb-10"
    >
      {/* Back */}
      <motion.button
        variants={I}
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      {/* Profile hero card */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.06),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle,#7C6FFF,transparent 70%)",
          }}
        />

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -inset-1 rounded-full blur-xl"
              style={{ background: "linear-gradient(135deg,#00FFC8,#7C6FFF)" }}
            />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center text-2xl font-black text-black">
              {initials}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[20px] font-black text-white">{name}</h2>
              {isMockMode && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#FFB347]/30 bg-[#FFB347]/10 text-[#FFB347]">
                  LOCAL MODE
                </span>
              )}
              {!isMockMode && isAuthenticated && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#00FFC8]/30 bg-[#00FFC8]/10 text-[#00FFC8]">
                  ✓ SYNCED
                </span>
              )}
            </div>
            <p className="text-[12px] text-white/38 mt-0.5">{email}</p>
            <p className="text-[11px] text-white/28 mt-0.5">
              Target: {exam} · Joined: {joinedDate}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {stats.rank && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: stats.rank.color,
                    background: `${stats.rank.color}14`,
                    border: `1px solid ${stats.rank.color}28`,
                  }}
                >
                  {stats.rank.emoji} {stats.rank.label}
                </span>
              )}
              <SyncStatusBadge compact={false} />
            </div>
          </div>
        </div>

        {/* Auth CTA for non-authenticated */}
        {!isAuthenticated && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/07">
            <Shield size={14} className="text-[#7C6FFF] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white">
                Sign in for cloud sync
              </p>
              <p className="text-[10px] text-white/35">
                Your data currently lives only on this device.
              </p>
            </div>
            <button
              onClick={() => openAuthModal("register")}
              className="shrink-0 px-3 py-1.5 rounded-lg font-bold text-[11px]"
              style={{
                background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
                color: "#fff",
              }}
            >
              Sign Up Free
            </button>
          </div>
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={I}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {STAT_PILLS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
              <Icon size={15} style={{ color: s.color }} />
              <span className="text-[20px] font-black text-white leading-none">
                {s.val}
              </span>
              <span className="text-[9px] text-white/25 uppercase tracking-wider text-center">
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Connected systems */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[10px] text-white/25 uppercase tracking-widest mb-4">
          Connected Systems
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Quiz Arena",
              val: `${stats.totalQuizzes ?? 0} sessions`,
              color: "#FFB347",
              ok: (stats.totalQuizzes ?? 0) > 0,
            },
            {
              label: "Focus Mode",
              val: `${stats.totalFocusSessions ?? 0} sessions`,
              color: "#B5FF47",
              ok: (stats.totalFocusSessions ?? 0) > 0,
            },
            {
              label: "AI Chat",
              val: env.hasGemini ? "Gemini AI" : "Mock AI",
              color: "#FF6B9D",
              ok: true,
            },
            {
              label: "Planner",
              val: `${stats.plannerDone ?? 0}/${stats.plannerTotal ?? 0} tasks`,
              color: "#4FC3F7",
              ok: true,
            },
            {
              label: "Achievements",
              val: `${stats.achievementsUnlocked ?? 0} unlocked`,
              color: "#FFD700",
              ok: (stats.achievementsUnlocked ?? 0) > 0,
            },
            {
              label: "Cloud Sync",
              val: isMockMode ? "localStorage" : "Connected",
              color: "#00FFC8",
              ok: !isMockMode,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.05]"
              style={{ background: `${s.color}06` }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: s.ok ? s.color : "#444",
                  boxShadow: s.ok ? `0 0 6px ${s.color}60` : "none",
                }}
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white/65 truncate">
                  {s.label}
                </p>
                <p className="text-[9px] text-white/28 truncate">{s.val}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={I} className="flex flex-col sm:flex-row gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/07 text-[12px] font-bold text-[#7C6FFF] hover:bg-[#7C6FFF]/12 transition-all"
        >
          <Download size={14} /> Export Data
        </motion.button>
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/06 text-[12px] font-bold text-red-400/65 hover:bg-red-500/10 transition-all"
          >
            Sign Out
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
