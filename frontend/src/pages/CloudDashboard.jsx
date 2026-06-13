import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Layers,
  Clock,
  GitMerge,
} from "lucide-react";
import { useCloud } from "../hooks/useCloud.js";
import { useToast } from "../components/ui/Toast.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function fmtDate(iso) {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "Unknown";
  }
}

function StatusDot({ ok, pulse }) {
  return (
    <div className="relative w-2.5 h-2.5 shrink-0">
      {pulse && ok && (
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute inset-0 rounded-full"
          style={{ background: "#00FFC8" }}
        />
      )}
      <div
        className="relative w-2.5 h-2.5 rounded-full"
        style={{ background: ok ? "#00FFC8" : "#FF3C3C" }}
      />
    </div>
  );
}

export default function CloudDashboard() {
  const navigate = useNavigate();
  const { show } = useToast();
  const {
    configStatus,
    cloudEnabled,
    provider,
    online,
    syncing,
    syncState,
    syncLog,
    queueStats,
    triggerSync,
    refresh,
    wipeLog,
  } = useCloud();

  const handleSync = async () => {
    if (!online) {
      show({
        type: "info",
        title: "Offline",
        message: "Cannot sync while offline",
        duration: 2000,
      });
      return;
    }
    const result = await triggerSync();
    show({
      type: result.ok ? "mission" : "info",
      title: result.ok ? "Cloud sync complete" : "Sync skipped",
      message: result.ok
        ? `${result.results?.length ?? 0} namespaces synced`
        : (result.reason ?? ""),
      duration: 2500,
    });
  };

  const handleClearLog = () => {
    wipeLog();
    show({ type: "info", title: "Sync log cleared", duration: 1500 });
  };

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* Header */}
      <motion.div
        variants={I}
        className="flex items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(0,255,200,0.08),rgba(124,111,255,0.08),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#00FFC8,#7C6FFF,transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-1">
          {cloudEnabled ? (
            <Cloud size={15} className="text-[#00FFC8]" />
          ) : (
            <CloudOff size={15} className="text-[#FFB347]" />
          )}
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: cloudEnabled ? "#00FFC8" : "#FFB347" }}
          >
            {cloudEnabled ? "Cloud Connected" : "Mock Cloud Mode"}
          </span>
        </div>
        <h2 className="text-[24px] font-black text-white">
          Cloud Sync Dashboard
        </h2>
        <p className="text-[12px] text-white/35 mt-1 max-w-lg">
          Multi-device sync engine —{" "}
          {provider === "supabase"
            ? "Supabase configured"
            : "running on localStorage with simulated cloud round-trips"}
          .
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              icon: online ? Wifi : WifiOff,
              val: online ? "Online" : "Offline",
              label: "Network",
              color: online ? "#00FFC8" : "#FF3C3C",
            },
            {
              icon: RefreshCw,
              val: syncState.syncCount ?? 0,
              label: "Syncs Run",
              color: "#7C6FFF",
            },
            {
              icon: GitMerge,
              val: syncState.conflicts ?? 0,
              label: "Conflicts",
              color: (syncState.conflicts ?? 0) > 0 ? "#FFB347" : "#00FFC8",
            },
            {
              icon: Layers,
              val: queueStats.pending ?? 0,
              label: "Queued",
              color: (queueStats.pending ?? 0) > 0 ? "#FFB347" : "#00FFC8",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/[0.06]"
                style={{ background: `${s.color}06` }}
              >
                <Icon size={14} style={{ color: s.color }} />
                <span className="text-[16px] font-black text-white leading-none">
                  {s.val}
                </span>
                <span className="text-[9px] text-white/25 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Connection + Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5 space-y-3"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2">
            <Database size={14} className="text-[#7C6FFF]" />
            <span className="text-[12px] font-bold text-white">
              Configuration Status
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[11px] text-white/32">Provider</span>
              <span
                className="text-[11px] font-bold"
                style={{ color: cloudEnabled ? "#00FFC8" : "#FFB347" }}
              >
                {provider === "supabase" ? "Supabase" : "Mock (localStorage)"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[11px] text-white/32">Last Full Sync</span>
              <span className="text-[11px] font-bold text-white/65">
                {fmtDate(syncState.lastFullSync)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[11px] text-white/32">Config Valid</span>
              <div className="flex items-center gap-1.5">
                <StatusDot ok={configStatus.valid} pulse={configStatus.valid} />
                <span
                  className="text-[11px] font-bold"
                  style={{ color: configStatus.valid ? "#00FFC8" : "#FF3C3C" }}
                >
                  {configStatus.valid ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {configStatus.issues.length > 0 && (
            <div className="px-3 py-2.5 rounded-xl border border-[#FFB347]/20 bg-[#FFB347]/06 space-y-1">
              {configStatus.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle
                    size={11}
                    className="text-[#FFB347] shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] text-[#FFB347]/80">{issue}</p>
                </div>
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSync}
            disabled={syncing || !online}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px] transition-all disabled:opacity-50"
          >
            <span
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
                color: "#000",
              }}
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing
                ? "Syncing…"
                : online
                  ? "Run Full Cloud Sync"
                  : "Offline"}
            </span>
          </motion.button>
        </motion.div>

        {/* Queue */}
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5 space-y-3"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#FFB347]" />
            <span className="text-[12px] font-bold text-white">
              Offline Queue
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[11px] text-white/32">Total Items</span>
              <span className="text-[11px] font-bold text-white/65">
                {queueStats.total ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[11px] text-white/32">Pending</span>
              <span
                className="text-[11px] font-bold"
                style={{
                  color: (queueStats.pending ?? 0) > 0 ? "#FFB347" : "#00FFC8",
                }}
              >
                {queueStats.pending ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
              <span className="text-[11px] text-white/32">High Priority</span>
              <span className="text-[11px] font-bold text-white/65">
                {queueStats.high ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[11px] text-white/32">
                Dead (max retries)
              </span>
              <span
                className="text-[11px] font-bold"
                style={{
                  color: (queueStats.dead ?? 0) > 0 ? "#FF6B6B" : "#00FFC8",
                }}
              >
                {queueStats.dead ?? 0}
              </span>
            </div>
          </div>
          <div className="px-3 py-2.5 rounded-xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/06">
            <p className="text-[10px] text-[#7C6FFF]/70 leading-relaxed">
              Actions are queued via <code>offlineQueue.js</code> while offline
              and replayed automatically by <code>syncScheduler.js</code> on
              reconnect.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sync log */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
          <Clock size={13} className="text-[#4FC3F7]" />
          <span className="text-[12px] font-bold text-white">Sync History</span>
          <span className="ml-auto text-[10px] text-white/25">
            {syncLog.length} entries
          </span>
          <button
            onClick={handleClearLog}
            className="text-[10px] text-white/25 hover:text-red-400/60 transition-colors"
          >
            Clear
          </button>
        </div>
        {syncLog.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-2xl">📡</span>
            <p className="text-[12px] text-white/25">
              No sync activity yet — run a full sync above
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto scrollbar-none font-mono">
            {syncLog.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0"
              >
                {entry.status === "synced" ? (
                  <CheckCircle2 size={13} className="text-[#00FFC8] shrink-0" />
                ) : entry.status === "skipped" ? (
                  <AlertTriangle
                    size={13}
                    className="text-[#FFB347] shrink-0"
                  />
                ) : (
                  <XCircle size={13} className="text-[#FF3C3C] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/65">
                    <span className="font-bold">{entry.namespace}</span>
                    {" · "}
                    {entry.status}
                    {entry.source && (
                      <span className="text-white/30"> · {entry.source}</span>
                    )}
                    {entry.conflict && (
                      <span className="text-[#FFB347]">
                        {" "}
                        · resolved conflict
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-[9px] text-white/18 shrink-0">
                  {fmtDate(entry.ts)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
