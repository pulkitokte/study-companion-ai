import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, RefreshCw, AlertTriangle, X } from "lucide-react";
import { useToast } from "../ui/Toast.jsx";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.1] p-6 space-y-4"
        style={{ background: "#0D0D1A" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Are you sure?</p>
            <p className="text-[11px] text-white/40">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/45 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-bold text-[12px] bg-red-500/80 hover:bg-red-500 text-white transition-all"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const DATA_KEYS = [
  "studymind_quiz_history",
  "studymind_focus_history",
  "studymind_ai_memory",
  "studymind_chat_history",
  "studymind_planner",
  "studymind_missions",
  "studymind_achievements",
];

export default function DataManagement() {
  const { show } = useToast();
  const [confirm, setConfirm] = useState(null); // { message, action }

  const handleExport = () => {
    const data = {};
    DATA_KEYS.forEach((k) => {
      try {
        data[k] = JSON.parse(localStorage.getItem(k) ?? "null");
      } catch {
        data[k] = null;
      }
    });
    data["studymind_profile"] = JSON.parse(
      localStorage.getItem("studymind_profile") ?? "null",
    );
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studymind-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show({
      type: "info",
      title: "Data exported",
      message: "JSON file downloaded",
      duration: 2500,
    });
  };

  const handleClearHistory = () => {
    DATA_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
    show({
      type: "info",
      title: "History cleared",
      message: "Profile and settings preserved",
      duration: 3000,
    });
    setConfirm(null);
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("studymind_onboarded");
    show({
      type: "info",
      title: "Onboarding reset",
      message: "Refresh and set up your profile again",
      duration: 3000,
    });
    setConfirm(null);
    setTimeout(() => (window.location.href = "/"), 2000);
  };

  const handleFullReset = () => {
    localStorage.clear();
    show({
      type: "info",
      title: "App reset complete",
      message: "Redirecting to onboarding...",
      duration: 2000,
    });
    setConfirm(null);
    setTimeout(() => (window.location.href = "/"), 2200);
  };

  const ACTIONS = [
    {
      icon: Download,
      label: "Export All Data",
      sub: "Download your full study history as JSON",
      color: "#00FFC8",
      action: handleExport,
      confirm: false,
    },
    {
      icon: Trash2,
      label: "Clear Study History",
      sub: "Remove quiz, focus, and chat history. Profile preserved.",
      color: "#FFB347",
      action: () =>
        setConfirm({
          message:
            "This will remove all quiz, focus, and chat history. Your profile will remain.",
          action: handleClearHistory,
        }),
      confirm: true,
    },
    {
      icon: RefreshCw,
      label: "Reset Onboarding",
      sub: "Redo the onboarding setup flow",
      color: "#7C6FFF",
      action: () =>
        setConfirm({
          message:
            "This will take you back through onboarding. Your history will be preserved.",
          action: handleResetOnboarding,
        }),
      confirm: true,
    },
    {
      icon: Trash2,
      label: "Full App Reset",
      sub: "Delete everything and start fresh",
      color: "#FF3C3C",
      action: () =>
        setConfirm({
          message: "This deletes ALL data permanently. This cannot be undone.",
          action: handleFullReset,
        }),
      confirm: true,
    },
  ];

  return (
    <>
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            message={confirm.message}
            onConfirm={confirm.action}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3">
          <Trash2 size={15} className="text-[#FF6B9D]" />
          <h3 className="text-[14px] font-bold text-white">Data Management</h3>
        </div>
        <div className="p-6 space-y-3">
          {ACTIONS.map((act, i) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={act.action}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 group"
                style={{
                  background: `${act.color}06`,
                  borderColor: `${act.color}18`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${act.color}38`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${act.color}18`;
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${act.color}14` }}
                >
                  <Icon size={15} style={{ color: act.color }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white/80">
                    {act.label}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">{act.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
}
