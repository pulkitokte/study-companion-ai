import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { buildSearchIndex, searchIndex } from "../../utils/searchIndex.js";

const TYPE_COLOR = {
  route: "#00FFC8",
  quiz_category: "#FFB347",
  achievement: "#FFD700",
  task: "#7C6FFF",
  activity: "#4FC3F7",
};

export default function SmartSearch({
  placeholder = "Search StudyMind…",
  className = "",
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const index = useMemo(() => buildSearchIndex(), [open]);
  const results = useMemo(() => {
    if (!query.trim())
      return index.filter((i) => i.type === "route").slice(0, 5);
    return searchIndex(query, index);
  }, [query, index]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[active]) {
        go(results[active]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, results, active]);

  const go = (item) => {
    navigate(item.path);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 60);
        }}
        className="flex items-center gap-2 h-8 px-3 rounded-lg border border-white/[0.08] bg-white/[0.04] cursor-text hover:border-white/[0.14] hover:bg-white/[0.06] transition-all"
        style={{ minWidth: 180 }}
      >
        <Search size={12} className="text-white/35 shrink-0" />
        <span className="text-[12px] text-white/25 flex-1">{placeholder}</span>
        <span className="text-[9px] text-white/18 border border-white/[0.1] rounded px-1.5 py-0.5 font-mono hidden sm:block">
          ⌘K
        </span>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-[calc(100%+6px)] left-0 z-50 w-[320px] rounded-xl border border-white/[0.09] overflow-hidden"
              style={{
                background: "rgba(8,8,15,0.99)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
                <Search size={13} className="text-[#7C6FFF] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search…"
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-white/22 outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-0.5 rounded text-white/28 hover:text-white/60"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="max-h-[280px] overflow-y-auto scrollbar-none py-1.5">
                {results.length === 0 && (
                  <p className="text-center text-[12px] text-white/28 py-6">
                    No results found
                  </p>
                )}
                {results.map((item, i) => {
                  const color = TYPE_COLOR[item.type] ?? "#888";
                  return (
                    <div
                      key={`${item.type}-${i}`}
                      onClick={() => go(item)}
                      className="flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: i === active ? `${color}0E` : "transparent",
                        border: `1px solid ${i === active ? `${color}28` : "transparent"}`,
                      }}
                    >
                      <span className="text-base w-6 text-center">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white/75 truncate">
                          {item.label}
                        </p>
                        <p className="text-[9px] text-white/28 truncate">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight
                        size={11}
                        style={{ color }}
                        className="shrink-0 opacity-50"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
