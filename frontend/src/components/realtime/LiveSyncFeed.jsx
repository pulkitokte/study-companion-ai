import { motion, AnimatePresence } from "framer-motion";
import { Activity, Wifi, Users, RefreshCw, Server } from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime.js";

const TYPE_META = {
  system: { icon: Server, color: "#7C6FFF" },
  presence: { icon: Users, color: "#00FFC8" },
  room: { icon: Activity, color: "#FFB347" },
  sync: { icon: RefreshCw, color: "#4FC3F7" },
};

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LiveSyncFeed({ limit = 12 }) {
  const { eventLog, engineStatus } = useRealtime();
  const events = eventLog.slice(0, limit);

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <Wifi size={13} className="text-[#00FFC8]" />
        <span className="text-[12px] font-bold text-white">
          Live Event Feed
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="relative w-1.5 h-1.5">
            {engineStatus.connected && (
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full bg-[#00FFC8]"
              />
            )}
            <div
              className="relative w-1.5 h-1.5 rounded-full"
              style={{
                background: engineStatus.connected ? "#00FFC8" : "#FF3C3C",
              }}
            />
          </div>
          <span
            className="text-[10px]"
            style={{ color: engineStatus.connected ? "#00FFC8" : "#FF3C3C" }}
          >
            {engineStatus.connected
              ? "Live"
              : engineStatus.connecting
                ? "Connecting"
                : "Offline"}
          </span>
        </div>
      </div>

      <div className="max-h-[280px] overflow-y-auto scrollbar-none font-mono">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-2xl">📡</span>
            <p className="text-[11px] text-white/25">Waiting for events…</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((evt) => {
              const meta = TYPE_META[evt.type] ?? TYPE_META.system;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -8, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] last:border-0"
                >
                  <Icon
                    size={11}
                    style={{ color: meta.color }}
                    className="shrink-0"
                  />
                  <p className="flex-1 text-[11px] text-white/55 truncate">
                    {evt.label}
                  </p>
                  <span className="text-[9px] text-white/18 shrink-0">
                    {fmtTime(evt.ts)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
