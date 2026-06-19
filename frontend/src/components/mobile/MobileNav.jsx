import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Swords,
  Timer,
  CalendarDays,
  MessageSquare,
  BarChart3,
  BookOpen,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/quiz", label: "Quiz", icon: Swords },
  { path: "/focus", label: "Focus", icon: Timer },
  { path: "/planner", label: "Planner", icon: CalendarDays },
  { path: "/syllabus", label: "Syllabus", icon: BookOpen },
  { path: "/progress", label: "Progress", icon: BarChart3 },
  { path: "/chat", label: "Chat", icon: MessageSquare },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around px-1 pb-safe"
      style={{
        background: "rgba(5,5,12,0.96)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 8,
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active =
          pathname === path ||
          (path !== "/dashboard" && pathname.startsWith(path));

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="relative flex flex-col items-center gap-[3px] px-2 py-1 min-w-0"
            style={{ flex: 1 }}
          >
            {active && (
              <motion.div
                layoutId="mobile-nav-pill"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                style={{ background: "#00FFC8" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <Icon
              size={18}
              style={{
                color: active
                  ? path === "/syllabus"
                    ? "#7C6FFF"
                    : "#00FFC8"
                  : "rgba(255,255,255,0.28)",
                filter: active
                  ? `drop-shadow(0 0 4px ${path === "/syllabus" ? "#7C6FFF" : "#00FFC8"}80)`
                  : "none",
                transition: "color 0.18s, filter 0.18s",
              }}
            />
            <span
              className="text-[9px] font-bold leading-none truncate"
              style={{
                color: active
                  ? "rgba(255,255,255,0.80)"
                  : "rgba(255,255,255,0.22)",
                transition: "color 0.18s",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
