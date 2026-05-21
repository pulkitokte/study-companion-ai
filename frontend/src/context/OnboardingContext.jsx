import { createContext, useContext, useState } from "react";

const INITIAL_DATA = {
  name: "",
  targetExam: "",
  wakeTime: "06:00",
  sleepTime: "22:30",
  hasCollege: false,
  collegeStart: "09:00",
  collegeEnd: "15:00",
  hasCoaching: false,
  coachingStart: "16:00",
  coachingEnd: "19:00",
  travelMinutes: 0,
  dailyStudyHours: 4,
  weekendStudy: true,
  preferredTime: "",
  weakSubjects: [],
  strongSubjects: [],
  burnoutLevel: 5,
  stressLevel: 5,
  consistencyLevel: 5,
  dreamGoal: "",
  targetRank: "",
  whyUpsc: "",
  studyStyle: "",
  sessionDuration: 45,
  revisionPreference: "",
};

const TOTAL_STEPS = 8;

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("welcome");
  const [direction, setDirection] = useState(1);

  const update = (fields) => setData((prev) => ({ ...prev, ...fields }));

  const next = () => {
    setDirection(1);
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      const payload = { ...data, completedAt: new Date().toISOString() };
      localStorage.setItem("studymind_profile", JSON.stringify(payload));
      localStorage.setItem("studymind_onboarded", "true");
      setPhase("complete");
    }
  };

  const prev = () => {
    setDirection(-1);
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      setPhase("welcome");
    }
  };

  const startOnboarding = () => {
    setDirection(1);
    setPhase("steps");
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        update,
        step,
        setStep,
        next,
        prev,
        phase,
        startOnboarding,
        direction,
        TOTAL_STEPS,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
