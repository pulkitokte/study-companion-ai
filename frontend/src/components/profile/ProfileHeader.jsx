import { motion } from "framer-motion";
// FIX: removed unused `Cloud` import.
// FIX: added missing `SyncStatusBadge` import — component was rendered in JSX
//      but never imported, causing "ReferenceError: SyncStatusBadge is not defined"
//      on every Profile page render.
import { Shield, Zap, Flame, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { useGlobalStats } from "../../hooks/useGlobalStats.js";
import SyncStatusBadge from "../ui/SyncStatus.jsx";
import env from "../../lib/env.js";

export default function ProfileHeader({ onSignIn }) {
  const { user, isAuthenticated } = useAuth();
  const { profile, syncing } = useUser();
  const { stats } = useGlobalStats();

  const name = user?.name || profile?.name || "Scholar";
  const email = user?.email || null;
  const exam = profile?.targetExam || "Not set";
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";
  const joinedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6 md:p-8"
      style={{
        background:
          "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.06),rgba(5,5,12,0))",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-56 h-40 opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle,#7C6FFF,transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background:
            "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
        }}
      />

      <div className="relative flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -inset-1.5 rounded-full blur-xl"
            style={{ background: "linear-gradient(135deg,#00FFC8,#7C6FFF)" }}
          />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center text-3xl font-black text-black select-none">
            {initials}
          </div>
          {syncing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-t-transparent border-[#00FFC8] bg-[#050508]"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-[22px] font-black text-white leading-tight">
              {name}
            </h2>
            {isAuthenticated && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#00FFC8]/28 bg-[#00FFC8]/08 text-[#00FFC8]">
                ✓ Signed In
              </span>
            )}
            {!isAuthenticated && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#FFB347]/28 bg-[#FFB347]/08 text-[#FFB347]">
                LOCAL
              </span>
            )}
            {env.isMock && (
              <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/[0.1] text-white/28">
                Mock Mode
              </span>
            )}
          </div>

          {email && <p className="text-[12px] text-white/38 mb-0.5">{email}</p>}
          <p className="text-[11px] text-white/28">
            {exam}
            {joinedAt ? ` · Joined ${joinedAt}` : ""}
          </p>
          {profile?.dreamGoal && (
            <p className="text-[11px] text-[#00FFC8]/60 mt-0.5">
              Goal: {profile.dreamGoal}
            </p>
          )}

          {/* Mini stats + sync badge */}
          <div className="flex flex-wrap gap-3 mt-3">
            {[
              {
                icon: Zap,
                val: `${(stats.totalXP ?? 0).toLocaleString()} XP`,
                color: "#7C6FFF",
              },
              {
                icon: Flame,
                val: `${stats.streak ?? 0}d streak`,
                color: "#FF6B2B",
              },
              {
                icon: Star,
                val: `Level ${stats.level ?? 1}`,
                color: "#FFB347",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.val} className="flex items-center gap-1.5">
                  <Icon size={12} style={{ color: s.color }} />
                  <span className="text-[11px] font-bold text-white/65">
                    {s.val}
                  </span>
                </div>
              );
            })}
            {stats.rank && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm leading-none">{stats.rank.emoji}</span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: stats.rank.color }}
                >
                  {stats.rank.label}
                </span>
              </div>
            )}
            {/* SyncStatusBadge — now correctly imported above */}
            <SyncStatusBadge compact={false} />
          </div>
        </div>
      </div>

      {/* Cloud sync CTA for unauthenticated users */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mt-5 flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/07"
        >
          <Shield size={15} className="text-[#7C6FFF] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white">
              Unlock cloud sync &amp; multi-device access
            </p>
            <p className="text-[10px] text-white/35 mt-0.5">
              Your data currently lives only on this browser.
            </p>
          </div>
          <button
            onClick={onSignIn}
            className="shrink-0 px-4 py-2 rounded-xl font-bold text-[12px] transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
              color: "#fff",
            }}
          >
            Sign Up Free
          </button>
        </motion.div>
      )}
    </div>
  );
}
