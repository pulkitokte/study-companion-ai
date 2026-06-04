import { BrowserRouter } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ToastProvider } from "./components/ui/Toast.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import LoadingScreen from "./components/ui/LoadingScreen.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { startFPSMonitor } from "./utils/performanceMonitor.js";

export default function App() {
  const [booted, setBooted] = useState(false);
  const handleBoot = useCallback(() => setBooted(true), []);

  useEffect(() => {
    // Start perf monitor in dev
    if (import.meta.env.DEV) startFPSMonitor();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          {!booted && <LoadingScreen onComplete={handleBoot} />}
          {booted && <AppRoutes />}
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
