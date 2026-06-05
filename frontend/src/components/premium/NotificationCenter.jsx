import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Zap,
  Trophy,
  Flame,
  Target,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { aggregateAll } from "../../utils/globalStats.js";

function buildNotifications(stats) {
  const items = [];
  const now = Date.now();

  if (stats.streak >= 3)
    items.push({
      id: "streak",
      icon: Flame,
      color: "#FF6B2B",
      title: `${stats.streak}-day streak active!`,
      sub: "Bonus XP on every activity today.",
      ts: now - 300000,
    });
  if (stats.achievementsUnlocked > 0)
    items.push({
      id: "ach",
      icon: Trophy,
      color: "#FFD700",
      title: `${stats.achievementsUnlocked} achievements unlocked`,
      sub: "View your achievement grid in Progress.",
      ts: now - 600000,
    });
  if ((stats.todayXP ?? 0) > 0)
    items.push({
      id: "xp",
      icon: Zap,
      color: "#7C6FFF",
      title: `+${stats.todayXP} XP earned today`,
      sub: "Keep going to hit the daily mission target.",
      ts: now - 900000,
    });
  if (
    stats.missions?.done === stats.missions?.total &&
    stats.missions?.total > 0
  ) {
    items.push({
      id: "miss",
      icon: CheckCircle2,
      color: "#00FFC8",
      title: "All missions complete!",
      sub: "Come back tomorrow for new challenges.",
      ts: now - 1200000,
    });
  }
  if (stats.totalFocusSessions > 0)
    items.push({
      id: "focus",
      icon: Timer,
      color: "#B5FF47",
      title: `${stats.totalFocusSessions} focus sessions logged`,
      sub: "Focus is building your cognitive edge.",
      ts: now - 1800000,
    });

  return items.slice(0, 5);
}

function fmtAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const stats = useMemo(() => aggregateAll(), [open]);
  const all = useMemo(() => buildNotifications(stats), [stats]);
  const visible = all.filter((n) => !dismissed.has(n.id));
  const unread = visible.length;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-white/38 hover:text-white/70 hover:bg-white/[0.06] transition-all"
      >
        <Bell size={16} />
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black bg-[#00FFC8]"
          >
            {unread}
          </motion.div>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="absolute right-0 top-[calc(100%+8px)] z-20 w-[300px] rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/60"
              style={{
                background: "rgba(8,8,15,0.98)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,#00FFC8,transparent)",
                }}
              />

              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-[#00FFC8]" />
                  <span className="text-[13px] font-bold text-white">
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#00FFC8]/15 text-[#00FFC8]">
                      {unread}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setDismissed(new Set(all.map((n) => n.id)));
                    setOpen(false);
                  }}
                  className="text-[10px] text-white/28 hover:text-white/55 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-[340px] overflow-y-auto scrollbar-none">
                {visible.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <span className="text-3xl">🔔</span>
                    <p className="text-[12px] text-white/30">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {visible.map((n, i) => {
                      const Icon = n.icon;
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: `${n.color}12`,
                              border: `1px solid ${n.color}20`,
                            }}
                          >
                            <Icon size={14} style={{ color: n.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white/80 leading-tight">
                              {n.title}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5 leading-snug">
                              {n.sub}
                            </p>
                            <p className="text-[9px] text-white/18 mt-1">
                              {fmtAgo(n.ts)}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setDismissed((s) => new Set([...s, n.id]))
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity text-white/22 hover:text-white/55"
                          >
                            <X size={11} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
