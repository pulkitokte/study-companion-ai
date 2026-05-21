import { motion } from "framer-motion";
import { BookOpen, Sun, Sunset, Moon, Zap } from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";

const TIME_SLOTS = [
  {
    id: "morning",
    label: "Morning",
    range: "5 AM – 9 AM",
    icon: Sun,
    color: "#FFD700",
    desc: "Sharpest focus — ideal for tough subjects",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    range: "12 PM – 4 PM",
    icon: Sun,
    color: "#FFB347",
    desc: "Good for revision and practice tests",
  },
  {
    id: "evening",
    label: "Evening",
    range: "5 PM – 9 PM",
    icon: Sunset,
    color: "#FF6B9D",
    desc: "Great for current affairs and reading",
  },
  {
    id: "night",
    label: "Night",
    range: "9 PM – 1 AM",
    icon: Moon,
    color: "#7C6FFF",
    desc: "Quiet and calm — best for memorisation",
  },
];

function hoursLabel(h) {
  if (h <= 2)
    return {
      text: "Light Start",
      color: "#FFB347",
      note: "Consistent beats intense — great starting point.",
    };
  if (h <= 4)
    return {
      text: "Solid Foundation",
      color: "#00FFC8",
      note: "Enough for steady daily progress on any exam.",
    };
  if (h <= 6)
    return {
      text: "Strong Grind",
      color: "#00FFC8",
      note: "Serious hours — AI will prevent burnout automatically.",
    };
  if (h <= 8)
    return {
      text: "Beast Mode",
      color: "#7C6FFF",
      note: "UPSC-level discipline. Rest slots built in.",
    };
  return {
    text: "Maximum Effort",
    color: "#FF6B2B",
    note: "⚠️ Burnout risk — strategic breaks are essential.",
  };
}

export default function Step4_Capacity({ accentColor = "#4FC3F7" }) {
  const { data, update } = useOnboarding();

  const dailyStudyHours = data?.dailyStudyHours ?? 4;
  const preferredTime = data?.preferredTime ?? "";
  const weekendStudy = data?.weekendStudy ?? true;

  const info = hoursLabel(dailyStudyHours);
  const pct = ((dailyStudyHours - 1) / 11) * 100;

  return (
    <div className="space-y-6">
      <StepHeader
        step={4}
        title="Your study capacity"
        subtitle="Be honest — realistic goals beat impossible ones every time."
        accentColor={accentColor}
      />

      {/* Hours slider */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <BookOpen size={11} style={{ color: accentColor }} />
          Daily Self-Study Hours
        </label>

        {/* Big number display */}
        <div className="flex items-end gap-3">
          <motion.span
            key={dailyStudyHours}
            initial={{ scale: 1.25, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-5xl font-black leading-none"
            style={{ color: accentColor }}
          >
            {dailyStudyHours}
          </motion.span>
          <div className="pb-1">
            <p className="text-[13px] text-white/55">hours / day</p>
            <p className="text-[11px] font-bold" style={{ color: info.color }}>
              {info.text}
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={1}
            max={12}
            step={0.5}
            value={dailyStudyHours}
            onChange={(e) =>
              update({ dailyStudyHours: parseFloat(e.target.value) })
            }
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${accentColor} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
              accentColor,
            }}
          />
          <div className="flex justify-between">
            {[1, 3, 5, 7, 9, 12].map((n) => (
              <span key={n} className="text-[9px] text-white/20">
                {n}h
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-white/32 leading-relaxed">{info.note}</p>
      </div>

      {/* Peak time */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Zap size={11} style={{ color: accentColor }} />
          Peak Productivity Window
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot, i) => {
            const Icon = slot.icon;
            const isSelected = preferredTime === slot.id;
            return (
              <motion.button
                key={slot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ preferredTime: slot.id })}
                className="flex flex-col gap-2 p-3 rounded-xl border text-left transition-all duration-200"
                style={{
                  background: isSelected
                    ? `${slot.color}12`
                    : "rgba(255,255,255,0.025)",
                  borderColor: isSelected
                    ? `${slot.color}55`
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isSelected ? `0 0 18px ${slot.color}18` : "none",
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    size={14}
                    style={{
                      color: isSelected ? slot.color : "rgba(255,255,255,0.3)",
                    }}
                  />
                  <span
                    className="text-[13px] font-bold"
                    style={{
                      color: isSelected ? slot.color : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {slot.label}
                  </span>
                </div>
                <p className="text-[9px] text-white/28">{slot.range}</p>
                <p
                  className="text-[10px] leading-snug"
                  style={{
                    color: isSelected
                      ? `${slot.color}AA`
                      : "rgba(255,255,255,0.22)",
                  }}
                >
                  {slot.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Weekend toggle */}
      <div
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{
          borderColor: "rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div>
          <p className="text-[12px] font-semibold text-white/68">
            Study on weekends?
          </p>
          <p className="text-[10px] text-white/28 mt-0.5">
            Weekend slots significantly boost revision coverage
          </p>
        </div>
        <button
          onClick={() => update({ weekendStudy: !weekendStudy })}
          className="shrink-0 ml-4"
        >
          <div
            className="w-10 h-5 rounded-full relative transition-all duration-300"
            style={{
              background: weekendStudy ? accentColor : "rgba(255,255,255,0.09)",
            }}
          >
            <motion.div
              animate={{ x: weekendStudy ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
