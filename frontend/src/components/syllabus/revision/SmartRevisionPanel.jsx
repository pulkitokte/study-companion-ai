// SmartRevisionPanel.jsx — Spaced repetition revision queue UI.
// Phase 31

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  CheckCircle2,
  Star,
  Clock,
  Zap,
  ChevronDown,
  AlertTriangle,
  CalendarDays,
  TrendingUp,
  BookOpen,
  Flame,
} from "lucide-react";
import {
  buildRevisionQueue,
  revisionSummary,
  levelLabel,
  nextIntervalDays,
  computeOverdueDays,
  MAX_LEVEL,
  REVISION_INTERVALS,
} from "../../../utils/spacedRepetition.js";

// ─── STATIC CONFIG ────────────────────────────────────────────────────────────

const LEVEL_COLORS = [
  "rgba(255,255,255,0.25)", // 0 — new
  "#FFB347", // 1
  "#7C6FFF", // 2
  "#4FC3F7", // 3
  "#00FFC8", // 4
  "#FFD700", // 5 — mastered
];

const DIFFICULTY_COLOR = {
  easy: "#00FF64",
  medium: "#FFB347",
  hard: "#FF6B2B",
};

// ─── LEVEL PROGRESS BAR ───────────────────────────────────────────────────────

function LevelBar({ level }) {
  const color = LEVEL_COLORS[Math.min(level, MAX_LEVEL)];
  const pct = (level / MAX_LEVEL) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-[9px] font-bold shrink-0" style={{ color }}>
        {levelLabel(level)}
      </span>
    </div>
  );
}

// ─── SINGLE REVISION CARD ─────────────────────────────────────────────────────

function RevisionCard({ entry, onRevise, onMaster, index }) {
  const [expanded, setExpanded] = useState(false);
  const meta = entry.progress?.revisionMeta;
  const level = meta?.level ?? 0;
  const overdue = entry.overdueDays ?? 0;
  const levelColor = LEVEL_COLORS[Math.min(level, MAX_LEVEL)];
  const diffColor =
    DIFFICULTY_COLOR[entry.topic?.difficulty] ?? DIFFICULTY_COLOR.medium;

  const nextDays = nextIntervalDays(level + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: overdue > 0 ? "rgba(255,107,43,0.25)" : `${levelColor}22`,
        background: overdue > 0 ? "rgba(255,107,43,0.04)" : `${levelColor}06`,
      }}
    >
      {/* Top accent */}
      <div
        className="h-[1.5px] w-full"
        style={{
          background:
            overdue > 0
              ? "linear-gradient(90deg,transparent,#FF6B2B,transparent)"
              : `linear-gradient(90deg,transparent,${levelColor},transparent)`,
        }}
      />

      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Subject emoji */}
          <span className="text-xl leading-none shrink-0 mt-0.5">
            {entry.subject?.emoji ?? "📖"}
          </span>

          <div className="flex-1 min-w-0">
            {/* Topic name */}
            <p className="text-[12px] font-bold text-white/85 leading-snug truncate">
              {entry.topic?.label ?? entry.topicId}
            </p>
            {/* Subject + overdue badge */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  color: entry.subject?.color ?? levelColor,
                  background: `${entry.subject?.color ?? levelColor}14`,
                }}
              >
                {entry.subject?.label ?? entry.subjectId}
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                style={{
                  color: diffColor,
                  borderColor: `${diffColor}28`,
                  background: `${diffColor}08`,
                }}
              >
                {entry.topic?.difficulty ?? "medium"}
              </span>
              {overdue > 0 && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#FF6B2B] px-1.5 py-0.5 rounded bg-[#FF6B2B]/10">
                  <AlertTriangle size={8} />
                  {overdue}d overdue
                </span>
              )}
              {overdue === 0 && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#00FFC8] px-1.5 py-0.5 rounded bg-[#00FFC8]/08">
                  <Clock size={8} />
                  Due today
                </span>
              )}
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 p-1 text-white/25 hover:text-white/55 transition-colors"
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={13} />
            </motion.span>
          </button>
        </div>

        {/* Level bar */}
        <div className="mt-2.5 ml-9">
          <LevelBar level={level} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5 ml-9 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onRevise(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
            style={{
              color: levelColor,
              borderColor: `${levelColor}28`,
              background: `${levelColor}0C`,
            }}
          >
            <RotateCcw size={11} />
            Revised
            {nextDays && (
              <span className="text-[9px] opacity-60 font-normal">
                → +{nextDays}d
              </span>
            )}
          </motion.button>

          {level < MAX_LEVEL && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onMaster(entry)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
              style={{
                color: "#FFD700",
                borderColor: "rgba(255,215,0,0.22)",
                background: "rgba(255,215,0,0.06)",
              }}
            >
              <Star size={11} />
              Mark Mastered
            </motion.button>
          )}

          {level >= MAX_LEVEL && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#FFD700]/70">
              <Star size={10} className="text-[#FFD700]" /> Mastered
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 ml-9 border-t border-white/[0.04] pt-2.5 space-y-1.5">
              {[
                {
                  label: "Revision Level",
                  value: `${level} / ${MAX_LEVEL}`,
                  color: levelColor,
                },
                {
                  label: "Total Revisions",
                  value: meta?.totalRevisions ?? 0,
                  color: "#7C6FFF",
                },
                {
                  label: "Last Revised",
                  value: meta?.lastRevisionDate ?? "—",
                  color: "rgba(255,255,255,0.45)",
                },
                {
                  label: "Next Due",
                  value: meta?.nextRevisionDate ?? "—",
                  color: overdue > 0 ? "#FF6B2B" : "#00FFC8",
                },
                {
                  label: "XP per revision",
                  value: `${entry.topic?.xp ?? 0} XP`,
                  color: "#7C6FFF",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-[10px] text-white/28">{row.label}</span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── UPCOMING SCHEDULE STRIP ──────────────────────────────────────────────────

function UpcomingStrip({ entries }) {
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return entries
      .filter((e) => {
        const d = e.progress?.revisionMeta?.nextRevisionDate;
        return d && d > today;
      })
      .sort((a, b) =>
        (a.progress.revisionMeta.nextRevisionDate ?? "").localeCompare(
          b.progress.revisionMeta.nextRevisionDate ?? "",
        ),
      )
      .slice(0, 8);
  }, [entries]);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-bold text-white/32 uppercase tracking-widest mb-2.5">
        Upcoming Revisions
      </p>
      <div className="space-y-2">
        {upcoming.map((e) => {
          const meta = e.progress?.revisionMeta;
          const level = meta?.level ?? 0;
          const color = LEVEL_COLORS[Math.min(level, MAX_LEVEL)];
          return (
            <div
              key={`${e.examId}-${e.subjectId}-${e.topicId}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/[0.05] bg-white/[0.02]"
            >
              <span className="text-sm leading-none shrink-0">
                {e.subject?.emoji ?? "📖"}
              </span>
              <p className="flex-1 text-[11px] text-white/65 truncate min-w-0">
                {e.topic?.label ?? e.topicId}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-bold" style={{ color }}>
                  {levelLabel(level)}
                </span>
                <span className="text-[9px] text-white/28 font-mono">
                  {meta?.nextRevisionDate ?? "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SUMMARY STATS BAR ───────────────────────────────────────────────────────

function SummaryBar({ summary, accentColor }) {
  const items = [
    {
      icon: Flame,
      label: "Due Today",
      value: summary.dueToday,
      color: summary.dueToday > 0 ? "#FF6B2B" : "#00FFC8",
    },
    {
      icon: AlertTriangle,
      label: "Overdue",
      value: summary.overdue,
      color: summary.overdue > 0 ? "#FF3C3C" : "rgba(255,255,255,0.25)",
    },
    {
      icon: CalendarDays,
      label: "This Week",
      value: summary.upcomingThisWeek,
      color: "#7C6FFF",
    },
    {
      icon: Star,
      label: "Mastered",
      value: summary.completed,
      color: "#FFD700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="flex flex-col gap-1 px-3 py-2.5 rounded-xl border"
          style={{ borderColor: `${color}20`, background: `${color}07` }}
        >
          <div className="flex items-center gap-1.5">
            <Icon size={10} style={{ color }} />
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: `${color}90` }}
            >
              {label}
            </span>
          </div>
          <span
            className="text-[20px] font-black leading-none"
            style={{ color }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── INTERVAL LEGEND ─────────────────────────────────────────────────────────

function IntervalLegend() {
  return (
    <div
      className="rounded-xl border border-white/[0.06] px-4 py-3"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <p className="text-[10px] font-bold text-white/32 uppercase tracking-widest mb-2">
        Spaced Repetition Schedule
      </p>
      <div className="flex flex-wrap gap-2">
        {REVISION_INTERVALS.map((days, i) => {
          const color = LEVEL_COLORS[i + 1] ?? LEVEL_COLORS[MAX_LEVEL];
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-bold"
              style={{
                color,
                borderColor: `${color}25`,
                background: `${color}0A`,
              }}
            >
              <span>Rev {i + 1}</span>
              <span className="opacity-60">+{days}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SmartRevisionPanel({
  allTopicEntries = [], // full list of { examId, subjectId, topicId, topic, subject, progress }
  accentColor = "#7C6FFF",
  onRevise, // (entry) => void
  onMaster, // (entry) => void
}) {
  const [showUpcoming, setShowUpcoming] = useState(false);

  const queue = useMemo(
    () => buildRevisionQueue(allTopicEntries),
    [allTopicEntries],
  );

  const summary = useMemo(
    () => revisionSummary(allTopicEntries),
    [allTopicEntries],
  );

  const handleRevise = useCallback(
    (entry) => {
      if (onRevise) onRevise(entry);
    },
    [onRevise],
  );

  const handleMaster = useCallback(
    (entry) => {
      if (onMaster) onMaster(entry);
    },
    [onMaster],
  );

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <SummaryBar summary={summary} accentColor={accentColor} />

      {/* Interval legend */}
      <IntervalLegend />

      {/* Due queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-white/32 uppercase tracking-widest">
            Due for Revision
            {queue.length > 0 && (
              <span className="ml-2 text-[#FF6B2B]">({queue.length})</span>
            )}
          </p>
        </div>

        {queue.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-12 rounded-2xl border border-white/[0.05]"
            style={{ background: "#0A0A14" }}
          >
            <CheckCircle2 size={30} className="text-[#00FFC8]/40" />
            <div className="text-center">
              <p className="text-[13px] font-bold text-white/55">
                All caught up!
              </p>
              <p className="text-[11px] text-white/28 mt-1">
                No revisions due today. Great work!
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {queue.map((entry, i) => (
                <RevisionCard
                  key={`${entry.examId}-${entry.subjectId}-${entry.topicId}`}
                  entry={entry}
                  onRevise={handleRevise}
                  onMaster={handleMaster}
                  index={i}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Upcoming toggle */}
      <div>
        <button
          onClick={() => setShowUpcoming((v) => !v)}
          className="flex items-center gap-2 text-[11px] font-bold transition-colors duration-150"
          style={{
            color: showUpcoming ? accentColor : "rgba(255,255,255,0.30)",
          }}
        >
          <CalendarDays size={12} />
          {showUpcoming ? "Hide" : "Show"} Upcoming Schedule
          {summary.upcomingThisWeek > 0 && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px]"
              style={{
                background: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {summary.upcomingThisWeek} this week
            </span>
          )}
          <motion.span
            animate={{ rotate: showUpcoming ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={12} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showUpcoming && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <UpcomingStrip entries={allTopicEntries} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
