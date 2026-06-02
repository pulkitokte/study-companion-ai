import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, BarChart3, Clock, Trophy } from "lucide-react";
import { FocusProvider, useFocus } from "../context/FocusContext.jsx";
import { getFocusHistory, getFocusStats } from "../utils/focusStorage.js";
import FocusHome from "../components/focus/FocusHome.jsx";
import SessionSetup from "../components/focus/SessionSetup.jsx";
import FocusTimer from "../components/focus/FocusTimer.jsx";
import CompletionScreen from "../components/focus/CompletionScreen.jsx";
import FocusAnalytics from "../components/focus/FocusAnalytics.jsx";
import SessionHistory from "../components/focus/SessionHistory.jsx";
import FocusAchievements from "../components/focus/FocusAchievements.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { registerToastFn } from "../context/FocusContext.jsx";

const TABS = [
  { id: "home", label: "Focus", icon: Timer },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "history", label: "History", icon: Clock },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

function FocusShell() {
  const { phase } = useFocus();
  const [view, setView] = useState("home");
  const { show } = useToast();

  const inSession = ["setup", "session", "break", "complete"].includes(phase);

  // Re-compute on phase change so analytics update after session ends
  const stats = useMemo(() => getFocusStats(), [phase]);
  const history = useMemo(() => getFocusHistory(), [phase]);
  registerToastFn(show);
  return (
    <div className="min-h-full pb-10">
      {/* Tab nav */}
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

      {/* Content */}
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
            <FocusHome onAnalyticsClick={() => setView("analytics")} />
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
            key="v-achievements"
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
