import { AnimatePresence, motion } from "framer-motion";
import {
  OnboardingProvider,
  useOnboarding,
} from "../context/OnboardingContext.jsx";

import WelcomeScreen from "../components/onboarding/WelcomeScreen.jsx";
import CompletionScreen from "../components/onboarding/CompletionScreen.jsx";
import ProgressBar from "../components/onboarding/ProgressBar.jsx";
import StepNavigation from "../components/onboarding/StepNavigation.jsx";
import StepContainer from "../components/onboarding/StepContainer.jsx";

import Step1_Identity from "../components/onboarding/steps/Step1_Identity.jsx";
import Step2_Sleep from "../components/onboarding/steps/Step2_Sleep.jsx";
import Step3_Schedule from "../components/onboarding/steps/Step3_Schedule.jsx";
import Step4_Capacity from "../components/onboarding/steps/Step4_Capacity.jsx";
import Step5_Burnout from "../components/onboarding/steps/Step5_Burnout.jsx";
import Step6_Goals from "../components/onboarding/steps/Step6_Goals.jsx";
import Step7_StudyStyle from "../components/onboarding/steps/Step7_StudyStyle.jsx";
import Step8_Review from "../components/onboarding/steps/Step8_Review.jsx";

const STEPS = [
  { component: Step1_Identity, label: "Identity", color: "#00FFC8" },
  { component: Step2_Sleep, label: "Sleep", color: "#7C6FFF" },
  { component: Step3_Schedule, label: "Schedule", color: "#FFB347" },
  { component: Step4_Capacity, label: "Capacity", color: "#4FC3F7" },
  { component: Step5_Burnout, label: "Wellbeing", color: "#FF6B2B" },
  { component: Step6_Goals, label: "Goals", color: "#FFD700" },
  { component: Step7_StudyStyle, label: "Style", color: "#B5FF47" },
  { component: Step8_Review, label: "Review", color: "#00FFC8" },
];

function OnboardingShell() {
  const { phase, step } = useOnboarding();

  const currentColor = STEPS[step]?.color ?? "#00FFC8";
  const CurrentStep = STEPS[step]?.component ?? null;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "#050508",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, #7C6FFF, transparent 70%)",
            filter: "blur(80px)",
            opacity: 0.05,
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, #00FFC8, transparent 70%)",
            filter: "blur(80px)",
            opacity: 0.05,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,200,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,200,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: 0.018,
          }}
        />
      </div>

      {/* Phase switcher */}
      <AnimatePresence mode="wait">
        {phase === "welcome" && (
          <motion.div
            key="welcome"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen />
          </motion.div>
        )}

        {phase === "steps" && (
          <motion.div
            key="steps"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Top progress bar */}
            <ProgressBar steps={STEPS} accentColor={currentColor} />

            {/* Scrollable step area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex items-start md:items-center justify-center px-4 py-8">
              <AnimatePresence mode="wait" initial={false}>
                <StepContainer key={`step-${step}`} accentColor={currentColor}>
                  {CurrentStep && <CurrentStep accentColor={currentColor} />}
                </StepContainer>
              </AnimatePresence>
            </div>

            {/* Bottom navigation */}
            <StepNavigation steps={STEPS} accentColor={currentColor} />
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div
            key="complete"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CompletionScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingShell />
    </OnboardingProvider>
  );
}
