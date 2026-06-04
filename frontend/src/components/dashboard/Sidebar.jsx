import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquareHeart,
  Swords,
  BarChart3,
  Timer,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Flame,
  Zap,
} from "lucide-react";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";
import { getProfile } from "../../utils/userProfile.js";

const NAV = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "#00FFC8",
    desc: "Mission Control",
  },
  {
    path: "/planner",
    icon: CalendarDays,
    label: "Planner",
    color: "#7C6FFF",
    desc: "Study Schedule",
  },
  {
    path: "/chat",
    icon: MessageSquareHeart,
    label: "Chat",
    color: "#FF6B9D",
    desc: "AI Study Partner",
  },
  {
    path: "/quiz",
    icon: Swords,
    label: "Quiz Arena",
    color: "#FFB347",
    desc: "Test Yourself",
  },
  {
    path: "/progress",
    icon: BarChart3,
    label: "Progress",
    color: "#4FC3F7",
    desc: "Track Growth",
  },
  {
    path: "/focus",
    icon: Timer,
    label: "Focus Mode",
    color: "#B5FF47",
    desc: "Deep Work",
  },
  {
    path: "/settings",
    icon: Settings,
    label: "Settings",
    color: "#888",
    desc: "Preferences",
  },
];

// Desktop-only sidebar (mobile uses BottomTabs + MobileNav)
export default function Sidebar({ collapsed, onToggleCollapse }) {
  const w = collapsed ? 72 : 240;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 border-r border-white/[0.06] overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0A0A14 0%,#06060F 100%)" }}
    >
      <SidebarInner collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </motion.aside>
  );
}

function SidebarInner({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const { stats } = useGlobalStats();
  const profile = getProfile();

  const name = profile?.name?.trim() || "Scholar";
  const exam = profile?.targetExam || "Exam";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";
  const level = stats.level ?? 1;
  const streak = stats.streak ?? 0;
  const totalXP = stats.totalXP ?? 0;
  const pct = stats.levelPct ?? 0;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-[64px] shrink-0 border-b border-white/[0.05]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2.5"
            >
              <div className="relative w-8 h-8 shrink-0">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-18 blur-md" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                  <Brain size={16} className="text-black" strokeWidth={2.5} />
                </div>
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-bold tracking-widest text-white uppercase">
                  StudyMind
                </p>
                <p className="text-[9px] tracking-[0.2em] text-[#00FFC8]/55 uppercase">
                  AI Companion
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-8 h-8 mx-auto"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-18 blur-md" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                <Brain size={16} className="text-black" strokeWidth={2.5} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile card */}
      <AnimatePresence mode="wait">
        {!collapsed ? (
          <motion.div
            key="pf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="px-3 py-4 border-b border-white/[0.05] shrink-0"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-70" />
                <div className="relative w-9 h-9 rounded-full bg-[#0F0F1E] flex items-center justify-center text-sm font-bold text-white">
                  {initials}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">
                  {name}
                </p>
                <p className="text-[10px] text-[#00FFC8]/65 truncate">{exam}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7C6FFF]/10 border border-[#7C6FFF]/20">
                <Zap size={10} className="text-[#7C6FFF]" />
                <span className="text-[10px] font-bold text-[#7C6FFF]">
                  LVL {level}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF6B2B]/10 border border-[#FF6B2B]/20">
                <Flame size={10} className="text-[#FF6B2B]" />
                <span className="text-[10px] font-bold text-[#FF6B2B]">
                  {streak}d
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] text-white/25 tracking-wider uppercase">
                  XP
                </span>
                <span className="text-[9px] text-[#00FFC8]/50">
                  {totalXP.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg,#00FFC8,#7C6FFF)",
                    boxShadow: "0 0 8px rgba(0,255,200,0.4)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pf-mini"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-3 border-b border-white/[0.05] shrink-0"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-70" />
              <div className="relative w-9 h-9 rounded-full bg-[#0F0F1E] flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-none">
        {!collapsed && (
          <p className="px-3 mb-2 text-[9px] tracking-[0.2em] text-white/18 uppercase">
            Navigation
          </p>
        )}
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.26, delay: i * 0.04 }}
            >
              <NavLink
                to={item.path}
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <div
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-full"
                        style={{
                          background: item.color,
                          boxShadow: `0 0 8px ${item.color}`,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <div className="relative shrink-0 w-5 h-5 flex items-center justify-center">
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-md blur-sm opacity-40"
                          style={{ background: item.color }}
                        />
                      )}
                      <Icon
                        size={16}
                        style={{ color: isActive ? item.color : undefined }}
                        className={
                          !isActive
                            ? "text-white/38 group-hover:text-white/65 transition-colors"
                            : ""
                        }
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    {!collapsed && (
                      <div className="min-w-0">
                        <p
                          className={`text-[12px] font-semibold leading-tight truncate ${isActive ? "text-white" : "text-white/48 group-hover:text-white/75"} transition-colors`}
                        >
                          {item.label}
                        </p>
                        {isActive && (
                          <p
                            className="text-[9px] truncate mt-0.5 opacity-55"
                            style={{ color: item.color }}
                          >
                            {item.desc}
                          </p>
                        )}
                      </div>
                    )}
                    {isActive && collapsed && (
                      <div
                        className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full"
                        style={{
                          background: item.color,
                          boxShadow: `0 0 6px ${item.color}`,
                        }}
                      />
                    )}
                  </div>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-white/[0.05] shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/28 hover:text-white/55 hover:bg-white/[0.04] transition-all group"
        >
          <div className="shrink-0 w-5 h-5 flex items-center justify-center">
            {collapsed ? (
              <ChevronRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            ) : (
              <ChevronLeft
                size={14}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            )}
          </div>
          {!collapsed && (
            <span className="text-[11px] tracking-wide">Collapse</span>
          )}
        </button>
      </div>
    </div>
  );
}
