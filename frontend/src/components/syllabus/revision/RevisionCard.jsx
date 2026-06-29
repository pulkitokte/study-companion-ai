import { motion } from "framer-motion";
import {
  Zap,
  RotateCcw,
  Star,
  Flame,
  Clock,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

/**
 * RevisionCard — Phase 31 update
 *
 * Now handles the new item shape from spacedRevisionEngine.buildTodayRevisionQueue():
 * {
 *   examId, subjectId, topicId, topicName,
 *   subjectLabel, subjectEmoji, subjectColor,
 *   difficulty, xp,
 *   revisionLevel, overdueDays, priorityScore, nextRevisionDate,
 *   progress,
 *   isOverdue, isGraduated
 * }
 *
 * Displays:
 *   - Overdue fire indicator OR "Due today" label
 *   - Topic name
 *   - Subject chip, difficulty badge, Level X/5 badge, XP
 *   - Next revision date after acting
 *   - Priority score
 *   - Action buttons: Mark Revised / Mark Mastered
 */

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_REVISION_LEVEL = 5;

const DIFFICULTY_CONFIG = {
  easy: { color: "#00FF64", label: "Easy" },
  medium: { color: "#FFB347", label: "Medium" },
  hard: { color: "#FF6B2B", label: "Hard" },
};

// Level colour progression — deepens as topic matures
const LEVEL_COLORS = [
  "rgba(255,255,255,0.22)", // 0 — never shown (no schedule yet)
  "#4FC3F7", // 1
  "#7C6FFF", // 2
  "#00FFC8", // 3
  "#FFB347", // 4
  "#FFD700", // 5 — graduated
];

const XP_REWARD = {
  revised: 20,
  mastered: 30,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatNextDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

// ─── ACTION BUTTON ────────────────────────────────────────────────────────────

function ActionButton({ label, icon: Icon, color, xp, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border
                 text-[11px] font-bold transition-all"
      style={{
        color,
        borderColor: `${color}28`,
        background: `${color}0C`,
      }}
    >
      <Icon size={11} />
      {label}
      {xp > 0 && (
        <span
          className="ml-0.5 text-[9px] font-black opacity-60"
          style={{ color }}
        >
          +{xp}
        </span>
      )}
    </motion.button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function RevisionCard({ item, onAction }) {
  if (!item) return null;

  const {
    topicName,
    subjectLabel,
    subjectEmoji,
    subjectColor,
    difficulty,
    xp,
    revisionLevel,
    overdueDays,
    priorityScore,
    nextRevisionDate,
    progress,
    isOverdue,
    isGraduated,
  } = item;

  const isMastered = progress?.status === "mastered";
  const level = revisionLevel ?? 0;
  const levelColor =
    LEVEL_COLORS[Math.min(level, MAX_REVISION_LEVEL)] ?? LEVEL_COLORS[1];
  const diffConfig = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;
  const nextDateLabel = formatNextDate(nextRevisionDate);
  const cardColor = isOverdue ? "#FF6B2B" : "#FFB347";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/[0.06] p-4 transition-all"
      style={{
        background: isOverdue ? "rgba(255,107,43,0.06)" : "#0A0A14",
      }}
    >
      {/* Priority accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${cardColor}, transparent)`,
          opacity: isOverdue ? 0.8 : 0.4,
        }}
      />

      {/* ── Top row: urgency + priority score ─────────────────────────── */}
      <div className="flex items-center justify-between mb-2.5">
        {isOverdue ? (
          <div className="flex items-center gap-1.5">
            <Flame size={12} style={{ color: "#FF6B2B" }} />
            <span className="text-[10px] font-black text-[#FF6B2B]">
              Overdue by {overdueDays} day{overdueDays !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: "#FFB347" }} />
            <span className="text-[10px] font-black text-[#FFB347]">
              Due today
            </span>
          </div>
        )}

        {priorityScore > 0 && (
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-white/20" />
            <span className="text-[9px] font-bold text-white/22">
              Priority {priorityScore}
            </span>
          </div>
        )}
      </div>

      {/* ── Topic name ────────────────────────────────────────────────── */}
      <p className="text-[13px] font-bold text-white/88 leading-snug mb-2.5">
        {topicName ?? "Unknown topic"}
      </p>

      {/* ── Chips row ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {/* Subject chip */}
        <div className="flex items-center gap-1">
          <span className="text-sm leading-none">{subjectEmoji}</span>
          <span
            className="text-[10px] font-bold"
            style={{ color: subjectColor ?? "#7C6FFF" }}
          >
            {subjectLabel}
          </span>
        </div>

        <span className="text-white/15 text-[10px]">·</span>

        {/* Difficulty badge */}
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
          style={{
            color: diffConfig.color,
            borderColor: `${diffConfig.color}28`,
            background: `${diffConfig.color}0C`,
          }}
        >
          {diffConfig.label}
        </span>

        {/* Revision level badge */}
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
          style={{
            color: levelColor,
            background: `${levelColor}18`,
            border: `1px solid ${levelColor}28`,
          }}
        >
          {isGraduated ? "✓ Graduated" : `Lv ${level} / ${MAX_REVISION_LEVEL}`}
        </span>

        {/* XP base */}
        <div className="flex items-center gap-0.5 ml-auto">
          <Zap size={9} className="text-[#7C6FFF]/55" />
          <span className="text-[9px] text-[#7C6FFF]/55 font-bold">
            {xp ?? 0} base
          </span>
        </div>
      </div>

      {/* ── Next revision date ────────────────────────────────────────── */}
      {nextDateLabel && (
        <div className="flex items-center gap-1.5 mb-3">
          <CalendarCheck size={10} className="text-white/22" />
          <span className="text-[9px] text-white/30">
            Next revision scheduled:{" "}
            <span className="text-white/50 font-bold">{nextDateLabel}</span>
          </span>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {isMastered ? (
          <ActionButton
            label="Review Again"
            icon={RotateCcw}
            color="#7C6FFF"
            xp={XP_REWARD.revised}
            onClick={() => onAction?.(item, "revise")}
          />
        ) : (
          <>
            <ActionButton
              label="Mark Revised"
              icon={RotateCcw}
              color="#7C6FFF"
              xp={XP_REWARD.revised}
              onClick={() => onAction?.(item, "revise")}
            />
            <ActionButton
              label="Mark Mastered"
              icon={Star}
              color="#FFD700"
              xp={XP_REWARD.mastered}
              onClick={() => onAction?.(item, "master")}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
 