import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  CloudOff,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  X,
} from "lucide-react";
import { useSystem } from "../../hooks/useSystem.js";

function StatRow({ label, value, color = "rgba(255,255,255,0.55)" }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] text-white/35">{label}</span>
      <span className="text-[11px] font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown";
  }
}

export default function SyncPanel({ open, onClose }) {
  const {
    syncStatus,
    cacheStats,
    storageSize,
    env,
    triggerSync,
    refreshStats,
  } = useSystem();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await triggerSync();
    refreshStats();
    setSyncing(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl"
          style={{
            background: "rgba(8,8,15,0.99)",
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
              <RefreshCw size={13} className="text-[#00FFC8]" />
              <span className="text-[13px] font-bold text-white">
                Sync & Storage
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/25 hover:text-white/55 transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Sync status */}
            <div
              className="rounded-xl border border-white/[0.06] p-3 space-y-1"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[9px] text-white/22 uppercase tracking-widest mb-2">
                Sync
              </p>
              <StatRow label="Last Sync" value={fmtDate(syncStatus.lastSync)} />
              <StatRow label="Total Syncs" value={syncStatus.syncCount ?? 0} />
              <StatRow
                label="Pending"
                value={syncStatus.queue?.pending ?? 0}
                color={syncStatus.queue?.pending > 0 ? "#FFB347" : "#00FFC8"}
              />
              <StatRow
                label="Failed"
                value={syncStatus.queue?.dead ?? 0}
                color={syncStatus.queue?.dead > 0 ? "#FF6B6B" : "#00FFC8"}
              />
              <StatRow
                label="Mode"
                value={env.isMock ? "Mock (localStorage)" : "Backend"}
                color={env.isMock ? "#FFB347" : "#00FFC8"}
              />
            </div>

            {/* Cache */}
            <div
              className="rounded-xl border border-white/[0.06] p-3 space-y-1"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[9px] text-white/22 uppercase tracking-widest mb-2">
                Cache
              </p>
              <StatRow label="Valid entries" value={cacheStats.valid ?? 0} />
              <StatRow label="Expired" value={cacheStats.expired ?? 0} />
              <StatRow
                label="Total hits"
                value={cacheStats.hits ?? 0}
                color="#7C6FFF"
              />
              <StatRow
                label="Cache size"
                value={`${cacheStats.sizeKB ?? 0} KB`}
              />
            </div>

            {/* Storage */}
            <div
              className="rounded-xl border border-white/[0.06] p-3"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[9px] text-white/22 uppercase tracking-widest mb-2">
                localStorage
              </p>
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-white/35">Used</span>
                <span className="text-[11px] font-bold text-white/65">
                  {storageSize.kb} KB / 5 MB
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${storageSize.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      storageSize.pct > 80
                        ? "#FF3C3C"
                        : storageSize.pct > 50
                          ? "#FFB347"
                          : "#00FFC8",
                  }}
                />
              </div>
              <p className="text-[9px] text-white/18 mt-1">
                {storageSize.pct}% of quota
              </p>
            </div>

            {/* Sync button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSync}
              disabled={syncing || !syncStatus.online}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
                color: "#000",
              }}
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing
                ? "Syncing…"
                : syncStatus.online
                  ? "Sync Now"
                  : "Offline"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
