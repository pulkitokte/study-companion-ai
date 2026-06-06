import { motion } from "framer-motion";
import { Wifi, WifiOff, Globe } from "lucide-react";
import { useSystem } from "../../hooks/useSystem.js";

const QUALITY_CFG = {
  fast: { color: "#00FFC8", label: "Fast", icon: Wifi },
  slow: { color: "#FFB347", label: "Slow", icon: Wifi },
  unknown: { color: "#7C6FFF", label: "Online", icon: Globe },
  offline: { color: "#FF3C3C", label: "Offline", icon: WifiOff },
};

export default function NetworkBadge({ showLabel = false }) {
  const { networkState } = useSystem();
  const quality = networkState.online
    ? (networkState.quality ?? "unknown")
    : "offline";
  const cfg = QUALITY_CFG[quality] ?? QUALITY_CFG.unknown;
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-1.5" title={`Network: ${cfg.label}`}>
      <div className="relative w-2 h-2">
        {networkState.online && (
          <motion.div
            animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: cfg.color }}
          />
        )}
        <div
          className="relative w-2 h-2 rounded-full"
          style={{ background: cfg.color }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-bold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}
