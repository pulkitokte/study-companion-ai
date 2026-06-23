import { motion } from "framer-motion";
import { Zap } from "lucide-react";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Mirrors STATUS_CONFIG in TopicPanel.jsx exactly.

const STATUS_CONFIG = {
  not_started: { color: "rgba(255,255,255,0.22)", label: "Not Started" },
  in_progress: { color: "#FFB347", label: "In Progress" },
  completed: { color: "#00FFC8", label: "Done" },
  revision_needed: { color: "#FF6B2B", label: "Review" },
  revised: { color: "#7C6FFF", label: "Revised" },
  mastered: { color: "#FFD700", label: "Mastered" },
};

const DIFFICULTY_CONFIG = {
  easy: { color: "#00FF64", label: "Easy" },
  medium: { color: "#FFB347", label: "Medium" },
  hard: { color: "#FF6B2B", label: "Hard" },
};

// ─── HIGHLIGHT HELPER ─────────────────────────────────────────────────────────
// Splits topicLabel into segments, wrapping matched query text in <mark>.
// Returns an array of { text, highlight } objects for rendering.

function buildHighlightSegments(label, query) {
  if (!query || query.trim().length < 2) {
    return [{ text: label, highlight: false }];
  }

  try {
    // Escape special regex characters in the query
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = label.split(regex);

    return parts.map((part) => ({
      text: part,
      highlight: regex.test(part),
    }));
  } catch {
    return [{ text: label, highlight: false }];
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

/**
 * SearchResultCard
 *
 * Displays a single topic search result with match highlighting.
 * Entire card is clickable → onSelect(result).
 * No service calls. Fully prop-driven.
 *
 * Props:
 *   result   {object}   scored index entry + enriched progress
 *   query    {string}   raw user query (used for highlight)
 *   onSelect {function} (result) => void
 */
export default function SearchResultCard({ result, query, onSelect }) {
  if (!result) return null;

  const {
    topicLabel,
    subjectLabel,
    subjectEmoji,
    subjectColor,
    examShortLabel,
    examEmoji,
    examColor,
    difficulty,
    xp,
    progress,
  } = result;

  const status = progress?.status ?? "not_started";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;
  const diffCfg = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;
  const segments = buildHighlightSegments(topicLabel, query);

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect?.(result)}
      className="relative flex flex-col gap-2 px-4 py-3.5 cursor-pointer
                 border-b border-white/[0.04] last:border-0
                 hover:bg-white/[0.03] transition-colors"
    >
      {/* Topic label with query highlight */}
      <p className="text-[13px] font-bold text-white/85 leading-snug">
        {segments.map((seg, i) =>
          seg.highlight ? (
            <mark
              key={i}
              style={{
                background: "rgba(124,111,255,0.30)",
                color: "#B8AFFF",
                borderRadius: 3,
                padding: "0 2px",
              }}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </p>

      {/* Chips row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Subject chip */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
          style={{
            background: `${subjectColor}12`,
            color: subjectColor,
            border: `1px solid ${subjectColor}22`,
          }}
        >
          <span className="text-xs leading-none">{subjectEmoji}</span>
          {subjectLabel}
        </div>

        {/* Exam chip */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
          style={{
            background: `${examColor}0E`,
            color: `${examColor}CC`,
            border: `1px solid ${examColor}18`,
          }}
        >
          <span className="text-xs leading-none">{examEmoji}</span>
          {examShortLabel}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Difficulty badge */}
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
          style={{
            color: diffCfg.color,
            borderColor: `${diffCfg.color}28`,
            background: `${diffCfg.color}0C`,
          }}
        >
          {diffCfg.label}
        </span>

        {/* XP */}
        <div className="flex items-center gap-0.5">
          <Zap size={9} className="text-[#7C6FFF]/55" />
          <span className="text-[9px] font-bold text-[#7C6FFF]/55">{xp}</span>
        </div>

        {/* Status dot + label */}
        <div className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: statusCfg.color,
              boxShadow:
                status !== "not_started"
                  ? `0 0 4px ${statusCfg.color}60`
                  : "none",
            }}
          />
          <span
            className="text-[9px] font-bold"
            style={{ color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
