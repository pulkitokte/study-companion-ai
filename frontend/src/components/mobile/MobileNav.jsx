import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Brain, Flame, Zap } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquareHeart,
  Swords,
  BarChart3,
  Timer,
  Settings,
} from "lucide-react";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";
import { getProfile } from "../../utils/userProfile.js";

const NAV = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "#00FFC8",
  },
  { path: "/planner", icon: CalendarDays, label: "Planner", color: "#7C6FFF" },
  { path: "/chat", icon: MessageSquareHeart, label: "Chat", color: "#FF6B9D" },
  { path: "/quiz", icon: Swords, label: "Quiz Arena", color: "#FFB347" },
  { path: "/progress", icon: BarChart3, label: "Progress", color: "#4FC3F7" },
  { path: "/focus", icon: Timer, label: "Focus Mode", color: "#B5FF47" },
  { path: "/settings", icon: Settings, label: "Settings", color: "#888" },
];

export default function MobileNav({ className = "" }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { stats } = useGlobalStats();
  const profile = getProfile();
  const name = profile?.name?.split(" ")[0] || "Scholar";
  const initials = (profile?.name || "SC")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className={`p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors md:hidden ${className}`}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-[90] w-[270px] flex flex-col border-r border-white/[0.07] overflow-hidden"
              style={{ background: "#0A0A14" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                    <Brain size={16} className="text-black" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-white tracking-wide">
                      StudyMind
                    </p>
                    <p className="text-[9px] text-[#00FFC8]/50 uppercase tracking-wider">
                      AI Companion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile mini */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
                <div className="relative shrink-0">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-70" />
                  <div className="relative w-10 h-10 rounded-full bg-[#0F0F1E] flex items-center justify-center text-sm font-bold text-white">
                    {initials}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-white truncate">
                    Hey, {name}!
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Zap size={10} className="text-[#7C6FFF]" />
                      <span className="text-[10px] font-bold text-[#7C6FFF]">
                        {(stats.totalXP ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Flame size={10} className="text-[#FF6B2B]" />
                      <span className="text-[10px] font-bold text-[#FF6B2B]">
                        {stats.streak ?? 0}d
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {NAV.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.045 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                        style={{
                          background: isActive
                            ? `${item.color}12`
                            : "transparent",
                          borderLeft: isActive
                            ? `3px solid ${item.color}`
                            : "3px solid transparent",
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color: isActive
                              ? item.color
                              : "rgba(255,255,255,0.38)",
                          }}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span
                          className="text-[13px] font-semibold"
                          style={{
                            color: isActive
                              ? "rgba(255,255,255,0.9)"
                              : "rgba(255,255,255,0.48)",
                          }}
                        >
                          {item.label}
                        </span>
                      </motion.div>
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
