import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, BarChart3, Clock, Trophy, BookOpen } from "lucide-react";
import {
  FocusProvider,
  useFocus,
  registerToastFn,
} from "../context/FocusContext.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { getFocusHistory, getFocusStats } from "../utils/focusStorage.js";
import FocusHome from "../components/focus/FocusHome.jsx";
import SessionSetup from "../components/focus/SessionSetup.jsx";
import FocusTimer from "../components/focus/FocusTimer.jsx";
import CompletionScreen from "../components/focus/CompletionScreen.jsx";
import FocusAnalytics from "../components/focus/FocusAnalytics.jsx";
import SessionHistory from "../components/focus/SessionHistory.jsx";
import FocusAchievements from "../components/focus/FocusAchievements.jsx";
import syllabusService from "../services/syllabusService.js";
import {
  startFocusSyllabusSession,
  clearFocusSyllabusSession,
} from "../utils/focusSyllabusSession.js";

const TABS = [
  { id: "home", label: "Focus", icon: Timer },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "history", label: "History", icon: Clock },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

// ─── STUDY CONTEXT CARD ───────────────────────────────────────────────────────

function StudyContextCard({ subjects, value, onChange }) {
  const hasSubjects = subjects.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto rounded-2xl border border-white/[0.06] p-5"
      style={{ background: "#0A0A14" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-[#7C6FFF]" />
          <span className="text-[13px] font-black text-white">
            Study Context
          </span>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          Optional
        </span>
      </div>

      <p className="text-[11px] text-white/35 mb-3 leading-relaxed">
        What are you studying? Tagging a subject lets StudyMind track your
        syllabus coverage automatically.
      </p>

      {/* Dropdown */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border px-3.5 py-2.5 text-[12px] outline-none
                     transition-all appearance-none cursor-pointer pr-9"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: value
              ? "rgba(124,111,255,0.40)"
              : "rgba(255,255,255,0.08)",
            color: value ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.30)",
          }}
        >
          <option value="" style={{ background: "#0D0D1A" }}>
            Select Subject (Optional)
          </option>
          {hasSubjects ? (
            subjects.map((s) => (
              <option key={s.id} value={s.id} style={{ background: "#0D0D1A" }}>
                {s.emoji ? `${s.emoji}  ` : ""}
                {s.label}
              </option>
            ))
          ) : (
            <option disabled style={{ background: "#0D0D1A" }}>
              No subjects available
            </option>
          )}
        </select>

        {/* Custom chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4l4 4 4-4"
              stroke={value ? "#7C6FFF" : "rgba(255,255,255,0.28)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Selected indicator + clear */}
      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.05]"
        >
          <span className="text-[10px] text-[#7C6FFF]/70 font-bold">
            ✓ Subject tagged — will be recorded with this session
          </span>
          <button
            onClick={() => onChange("")}
            className="text-[10px] text-white/22 hover:text-white/50 transition-colors ml-3 shrink-0"
          >
            Clear
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── FOCUS SHELL ──────────────────────────────────────────────────────────────

function FocusShell() {
  const { phase } = useFocus();
  const [view, setView] = useState("home");

  // Wire toast bridge — runs on every render but is a no-op if already set
  const { show } = useToast();
  registerToastFn(show);

  const inSession = ["setup", "session", "break", "complete"].includes(phase);
  const stats = useMemo(() => getFocusStats(), [phase]);
  const history = useMemo(() => getFocusHistory(), [phase]);

  // ── Phase 35 Batch B: Study Context state ────────────────────────────────
  const [activeExam, setActiveExam] = useState("upsc");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Ref keeps the latest selection accessible inside phase-watch effect
  // without adding it to the dependency array (avoids stale closures).
  const selectionRef = useRef({
    selectedSubjectId: "",
    subjects: [],
    activeExam: "upsc",
  });

  useEffect(() => {
    selectionRef.current = { selectedSubjectId, subjects, activeExam };
  }, [selectedSubjectId, subjects, activeExam]);

  // Load subjects for the current active exam on mount
  useEffect(() => {
    try {
      const examId = syllabusService.getActiveExam();
      setActiveExam(examId);
      const subs = syllabusService.getAllSubjectProgress(examId) ?? [];
      // Flatten to minimal shape the card needs: { id, label, emoji }
      setSubjects(
        subs.map((s) => ({
          id: s.id,
          label: s.label ?? s.id,
          emoji: s.emoji ?? "",
        })),
      );
    } catch {
      setSubjects([]);
    }
  }, []);

  // Watch for the transition from home into the session flow.
  // When phase enters "setup", persist the chosen syllabus context
  // (or clear any stale session if nothing was selected).
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    const wasOutside = !["setup", "session", "break", "complete"].includes(
      prev,
    );
    const nowSetup = phase === "setup";

    if (wasOutside && nowSetup) {
      const {
        selectedSubjectId: sid,
        subjects: subs,
        activeExam: eid,
      } = selectionRef.current;

      if (sid) {
        const subject = subs.find((s) => s.id === sid);
        if (subject) {
          startFocusSyllabusSession({
            examId: eid,
            subjectId: subject.id,
            subjectLabel: subject.label,
            topicId: null,
            topicLabel: null,
            startedAt: new Date().toISOString(),
          });
        }
      } else {
        // No subject chosen — clear any leftover session from a prior run
        clearFocusSyllabusSession();
      }
    }
  }, [phase]);

  return (
    <div className="min-h-full pb-10">
      <AnimatePresence>
        {!inSession && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 mb-6 overflow-x-auto scrollbar-none"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const on = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0 text-[12px] font-bold transition-all duration-200"
                  style={{
                    background: on
                      ? "rgba(124,111,255,0.1)"
                      : "rgba(255,255,255,0.025)",
                    borderColor: on
                      ? "rgba(124,111,255,0.45)"
                      : "rgba(255,255,255,0.07)",
                    color: on ? "#7C6FFF" : "rgba(255,255,255,0.32)",
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SessionSetup />
          </motion.div>
        )}
        {(phase === "session" || phase === "break") && (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FocusTimer />
          </motion.div>
        )}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CompletionScreen />
          </motion.div>
        )}
        {!inSession && view === "home" && (
          <motion.div
            key="v-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Study Context card above FocusHome — Phase 35 Batch B */}
            <div className="space-y-5">
              <StudyContextCard
                subjects={subjects}
                value={selectedSubjectId}
                onChange={setSelectedSubjectId}
              />
              <FocusHome onAnalyticsClick={() => setView("analytics")} />
            </div>
          </motion.div>
        )}
        {!inSession && view === "analytics" && (
          <motion.div
            key="v-analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FocusAnalytics onBack={() => setView("home")} />
          </motion.div>
        )}
        {!inSession && view === "history" && (
          <motion.div
            key="v-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-black text-white">
                  Session History
                </h2>
                <span className="text-[11px] text-white/25">
                  {history.length} total
                </span>
              </div>
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <SessionHistory sessions={history} />
              </div>
            </div>
          </motion.div>
        )}
        {!inSession && view === "achievements" && (
          <motion.div
            key="v-ach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-[20px] font-black text-white">
                Focus Achievements
              </h2>
              <div
                className="rounded-2xl border border-white/[0.06] p-5"
                style={{ background: "#0A0A14" }}
              >
                <FocusAchievements stats={stats} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Focus() {
  return (
    <FocusProvider>
      <FocusShell />
    </FocusProvider>
  );
}
