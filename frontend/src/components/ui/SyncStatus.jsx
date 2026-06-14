import { useMemo } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudOff, Loader2, CheckCircle2 } from "lucide-react";
import {
  getSyncStatus,
  SyncStatus as SyncStatusEnum,
} from "../../lib/cloudSync.js";
import env from "../../lib/env.js";

const CONFIG = {
  [SyncStatusEnum.MOCK]: {
    icon: Cloud,
    color: "#FFB347",
    label: "Local mode",
    pulse: false,
  },
  [SyncStatusEnum.OFFLINE]: {
    icon: CloudOff,
    color: "#FF6B6B",
    label: "Offline",
    pulse: false,
  },
  [SyncStatusEnum.SYNCING]: {
    icon: Loader2,
    color: "#7C6FFF",
    label: "Syncing…",
    pulse: true,
  },
  [SyncStatusEnum.SYNCED]: {
    icon: CheckCircle2,
    color: "#00FFC8",
    label: "Synced",
    pulse: false,
  },
  [SyncStatusEnum.ERROR]: {
    icon: CloudOff,
    color: "#FFB347",
    label: "Sync error",
    pulse: false,
  },
  [SyncStatusEnum.IDLE]: {
    icon: Cloud,
    color: "#888",
    label: "Not synced",
    pulse: false,
  },
};

export default function SyncStatus({ compact = true }) {
  const status = useMemo(() => getSyncStatus(), []);
  const cfg = CONFIG[status] ?? CONFIG[SyncStatus.IDLE];
  const Icon = cfg.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={cfg.label}>
        {cfg.pulse ? (
          <Loader2
            size={11}
            style={{ color: cfg.color }}
            className="animate-spin"
          />
        ) : (
          <div className="relative w-1.5 h-1.5">
            {status === SyncStatusEnum.SYNCED && (
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 rounded-full"
                style={{ background: cfg.color }}
              />
            )}
            <div
              className="relative w-1.5 h-1.5 rounded-full"
              style={{ background: cfg.color }}
            />
          </div>
        )}
        {!compact && (
          <span
            className="text-[10px] font-semibold"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border"
      style={{ borderColor: `${cfg.color}20`, background: `${cfg.color}07` }}
    >
      {cfg.pulse ? (
        <Loader2
          size={12}
          style={{ color: cfg.color }}
          className="animate-spin"
        />
      ) : (
        <Icon size={12} style={{ color: cfg.color }} />
      )}
      <span className="text-[10px] font-bold" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}
