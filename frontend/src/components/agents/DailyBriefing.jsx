import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Zap, Clock, Flame, ArrowRight } from "lucide-react";
import { useAgent } from "../../hooks/useAgent.js";

export default function DailyBriefing() {
  const navigate = useNavigate();
  const { briefing } = useAgent();

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
      style={{
        background:
          "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.06),rgba(5,5,12,0))",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background:
            "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
        }}
      />
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-10"
        style={{ background: "#7C6FFF" }}
      />

      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={14} className="text-[#7C6FFF]" />
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C6FFF]">
          Daily Briefing
        </span>
      </div>

      <h2 className="text-[22px] font-black text-white">{briefing.greeting}</h2>
      <p className="text-[13px] text-white/45 mt-1.5 max-w-lg leading-relaxed">
        {briefing.motivational}
      </p>

      {/* Today's mini stats */}
      <div className="flex flex-wrap gap-3 mt-4">
        {[
          { icon: Zap, val: `${briefing.todayXP} XP today`, color: "#7C6FFF" },
          {
            icon: Clock,
            val: `${briefing.todayMinutes}m focused`,
            color: "#00FFC8",
          },
          { icon: Flame, val: `${briefing.streak}d streak`, color: "#FF6B2B" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.val}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06]"
              style={{ background: `${s.color}08` }}
            >
              <Icon size={12} style={{ color: s.color }} />
              <span className="text-[11px] font-bold text-white/65">
                {s.val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Top priority */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() =>
          navigate(briefing.topPriority?.action?.path ?? "/dashboard")
        }
        className="w-full mt-5 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all"
        style={{
          borderColor: `${briefing.topPriority?.color ?? "#7C6FFF"}28`,
          background: `${briefing.topPriority?.color ?? "#7C6FFF"}08`,
        }}
      >
        <span className="text-2xl shrink-0">
          {briefing.topPriority?.icon ?? "🚀"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-white/25 mb-0.5">
            Today's Priority
          </p>
          <p className="text-[13px] font-bold text-white">
            {briefing.topPriority?.title}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
            {briefing.topPriority?.detail}
          </p>
        </div>
        <ArrowRight size={16} className="text-white/25 shrink-0" />
      </motion.button>
    </div>
  );
}
