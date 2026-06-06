import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { useSystem } from "../../hooks/useSystem.js";

export default function OfflineBanner() {
  const { networkState, syncStatus, triggerSync } = useSystem();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!networkState.online) {
      setWasOffline(true);
    }
    if (networkState.online && wasOffline) {
      setShowReconnected(true);
      setWasOffline(false);
      triggerSync();
      const t = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(t);
    }
  }, [networkState.online, wasOffline, triggerSync]);

  const isOffline = !networkState.online;
  const show = isOffline || showReconnected;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div
            className="flex items-center justify-center gap-2.5 px-4 py-2 text-center"
            style={{
              background: isOffline
                ? "rgba(255,60,60,0.12)"
                : "rgba(0,255,200,0.1)",
              borderBottom: `1px solid ${isOffline ? "rgba(255,60,60,0.2)" : "rgba(0,255,200,0.2)"}`,
            }}
          >
            {isOffline ? (
              <>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <WifiOff size={13} className="text-[#FF3C3C]" />
                </motion.div>
                <span className="text-[11px] font-bold text-[#FF3C3C]">
                  You&apos;re offline — changes saved locally and will sync when
                  reconnected.
                </span>
                {syncStatus.queue?.pending > 0 && (
                  <span className="text-[10px] text-[#FF3C3C]/60">
                    ({syncStatus.queue.pending} pending)
                  </span>
                )}
              </>
            ) : (
              <>
                <RefreshCw size={12} className="text-[#00FFC8] animate-spin" />
                <span className="text-[11px] font-bold text-[#00FFC8]">
                  Back online — syncing your progress…
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
