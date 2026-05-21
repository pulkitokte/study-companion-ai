// FILE PATH: frontend/src/layouts/MainLayout.jsx
// LAYOUT WRAPPER — every authenticated page lives inside this shell.
// Renders: Sidebar (left) + Navbar (top) + Page Content (right/main area).
// The <Outlet /> is where React Router injects the current page component.
// Manages sidebar open/close state and passes it down as props.

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Navbar from "../components/dashboard/Navbar.jsx";

export default function MainLayout() {
  // Controls whether sidebar is expanded (desktop) or open (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Controls sidebar collapse on desktop (icon-only vs full)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile sidebar when screen grows to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#050508] overflow-hidden font-mono">
      {/* ── MOBILE OVERLAY ── */}
      {/* Dark backdrop behind sidebar on mobile. Clicking it closes sidebar. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* ── MAIN AREA: Navbar + Page Content ── */}
      <div
        className={`
          flex flex-col flex-1 min-w-0 transition-all duration-300
          ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"}
        `}
      >
        {/* Top navigation bar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content scrollable area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Subtle background grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,200,0.015) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,200,0.015) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative z-10 p-4 md:p-6 lg:p-8 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
