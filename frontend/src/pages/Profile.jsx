import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  BarChart3,
  Calendar,
  Sliders,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import ProfileStats from "../components/profile/ProfileStats.jsx";
import ProfileAchievements from "../components/profile/ProfileAchievements.jsx";
import ProfileActivity from "../components/profile/ProfileActivity.jsx";
import ProfileSettings from "../components/profile/ProfileSettings.jsx";

const TABS = [
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: User },
  { id: "activity", label: "Activity", icon: Calendar },
  { id: "settings", label: "Preferences", icon: Sliders },
];

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("stats");
  const { openAuthModal } = useAuth();
  const { syncNow, exportData, syncing } = useUser();
  const { show } = useToast();

  const handleSync = async () => {
    await syncNow();
    show({
      type: "mission",
      title: "Profile synced",
      message: "All stats refreshed",
      duration: 2000,
    });
  };

  const handleExport = () => {
    exportData();
    show({
      type: "info",
      title: "Data exported",
      message: "JSON file downloaded",
      duration: 2500,
    });
  };

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* Top nav */}
      <motion.div
        variants={I}
        className="flex items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            Sync
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/07 text-[11px] font-bold text-[#7C6FFF] hover:bg-[#7C6FFF]/14 transition-all"
          >
            <Download size={12} /> Export
          </motion.button>
        </div>
      </motion.div>

      {/* Profile header */}
      <motion.div variants={I}>
        <ProfileHeader onSignIn={() => openAuthModal("register")} />
      </motion.div>

      {/* Tab strip */}
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
          {tab === "stats" && <ProfileStats />}
          {tab === "achievements" && <ProfileAchievements />}
          {tab === "activity" && <ProfileActivity />}
          {tab === "settings" && <ProfileSettings />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
