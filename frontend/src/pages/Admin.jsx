import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  LayoutDashboard,
  BarChart3,
  FileQuestion,
  ToggleLeft,
  Megaphone,
  ScrollText,
  ShieldCheck,
  LogOut,
  Zap,
  Database,
  Boxes,
} from "lucide-react";
import { useAdmin } from "../hooks/useAdmin.js";
import AdminLogin from "../components/admin/AdminLogin.jsx";
import FeatureFlagsPanel from "../components/admin/FeatureFlagsPanel.jsx";
import AnalyticsCharts from "../components/admin/AnalyticsCharts.jsx";
import QuestionEditor from "../components/admin/QuestionEditor.jsx";
import AnnouncementManager from "../components/admin/AnnouncementManager.jsx";
import AdminActionLog from "../components/admin/AdminActionLog.jsx";
import { useToast } from "../components/ui/Toast.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "content", label: "Content", icon: FileQuestion },
  { id: "flags", label: "Feature Flags", icon: ToggleLeft },
  { id: "announce", label: "Announcements", icon: Megaphone },
  { id: "logs", label: "Audit Logs", icon: ScrollText },
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

function OverviewTab() {
  const { overview, flags, actionLog, announcements } = useAdmin();
  const activeAnnouncements = announcements.filter((a) => a.active).length;

  const CARDS = [
    {
      icon: Zap,
      label: "Total XP",
      val: (overview.stats.totalXP ?? 0).toLocaleString(),
      color: "#7C6FFF",
    },
    {
      icon: FileQuestion,
      label: "Quiz Sessions",
      val: overview.counts.quizSessions,
      color: "#FFB347",
    },
    {
      icon: Boxes,
      label: "Focus Sessions",
      val: overview.counts.focusSessions,
      color: "#00FFC8",
    },
    {
      icon: ScrollText,
      label: "Planner Tasks",
      val: overview.counts.plannerTasks,
      color: "#4FC3F7",
    },
    {
      icon: ShieldCheck,
      label: "Achievements",
      val: overview.counts.achievements,
      color: "#FFD700",
    },
    {
      icon: Database,
      label: "Storage Used",
      val: `${(overview.storageBytes / 1024).toFixed(1)} KB`,
      color: "#FF6B9D",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col gap-2 p-4 rounded-2xl border border-white/[0.06]"
              style={{ background: `${c.color}06` }}
            >
              <div
                className="p-1.5 w-fit rounded-lg"
                style={{ background: `${c.color}15` }}
              >
                <Icon size={14} style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-[20px] font-black text-white leading-none">
                  {c.val}
                </p>
                <p className="text-[9px] text-white/28 uppercase tracking-wider mt-1">
                  {c.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <p className="text-[10px] text-white/22 uppercase tracking-widest mb-3">
            System Snapshot
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] text-white/35">
                Feature flags enabled
              </span>
              <span className="text-[11px] font-bold text-white/70">
                {overview.flagsEnabled}/{overview.flagsTotal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-white/35">
                Active announcements
              </span>
              <span className="text-[11px] font-bold text-white/70">
                {activeAnnouncements}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-white/35">
                Audit log entries
              </span>
              <span className="text-[11px] font-bold text-white/70">
                {actionLog.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-white/35">Generated</span>
              <span className="text-[11px] font-bold text-white/70">
                {new Date(overview.generatedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/[0.06] p-5"
          style={{ background: "#0A0A14" }}
        >
          <p className="text-[10px] text-white/22 uppercase tracking-widest mb-3">
            Rank & Progress
          </p>
          {overview.stats.rank ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{overview.stats.rank.emoji}</span>
              <div>
                <p
                  className="text-[14px] font-black"
                  style={{ color: overview.stats.rank.color }}
                >
                  {overview.stats.rank.label}
                </p>
                <p className="text-[11px] text-white/35">
                  Level {overview.stats.level ?? 1} ·{" "}
                  {overview.stats.streak ?? 0}d streak
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-white/25">No rank data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminShell() {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const { show } = useToast();
  const [tab, setTab] = useState("overview");

  const handleLogout = () => {
    logout();
    show({ type: "info", title: "Admin session ended", duration: 2000 });
  };

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
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/06 text-[11px] font-bold text-red-400/65 hover:bg-red-500/12 transition-all"
        >
          <LogOut size={12} /> Lock Panel
        </button>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(255,107,157,0.1),rgba(124,111,255,0.08),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#FF6B9D,#7C6FFF,transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={15} className="text-[#FF6B9D]" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#FF6B9D]">
            Admin Control Center
          </span>
        </div>
        <h2 className="text-[24px] font-black text-white">
          StudyMind Administration
        </h2>
        <p className="text-[12px] text-white/35 mt-1 max-w-lg">
          Manage feature rollouts, content, announcements, and audit the full
          ecosystem — all local-first, backend-ready.
        </p>
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
                  ? "rgba(255,107,157,0.12)"
                  : "rgba(255,255,255,0.025)",
                borderColor: on
                  ? "rgba(255,107,157,0.4)"
                  : "rgba(255,255,255,0.07)",
                color: on ? "#FF6B9D" : "rgba(255,255,255,0.35)",
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
          {tab === "overview" && <OverviewTab />}
          {tab === "analytics" && <AnalyticsCharts />}
          {tab === "content" && <QuestionEditor />}
          {tab === "flags" && <FeatureFlagsPanel />}
          {tab === "announce" && <AnnouncementManager />}
          {tab === "logs" && <AdminActionLog />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function Admin() {
  const { unlocked } = useAdmin();
  return unlocked ? <AdminShell /> : <AdminLogin />;
}
