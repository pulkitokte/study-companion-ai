import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, RefreshCw, Sparkles } from "lucide-react";
// FIX: removed unused `recommendations` and `stats` from destructuring —
// CoachPanel calls useAgent() internally; no prop drilling from this page.
import { useAgent } from "../hooks/useAgent.js";
import { useToast } from "../components/ui/Toast.jsx";
import CoachPanel from "../components/agents/CoachPanel.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export default function AICoach() {
  const navigate = useNavigate();
  const { refresh } = useAgent();
  const { show } = useToast();

  const handleRefresh = () => {
    refresh();
    show({
      type: "mission",
      title: "Coach refreshed",
      message: "New recommendations generated",
      duration: 2000,
    });
  };

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* Header */}
      <motion.div
        variants={I}
        className="flex items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
        >
          <RefreshCw size={12} /> Refresh Coach
        </button>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(255,107,157,0.06),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#7C6FFF,#FF6B9D,transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-1">
          <Bot size={15} className="text-[#7C6FFF]" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C6FFF]">
            AI Coaching Center
          </span>
        </div>
        <h2 className="text-[24px] font-black text-white">
          Your Personal Study Coach
        </h2>
        <p className="text-[12px] text-white/35 mt-1 max-w-lg">
          Four specialized agents analyze your quiz, focus, planner, and
          progress data to deliver personalized guidance — updated automatically
          as you study.
        </p>

        {/* Agent cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              label: "Coach Agent",
              desc: "Learning analysis",
              color: "#7C6FFF",
            },
            {
              label: "Planner Agent",
              desc: "Task prioritization",
              color: "#4FC3F7",
            },
            {
              label: "Focus Agent",
              desc: "Productivity tuning",
              color: "#00FFC8",
            },
            {
              label: "Progress Agent",
              desc: "Growth forecasting",
              color: "#FFD700",
            },
          ].map((a) => (
            <div
              key={a.label}
              className="flex flex-col gap-1 px-3 py-2.5 rounded-xl border border-white/[0.06]"
              style={{ background: `${a.color}06` }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} style={{ color: a.color }} />
                <span className="text-[10px] font-bold text-white/70">
                  {a.label}
                </span>
              </div>
              <p className="text-[9px] text-white/25">{a.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Coach panel — calls useAgent() internally for all live data */}
      <motion.div variants={I}>
        <CoachPanel />
      </motion.div>
    </motion.div>
  );
}
