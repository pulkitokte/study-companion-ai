import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import Onboarding from "../pages/Onboarding.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Planner from "../pages/Planner.jsx";
import Chat from "../pages/Chat.jsx";
import Quiz from "../pages/Quiz.jsx";
import Progress from "../pages/Progress.jsx";
import Focus from "../pages/Focus.jsx";
import Settings from "../pages/Settings.jsx";

function RootRedirect() {
  const done = localStorage.getItem("studymind_onboarded") === "true";
  return <Navigate to={done ? "/dashboard" : "/onboarding"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
