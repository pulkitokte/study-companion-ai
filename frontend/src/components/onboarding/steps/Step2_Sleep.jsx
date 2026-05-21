import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sunrise, Moon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";

function toMins(t) {
  if (!t || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function calcHours(wake, sleep) {
  const w = toMins(wake);
  const s = toMins(sleep);
  const sleepMins = s > w ? s - w : 1440 - w + s;
  const awakeMins = 1440 - sleepMins;
  return {
    sleepH: (sleepMins / 60).toFixed(1),
    awakeH: (awakeMins / 60).toFixed(1),
    sleepPct: (sleepMins / 1440) * 100,
    wakePct: (w / 1440) * 100,
  };
}

function sleepFeedback(sleepH) {
  const h = parseFloat(sleepH);
  if (h < 5)
    return {
      icon: AlertTriangle,
      color: "#FF4444",
      msg: "Too little sleep — memory consolidation suffers badly.",
    };
  if (h < 6.5)
    return {
      icon: AlertTriangle,
      color: "#FFB347",
      msg: "Slightly below optimal. Try adding 30–60 min if possible.",
    };
  if (h <= 8)
    return {
      icon: CheckCircle2,
      color: "#00FFC8",
      msg: "Perfect sleep window for peak exam performance!",
    };
  return {
    icon: CheckCircle2,
    color: "#7C6FFF",
    msg: "Great rest. Mornings will be your sharpest study window.",
  };
}

function wakeCategory(wake) {
  const m = toMins(wake);
  if (m < 300) return { label: "Ultra Early Bird 🦅", color: "#FFD700" };
  if (m < 360) return { label: "Early Riser ⚡", color: "#00FFC8" };
  if (m < 420) return { label: "Morning Person ☀️", color: "#00FFC8" };
  if (m < 540) return { label: "Regular Schedule 📅", color: "#7C6FFF" };
  if (m < 660) return { label: "Late Starter 🌤️", color: "#FFB347" };
  return { label: "Night Owl 🦉", color: "#FF6B9D" };
}

const WAKE_PRESETS = ["04:30", "05:00", "05:30", "06:00", "06:30", "07:00"];
const SLEEP_PRESETS = [
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
  "00:00",
];

export default function Step2_Sleep({ accentColor = "#7C6FFF" }) {
  const { data, update } = useOnboarding();

  const wakeTime = data?.wakeTime ?? "06:00";
  const sleepTime = data?.sleepTime ?? "22:30";

  const { sleepH, awakeH, wakePct } = useMemo(
    () => calcHours(wakeTime, sleepTime),
    [wakeTime, sleepTime],
  );

  const { sleepH: sh } = useMemo(
    () => calcHours(wakeTime, sleepTime),
    [wakeTime, sleepTime],
  );
  const feedback = sleepFeedback(sh);
  const FeedbackIcon = feedback.icon;
  const wakeLabel = wakeCategory(wakeTime);

  return (
    <div className="space-y-6">
      <StepHeader
        step={2}
        title="Your daily rhythm"
        subtitle="Everything gets scheduled around your sleep cycle — the foundation of peak performance."
        accentColor={accentColor}
      />

      {/* Wake time */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Sunrise size={11} style={{ color: accentColor }} />
          Wake Up Time
        </label>

        <div className="flex flex-wrap gap-2">
          {WAKE_PRESETS.map((t) => {
            const active = wakeTime === t;
            return (
              <button
                key={t}
                onClick={() => update({ wakeTime: t })}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200"
                style={{
                  background: active
                    ? `${accentColor}18`
                    : "rgba(255,255,255,0.03)",
                  borderColor: active
                    ? `${accentColor}55`
                    : "rgba(255,255,255,0.08)",
                  color: active ? accentColor : "rgba(255,255,255,0.4)",
                  boxShadow: active ? `0 0 10px ${accentColor}22` : "none",
                }}
              >
                {t}
              </button>
            );
          })}
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => update({ wakeTime: e.target.value })}
            className="px-3 py-1.5 rounded-lg text-[11px] border bg-white/[0.03] text-white/60 outline-none"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />
        </div>

        <motion.div
          key={wakeTime}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: wakeLabel.color,
              boxShadow: `0 0 6px ${wakeLabel.color}`,
            }}
          />
          <span
            className="text-[11px] font-semibold"
            style={{ color: wakeLabel.color }}
          >
            {wakeLabel.label}
          </span>
        </motion.div>
      </div>

      {/* Sleep time */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Moon size={11} style={{ color: "#7C6FFF" }} />
          Sleep Time
        </label>

        <div className="flex flex-wrap gap-2">
          {SLEEP_PRESETS.map((t) => {
            const active = sleepTime === t;
            return (
              <button
                key={t}
                onClick={() => update({ sleepTime: t })}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200"
                style={{
                  background: active
                    ? "rgba(124,111,255,0.18)"
                    : "rgba(255,255,255,0.03)",
                  borderColor: active
                    ? "rgba(124,111,255,0.55)"
                    : "rgba(255,255,255,0.08)",
                  color: active ? "#7C6FFF" : "rgba(255,255,255,0.4)",
                  boxShadow: active
                    ? "0 0 10px rgba(124,111,255,0.22)"
                    : "none",
                }}
              >
                {t}
              </button>
            );
          })}
          <input
            type="time"
            value={sleepTime}
            onChange={(e) => update({ sleepTime: e.target.value })}
            className="px-3 py-1.5 rounded-lg text-[11px] border bg-white/[0.03] text-white/60 outline-none"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />
        </div>
      </div>

      {/* 24-hour bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-white/20">
          {["12 AM", "6 AM", "12 PM", "6 PM", "12 AM"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div
          className="relative h-5 rounded-full overflow-hidden border border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            animate={{
              left: `${wakePct}%`,
              width: `${Math.min((parseFloat(awakeH) / 24) * 100, 100)}%`,
            }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 bottom-0 rounded-full"
            style={{ background: `${accentColor}55` }}
          />
        </div>
        <div className="flex gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: `${accentColor}60` }}
            />
            <span className="text-white/35">Awake {awakeH}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.06]" />
            <span className="text-white/35">Sleep {sleepH}h</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <motion.div
        key={sleepH}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border px-4 py-3"
        style={{
          borderColor: `${feedback.color}28`,
          background: `${feedback.color}08`,
        }}
      >
        <FeedbackIcon
          size={14}
          style={{ color: feedback.color }}
          className="shrink-0 mt-0.5"
        />
        <div>
          <p
            className="text-[11px] font-semibold mb-0.5"
            style={{ color: feedback.color }}
          >
            {sleepH}h sleep · {awakeH}h active day
          </p>
          <p className="text-[11px] text-white/38 leading-relaxed">
            {feedback.msg}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
