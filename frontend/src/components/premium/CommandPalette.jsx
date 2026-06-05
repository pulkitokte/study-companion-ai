import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, X, Keyboard } from "lucide-react";
import { buildSearchIndex, searchIndex } from "../../utils/searchIndex.js";

const TYPE_COLOR = {
  route: "#00FFC8",
  quiz_category: "#FFB347",
  achievement: "#FFD700",
  task: "#7C6FFF",
  activity: "#4FC3F7",
};

function ResultRow({ item, active, onClick }) {
  const color = TYPE_COLOR[item.type] ?? "#888";
  return (
    <motion.div
      animate={{ background: active ? `${color}10` : "transparent" }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-xl mx-2 transition-all group"
      style={{ border: `1px solid ${active ? `${color}30` : "transparent"}` }}
    >
      <span className="text-xl w-7 text-center shrink-0">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white/80 truncate">
          {item.label}
        </p>
        <p className="text-[10px] text-white/28 truncate">{item.desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
          style={{ color, background: `${color}15` }}
        >
          {item.type.replace("_", " ")}
        </span>
        <ArrowRight
          size={12}
          className="text-white/20 group-hover:text-white/55 transition-colors"
        />
      </div>
    </motion.div>
  );
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const index = useMemo(() => buildSearchIndex(), [open]);
  const results = useMemo(() => {
    if (!query.trim()) {
      return index.filter((i) => i.type === "route").slice(0, 6);
    }
    return searchIndex(query, index);
  }, [query, index]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[activeIdx]) {
        go(results[activeIdx]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, results, activeIdx]);

  const go = (item) => {
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[600] flex items-start justify-center pt-[10vh] px-4"
          style={{
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(12px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1]"
            style={{
              background: "rgba(8,8,15,0.99)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(124,111,255,0.1)",
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
              }}
            />

            {/* Search bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
              <Search size={17} className="text-[#7C6FFF] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search routes, tasks, subjects…"
                className="flex-1 bg-transparent text-[14px] text-white placeholder-white/22 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg text-white/28 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] border border-white/[0.1] rounded px-1.5 py-0.5 text-white/28 font-mono">
                  ESC
                </span>
              </div>
            </div>

            {/* Results */}
            <div className="py-2 max-h-[360px] overflow-y-auto scrollbar-none">
              {results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-[13px] text-white/30">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}
              {!query && (
                <p className="text-[9px] text-white/22 px-5 pb-1 uppercase tracking-widest">
                  Quick Navigation
                </p>
              )}
              {results.map((item, i) => (
                <ResultRow
                  key={`${item.type}-${item.label}-${i}`}
                  item={item}
                  active={i === activeIdx}
                  onClick={() => go(item)}
                />
              ))}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <div className="flex items-center gap-3 text-[10px] text-white/22">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/18">
                <Keyboard size={11} />
                <span>⌘K</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
