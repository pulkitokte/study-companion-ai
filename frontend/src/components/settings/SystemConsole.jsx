import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, RefreshCw, Trash2, ChevronDown } from "lucide-react";
import { getLogs, clearLogs } from "../../lib/errorLogger.js";
import { useSystem } from "../../hooks/useSystem.js";
import { useToast } from "../ui/Toast.jsx";

const LEVEL_CFG = {
  error: { color: "#FF3C3C", bg: "rgba(255,60,60,0.08)" },
  warn: { color: "#FFB347", bg: "rgba(255,179,71,0.08)" },
  info: { color: "#00FFC8", bg: "rgba(0,255,200,0.06)" },
  debug: { color: "#7C6FFF", bg: "rgba(124,111,255,0.06)" },
};

export default function SystemConsole({ open, onClose }) {
  const { logStats, refreshStats } = useSystem();
  const { show } = useToast();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const allLogs = useMemo(() => getLogs(), [logStats, open]);
  const filtered =
    filter === "all" ? allLogs : allLogs.filter((l) => l.level === filter);

  const handleClear = () => {
    clearLogs();
    refreshStats();
    show({
      type: "info",
      title: "Logs cleared",
      message: "Console history cleared",
      duration: 2000,
    });
  };

  function fmtTime(iso) {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="fixed bottom-4 right-4 z-[400] w-[420px] max-w-[95vw] rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl"
          style={{
            background: "rgba(4,4,10,0.99)",
            backdropFilter: "blur(20px)",
            maxHeight: "60vh",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
            }}
          />

          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.025)" }}
          >
            <div className="flex items-center gap-1.5">
              {["#FF5F56", "#FFBD2E", "#27C93F"].map((c, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: c, opacity: 0.7 }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <Terminal size={12} className="text-[#7C6FFF]" />
              <span className="text-[11px] font-bold text-white/55 font-mono">
                studymind.console
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={refreshStats}
                className="p-1 rounded text-white/22 hover:text-white/55 transition-colors"
              >
                <RefreshCw size={11} />
              </button>
              <button
                onClick={handleClear}
                className="p-1 rounded text-white/22 hover:text-red-400/60 transition-colors"
              >
                <Trash2 size={11} />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded text-white/22 hover:text-white/55 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.05]">
            {["all", "error", "warn", "info"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-2.5 py-0.5 rounded text-[10px] font-bold transition-all uppercase"
                style={{
                  background:
                    filter === f ? "rgba(124,111,255,0.15)" : "transparent",
                  color: filter === f ? "#7C6FFF" : "rgba(255,255,255,0.25)",
                }}
              >
                {f}
                {f === "error" && logStats.errors > 0 && (
                  <span className="ml-1 text-[9px] text-[#FF3C3C]">
                    ({logStats.errors})
                  </span>
                )}
              </button>
            ))}
            <span className="ml-auto text-[9px] text-white/15">
              {filtered.length} entries
            </span>
          </div>

          {/* Log list */}
          <div
            className="overflow-y-auto scrollbar-none font-mono"
            style={{ maxHeight: "calc(60vh - 100px)" }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="text-2xl">✨</span>
                <p className="text-[11px] text-white/25">No logs found</p>
              </div>
            ) : (
              filtered.map((entry, i) => {
                const cfg = LEVEL_CFG[entry.level] ?? LEVEL_CFG.info;
                const isExpanded = expanded === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : entry.id)}
                  >
                    <div className="flex items-start gap-2 px-3 py-2">
                      <span
                        className="text-[9px] font-bold uppercase shrink-0 mt-0.5 px-1 py-0.5 rounded"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {entry.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/65 leading-snug truncate">
                          {entry.message}
                        </p>
                        <p className="text-[9px] text-white/20 mt-0.5">
                          {fmtTime(entry.timestamp)} · {entry.url}
                        </p>
                      </div>
                      <ChevronDown
                        size={11}
                        className="text-white/18 shrink-0 mt-1"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </div>
                    {isExpanded && entry.context && entry.context !== "{}" && (
                      <div className="px-3 pb-2">
                        <pre className="text-[9px] text-white/30 bg-white/[0.03] rounded p-2 overflow-x-auto">
                          {entry.context}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
