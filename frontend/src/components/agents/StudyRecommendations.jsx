import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, X, ListChecks, Route } from "lucide-react";
import { useAgent } from "../../hooks/useAgent.js";

const AGENT_LABELS = {
  coach: { label: "Coach", color: "#7C6FFF" },
  planner: { label: "Planner", color: "#4FC3F7" },
  focus: { label: "Focus", color: "#00FFC8" },
  progress: { label: "Progress", color: "#FFD700" },
};

export default function StudyRecommendations() {
  const navigate = useNavigate();
  const { recommendations, studyPath, accept, dismiss, complete } = useAgent();

  return (
    <div className="space-y-5">
      {/* Recommendations list */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
          <ListChecks size={14} className="text-[#7C6FFF]" />
          <span className="text-[12px] font-bold text-white">
            Recommended For You
          </span>
          <span className="ml-auto text-[10px] text-white/25">
            {recommendations.length} active
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-3xl">✨</span>
            <p className="text-[12px] text-white/30">
              All caught up! Check back after your next session.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence initial={false}>
              {recommendations.map((rec, i) => {
                const agentMeta = AGENT_LABELS[rec.agent] ?? AGENT_LABELS.coach;
                return (
                  <motion.div
                    key={rec.id ?? rec.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 px-4 py-3.5"
                  >
                    <span className="text-2xl shrink-0">
                      {rec.icon ?? "✨"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-[12px] font-bold text-white/80">
                          {rec.title}
                        </p>
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase"
                          style={{
                            color: agentMeta.color,
                            background: `${agentMeta.color}14`,
                          }}
                        >
                          {agentMeta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {rec.action && (
                          <button
                            onClick={() => {
                              complete(rec.id);
                              navigate(rec.action.path);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                            style={{
                              color: rec.color ?? agentMeta.color,
                              background: `${rec.color ?? agentMeta.color}12`,
                            }}
                          >
                            {rec.action.label} <ArrowRight size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => complete(rec.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/30 hover:text-[#00FFC8] transition-colors"
                        >
                          <CheckCircle2 size={11} /> Done
                        </button>
                        <button
                          onClick={() => dismiss(rec.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/25 hover:text-red-400/60 transition-colors"
                        >
                          <X size={11} /> Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Study path */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
          <Route size={14} className="text-[#00FFC8]" />
          <span className="text-[12px] font-bold text-white">
            Suggested Study Path
          </span>
        </div>
        <div className="p-4 space-y-2">
          {studyPath.map((step, i) => (
            <motion.button
              key={step.step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(step.path)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/[0.05] hover:border-[#00FFC8]/25 hover:bg-[#00FFC8]/04 transition-all text-left"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{ background: "rgba(0,255,200,0.12)", color: "#00FFC8" }}
              >
                {step.step}
              </div>
              <span className="text-lg shrink-0">{step.icon}</span>
              <span className="flex-1 text-[12px] text-white/65">
                {step.label}
              </span>
              <ArrowRight size={13} className="text-white/20 shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
