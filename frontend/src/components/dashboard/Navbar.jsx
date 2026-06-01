// FILE PATH: frontend/src/components/dashboard/Navbar.jsx
// REPLACES existing Navbar.jsx — uses real profile + live XP/streak.

import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  Flame,
  Zap,
  Target,
  ChevronDown,
  X,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  getFirstName,
  getDisplayName,
  getTargetExam,
  getUnifiedXP,
  getUnifiedStreak,
  getLevelFromXP,
} from "../../utils/userProfile.js";

const PAGE_META = {
  "/dashboard": {
    title: "Mission Control",
    subtitle: "Your daily command center",
  },
  "/planner": { title: "Study Planner", subtitle: "Manage your schedule" },
  "/chat": {
    title: "Chat Companion",
    subtitle: "Talk to your AI study partner",
  },
  "/quiz": { title: "Quiz Arena", subtitle: "Test your knowledge" },
  "/progress": { title: "Progress Report", subtitle: "Track your growth" },
  "/focus": { title: "Focus Mode", subtitle: "Deep work session" },
  "/settings": { title: "Settings", subtitle: "Customize your experience" },
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Live data from localStorage
  const { totalXP } = useMemo(() => getUnifiedXP(), []);
  const streak = useMemo(() => getUnifiedStreak(), []);
  const level = getLevelFromXP(totalXP);
  const firstName = getFirstName();
  const displayName = getDisplayName();
  const targetExam = getTargetExam();
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";

  const meta = PAGE_META[location.pathname] ?? {
    title: "StudyMind",
    subtitle: "",
  };

  return (
    <header
      className="relative z-10 h-[64px] shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-white/[0.05]"
      style={{ background: "rgba(5,5,12,0.8)", backdropFilter: "blur(12px)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-[15px] font-bold text-white tracking-wide leading-tight">
              {meta.title}
            </h1>
            <p className="text-[10px] text-white/30 tracking-wider hidden sm:block">
              {meta.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="open"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.04] overflow-hidden"
            >
              <Search size={13} className="text-white/40 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[12px] text-white placeholder-white/25 outline-none"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X
                  size={13}
                  className="text-white/30 hover:text-white/60 transition-colors"
                />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            >
              <Search size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Quick stats — desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#FF6B2B]/20 bg-[#FF6B2B]/[0.06]">
            <Flame size={12} className="text-[#FF6B2B]" />
            <span className="text-[11px] font-bold text-[#FF6B2B]">
              {streak}d
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#7C6FFF]/20 bg-[#7C6FFF]/[0.06]">
            <Zap size={12} className="text-[#7C6FFF]" />
            <span className="text-[11px] font-bold text-[#7C6FFF]">
              {totalXP.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#00FFC8]/20 bg-[#00FFC8]/[0.06]">
            <Target size={12} className="text-[#00FFC8]" />
            <span className="text-[11px] font-bold text-[#00FFC8]">
              {targetExam}
            </span>
          </div>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/[0.06] transition-all group"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="relative w-8 h-8 rounded-full bg-[#0F0F1E] flex items-center justify-center text-[11px] font-bold text-white">
                {initials}
              </div>
            </div>
            <ChevronDown
              size={12}
              className={`text-white/30 transition-transform duration-200 hidden sm:block ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+8px)] z-20 w-[200px] rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/50"
                  style={{ background: "#0D0D1A" }}
                >
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-[12px] font-bold text-white">
                      {displayName || "Scholar"}
                    </p>
                    <p className="text-[10px] text-[#00FFC8]/60">
                      {targetExam} · Level {level}
                    </p>
                  </div>
                  {[
                    { icon: User, label: "Profile" },
                    { icon: Settings, label: "Settings" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                    >
                      <Icon size={13} className="text-white/40" />
                      <span className="text-[12px] text-white/60">{label}</span>
                    </button>
                  ))}
                  <div className="border-t border-white/[0.06]">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/[0.06] transition-colors">
                      <LogOut size={13} className="text-red-400/60" />
                      <span className="text-[12px] text-red-400/60">
                        Sign Out
                      </span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
