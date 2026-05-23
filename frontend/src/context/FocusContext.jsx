import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { saveFocusSession, getFocusStats } from "../utils/focusStorage.js";

export const FOCUS_MODES = {
  pomodoro: {
    id: "pomodoro",
    label: "Pomodoro",
    emoji: "🍅",
    color: "#FF6B2B",
    gradient: "linear-gradient(135deg,#FF6B2B,#CC3D00)",
    description: "25 min focus · 5 min break. Proven for sustained output.",
    defaultWork: 25,
    defaultBreak: 5,
    xpPerMinute: 8,
  },
  deepwork: {
    id: "deepwork",
    label: "Deep Work",
    emoji: "🧠",
    color: "#7C6FFF",
    gradient: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
    description: "Long uninterrupted blocks. Maximum cognitive output.",
    defaultWork: 90,
    defaultBreak: 15,
    xpPerMinute: 12,
  },
  sprint: {
    id: "sprint",
    label: "Sprint",
    emoji: "⚡",
    color: "#00FFC8",
    gradient: "linear-gradient(135deg,#00FFC8,#00A884)",
    description: "Short intense bursts. Quick revision or practice.",
    defaultWork: 15,
    defaultBreak: 3,
    xpPerMinute: 6,
  },
};

const FocusContext = createContext(null);

export function FocusProvider({ children }) {
  const [phase, setPhase] = useState("home"); // 'home' | 'setup' | 'session' | 'break' | 'complete'
  const [activeMode, setActiveMode] = useState("pomodoro");
  const [config, setConfig] = useState(null); // { mode, workMinutes, breakMinutes, subject, goal }
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Keyboard: space = pause/resume, Esc = exit fullscreen
  useEffect(() => {
    const handler = (e) => {
      if (phase !== "session" && phase !== "break") return;
      if (
        e.code === "Space" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setRunning((r) => !r);
      }
      if (e.code === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase]);

  const handleTimerEnd = useCallback(() => {
    setRunning(false);
    const modeData = FOCUS_MODES[activeMode] ?? FOCUS_MODES.pomodoro;
    if (phase === "session") {
      const mins = config ? config.workMinutes : modeData.defaultWork;
      const earned = Math.round(mins * modeData.xpPerMinute);
      setXpEarned((prev) => prev + earned);
      setPomodoroCount((c) => c + 1);
      if (activeMode === "pomodoro") {
        setPhase("break");
        const breakSecs = (config?.breakMinutes ?? modeData.defaultBreak) * 60;
        setSecondsLeft(breakSecs);
        setTotalSeconds(breakSecs);
      } else {
        finishSession(earned);
      }
    } else if (phase === "break") {
      setPhase("session");
      const workSecs = (config?.workMinutes ?? modeData.defaultWork) * 60;
      setSecondsLeft(workSecs);
      setTotalSeconds(workSecs);
    }
  }, [phase, activeMode, config]);

  const finishSession = useCallback(
    (bonusXP = 0) => {
      const modeData = FOCUS_MODES[activeMode] ?? FOCUS_MODES.pomodoro;
      const mins = config?.workMinutes ?? modeData.defaultWork;
      const total = xpEarned + bonusXP;
      const duration = startTimeRef.current
        ? Math.round((Date.now() - startTimeRef.current) / 60000)
        : mins;
      saveFocusSession({
        mode: activeMode,
        durationMinutes: duration,
        subject: config?.subject ?? "",
        goal: config?.goal ?? "",
        xpEarned: total,
        pomodoroCount,
        completed: true,
      });
      setXpEarned(total);
      setPhase("complete");
      setRunning(false);
    },
    [activeMode, config, xpEarned, pomodoroCount],
  );

  const startSession = useCallback((cfg) => {
    const modeData = FOCUS_MODES[cfg.mode] ?? FOCUS_MODES.pomodoro;
    const secs = cfg.workMinutes * 60;
    setConfig(cfg);
    setActiveMode(cfg.mode);
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setXpEarned(0);
    setPomodoroCount(0);
    setRunning(true);
    setPhase("session");
    startTimeRef.current = Date.now();
  }, []);

  const pauseResume = useCallback(() => setRunning((r) => !r), []);
  const resetSession = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    if (config) {
      const secs = config.workMinutes * 60;
      setSecondsLeft(secs);
      setTotalSeconds(secs);
      setPhase("session");
    }
  }, [config]);

  const exitToHome = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPhase("home");
    setConfig(null);
    setIsFullscreen(false);
  }, []);

  const goToSetup = useCallback(() => setPhase("setup"), []);

  const pct =
    totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <FocusContext.Provider
      value={{
        phase,
        config,
        activeMode,
        secondsLeft,
        totalSeconds,
        pct,
        running,
        pomodoroCount,
        xpEarned,
        isFullscreen,
        FOCUS_MODES,
        startSession,
        pauseResume,
        resetSession,
        exitToHome,
        goToSetup,
        finishSession,
        setIsFullscreen,
        setPhase,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used inside FocusProvider");
  return ctx;
}
