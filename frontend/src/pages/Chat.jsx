// FILE PATH: frontend/src/pages/Chat.jsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatProvider } from "../context/ChatContext.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";

// Pull user profile from localStorage (set during onboarding)
function getUserProfile() {
  try {
    const raw = localStorage.getItem("studymind_profile");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ChatPageInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = getUserProfile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex h-full overflow-hidden rounded-2xl border border-white/[0.05]"
      style={{ background: "#07070F" }}
    >
      {/* ── LEFT: Mode sidebar ── */}
      <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── RIGHT: Chat area ── */}
      <ChatWindow onOpenSidebar={() => setSidebarOpen(true)} />
    </motion.div>
  );
}

// Wrap with provider so all chat components share state
export default function Chat() {
  return (
    <div className="h-[calc(100vh-64px)] max-h-[900px]">
      <ChatProvider>
        <ChatPageInner />
      </ChatProvider>
    </div>
  );
}
