import { useState } from "react";
import { motion } from "framer-motion";
import { AIProvider } from "../context/AIContext.jsx";
import ChatSidebar from "../components/chat/ChatSidebar.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import ConnectionStatus from "../components/ui/ConnectionStatus.jsx";

function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Connection status bar */}
      <div className="flex justify-end">
        <ConnectionStatus />
      </div>

      {/* Chat container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex overflow-hidden rounded-2xl border border-white/[0.05]"
        style={{
          background: "#07070F",
          height: "calc(100vh - 148px)",
          minHeight: "500px",
          maxHeight: "860px",
        }}
      >
        <ChatSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <ChatWindow onOpenSidebar={() => setSidebarOpen(true)} />
      </motion.div>
    </div>
  );
}

export default function Chat() {
  return (
    <AIProvider>
      <ChatShell />
    </AIProvider>
  );
}
