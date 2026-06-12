import { motion } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  Server,
  Activity,
} from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime.js";

function StatusDot({ ok, pulse }) {
  return (
    <div className="relative w-2 h-2">
      {pulse && ok && (
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute inset-0 rounded-full"
          style={{ background: "#00FFC8" }}
        />
      )}
      <div
        className="relative w-2 h-2 rounded-full"
        style={{ background: ok ? "#00FFC8" : "#FF3C3C" }}
      />
    </div>
  );
}

export default function RealtimeConsole() {
  const { engineStatus, reconnectNow, presence, devices, eventLog } =
    useRealtime();

  const ROWS = [
    {
      label: "Connection",
      val: engineStatus.connected
        ? "Connected"
        : engineStatus.connecting
          ? "Connecting…"
          : "Disconnected",
      ok: engineStatus.connected,
    },
    {
      label: "Reconnect attempts",
      val: `${engineStatus.reconnectAttempts}/${engineStatus.maxReconnect}`,
      ok: engineStatus.reconnectAttempts === 0,
    },
    { label: "Active users", val: presence.online, ok: true },
    { label: "Devices linked", val: devices.length, ok: true },
    { label: "Events logged", val: eventLog.length, ok: true },
  ];

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div
        className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.05]"
        style={{ background: "rgba(255,255,255,0.025)" }}
      >
        {["#FF5F56", "#FFBD2E", "#27C93F"].map((c, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: c, opacity: 0.7 }}
          />
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <Server size={11} className="text-[#7C6FFF]" />
          <span className="text-[11px] font-bold text-white/55 font-mono">
            realtime.engine
          </span>
        </div>
        <div className="ml-auto">
          {engineStatus.connecting ? (
            <Loader2 size={13} className="text-[#FFB347] animate-spin" />
          ) : engineStatus.connected ? (
            <Wifi size={13} className="text-[#00FFC8]" />
          ) : (
            <WifiOff size={13} className="text-[#FF3C3C]" />
          )}
        </div>
      </div>

      <div className="p-4 space-y-1.5 font-mono">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0"
          >
            <div className="flex items-center gap-2">
              <StatusDot ok={r.ok} pulse={r.ok} />
              <span className="text-[11px] text-white/40">{r.label}</span>
            </div>
            <span className="text-[11px] font-bold text-white/70">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="p-4 pt-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={reconnectNow}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px] border border-[#7C6FFF]/25 bg-[#7C6FFF]/06 text-[#7C6FFF] hover:bg-[#7C6FFF]/12 transition-all"
        >
          <RefreshCw size={13} /> Reconnect Engine
        </motion.button>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#00FFC8]/15 bg-[#00FFC8]/05">
          <Activity size={12} className="text-[#00FFC8] shrink-0" />
          <p className="text-[10px] text-[#00FFC8]/65 leading-relaxed">
            Simulated WebSocket engine. Swap <code>realtimeEngine.js</code>{" "}
            internals with a real socket connection (Socket.io, Supabase
            Realtime, Pusher) — public API stays identical.
          </p>
        </div>
      </div>
    </div>
  );
}
