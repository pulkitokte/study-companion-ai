import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";
import SearchResultCard from "./SearchResultCard.jsx";

/**
 * SearchResults
 *
 * Floating overlay that renders scored search results below the SearchBar.
 * Handles click-outside and Escape key dismissal.
 * No service calls. Fully prop-driven.
 *
 * Props:
 *   results  {Array}    scored + enriched result entries from runSearch()
 *   query    {string}   raw user query (forwarded to SearchResultCard for highlight)
 *   isOpen   {boolean}  controls AnimatePresence visibility
 *   onSelect {function} (result) => void — forwarded from parent
 *   onClose  {function} () => void — called on click-outside or Escape
 */
export default function SearchResults({
  results,
  query,
  isOpen,
  onSelect,
  onClose,
}) {
  const panelRef = useRef(null);

  // ── Click outside ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose]);

  // ── Escape key ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const hasResults = Array.isArray(results) && results.length > 0;
  const noResults =
    Array.isArray(results) && results.length === 0 && query.length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          key="search-results"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute left-0 right-0 z-[500] mt-2 rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(24px)",
            borderColor: "rgba(255,255,255,0.09)",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(124,111,255,0.08)",
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          {/* ── Results list ──────────────────────────────────────────────── */}
          {hasResults && (
            <>
              {/* Header */}
              <div
                className="sticky top-0 px-4 py-2 border-b border-white/[0.05] flex items-center justify-between"
                style={{
                  background: "rgba(10,10,20,0.98)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span className="text-[10px] font-black text-white/28 uppercase tracking-widest">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-white/18">
                  Click to open topic
                </span>
              </div>

              {/* Cards */}
              {results.map((result, i) => (
                <motion.div
                  key={`${result.examId}-${result.subjectId}-${result.topicId}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.16 }}
                >
                  <SearchResultCard
                    result={result}
                    query={query}
                    onSelect={onSelect}
                  />
                </motion.div>
              ))}
            </>
          )}

          {/* ── Empty state ───────────────────────────────────────────────── */}
          {noResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-10 px-6 text-center"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <SearchX size={20} className="text-white/22" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white/40 mb-1">
                  No topics found
                </p>
                <p className="text-[11px] text-white/22 leading-relaxed">
                  No results for{" "}
                  <span className="text-white/40 font-bold">"{query}"</span>
                  <br />
                  Try a shorter keyword or subject name.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
