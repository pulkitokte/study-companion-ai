import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  {
    keys: ["G", "D"],
    label: "Go to Dashboard",
    action: "nav",
    path: "/dashboard",
  },
  { keys: ["G", "C"], label: "Go to Chat", action: "nav", path: "/chat" },
  { keys: ["G", "Q"], label: "Go to Quiz", action: "nav", path: "/quiz" },
  { keys: ["G", "F"], label: "Go to Focus", action: "nav", path: "/focus" },
  {
    keys: ["G", "P"],
    label: "Go to Progress",
    action: "nav",
    path: "/progress",
  },
  { keys: ["G", "L"], label: "Go to Planner", action: "nav", path: "/planner" },
  {
    keys: ["G", "S"],
    label: "Go to Settings",
    action: "nav",
    path: "/settings",
  },
  { keys: ["⌘", "K"], label: "Open Command Palette", action: "cmd" },
  { keys: ["/"], label: "Focus Search", action: "cmd" },
  { keys: ["?"], label: "Show Shortcuts", action: "shortcuts" },
  { keys: ["Escape"], label: "Close modals", action: "escape" },
];

// Key: 'G' pressed first, then second key within 800ms
let gPressed = false;
let gTimer = null;

export function useKeyboardShortcuts({ onOpenCmd }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (["INPUT", "TEXTAREA"].includes(tag)) return;

      // CMD+K or CTRL+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenCmd?.();
        return;
      }
      // / → command palette
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onOpenCmd?.();
        return;
      }

      // G + second key navigation
      if (e.key === "g" || e.key === "G") {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 800);
        return;
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(gTimer);
        const map = {
          d: "/dashboard",
          c: "/chat",
          q: "/quiz",
          f: "/focus",
          p: "/progress",
          l: "/planner",
          s: "/settings",
        };
        const path = map[e.key.toLowerCase()];
        if (path) {
          e.preventDefault();
          navigate(path);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, onOpenCmd]);
}

const KEY_GROUPS = [
  { label: "Navigation", items: SHORTCUTS.filter((s) => s.action === "nav") },
  {
    label: "Search & Commands",
    items: SHORTCUTS.filter(
      (s) =>
        s.action === "cmd" || s.action === "shortcuts" || s.action === "escape",
    ),
  },
];

function KeyBadge({ k }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded border border-white/[0.14] bg-white/[0.06] text-[11px] font-mono font-bold text-white/60">
      {k}
    </span>
  );
}

export default function KeyboardShortcuts({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-md rounded-2xl border border-white/[0.1] overflow-hidden"
            style={{
              background: "rgba(8,8,15,0.98)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
              }}
            />

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Keyboard size={16} className="text-[#7C6FFF]" />
                <h3 className="text-[14px] font-bold text-white">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/28 hover:text-white/65 hover:bg-white/[0.07] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-none">
              {KEY_GROUPS.map((group) => (
                <div key={group.label} className="space-y-2">
                  <p className="text-[10px] text-white/28 uppercase tracking-widest">
                    {group.label}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                      >
                        <span className="text-[12px] text-white/55">
                          {s.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {s.keys.map((k, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <KeyBadge k={k} />
                              {i < s.keys.length - 1 && (
                                <span className="text-[10px] text-white/20">
                                  then
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-white/[0.05]">
                <p className="text-[10px] text-white/18 text-center">
                  Press <KeyBadge k="?" /> anytime to show this panel
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
