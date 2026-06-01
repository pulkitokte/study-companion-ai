import { useState } from "react";
import { motion } from "framer-motion";
import { AIProvider } from "../context/AIContext.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";

function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100vh-64px)] max-h-[900px] overflow-hidden rounded-2xl border border-white/[0.05]"
      style={{ background: "#07070F" }}
    >
      <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ChatWindow onOpenSidebar={() => setSidebarOpen(true)} />
    </motion.div>
  );
}

export default function Chat() {
  return (
    <AIProvider>
      <ChatShell />
    </AIProvider>
  );
}
