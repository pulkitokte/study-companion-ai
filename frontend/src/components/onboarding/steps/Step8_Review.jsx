// FILE PATH: frontend/src/components/onboarding/steps/Step8_Review.jsx
// STEP 8 — Final Review + Confirmation
// Shows a read-only summary of every answer the user gave.
// User confirms before the AI plan is "generated" and they proceed.
// Clicking any edit section jumps back to that step via setStep().

import { motion } from "framer-motion";
import {
  CheckCircle2,
  User,
  Clock,
  Calendar,
  BookOpen,
  Brain,
  Trophy,
  Palette,
  Edit2,
  Zap,
} from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";

export default function Step8_Review({ accentColor }) {
  const { data, setStep } = useOnboarding();

  const sections = buildSections(data);

  return (
    <div className="space-y-5">
      <StepHeader
        step={8}
        title="Review your profile"
        subtitle="Your AI companion is built from everything below. Confirm to activate your personalized study system."
        accentColor={accentColor}
      />

      {/* Review cards */}
      <div className="space-y-2">
        {sections.map((section, si) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.07 }}
            className="group rounded-xl border overflow-hidden transition-all duration-200"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-start justify-between px-4 py-3 gap-3">
              {/* Left — icon + content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${section.color}15`,
                    border: `1px solid ${section.color}25`,
                  }}
                >
                  <section.icon size={13} style={{ color: section.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-white/30 tracking-widest uppercase mb-1.5">
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-start gap-2">
                        <span className="text-[10px] text-white/25 shrink-0 mt-0.5">
                          {item.key}
                        </span>
                        <span className="text-[11px] font-semibold text-white/70 leading-snug">
                          {item.value || (
                            <span className="text-white/20 font-normal italic">
                              Not set
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => setStep(section.stepIndex)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={10} />
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final confirmation banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border p-4 space-y-3"
        style={{
          borderColor: `${accentColor}25`,
          background: `linear-gradient(135deg, ${accentColor}08, rgba(124,111,255,0.06))`,
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} style={{ color: accentColor }} />
          <span
            className="text-[12px] font-bold"
            style={{ color: accentColor }}
          >
            Ready to activate
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Study Plan", val: "AI-Built" },
            { label: "Daily XP", val: "Active" },
            { label: "Companion", val: "Ready" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg py-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p
                className="text-[13px] font-black"
                style={{ color: accentColor }}
              >
                {item.val}
              </p>
              <p className="text-[9px] text-white/25 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/25 leading-relaxed">
          Clicking <span className="text-white/40 font-semibold">Complete</span>{" "}
          activates your personalized AI study companion and generates your
          first week&apos;s study plan.
        </p>
      </motion.div>

      {/* Saved data note */}
      <div className="flex items-center gap-2 justify-center">
        <Zap size={10} className="text-white/15" />
        <p className="text-[10px] text-white/15 text-center">
          Your profile is saved locally. No account required yet.
        </p>
      </div>
    </div>
  );
}

// ─── BUILD REVIEW SECTIONS FROM DATA ───────────────────────────────
function buildSections(data) {
  return [
    {
      label: "Identity",
      icon: User,
      color: "#00FFC8",
      stepIndex: 0,
      items: [
        { key: "Name", value: data.name || "—" },
        { key: "Exam", value: data.targetExam || "—" },
      ],
    },
    {
      label: "Sleep Schedule",
      icon: Clock,
      color: "#7C6FFF",
      stepIndex: 1,
      items: [
        { key: "Wake", value: data.wakeTime },
        { key: "Sleep", value: data.sleepTime },
      ],
    },
    {
      label: "Daily Schedule",
      icon: Calendar,
      color: "#FFB347",
      stepIndex: 2,
      items: [
        {
          key: "College",
          value: data.hasCollege
            ? `${data.collegeStart} – ${data.collegeEnd}`
            : "None",
        },
        {
          key: "Coaching",
          value: data.hasCoaching
            ? `${data.coachingStart} – ${data.coachingEnd}`
            : "None",
        },
        {
          key: "Travel",
          value:
            data.travelMinutes > 0
              ? `${data.travelMinutes} min one-way`
              : "None",
        },
      ],
    },
    {
      label: "Study Capacity",
      icon: BookOpen,
      color: "#4FC3F7",
      stepIndex: 3,
      items: [
        { key: "Daily hours", value: `${data.dailyStudyHours}h` },
        {
          key: "Peak time",
          value: data.preferredTime
            ? data.preferredTime.charAt(0).toUpperCase() +
              data.preferredTime.slice(1)
            : "—",
        },
        { key: "Weekends", value: data.weekendStudy ? "Yes" : "No" },
      ],
    },
    {
      label: "Mental State",
      icon: Brain,
      color: "#FF6B2B",
      stepIndex: 4,
      items: [
        { key: "Burnout", value: `${data.burnoutLevel}/10` },
        { key: "Stress", value: `${data.stressLevel}/10` },
        { key: "Consistency", value: `${data.consistencyLevel}/10` },
      ],
    },
    {
      label: "Goals",
      icon: Trophy,
      color: "#FFD700",
      stepIndex: 5,
      items: [
        { key: "Dream post", value: data.dreamGoal || "—" },
        { key: "Target", value: data.targetRank || "Not set" },
        {
          key: "Why",
          value: data.whyUpsc
            ? data.whyUpsc.slice(0, 60) + (data.whyUpsc.length > 60 ? "…" : "")
            : "—",
        },
      ],
    },
    {
      label: "Study Style",
      icon: Palette,
      color: "#B5FF47",
      stepIndex: 6,
      items: [
        {
          key: "Technique",
          value: data.studyStyle
            ? data.studyStyle.charAt(0).toUpperCase() + data.studyStyle.slice(1)
            : "—",
        },
        {
          key: "Session",
          value: data.sessionDuration ? `${data.sessionDuration} min` : "—",
        },
        {
          key: "Revision",
          value: data.revisionPreference
            ? data.revisionPreference.charAt(0).toUpperCase() +
              data.revisionPreference.slice(1)
            : "—",
        },
      ],
    },
  ];
}
