import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Layers,
  CheckCircle2,
  XCircle,
  Cloud,
  AlertTriangle,
  Terminal,
  Zap,
  Shield,
  Globe,
  Server,
  Activity,
} from "lucide-react";
import { useSystem } from "../hooks/useSystem.js";
import { useToast } from "../components/ui/Toast.jsx";
import { getLogs, clearLogs } from "../lib/errorLogger.js";
import { clearQueue } from "../lib/offlineQueue.js";
import { cacheClear } from "../lib/cacheManager.js";
import { API_ROUTES } from "../lib/apiRoutes.js";
import SystemConsole from "../components/settings/SystemConsole.jsx";
import SyllabusSettingsSection from "../components/syllabus/SyllabusSettingsSection.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function StatusDot({ ok, pulse = false }) {
  const color = ok ? "#00FFC8" : "#FF3C3C";
  return (
    <div className="relative w-2.5 h-2.5 shrink-0">
      {pulse && ok && (
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
        />
      )}
      <div
        className="relative w-2.5 h-2.5 rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

function CheckRow({ label, ok, detail = "" }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <Icon
        size={15}
        style={{ color: ok ? "#00FFC8" : "#FF3C3C" }}
        className="shrink-0"
      />
      <span className="flex-1 text-[12px] text-white/65">{label}</span>
      <span
        className="text-[10px]"
        style={{ color: ok ? "rgba(0,255,200,0.55)" : "rgba(255,60,60,0.55)" }}
      >
        {detail}
      </span>
    </div>
  );
}

function RouteGroup({ name, routes }) {
  return (
    <div>
      <p className="text-[9px] text-white/22 uppercase tracking-widest mb-1.5">
        {name}
      </p>
      <div
        className="rounded-xl border border-white/[0.06] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        {Object.entries(routes).map(([key, val]) => {
          const path = typeof val === "function" ? `${val(":id")}` : val;
          return (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] last:border-0 font-mono"
            >
              <span className="text-[9px] text-[#7C6FFF] font-bold uppercase shrink-0 w-14">
                {key}
              </span>
              <span className="text-[10px] text-white/38 truncate">{path}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function System() {
  const navigate = useNavigate();
  const { show } = useToast();
  const {
    networkState,
    syncStatus,
    cacheStats,
    logStats,
    storageSize,
    systemHealth,
    env,
    triggerSync,
    refreshStats,
  } = useSystem();
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const res = await triggerSync();
    setSyncing(false);
    show({
      type: res.ok ? "mission" : "info",
      title: res.ok ? "Sync complete" : "Sync skipped",
      message: res.ok
        ? `${res.replayed ?? 0} actions replayed`
        : (res.reason ?? ""),
      duration: 2500,
    });
  };

  const handleClearCache = () => {
    cacheClear();
    refreshStats();
    show({
      type: "info",
      title: "Cache cleared",
      message: "All cached data removed",
      duration: 2000,
    });
  };

  const handleClearQueue = () => {
    clearQueue();
    refreshStats();
    show({
      type: "info",
      title: "Queue cleared",
      message: "All pending actions removed",
      duration: 2000,
    });
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConsoleOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#7C6FFF]/25 bg-[#7C6FFF]/07 text-[11px] font-bold text-[#7C6FFF] hover:bg-[#7C6FFF]/14 transition-all"
          >
            <Terminal size={12} /> Console
          </button>
          <button
            onClick={() => {
              refreshStats();
              show({
                type: "info",
                title: "Refreshed",
                message: "Stats updated",
                duration: 1500,
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.06),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
          }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={15} className="text-[#7C6FFF]" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C6FFF]">
                System Monitor
              </span>
            </div>
            <h2 className="text-[24px] font-black text-white">
              Backend Readiness Dashboard
            </h2>
            <p className="text-[12px] text-white/35 mt-1 max-w-md">
              Architecture health, sync status, API routes, and offline queue
              visualization.
            </p>
          </div>
          <div className="flex flex-col items-center px-6 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.025]">
            <motion.div
              animate={{ rotate: systemHealth.score < 80 ? [0, 3, -3, 0] : 0 }}
              transition={{
                repeat: systemHealth.score < 80 ? Infinity : 0,
                duration: 1.5,
              }}
              className="text-4xl mb-1"
            >
              {systemHealth.score >= 80
                ? "✅"
                : systemHealth.score >= 60
                  ? "⚠️"
                  : "❌"}
            </motion.div>
            <p className="text-[28px] font-black text-white leading-none">
              {systemHealth.score}%
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">System Health</p>
          </div>
        </div>
      </motion.div>

      {/* Health checks */}
      <motion.div variants={I}>
        <h3 className="text-[13px] font-bold text-white mb-3">Health Checks</h3>
        <div
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "#0A0A14" }}
        >
          {systemHealth.checks.map((check) => (
            <CheckRow
              key={check.id}
              label={check.label}
              ok={check.ok}
              detail={check.ok ? "Pass" : "Fail"}
            />
          ))}
        </div>
      </motion.div>

      {/* Network + Sync row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Network */}
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2">
            {networkState.online ? (
              <Wifi size={14} className="text-[#00FFC8]" />
            ) : (
              <WifiOff size={14} className="text-[#FF3C3C]" />
            )}
            <span className="text-[12px] font-bold text-white">
              Network State
            </span>
            <StatusDot ok={networkState.online} pulse />
          </div>
          <div className="space-y-2">
            {[
              {
                label: "Status",
                val: networkState.online ? "Online" : "Offline",
                color: networkState.online ? "#00FFC8" : "#FF3C3C",
              },
              {
                label: "Quality",
                val: networkState.quality ?? "unknown",
                color: "#FFB347",
              },
              {
                label: "RTT",
                val: networkState.rtt ? `${networkState.rtt}ms` : "—",
                color: "#7C6FFF",
              },
              {
                label: "Downlink",
                val: networkState.downlinks
                  ? `${networkState.downlinks} Mbps`
                  : "—",
                color: "#4FC3F7",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex justify-between py-1.5 border-b border-white/[0.04]"
              >
                <span className="text-[11px] text-white/32">{s.label}</span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: s.color }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sync */}
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-[#7C6FFF]" />
            <span className="text-[12px] font-bold text-white">
              Sync Engine
            </span>
          </div>
          <div className="space-y-2">
            {[
              {
                label: "Mode",
                val: env.isMock ? "localStorage" : "Backend",
                color: env.isMock ? "#FFB347" : "#00FFC8",
              },
              {
                label: "Syncs Run",
                val: syncStatus.syncCount ?? 0,
                color: "#7C6FFF",
              },
              {
                label: "Pending",
                val: syncStatus.queue?.pending ?? 0,
                color: syncStatus.queue?.pending > 0 ? "#FFB347" : "#00FFC8",
              },
              {
                label: "Dead",
                val: syncStatus.queue?.dead ?? 0,
                color: syncStatus.queue?.dead > 0 ? "#FF3C3C" : "#00FFC8",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex justify-between py-1.5 border-b border-white/[0.04]"
              >
                <span className="text-[11px] text-white/32">{s.label}</span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: s.color }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-[11px] transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
                color: "#fff",
              }}
            >
              <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync Now"}
            </motion.button>
            <button
              onClick={handleClearQueue}
              className="px-3 py-2 rounded-xl border border-white/[0.08] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
            >
              Clear
            </button>
          </div>
        </motion.div>
      </div>

      {/* Cache + Storage + Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Layers,
            title: "Cache",
            color: "#FFB347",
            stats: [
              { l: "Valid", v: cacheStats.valid ?? 0 },
              { l: "Expired", v: cacheStats.expired ?? 0 },
              { l: "Hits", v: cacheStats.hits ?? 0 },
              { l: "Size", v: `${cacheStats.sizeKB ?? 0} KB` },
            ],
            action: {
              label: "Clear Cache",
              fn: handleClearCache,
              color: "#FFB347",
            },
          },
          {
            icon: Database,
            title: "Storage",
            color: "#00FFC8",
            stats: [
              { l: "Used", v: `${storageSize.kb} KB` },
              { l: "Quota", v: "5 MB" },
              { l: "Usage", v: `${storageSize.pct}%` },
              { l: "Status", v: storageSize.pct < 80 ? "Healthy" : "Warning" },
            ],
            action: null,
          },
          {
            icon: AlertTriangle,
            title: "Error Logs",
            color: "#FF6B9D",
            stats: [
              { l: "Total", v: logStats.total ?? 0 },
              { l: "Errors", v: logStats.errors ?? 0 },
              { l: "Warns", v: logStats.warns ?? 0 },
              { l: "Infos", v: logStats.infos ?? 0 },
            ],
            action: {
              label: "Open Console",
              fn: () => setConsoleOpen(true),
              color: "#7C6FFF",
            },
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={I}
              className="rounded-2xl border border-white/[0.06] p-4 space-y-3"
              style={{ background: "#0A0A14" }}
            >
              <div className="flex items-center gap-2">
                <Icon size={13} style={{ color: card.color }} />
                <span className="text-[12px] font-bold text-white">
                  {card.title}
                </span>
              </div>
              <div className="space-y-1.5">
                {card.stats.map((s) => (
                  <div key={s.l} className="flex justify-between">
                    <span className="text-[11px] text-white/30">{s.l}</span>
                    <span className="text-[11px] font-bold text-white/65">
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>
              {card.action && (
                <button
                  onClick={card.action.fn}
                  className="w-full py-1.5 rounded-xl border text-[11px] font-bold transition-all hover:opacity-80"
                  style={{
                    borderColor: `${card.action.color}30`,
                    background: `${card.action.color}0A`,
                    color: card.action.color,
                  }}
                >
                  {card.action.label}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* API Routes */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-2">
          <Server size={14} className="text-[#4FC3F7]" />
          <h3 className="text-[13px] font-bold text-white">
            API Route Registry
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFB347]/12 text-[#FFB347] border border-[#FFB347]/25 ml-auto">
            {env.isMock ? "Mock Mode" : "Backend Ready"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(API_ROUTES)
            .slice(0, 6)
            .map(([group, routes]) => (
              <RouteGroup key={group} name={group} routes={routes} />
            ))}
        </div>
      </motion.div>

      {/* Env config */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-[#7C6FFF]" />
          <h3 className="text-[13px] font-bold text-white">
            Environment Configuration
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            {
              label: "Gemini AI",
              ok: env.hasGemini,
              hint: "VITE_GEMINI_API_KEY",
            },
            {
              label: "Backend URL",
              ok: env.hasBackend,
              hint: "VITE_BACKEND_URL",
            },
            { label: "Supabase", ok: false, hint: "VITE_SUPABASE_URL + KEY" },
            {
              label: "Production Mode",
              ok: env.isProd,
              hint: "VITE_APP_ENV=production",
            },
          ].map((e) => (
            <div
              key={e.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
              style={{
                borderColor: `${e.ok ? "#00FFC8" : "rgba(255,255,255,0.08)"}22`,
                background: `${e.ok ? "rgba(0,255,200,0.05)" : "rgba(255,255,255,0.02)"}`,
              }}
            >
              <StatusDot ok={e.ok} pulse={e.ok} />
              <div>
                <p className="text-[11px] font-semibold text-white/65">
                  {e.label}
                </p>
                <p className="text-[9px] text-white/22 font-mono">{e.hint}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/06">
          <p className="text-[10px] text-[#7C6FFF]/70 leading-relaxed font-mono">
            # To connect a real backend, add to frontend/.env:
            <br />
            VITE_BACKEND_URL=https://your-api.com
            <br />
            VITE_GEMINI_API_KEY=your_key
            <br />
            VITE_SUPABASE_URL=https://xxx.supabase.co
            <br />
            VITE_SUPABASE_ANON_KEY=your_anon_key
          </p>
        </div>
      </motion.div>
      {/* Syllabus Settings */}
      <SyllabusSettingsSection />
      {/* Console overlay */}
      <SystemConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </motion.div>
  );
}
