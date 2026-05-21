// FILE PATH: frontend/src/components/dashboard/Sidebar.jsx
// SIDEBAR — primary navigation. Shows all app sections.
// On desktop: fixed left panel, can collapse to icon-only mode.
// On mobile: slides in from left as an overlay when hamburger is tapped.
// Uses Framer Motion for smooth entrance + hover animations.
// Uses React Router's useLocation to highlight the active route.

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
  Zap,
  X,
  Flame,
  Brain,
} from "lucide-react";

// ─── NAV ITEMS ────────────────────────────────────────────────────
// Each item: path, icon, label, accent color for the glow effect
const NAV_ITEMS = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "#00FFC8",
    description: "Mission Control",
  },
  {
    path: "/planner",
    icon: CalendarDays,
    label: "Planner",
    color: "#7C6FFF",
    description: "Study Schedule",
  },
  {
    path: "/chat",
    icon: MessageSquareHeart,
    label: "Chat Companion",
    color: "#FF6B9D",
    description: "AI Study Partner",
  },
  {
    path: "/quiz",
    icon: Swords,
    label: "Quiz Arena",
    color: "#FFB347",
    description: "Test Yourself",
  },
  {
    path: "/progress",
    icon: BarChart3,
    label: "Progress",
    color: "#4FC3F7",
    description: "Track Growth",
  },
  {
    path: "/focus",
    icon: Timer,
    label: "Focus Mode",
    color: "#B5FF47",
    description: "Deep Work",
  },
];

const BOTTOM_ITEMS = [
  {
    path: "/settings",
    icon: Settings,
    label: "Settings",
    color: "#888",
    description: "Preferences",
  },
];

// ─── USER STATS (mock data — will be replaced with real data later) ──
const MOCK_USER = {
  name: "Arjun Singh",
  exam: "UPSC 2026",
  level: 12,
  xp: 3240,
  xpNeeded: 4000,
  streak: 7,
  title: "The Aspirant",
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}) {
  const location = useLocation();

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="
          hidden lg:flex flex-col
          fixed left-0 top-0 h-full z-30
          border-r border-white/[0.06]
          overflow-hidden
        "
        style={{
          background: "linear-gradient(180deg, #0A0A14 0%, #06060F 100%)",
        }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          location={location}
          onClose={onClose}
          isDesktop
        />
      </motion.aside>

      {/* ── MOBILE SIDEBAR ── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="
              flex lg:hidden flex-col
              fixed left-0 top-0 h-full z-30 w-[240px]
              border-r border-white/[0.06]
              overflow-hidden
            "
            style={{
              background: "linear-gradient(180deg, #0A0A14 0%, #06060F 100%)",
            }}
          >
            <SidebarContent
              collapsed={false}
              onToggleCollapse={onToggleCollapse}
              location={location}
              onClose={onClose}
              isDesktop={false}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── SIDEBAR INNER CONTENT ─────────────────────────────────────────
// Extracted so both desktop + mobile share identical markup
function SidebarContent({
  collapsed,
  onToggleCollapse,
  location,
  onClose,
  isDesktop,
}) {
  const xpPercent = Math.round((MOCK_USER.xp / MOCK_USER.xpNeeded) * 100);

  return (
    <div className="flex flex-col h-full select-none">
      {/* ── LOGO / BRAND ── */}
      <div className="relative flex items-center justify-between px-4 h-[64px] shrink-0 border-b border-white/[0.05]">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5"
            >
              {/* Hexagon logo mark */}
              <div className="relative w-8 h-8 shrink-0">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-20 blur-md" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                  <Brain size={16} className="text-black" strokeWidth={2.5} />
                </div>
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-bold tracking-widest text-white uppercase">
                  StudyMind
                </p>
                <p className="text-[9px] tracking-[0.2em] text-[#00FFC8]/60 uppercase">
                  AI Companion
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-8 h-8 mx-auto"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-20 blur-md" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                <Brain size={16} className="text-black" strokeWidth={2.5} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        {!isDesktop && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── USER PROFILE CARD ── */}
      <AnimatePresence mode="wait">
        {!collapsed ? (
          <motion.div
            key="profile-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 py-4 border-b border-white/[0.05] shrink-0"
          >
            {/* Avatar + name row */}
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar with gradient ring */}
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-70" />
                <div className="relative w-9 h-9 rounded-full bg-[#0F0F1E] flex items-center justify-center text-sm font-bold text-white">
                  {MOCK_USER.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">
                  {MOCK_USER.name}
                </p>
                <p className="text-[10px] text-[#00FFC8]/70 truncate">
                  {MOCK_USER.exam}
                </p>
              </div>
            </div>

            {/* Level + Streak row */}
            <div className="flex items-center gap-2 mb-2.5">
              {/* Level badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7C6FFF]/10 border border-[#7C6FFF]/20">
                <Zap size={10} className="text-[#7C6FFF]" />
                <span className="text-[10px] font-bold text-[#7C6FFF]">
                  LVL {MOCK_USER.level}
                </span>
              </div>
              {/* Streak badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF6B2B]/10 border border-[#FF6B2B]/20">
                <Flame size={10} className="text-[#FF6B2B]" />
                <span className="text-[10px] font-bold text-[#FF6B2B]">
                  {MOCK_USER.streak}d
                </span>
              </div>
              {/* Title */}
              <span className="text-[9px] text-white/30 truncate">
                {MOCK_USER.title}
              </span>
            </div>

            {/* XP Progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] text-white/30 tracking-wider uppercase">
                  XP Progress
                </span>
                <span className="text-[9px] text-[#00FFC8]/60">
                  {MOCK_USER.xp}/{MOCK_USER.xpNeeded}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full relative"
                  style={{
                    background: "linear-gradient(90deg, #00FFC8, #7C6FFF)",
                    boxShadow: "0 0 8px rgba(0,255,200,0.5)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          /* Collapsed: just show avatar centered */
          <motion.div
            key="profile-mini"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-3 border-b border-white/[0.05] shrink-0"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-70" />
              <div className="relative w-9 h-9 rounded-full bg-[#0F0F1E] flex items-center justify-center text-xs font-bold text-white">
                {MOCK_USER.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV LINKS ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none">
        {/* Section label */}
        {!collapsed && (
          <p className="px-3 mb-2 text-[9px] tracking-[0.2em] text-white/20 uppercase">
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item, index) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            index={index}
          />
        ))}
      </nav>

      {/* ── BOTTOM SECTION ── */}
      <div className="px-2 py-3 border-t border-white/[0.05] space-y-0.5 shrink-0">
        {BOTTOM_ITEMS.map((item, index) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            index={index}
          />
        ))}

        {/* Desktop collapse toggle */}
        {isDesktop && (
          <button
            onClick={onToggleCollapse}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-white/30 hover:text-white/60
              hover:bg-white/[0.04] transition-all duration-200 group
            "
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
        )}
      </div>
    </div>
  );
}

// ─── INDIVIDUAL NAV ITEM ───────────────────────────────────────────
function NavItem({ item, collapsed, index }) {
  const { path, icon: Icon, label, color, description } = item;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <NavLink to={path}>
        {({ isActive }) => (
          <div
            className={`
              relative flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200 group cursor-pointer
              ${isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}
            `}
            title={collapsed ? label : undefined}
          >
            {/* Active left border glow */}
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Icon with glow effect when active */}
            <div
              className={`
                relative shrink-0 w-5 h-5 flex items-center justify-center
                transition-all duration-200
              `}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-md blur-md opacity-40"
                  style={{ background: color }}
                />
              )}
              <Icon
                size={16}
                style={{ color: isActive ? color : undefined }}
                className={
                  !isActive
                    ? "text-white/40 group-hover:text-white/70 transition-colors"
                    : ""
                }
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>

            {/* Label + description */}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p
                      className={`
                        text-[12px] font-semibold tracking-wide leading-tight truncate
                        ${isActive ? "text-white" : "text-white/50 group-hover:text-white/80"}
                        transition-colors duration-200
                      `}
                    >
                      {label}
                    </p>
                    <p
                      className={`
                      text-[9px] tracking-wide truncate mt-0.5
                      ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"}
                      transition-opacity duration-200
                    `}
                      style={{ color: isActive ? color : "#fff" }}
                    >
                      {description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Active ping dot (collapsed mode) */}
            {isActive && collapsed && (
              <div
                className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
              />
            )}
          </div>
        )}
      </NavLink>
    </motion.div>
  );
}
