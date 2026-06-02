import { useState } from "react";
import { motion } from "framer-motion";
import { User, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "../ui/Toast.jsx";

const EXAMS = [
  "UPSC",
  "SSC",
  "Banking",
  "Railway",
  "Insurance",
  "Defence",
  "State PSC",
  "Other",
];
const SUBJECTS = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Science & Tech",
  "Environment",
  "Current Affairs",
  "CSAT",
];

function getProfile() {
  try {
    return (
      JSON.parse(localStorage.getItem("studymind_profile") ?? "null") ?? {}
    );
  } catch {
    return {};
  }
}

export default function ProfileCard() {
  const { show } = useToast();
  const init = getProfile();

  const [name, setName] = useState(init.name ?? "");
  const [targetExam, setTargetExam] = useState(init.targetExam ?? "");
  const [dreamGoal, setDreamGoal] = useState(init.dreamGoal ?? "");
  const [weakSubjects, setWeakSubjects] = useState(init.weakSubjects ?? []);
  const [saved, setSaved] = useState(false);

  const initials =
    name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SC";

  const handleSave = () => {
    const profile = {
      ...getProfile(),
      name,
      targetExam,
      dreamGoal,
      weakSubjects,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("studymind_profile", JSON.stringify(profile));
    setSaved(true);
    show({
      type: "mission",
      title: "Profile saved",
      message: "Changes applied immediately",
      duration: 2500,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSubject = (s) => {
    setWeakSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3">
        <User size={15} className="text-[#00FFC8]" />
        <h3 className="text-[14px] font-bold text-white">Profile</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-70" />
            <div className="relative w-16 h-16 rounded-full bg-[#0F0F1E] flex items-center justify-center text-xl font-black text-white">
              {initials}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">
              {name || "Your Name"}
            </p>
            <p className="text-[11px] text-[#00FFC8]/60">
              {targetExam || "Set your target exam"}
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-[11px] text-white/35 uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-xl border bg-white/[0.03] text-white placeholder-white/20 text-[13px] outline-none transition-all"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(0,255,200,0.45)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
        </div>

        {/* Target exam */}
        <div className="space-y-2">
          <label className="text-[11px] text-white/35 uppercase tracking-widest">
            Target Exam
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAMS.map((e) => {
              const on = targetExam === e;
              return (
                <button
                  key={e}
                  onClick={() => setTargetExam(e)}
                  className="px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all"
                  style={{
                    background: on
                      ? "rgba(0,255,200,0.12)"
                      : "rgba(255,255,255,0.03)",
                    borderColor: on
                      ? "rgba(0,255,200,0.45)"
                      : "rgba(255,255,255,0.08)",
                    color: on ? "#00FFC8" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dream goal */}
        <div className="space-y-2">
          <label className="text-[11px] text-white/35 uppercase tracking-widest">
            Dream Goal
          </label>
          <input
            type="text"
            value={dreamGoal}
            onChange={(e) => setDreamGoal(e.target.value)}
            placeholder="e.g. IAS, IBPS PO, RRB NTPC..."
            className="w-full px-4 py-2.5 rounded-xl border bg-white/[0.03] text-white placeholder-white/20 text-[13px] outline-none transition-all"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(0,255,200,0.45)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          />
        </div>

        {/* Weak subjects */}
        <div className="space-y-2">
          <label className="text-[11px] text-white/35 uppercase tracking-widest">
            Weak Subjects
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const on = weakSubjects.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className="px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all"
                  style={{
                    background: on
                      ? "rgba(255,107,157,0.12)"
                      : "rgba(255,255,255,0.03)",
                    borderColor: on
                      ? "rgba(255,107,157,0.45)"
                      : "rgba(255,255,255,0.08)",
                    color: on ? "#FF6B9D" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all"
          style={{
            background: saved
              ? "rgba(0,255,100,0.12)"
              : "linear-gradient(135deg,#00FFC8,#00A884)",
            color: saved ? "#00FF64" : "#000",
            border: saved ? "1px solid rgba(0,255,100,0.35)" : "none",
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={14} /> Saved!
            </>
          ) : (
            <>
              <Save size={14} /> Save Changes
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
