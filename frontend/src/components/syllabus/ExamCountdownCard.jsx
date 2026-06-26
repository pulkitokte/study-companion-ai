// ExamCountdownCard.jsx — Deadline-driven planning card for the Syllabus Tracker.
// Phase 30

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Target, TrendingUp, Clock } from "lucide-react";
import {
  getExamDeadline,
  getDaysRemaining,
  getDailyTarget,
  getCountdownStatus,
} from "../../utils/examPlanner.js";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col gap-1 px-3 py-2.5 rounded-xl border"
      style={{
        background: `${color}08`,
        borderColor: `${color}20`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={11} style={{ color }} />
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `${color}90` }}>
          {label}
        </span>
      </div>
      <span className="text-[18px] font-black leading-none truncate" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ExamCountdownCard({ examId, examDef, examProgress }) {
  const deadline = getExamDeadline(examId);
  const daysRemaining = useMemo(() => getDaysRemaining(examId), [examId, deadline]);
  const dailyTarget = useMemo(
    () => getDailyTarget(examProgress, examId),
    [examProgress, examId, deadline]
  );
  const countdownStatus = useMemo(
    () => getCountdownStatus(daysRemaining, dailyTarget),
    [daysRemaining, dailyTarget]
  );

  const accentColor = examDef?.color ?? "#7C6FFF";
  const formattedDate = formatDate(deadline);

  const topicsPerDayDisplay =
    dailyTarget.topicsPerDay === null
      ? "—"
      : dailyTarget.topicsPerDay === Infinity
      ? "∞"
      : dailyTarget.topicsPerDay === 0
      ? "0"
      : dailyTarget.topicsPerDay % 1 === 0
      ? String(dailyTarget.topicsPerDay)
      : dailyTarget.topicsPerDay.toFixed(1);

  const daysDisplay =
    daysRemaining === null
      ? "—"
      : daysRemaining < 0
      ? `${Math.abs(daysRemaining)}d ago`
      : `${daysRemaining}d`;

  // ── No date configured ────────────────────────────────────────────────────
  if (!deadline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl border overflow-hidden px-5 py-4"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background: `linear-gradient(90deg,transparent,${accentColor}50,transparent)`,
          }}
        />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${accentColor}14`,
                border: `1px solid ${accentColor}25`,
              }}
            >
              <CalendarDays size={16} style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-white/80 leading-tight">
                {examDef?.label ?? examId} Countdown
              </p>
              <p className="text-[11px] text-white/30 mt-0.5">
                No exam date configured yet.
              </p>
            </div>
          </div>

          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();

              window.dispatchEvent(
                new CustomEvent("navigate", {
                  detail: "settings",
                }),
              );
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-150 border"
            style={{
              color: accentColor,
              borderColor: `${accentColor}35`,
              background: `${accentColor}0C`,
            }}
          >
            Set exam date in Settings →
          </a>
        </div>
      </motion.div>
    );
  }

  // ── Date configured ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative rounded-2xl border overflow-hidden px-5 py-4"
      style={{
        background: `${accentColor}07`,
        borderColor: `${accentColor}22`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg,transparent,${accentColor},transparent)`,
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
        style={{ background: `${accentColor}12` }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
          >
            <CalendarDays size={14} style={{ color: accentColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-white/85 leading-tight truncate">
              {examDef?.label ?? examId}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: `${accentColor}90` }}>
              📅 {formattedDate}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-xl border"
          style={{
            color: countdownStatus.color,
            borderColor: `${countdownStatus.color}30`,
            background: `${countdownStatus.color}10`,
          }}
        >
          {countdownStatus.label}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex gap-2 flex-wrap">
        <StatBox
          icon={Clock}
          label="Days Left"
          value={daysDisplay}
          color={countdownStatus.color}
        />
        <StatBox
          icon={Target}
          label="Remaining"
          value={`${dailyTarget.topicsRemaining} topics`}
          color={accentColor}
        />
        <StatBox
          icon={TrendingUp}
          label="Topics/Day"
          value={topicsPerDayDisplay}
          color={
            countdownStatus.status === "on_track"
              ? "#00FFC8"
              : countdownStatus.status === "tight"
              ? "#FFB347"
              : countdownStatus.status === "complete"
              ? "#FFD700"
              : countdownStatus.status === "expired"
              ? "rgba(255,255,255,0.30)"
              : "#FF6B2B"
          }
        />
      </div>

      {/* Progress micro-bar */}
      {(examProgress?.total ?? 0) > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/28 font-bold uppercase tracking-wider">
              Syllabus Progress
            </span>
            <span className="text-[9px] font-black" style={{ color: accentColor }}>
              {examProgress?.pct ?? 0}%
            </span>
          </div>
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${examProgress?.pct ?? 0}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ background: accentColor }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}