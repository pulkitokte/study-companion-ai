import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Building2, Car, Clock } from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";

function toMins(t) {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtMins(m) {
  const h = Math.floor(Math.abs(m) / 60);
  const min = Math.abs(m) % 60;
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

const TRAVEL_OPTS = [0, 15, 30, 45, 60, 90, 120];

export default function Step3_Schedule({ accentColor = "#FFB347" }) {
  const { data, update } = useOnboarding();

  const hasCollege = data?.hasCollege ?? false;
  const collegeStart = data?.collegeStart ?? "09:00";
  const collegeEnd = data?.collegeEnd ?? "15:00";
  const hasCoaching = data?.hasCoaching ?? false;
  const coachingStart = data?.coachingStart ?? "16:00";
  const coachingEnd = data?.coachingEnd ?? "19:00";
  const travelMinutes = data?.travelMinutes ?? 0;
  const wakeTime = data?.wakeTime ?? "06:00";
  const sleepTime = data?.sleepTime ?? "22:30";

  const summary = useMemo(() => {
    const wM = toMins(wakeTime);
    const sM = toMins(sleepTime);
    const awake = sM > wM ? sM - wM : 1440 - wM + sM;

    let busy = travelMinutes * 2;
    if (hasCollege)
      busy += Math.max(0, toMins(collegeEnd) - toMins(collegeStart));
    if (hasCoaching)
      busy += Math.max(0, toMins(coachingEnd) - toMins(coachingStart));

    const free = Math.max(0, awake - busy);
    return {
      busy: fmtMins(busy),
      free: fmtMins(free),
      awake: fmtMins(awake),
      freeHours: free / 60,
    };
  }, [
    hasCollege,
    collegeStart,
    collegeEnd,
    hasCoaching,
    coachingStart,
    coachingEnd,
    travelMinutes,
    wakeTime,
    sleepTime,
  ]);

  return (
    <div className="space-y-5">
      <StepHeader
        step={3}
        title="Your daily commitments"
        subtitle="Tell us what eats into your day so your AI plan stays realistic."
        accentColor={accentColor}
      />

      {/* College toggle */}
      <ToggleBlock
        icon={GraduationCap}
        label="I attend College / University"
        active={hasCollege}
        onToggle={() => update({ hasCollege: !hasCollege })}
        accentColor={accentColor}
      >
        <TimeRange
          startVal={collegeStart}
          endVal={collegeEnd}
          onStart={(v) => update({ collegeStart: v })}
          onEnd={(v) => update({ collegeEnd: v })}
          accentColor={accentColor}
        />
      </ToggleBlock>

      {/* Coaching toggle */}
      <ToggleBlock
        icon={Building2}
        label="I attend Coaching / Classes"
        active={hasCoaching}
        onToggle={() => update({ hasCoaching: !hasCoaching })}
        accentColor={accentColor}
      >
        <TimeRange
          startVal={coachingStart}
          endVal={coachingEnd}
          onStart={(v) => update({ coachingStart: v })}
          onEnd={(v) => update({ coachingEnd: v })}
          accentColor={accentColor}
        />
      </ToggleBlock>

      {/* Travel time */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Car size={11} style={{ color: accentColor }} />
          One-Way Travel Time
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_OPTS.map((mins) => {
            const active = travelMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => update({ travelMinutes: mins })}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200"
                style={{
                  background: active
                    ? `${accentColor}18`
                    : "rgba(255,255,255,0.03)",
                  borderColor: active
                    ? `${accentColor}55`
                    : "rgba(255,255,255,0.08)",
                  color: active ? accentColor : "rgba(255,255,255,0.4)",
                }}
              >
                {mins === 0 ? "None" : `${mins}m`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-xl border px-4 py-4 space-y-3"
        style={{
          borderColor: `${accentColor}22`,
          background: `${accentColor}06`,
        }}
      >
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: accentColor }} />
          <span
            className="text-[11px] font-bold tracking-wide"
            style={{ color: accentColor }}
          >
            Daily Time Snapshot
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Busy", val: summary.busy, color: "#FF6B9D" },
            { label: "Free", val: summary.free, color: accentColor },
            { label: "Awake", val: summary.awake, color: "#7C6FFF" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg py-2.5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p
                className="text-[17px] font-black"
                style={{ color: item.color }}
              >
                {item.val}
              </p>
              <p className="text-[9px] text-white/28 uppercase tracking-widest mt-0.5">
                {item.label}
              </p>
            </div>
          ))}
        </div>
        {summary.freeHours < 2 && (
          <p className="text-[10px] text-[#FFB347] leading-relaxed">
            ⚠️ Very tight schedule — your AI plan will use micro-sessions
            strategically.
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleBlock({
  icon: Icon,
  label,
  active,
  onToggle,
  accentColor,
  children,
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        borderColor: active ? `${accentColor}32` : "rgba(255,255,255,0.07)",
        background: active ? `${accentColor}05` : "rgba(255,255,255,0.02)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Icon
            size={14}
            style={{ color: active ? accentColor : "rgba(255,255,255,0.3)" }}
          />
          <span className="text-[12px] font-semibold text-white/65">
            {label}
          </span>
        </div>
        {/* Toggle pill */}
        <div
          className="w-9 h-5 rounded-full relative transition-all duration-300 shrink-0"
          style={{
            background: active ? accentColor : "rgba(255,255,255,0.09)",
          }}
        >
          <motion.div
            animate={{ x: active ? 18 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
          />
        </div>
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/[0.05]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeRange({ startVal, endVal, onStart, onEnd, accentColor }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 space-y-1">
        <p className="text-[9px] text-white/28 uppercase tracking-wider">
          Start
        </p>
        <input
          type="time"
          value={startVal}
          onChange={(e) => onStart(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-white/[0.03] text-white/70 text-[12px] outline-none"
          style={{ borderColor: `${accentColor}32` }}
        />
      </div>
      <span className="text-white/20 pb-2.5 text-xs">→</span>
      <div className="flex-1 space-y-1">
        <p className="text-[9px] text-white/28 uppercase tracking-wider">End</p>
        <input
          type="time"
          value={endVal}
          onChange={(e) => onEnd(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-white/[0.03] text-white/70 text-[12px] outline-none"
          style={{ borderColor: `${accentColor}32` }}
        />
      </div>
    </div>
  );
}
