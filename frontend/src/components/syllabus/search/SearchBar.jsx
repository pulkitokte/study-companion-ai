import { useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar
 *
 * Controlled search input for the Topic Search System.
 * No service calls. No localStorage. Fully prop-driven.
 *
 * Props:
 *   query       {string}   current query value
 *   onChange    {function} (value: string) => void
 *   onClear     {function} () => void
 *   resultCount {number}   shown when isOpen && resultCount > 0
 *   isOpen      {boolean}  whether results overlay is visible
 */
export default function SearchBar({
  query,
  onChange,
  onClear,
  resultCount,
  isOpen,
}) {
  const inputRef = useRef(null);

  // ── Keyboard: Escape clears; Ctrl/Cmd+K focuses ──────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClear?.();
        inputRef.current?.blur();
      }
    },
    [onClear],
  );

  useEffect(() => {
    const globalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", globalKeyDown);
    return () => window.removeEventListener("keydown", globalKeyDown);
  }, []);

  const hasQuery = query.length > 0;

  return (
    <div className="relative w-full">
      {/* Input wrapper */}
      <div
        className="relative flex items-center rounded-2xl border transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.035)",
          borderColor: hasQuery
            ? "rgba(124,111,255,0.40)"
            : "rgba(255,255,255,0.08)",
          boxShadow: hasQuery ? "0 0 0 3px rgba(124,111,255,0.08)" : "none",
        }}
      >
        {/* Search icon */}
        <Search
          size={15}
          className="absolute left-3.5 shrink-0 pointer-events-none transition-colors"
          style={{ color: hasQuery ? "#7C6FFF" : "rgba(255,255,255,0.25)" }}
        />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search topics, subjects, exams..."
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent py-3 pl-10 pr-20 text-[13px] text-white/80
                     placeholder-white/20 outline-none"
          style={{ caretColor: "#7C6FFF" }}
        />

        {/* Right side: result count + clear button */}
        <div className="absolute right-3 flex items-center gap-2 shrink-0">
          {/* Result count badge */}
          {isOpen && hasQuery && resultCount > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                color: "#7C6FFF",
                background: "rgba(124,111,255,0.14)",
              }}
            >
              {resultCount}
            </span>
          )}

          {/* Keyboard shortcut hint when idle */}
          {!hasQuery && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md hidden sm:inline"
              style={{
                color: "rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ⌘K
            </span>
          )}

          {/* Clear button */}
          {hasQuery && (
            <button
              onClick={() => {
                onClear?.();
                inputRef.current?.focus();
              }}
              className="flex items-center justify-center w-5 h-5 rounded-md
                         text-white/30 hover:text-white/65
                         hover:bg-white/[0.07] transition-all"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
