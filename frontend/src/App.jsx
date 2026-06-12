import { BrowserRouter } from "react-router-dom";
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { SystemProvider } from "./context/SystemContext.jsx";
import { RealtimeProvider } from "./context/RealtimeContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import LoadingScreen from "./components/ui/LoadingScreen.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import BottomTabs from "./components/mobile/BottomTabs.jsx";
import QuickTour from "./components/launch/QuickTour.jsx";
import DemoModeBanner from "./components/launch/DemoModeBanner.jsx";
import UpdateBanner from "./components/premium/UpdateBanner.jsx";
import OfflineBanner from "./components/system/OfflineBanner.jsx";
import CommandPalette from "./components/premium/CommandPalette.jsx";
import KeyboardShortcuts, {
  useKeyboardShortcuts,
} from "./components/premium/KeyboardShortcuts.jsx";
import { isDemoMode } from "./utils/demoDataSeeder.js";
import { startFPSMonitor } from "./utils/performanceMonitor.js";
import { isMobile } from "./utils/mobileOptimizations.js";

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

  useKeyboardShortcuts({ onOpenCmd: () => setCmdOpen(true) });

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
      {isDemo && <DemoModeBanner />}
      <UpdateBanner />
      <OfflineBanner />

      <AppRoutes />

      <BottomTabs />
      <AuthModal />

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <KeyboardShortcuts
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <Suspense fallback={null}>
        {!isMobile() && <FloatingAssistant />}
        <NotificationCenter />
      </Suspense>

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
          <AuthProvider>
            <UserProvider>
              <SystemProvider>
                <RealtimeProvider>
                  <AdminProvider>
                    {!booted && <LoadingScreen onComplete={handleBoot} />}
                    {booted && <AppShell />}
                  </AdminProvider>
                </RealtimeProvider>
              </SystemProvider>
            </UserProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
