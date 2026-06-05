import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Zap,
  Star,
  Trophy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { stats } = useGlobalStats();
  const [open, setOpen] = useState(false);

  const name = user?.name ?? "Scholar";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";
  const exam = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("studymind_profile") ?? "{}")
          ?.targetExam ?? "Exam"
      );
    } catch {
      return "Exam";
    }
  })();

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => openAuthModal("login")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
      >
        <User size={13} /> Sign In
      </button>
    );
  }

  const MENU_ITEMS = [
    {
      icon: User,
      label: "Profile",
      action: () => {
        navigate("/profile");
        setOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      action: () => {
        navigate("/settings");
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/[0.06] transition-all group"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-60 group-hover:opacity-90 transition-opacity" />
          <div className="relative w-7 h-7 rounded-full bg-[#0F0F1E] flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
        </div>
        <ChevronDown
          size={11}
          className={`text-white/28 transition-transform duration-200 hidden sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.94 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-[calc(100%+8px)] z-20 w-[220px] rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/60"
              style={{ background: "#0D0D1A", backdropFilter: "blur(20px)" }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,#7C6FFF,transparent)",
                }}
              />

              {/* User info */}
              <div className="px-4 py-3.5 border-b border-white/[0.06]">
                <p className="text-[13px] font-bold text-white truncate">
                  {name}
                </p>
                <p className="text-[10px] text-[#00FFC8]/55 truncate">{exam}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-[#7C6FFF]" />
                    <span className="text-[10px] font-bold text-[#7C6FFF]">
                      {(stats.totalXP ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-[#FFB347]" />
                    <span className="text-[10px] font-bold text-[#FFB347]">
                      Lv.{stats.level ?? 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy size={10} className="text-[#FFD700]" />
                    <span className="text-[10px] font-bold text-[#FFD700]">
                      {stats.achievementsUnlocked ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rank badge */}
              {stats.rank && (
                <div
                  className="px-4 py-2 border-b border-white/[0.05]"
                  style={{ background: `${stats.rank.color}08` }}
                >
                  <p
                    className="text-[10px] font-bold"
                    style={{ color: stats.rank.color }}
                  >
                    {stats.rank.emoji} {stats.rank.label} ·{" "}
                    {stats.rank.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              {MENU_ITEMS.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                >
                  <Icon size={13} className="text-white/38" />
                  <span className="text-[12px] text-white/58">{label}</span>
                </button>
              ))}

              <div className="border-t border-white/[0.06]">
                <button
                  onClick={async () => {
                    await logout();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/[0.07] transition-colors"
                >
                  <LogOut size={13} className="text-red-400/55" />
                  <span className="text-[12px] text-red-400/55">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
