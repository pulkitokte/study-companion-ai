import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout.jsx";

const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Chat = lazy(() => import("../pages/Chat.jsx"));
const Quiz = lazy(() => import("../pages/Quiz.jsx"));
const Focus = lazy(() => import("../pages/Focus.jsx"));
const Progress = lazy(() => import("../pages/Progress.jsx"));
const Planner = lazy(() => import("../pages/Planner.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
const Showcase = lazy(() => import("../pages/Showcase.jsx"));
const Onboarding = lazy(() => import("../pages/Onboarding.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1, 0.95] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF]"
      />
    </div>
  );
}

function RootRedirect() {
  const onboarded = localStorage.getItem("studymind_onboarded") === "true";
  return <Navigate to={onboarded ? "/dashboard" : "/onboarding"} replace />;
}

export default function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Main layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
