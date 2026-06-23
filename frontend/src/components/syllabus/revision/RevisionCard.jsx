import { motion } from "framer-motion";
import {
  Zap,
  RotateCcw,
  Star,
  AlertTriangle,
  Clock,
  CalendarClock,
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  easy: { color: "#00FF64", label: "Easy" },
  medium: { color: "#FFB347", label: "Medium" },
  hard: { color: "#FF6B2B", label: "Hard" },
};

const CATEGORY_CONFIG = {
  overdue: { color: "#FF6B2B", icon: AlertTriangle, prefix: "overdue by" },
  dueToday: { color: "#FFB347", icon: Clock, prefix: "due" },
  upcoming: { color: "#4FC3F7", icon: CalendarClock, prefix: "due in" },
};

const XP_REWARD = {
  revised: 20,
  mastered: 30,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDays(daysPastDue) {
  const abs = Math.abs(Math.round(daysPastDue));
  if (abs === 0) return "today";
  if (abs === 1) return "1 day";
  return `${abs} days`;
}

function getCategory(daysPastDue) {
  if (daysPastDue > 2) return "overdue";
  if (daysPastDue >= 0) return "dueToday";
  return "upcoming";
}

// ─── ACTION BUTTONS ───────────────────────────────────────────────────────────

function ActionButton({ label, icon: Icon, color, xp, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
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

/**
 * @param {{ item, onAction }} props
 * item shape — output of revisionEngine.buildRevisionQueue():
 *   { examId, subjectId, topicId, topic, subject, progress, score, daysPastDue, dueDate }
 */
export default function RevisionCard({ item, onAction }) {
  if (!item) return null;

  const { topic, subject, progress, score, daysPastDue } = item;

  const category = getCategory(daysPastDue ?? 0);
  const catConfig = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.dueToday;
  const CatIcon = catConfig.icon;

  const diffConfig =
    DIFFICULTY_CONFIG[topic?.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const isMastered = progress?.status === "mastered";

  const daysLabel = formatDays(daysPastDue ?? 0);
  const urgencyStr =
    category === "upcoming"
      ? `${catConfig.prefix} ${daysLabel}`
      : daysLabel === "today"
        ? "due today"
        : `${catConfig.prefix} ${daysLabel}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/[0.06] p-4 transition-all"
      style={{
        background: category === "overdue" ? `${catConfig.color}07` : "#0A0A14",
      }}
    >
      {/* Priority accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${catConfig.color}, transparent)`,
          opacity: category === "overdue" ? 0.7 : 0.35,
        }}
      />

      {/* Top row: urgency indicator + score */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <CatIcon size={11} style={{ color: catConfig.color }} />
          <span
            className="text-[10px] font-black capitalize"
            style={{ color: catConfig.color }}
          >
            {urgencyStr}
          </span>
        </div>
        {score > 0 && (
          <span className="text-[9px] font-bold text-white/22">
            priority {score}
          </span>
        )}
      </div>

      {/* Topic label */}
      <p className="text-[13px] font-bold text-white/85 leading-snug mb-1.5">
        {topic?.label ?? "Unknown topic"}
      </p>

      {/* Subject + badges row */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {/* Subject chip */}
        <div className="flex items-center gap-1">
          <span className="text-sm leading-none">{subject?.emoji}</span>
          <span
            className="text-[10px] font-bold"
            style={{ color: subject?.color ?? "#7C6FFF" }}
          >
            {subject?.label}
          </span>
        </div>

        {/* Separator */}
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

        {/* XP available */}
        <div className="flex items-center gap-0.5 ml-auto">
          <Zap size={9} className="text-[#7C6FFF]/55" />
          <span className="text-[9px] text-[#7C6FFF]/55 font-bold">
            {topic?.xp ?? 0} base
          </span>
        </div>
      </div>

      {/* Action buttons */}
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
