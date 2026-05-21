import { motion } from "framer-motion";
import { User, BookOpen, ChevronRight } from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";

const EXAMS = [
  { id: "UPSC", label: "UPSC", sub: "Civil Services", emoji: "🏛️" },
  { id: "SSC", label: "SSC", sub: "Staff Selection", emoji: "📋" },
  { id: "Banking", label: "Banking", sub: "IBPS / SBI / RBI", emoji: "🏦" },
  { id: "Railway", label: "Railway", sub: "RRB / NTPC / ALP", emoji: "🚄" },
  { id: "Insurance", label: "Insurance", sub: "LIC / NIACL", emoji: "🛡️" },
  { id: "Defence", label: "Defence", sub: "NDA / CDS / CAPF", emoji: "⚔️" },
  { id: "State PSC", label: "State PSC", sub: "MPPSC / UPPSC…", emoji: "📍" },
  { id: "Other", label: "Other", sub: "Any exam", emoji: "🎯" },
];

export const StepHeader = ({ step, title, subtitle, accentColor }) => (
  <div className="space-y-1 pb-2">
    <div className="flex items-center gap-2 mb-2">
      <span
        className="text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-0.5 rounded"
        style={{
          color: accentColor,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}28`,
        }}
      >
        Step {step} of 8
      </span>
    </div>
    <h2 className="text-[22px] md:text-[26px] font-black text-white leading-tight">
      {title}
    </h2>
    <p className="text-[12px] text-white/35 leading-relaxed">{subtitle}</p>
  </div>
);

export default function Step1_Identity({ accentColor = "#00FFC8" }) {
  const { data, update } = useOnboarding();

  const name = data?.name ?? "";
  const targetExam = data?.targetExam ?? "";

  return (
    <div className="space-y-6">
      <StepHeader
        step={1}
        title="Let's get to know you"
        subtitle="Your identity is the foundation of your AI companion."
        accentColor={accentColor}
      />

      {/* Name input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <User size={11} style={{ color: accentColor }} />
          Your Name
        </label>
        <input
          type="text"
          placeholder="e.g. Arjun Singh"
          value={name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-white text-[14px] outline-none transition-all duration-200 placeholder-white/20"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${name.trim().length >= 2 ? `${accentColor}45` : "rgba(255,255,255,0.09)"}`,
            boxShadow:
              name.trim().length >= 2 ? `0 0 0 1px ${accentColor}1A` : "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = `${accentColor}65`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor =
              name.trim().length >= 2
                ? `${accentColor}45`
                : "rgba(255,255,255,0.09)";
          }}
        />
      </div>

      {/* Exam selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <BookOpen size={11} style={{ color: accentColor }} />
          Target Exam
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXAMS.map((exam, i) => {
            const isSelected = targetExam === exam.id;
            return (
              <motion.button
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => update({ targetExam: exam.id })}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200"
                style={{
                  background: isSelected
                    ? `${accentColor}12`
                    : "rgba(255,255,255,0.025)",
                  borderColor: isSelected
                    ? `${accentColor}55`
                    : "rgba(255,255,255,0.08)",
                  boxShadow: isSelected ? `0 0 18px ${accentColor}1A` : "none",
                }}
              >
                <span className="text-xl leading-none">{exam.emoji}</span>
                <span
                  className="text-[12px] font-bold leading-tight"
                  style={{
                    color: isSelected ? accentColor : "rgba(255,255,255,0.75)",
                  }}
                >
                  {exam.label}
                </span>
                <span className="text-[9px] text-white/28 leading-tight">
                  {exam.sub}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Live greeting */}
      {name.trim().length >= 2 && targetExam && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{
            borderColor: `${accentColor}22`,
            background: `${accentColor}08`,
          }}
        >
          <ChevronRight
            size={14}
            style={{ color: accentColor }}
            className="shrink-0 mt-0.5"
          />
          <p className="text-[12px] text-white/55 leading-relaxed">
            Welcome,{" "}
            <span className="font-bold" style={{ color: accentColor }}>
              {name.trim()}
            </span>
            ! Your companion will be fully optimised for{" "}
            <span className="font-bold text-white">{targetExam}</span>{" "}
            preparation. Let&apos;s build your perfect system. 🚀
          </p>
        </motion.div>
      )}
    </div>
  );
}
