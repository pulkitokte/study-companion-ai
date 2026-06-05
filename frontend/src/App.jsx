import { BrowserRouter } from "react-router-dom";
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { ToastProvider } from "./components/ui/Toast.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import LoadingScreen from "./components/ui/LoadingScreen.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import BottomTabs from "./components/mobile/BottomTabs.jsx";
import QuickTour from "./components/launch/QuickTour.jsx";
import DemoModeBanner from "./components/launch/DemoModeBanner.jsx";
import UpdateBanner from "./components/premium/UpdateBanner.jsx";
import CommandPalette from "./components/premium/CommandPalette.jsx";
import KeyboardShortcuts, {
  useKeyboardShortcuts,
} from "./components/premium/KeyboardShortcuts.jsx";
import { isDemoMode } from "./utils/demoDataSeeder.js";
import { startFPSMonitor } from "./utils/performanceMonitor.js";
import { isMobile } from "./utils/mobileOptimizations.js";

// Lazy-loaded premium overlays
const FloatingAssistant = lazy(
  () => import("./components/launch/FloatingAssistant.jsx"),
);
const NotificationCenter = lazy(
  () => import("./components/premium/NotificationCenter.jsx"),
);

function AppShell() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const isDemo = isDemoMode();

  // Register global keyboard shortcuts
  useKeyboardShortcuts({ onOpenCmd: () => setCmdOpen(true) });

  // '?' to open shortcuts panel
  useEffect(() => {
    const fn = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div style={{ paddingTop: isDemo ? 44 : 0 }}>
      {/* Banners */}
      {isDemo && <DemoModeBanner />}
      <UpdateBanner />

      {/* Main routes */}
      <AppRoutes />

      {/* Mobile bottom tabs */}
      <BottomTabs />

      {/* Command palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Keyboard shortcuts panel */}
      <KeyboardShortcuts
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Lazy premium overlays */}
      <Suspense fallback={null}>
        {!isMobile() && <FloatingAssistant />}
        <NotificationCenter />
      </Suspense>

      {/* First-time tour */}
      <QuickTour />
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const handleBoot = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (import.meta.env.DEV) startFPSMonitor();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          {!booted && <LoadingScreen onComplete={handleBoot} />}
          {booted && <AppShell />}
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
