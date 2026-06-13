import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ListChecks, BarChart3, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DailyBriefing from "./DailyBriefing.jsx";
import StudyRecommendations from "./StudyRecommendations.jsx";
import SmartInsights from "./SmartInsights.jsx";
import { useAgent } from "../../hooks/useAgent.js";

const TABS = [
  { id: "briefing", label: "Briefing", icon: Sparkles },
  { id: "recs", label: "Recommended", icon: ListChecks },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

export default function CoachPanel() {
  const navigate = useNavigate();
  const { refresh } = useAgent();
  const [tab, setTab] = useState("briefing");

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border shrink-0 text-[12px] font-bold transition-all duration-200"
              style={{
                background: on
                  ? "rgba(124,111,255,0.12)"
                  : "rgba(255,255,255,0.025)",
                borderColor: on
                  ? "rgba(124,111,255,0.45)"
                  : "rgba(255,255,255,0.07)",
                color: on ? "#7C6FFF" : "rgba(255,255,255,0.35)",
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#FF6B9D]/25 bg-[#FF6B9D]/06 shrink-0 text-[12px] font-bold text-[#FF6B9D] ml-auto hover:bg-[#FF6B9D]/12 transition-all"
        >
          <MessageCircle size={13} /> Chat with Coach
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "briefing" && <DailyBriefing />}
          {tab === "recs" && <StudyRecommendations />}
          {tab === "insights" && <SmartInsights />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
