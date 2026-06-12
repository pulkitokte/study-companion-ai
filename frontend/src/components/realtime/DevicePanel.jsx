import { motion } from "framer-motion";
import {
  Smartphone,
  Tablet,
  Monitor,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime.js";
import {
  trustDevice,
  removeDevice,
  getAllDevices,
} from "../../lib/deviceManager.js";
import { useToast } from "../ui/Toast.jsx";

const TYPE_ICON = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };

function fmtAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

export default function DevicePanel() {
  const { devices, deviceStats, refreshAll } = useRealtime();
  const { show } = useToast();

  const handleTrust = (id, current) => {
    trustDevice(id, !current);
    refreshAll();
    show({
      type: "info",
      title: !current ? "Device trusted" : "Trust revoked",
      message: "Device list updated",
      duration: 2000,
    });
  };

  const handleRemove = (id) => {
    removeDevice(id);
    refreshAll();
    show({
      type: "info",
      title: "Device removed",
      message: "Session ended for this device",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
          Connected Devices
        </p>
        <div className="flex items-center gap-3 text-[10px] text-white/28">
          <span>{deviceStats.active} active</span>
          <span>·</span>
          <span>{deviceStats.trusted} trusted</span>
        </div>
      </div>

      <div className="space-y-2">
        {devices.map((d, i) => {
          const Icon = TYPE_ICON[d.type] ?? Monitor;
          const isActive =
            Date.now() - new Date(d.lastActive).getTime() < 30 * 60 * 1000;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06]"
              style={{
                background: isActive
                  ? "rgba(0,255,200,0.04)"
                  : "rgba(255,255,255,0.015)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isActive
                    ? "rgba(0,255,200,0.1)"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color: isActive ? "#00FFC8" : "rgba(255,255,255,0.35)",
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-white/72 truncate">
                    {d.label}
                  </p>
                  {d.simulated && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-white/25">
                      SIMULATED
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#00FFC8]/12 text-[#00FFC8]">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/28">
                  {d.os} · Last active {fmtAgo(d.lastActive)}
                </p>
              </div>
              {!d.simulated && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTrust(d.id, d.trusted)}
                    title={d.trusted ? "Trusted" : "Mark trusted"}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{
                      color: d.trusted ? "#00FFC8" : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {d.trusted ? (
                      <ShieldCheck size={14} />
                    ) : (
                      <Shield size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(d.id)}
                    className="p-1.5 rounded-lg text-white/22 hover:text-red-400/60 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
