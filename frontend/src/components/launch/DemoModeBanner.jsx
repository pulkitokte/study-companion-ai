import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, X, ChevronRight } from "lucide-react";
import { clearDemoData, seedDemoData } from "../../utils/demoDataSeeder.js";
import { useToast } from "../ui/Toast.jsx";

export default function DemoModeBanner() {
  const { show } = useToast();
  const [visible, setVisible] = useState(true);
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    setResetting(true);
    clearDemoData();
    seedDemoData();
    setTimeout(() => {
      setResetting(false);
      show({
        type: "info",
        title: "Demo data refreshed",
        message: "All stats reset to fresh demo state",
        duration: 2500,
      });
      window.location.reload();
    }, 800);
  };

  const handleExit = () => {
    clearDemoData();
    window.location.href = "/";
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between gap-3 px-4 py-2.5 border-b"
          style={{
            background:
              "linear-gradient(90deg,rgba(124,111,255,0.18),rgba(0,255,200,0.1),rgba(5,5,12,0.95))",
            borderColor: "rgba(0,255,200,0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Animated left line */}
          <motion.div
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00FFC8] origin-top"
          />

          <div className="flex items-center gap-2.5 min-w-0">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Sparkles size={13} className="text-[#00FFC8] shrink-0" />
            </motion.div>
            <span className="text-[11px] font-bold text-[#00FFC8] tracking-wide hidden sm:block">
              DEMO MODE
            </span>
            <span className="text-[10px] text-white/40 truncate">
              Exploring with sample data. No real account needed.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#7C6FFF]/35 bg-[#7C6FFF]/10 text-[#7C6FFF] hover:bg-[#7C6FFF]/20 transition-all disabled:opacity-50"
            >
              <RotateCcw
                size={11}
                className={resetting ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Reset Demo</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-[#00FFC8]/35 bg-[#00FFC8]/10 text-[#00FFC8] hover:bg-[#00FFC8]/20 transition-all"
            >
              <ChevronRight size={11} />
              <span className="hidden sm:inline">Start Real</span>
            </motion.button>

            <button
              onClick={() => setVisible(false)}
              className="p-1.5 rounded-lg text-white/25 hover:text-white/55 hover:bg-white/[0.06] transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
