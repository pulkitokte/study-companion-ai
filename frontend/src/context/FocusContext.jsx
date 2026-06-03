import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { saveFocusSession } from "../utils/focusStorage.js";
import { notifyStatsUpdate } from "../hooks/useGlobalStats.js";

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

// Module-level toast bridge — set once by Focus.jsx via registerToastFn
let _toast = null;
export function registerToastFn(fn) {
  _toast = fn;
}
function fireToast(opts) {
  try {
    if (_toast) _toast(opts);
  } catch {
    /* ignore */
  }
}

export function FocusProvider({ children }) {
  const [phase, setPhase] = useState("home");
  const [activeMode, setActiveMode] = useState("pomodoro");
  const [config, setConfig] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tickRef = useRef(null);
  const startRef = useRef(null);
  const configRef = useRef(null);
  const xpRef = useRef(0);
  const pomRef = useRef(0);
  const firedRef = useRef(false);
  const prevSecs = useRef(0);

  useEffect(() => {
    configRef.current = config;
  }, [config]);
  useEffect(() => {
    xpRef.current = xpEarned;
  }, [xpEarned]);
  useEffect(() => {
    pomRef.current = pomodoroCount;
  }, [pomodoroCount]);

  // Tick
  useEffect(() => {
    if (!running) {
      clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setSecondsLeft((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  // Natural end detection
  useEffect(() => {
    if (secondsLeft === 0 && prevSecs.current > 0 && !firedRef.current) {
      firedRef.current = true;
      clearInterval(tickRef.current);
      setRunning(false);
      handleTimerEnd();
    }
    if (secondsLeft > 0) firedRef.current = false;
    prevSecs.current = secondsLeft;
  }, [secondsLeft]); // eslint-disable-line

  // Keyboard
  useEffect(() => {
    const fn = (e) => {
      if (!["session", "break"].includes(phase)) return;
      if (
        e.code === "Space" &&
        !["INPUT", "TEXTAREA"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        setRunning((r) => !r);
      }
      if (e.code === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [phase]);

  const saveAndNotify = useCallback((sessionData) => {
    saveFocusSession(sessionData);
    notifyStatsUpdate(); // ping all global stat consumers
  }, []);

  const handleTimerEnd = useCallback(() => {
    const cfg = configRef.current;
    if (!cfg) return;
    const modeData = FOCUS_MODES[cfg.mode] ?? FOCUS_MODES.pomodoro;
    const mins = cfg.workMinutes ?? modeData.defaultWork;

    if (phase === "session" || prevSecs.current === 0) {
      const earned = Math.round(mins * modeData.xpPerMinute);
      const newXP = xpRef.current + earned;
      const newCount = pomRef.current + 1;
      setXpEarned(newXP);
      xpRef.current = newXP;
      setPomodoroCount(newCount);
      pomRef.current = newCount;

      fireToast({
        type: "xp",
        title: `+${earned} XP earned`,
        message: `${mins}m ${modeData.label} session`,
        duration: 3000,
      });

      if (cfg.mode === "pomodoro") {
        fireToast({
          type: "info",
          title: "☕ Break Time!",
          message: `${cfg.breakMinutes ?? modeData.defaultBreak}m rest`,
          duration: 2500,
        });
        const bSecs = (cfg.breakMinutes ?? modeData.defaultBreak) * 60;
        setPhase("break");
        setSecondsLeft(bSecs);
        prevSecs.current = bSecs;
        setTotalSeconds(bSecs);
        setTimeout(() => setRunning(true), 100);
      } else {
        const dur = startRef.current
          ? Math.round((Date.now() - startRef.current) / 60000)
          : mins;
        saveAndNotify({
          mode: cfg.mode,
          durationMinutes: dur,
          subject: cfg.subject,
          goal: cfg.goal,
          xpEarned: newXP,
          pomodoroCount: newCount,
          completed: true,
        });
        fireToast({
          type: "mission",
          title: "Session Complete! 🎯",
          message: `${dur}m focused · +${newXP} XP`,
          duration: 4000,
        });
        setPhase("complete");
      }
    } else if (phase === "break") {
      fireToast({
        type: "streak",
        title: "Break over. Lock in! ⚡",
        message: "Next work session starting",
        duration: 2000,
      });
      const wSecs = (cfg.workMinutes ?? modeData.defaultWork) * 60;
      setPhase("session");
      setSecondsLeft(wSecs);
      prevSecs.current = wSecs;
      setTotalSeconds(wSecs);
      setTimeout(() => setRunning(true), 100);
    }
  }, [phase, saveAndNotify]);

  const startSession = useCallback((cfg) => {
    const modeData = FOCUS_MODES[cfg.mode] ?? FOCUS_MODES.pomodoro;
    const secs = cfg.workMinutes * 60;
    setConfig(cfg);
    configRef.current = cfg;
    setActiveMode(cfg.mode);
    setSecondsLeft(secs);
    prevSecs.current = secs;
    setTotalSeconds(secs);
    setXpEarned(0);
    xpRef.current = 0;
    setPomodoroCount(0);
    pomRef.current = 0;
    firedRef.current = false;
    setRunning(true);
    setPhase("session");
    startRef.current = Date.now();
    fireToast({
      type: "info",
      title: `${modeData.emoji} ${modeData.label} started`,
      message: `${cfg.workMinutes}m${cfg.subject ? ` · ${cfg.subject}` : ""}`,
      duration: 2000,
    });
  }, []);

  const pauseResume = useCallback(() => setRunning((r) => !r), []);

  const resetSession = useCallback(() => {
    clearInterval(tickRef.current);
    setRunning(false);
    const cfg = configRef.current;
    if (cfg) {
      const s = cfg.workMinutes * 60;
      setSecondsLeft(s);
      prevSecs.current = s;
      setTotalSeconds(s);
      setPhase("session");
      firedRef.current = false;
    }
  }, []);

  const finishEarly = useCallback(() => {
    clearInterval(tickRef.current);
    setRunning(false);
    const cfg = configRef.current;
    if (!cfg) {
      setPhase("home");
      return;
    }
    const modeData = FOCUS_MODES[cfg.mode] ?? FOCUS_MODES.pomodoro;
    const elapsed = startRef.current
      ? Math.round((Date.now() - startRef.current) / 60000)
      : cfg.workMinutes;
    const finalXP =
      xpRef.current +
      Math.round(
        Math.min(elapsed, cfg.workMinutes) * modeData.xpPerMinute * 0.5,
      );
    setXpEarned(finalXP);
    saveAndNotify({
      mode: cfg.mode,
      durationMinutes: elapsed,
      subject: cfg.subject,
      goal: cfg.goal,
      xpEarned: finalXP,
      pomodoroCount: pomRef.current,
      completed: false,
    });
    fireToast({
      type: "xp",
      title: `Session saved · +${finalXP} XP`,
      message: `${elapsed}m completed`,
      duration: 3000,
    });
    setPhase("complete");
  }, [saveAndNotify]);

  const exitToHome = useCallback(() => {
    clearInterval(tickRef.current);
    setRunning(false);
    setPhase("home");
    setConfig(null);
    configRef.current = null;
    setIsFullscreen(false);
    setXpEarned(0);
    setPomodoroCount(0);
    xpRef.current = 0;
    pomRef.current = 0;
    firedRef.current = false;
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
        FOCUS_MODES,
        secondsLeft,
        totalSeconds,
        pct,
        running,
        pomodoroCount,
        xpEarned,
        isFullscreen,
        startSession,
        pauseResume,
        resetSession,
        finishEarly,
        exitToHome,
        goToSetup,
        setIsFullscreen,
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
