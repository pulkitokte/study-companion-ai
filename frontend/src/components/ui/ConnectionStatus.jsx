import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Wifi, WifiOff } from "lucide-react";
import { isGeminiAvailable } from "../../utils/geminiClient.js";

export default function ConnectionStatus({ compact = false }) {
  const hasKey = useMemo(() => isGeminiAvailable(), []);
  const online = navigator.onLine;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="relative w-1.5 h-1.5">
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            className="absolute inset-0 rounded-full"
            style={{ background: hasKey ? "#00FFC8" : "#FFB347" }}
          />
          <div
            className="relative w-1.5 h-1.5 rounded-full"
            style={{ background: hasKey ? "#00FFC8" : "#FFB347" }}
          />
        </div>
        <span
          className="text-[10px] font-bold"
          style={{ color: hasKey ? "#00FFC8" : "#FFB347" }}
        >
          {hasKey ? "Gemini" : "Mock AI"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
      style={{
        background: hasKey ? "rgba(0,255,200,0.06)" : "rgba(255,179,71,0.06)",
        borderColor: hasKey ? "rgba(0,255,200,0.2)" : "rgba(255,179,71,0.2)",
      }}
    >
      {/* AI status */}
      <div className="flex items-center gap-1.5">
        <div className="relative w-2 h-2 shrink-0">
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: hasKey ? "#00FFC8" : "#FFB347" }}
          />
          <div
            className="relative w-2 h-2 rounded-full"
            style={{ background: hasKey ? "#00FFC8" : "#FFB347" }}
          />
        </div>
        <Brain size={12} style={{ color: hasKey ? "#00FFC8" : "#FFB347" }} />
        <span
          className="text-[11px] font-bold"
          style={{ color: hasKey ? "#00FFC8" : "#FFB347" }}
        >
          {hasKey ? "Gemini AI" : "Mock Mode"}
        </span>
      </div>

      <div className="w-px h-4 bg-white/[0.08]" />

      {/* Network */}
      <div className="flex items-center gap-1.5">
        {online ? (
          <Wifi size={11} className="text-[#00FFC8]" />
        ) : (
          <WifiOff size={11} className="text-red-400" />
        )}
        <span
          className={`text-[10px] font-semibold ${online ? "text-white/45" : "text-red-400"}`}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>

      {!hasKey && (
        <>
          <div className="w-px h-4 bg-white/[0.08]" />
          <span className="text-[9px] text-white/22">
            Add VITE_GEMINI_API_KEY to .env
          </span>
        </>
      )}
    </div>
  );
}
