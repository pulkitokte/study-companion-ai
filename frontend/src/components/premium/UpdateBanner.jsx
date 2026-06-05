import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";

const UPDATES = [
  {
    id: "v1.1",
    label: "Phase 13 · Command Palette + Smart Search launched",
    link: "/showcase",
  },
];

const BANNER_KEY = "studymind_dismissed_banners";

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(BANNER_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function UpdateBanner() {
  const dismissed = getDismissed();
  const pending = UPDATES.filter((u) => !dismissed.includes(u.id));
  const [visible, setVisible] = useState(pending.length > 0);

  if (!pending.length) return null;

  const update = pending[0];

  const dismiss = () => {
    const ids = [...getDismissed(), update.id];
    localStorage.setItem(BANNER_KEY, JSON.stringify(ids));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden relative"
        >
          <div
            className="flex items-center gap-3 px-4 py-2 text-center justify-center"
            style={{
              background:
                "linear-gradient(90deg,rgba(124,111,255,0.15),rgba(0,255,200,0.12),rgba(124,111,255,0.15))",
              borderBottom: "1px solid rgba(0,255,200,0.15)",
            }}
          >
            {/* Animated border */}
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 opacity-[0.07]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#00FFC8,transparent)",
              }}
            />

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Sparkles size={13} className="text-[#00FFC8] shrink-0" />
            </motion.div>

            <p className="text-[11px] text-white/65 font-medium truncate max-w-xs sm:max-w-none">
              {update.label}
            </p>

            <button
              onClick={dismiss}
              className="ml-auto flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors shrink-0 p-1 rounded"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
