import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ScrollText, Search, Trash2, Filter } from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useToast } from "../ui/Toast.jsx";

const ACTION_COLORS = {
  admin_unlock: "#00FFC8",
  admin_lock: "#FF6B6B",
  feature_flag_change: "#7C6FFF",
  feature_flags_reset: "#7C6FFF",
  module_reset: "#FFB347",
  question_created: "#00FFC8",
  question_deleted: "#FF6B6B",
  announcement_created: "#00FFC8",
  announcement_deleted: "#FF6B6B",
  events_cleared: "#FFB347",
};

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function fmtAction(action) {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminActionLog() {
  const { actionLog, clearLog } = useAdmin();
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const actionTypes = useMemo(() => {
    const types = new Set(actionLog.map((a) => a.action));
    return ["all", ...types];
  }, [actionLog]);

  const filtered = useMemo(() => {
    return actionLog.filter((entry) => {
      if (filter !== "all" && entry.action !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack =
          `${entry.action} ${JSON.stringify(entry.meta)}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [actionLog, filter, search]);

  const handleClear = () => {
    clearLog();
    show({ type: "info", title: "Audit log cleared", duration: 1800 });
  };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
        <ScrollText size={14} className="text-[#7C6FFF]" />
        <span className="text-[12px] font-bold text-white">
          Admin Audit Log
        </span>
        <span className="text-[10px] text-white/25 ml-1">
          ({filtered.length})
        </span>
        <button
          onClick={handleClear}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] text-[10px] font-bold text-white/30 hover:text-red-400/60 hover:bg-white/[0.04] transition-all"
        >
          <Trash2 size={10} /> Clear
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <Search size={12} className="text-white/25 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log…"
            className="flex-1 bg-transparent text-[11px] text-white placeholder-white/22 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <Filter size={11} className="text-white/22 shrink-0" />
          {actionTypes.slice(0, 6).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all"
              style={{
                background:
                  filter === t ? "rgba(124,111,255,0.15)" : "transparent",
                color: filter === t ? "#7C6FFF" : "rgba(255,255,255,0.25)",
              }}
            >
              {t === "all" ? "All" : fmtAction(t)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[320px] overflow-y-auto scrollbar-none font-mono">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-2xl">📋</span>
            <p className="text-[11px] text-white/25">No log entries</p>
          </div>
        ) : (
          filtered.map((entry, i) => {
            const color = ACTION_COLORS[entry.action] ?? "#888";
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1 shrink-0"
                  style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold" style={{ color }}>
                    {fmtAction(entry.action)}
                  </p>
                  {Object.keys(entry.meta).length > 0 && (
                    <p className="text-[10px] text-white/30 mt-0.5 truncate">
                      {JSON.stringify(entry.meta)}
                    </p>
                  )}
                </div>
                <span className="text-[9px] text-white/18 shrink-0">
                  {fmtTime(entry.timestamp)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
