import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquareHeart,
  Swords,
  Timer,
  BarChart3,
} from "lucide-react";

const TABS = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Home",
    color: "#00FFC8",
  },
  { path: "/quiz", icon: Swords, label: "Quiz", color: "#FFB347" },
  { path: "/focus", icon: Timer, label: "Focus", color: "#B5FF47" },
  { path: "/chat", icon: MessageSquareHeart, label: "Chat", color: "#FF6B9D" },
  { path: "/progress", icon: BarChart3, label: "Stats", color: "#7C6FFF" },
];

export default function BottomTabs() {
  const location = useLocation();

  // Hide during onboarding
  if (location.pathname === "/onboarding") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] flex md:hidden items-stretch border-t border-white/[0.08] safe-area-inset-bottom"
      style={{
        background: "rgba(5,5,12,0.96)",
        backdropFilter: "blur(20px)",
        paddingBottom: "env(safe-area-inset-bottom,0px)",
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <NavLink key={tab.path} to={tab.path} className="flex-1">
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
            >
              {/* Active pill bg */}
              {isActive && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute inset-x-3 inset-y-1 rounded-xl"
                  style={{ background: `${tab.color}12` }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}

              <div className="relative">
                {isActive && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full blur-sm"
                    style={{ background: tab.color }}
                  />
                )}
                <Icon
                  size={20}
                  className="relative transition-colors duration-200"
                  style={{
                    color: isActive ? tab.color : "rgba(255,255,255,0.28)",
                  }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              <span
                className="text-[9px] font-bold transition-colors duration-200 relative"
                style={{
                  color: isActive ? tab.color : "rgba(255,255,255,0.28)",
                }}
              >
                {tab.label}
              </span>
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
}
