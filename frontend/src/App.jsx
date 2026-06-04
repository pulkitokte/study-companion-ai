import { BrowserRouter } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ToastProvider } from "./components/ui/Toast.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import LoadingScreen from "./components/ui/LoadingScreen.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import FloatingAssistant from "./components/launch/FloatingAssistant.jsx";
import DemoModeBanner from "./components/launch/DemoModeBanner.jsx";
import BottomTabs from "./components/mobile/BottomTabs.jsx";
import QuickTour from "./components/launch/QuickTour.jsx";
import { isDemoMode } from "./utils/demoDataSeeder.js";
import { startFPSMonitor } from "./utils/performanceMonitor.js";
import { isMobile } from "./utils/mobileOptimizations.js";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const handleBoot = useCallback(() => {
    setBooted(true);
    setIsDemo(isDemoMode());
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) startFPSMonitor();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          {/* Boot sequence */}
          {!booted && <LoadingScreen onComplete={handleBoot} />}

          {booted && (
            <>
              {/* Demo mode banner */}
              {isDemo && <DemoModeBanner />}

              {/* Main app — push down when demo banner visible */}
              <div style={{ paddingTop: isDemo ? 44 : 0 }}>
                <AppRoutes />
              </div>

              {/* Mobile bottom tabs */}
              <BottomTabs />

              {/* Floating AI assistant (desktop only) */}
              {!isMobile() && <FloatingAssistant />}

              {/* Quick tour (first time) */}
              <QuickTour />
            </>
          )}
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
