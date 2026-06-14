import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Flame,
  Trophy,
  Globe,
  ArrowRight,
  Brain,
  Star,
} from "lucide-react";
import HeroBanner from "../components/showcase/HeroBanner.jsx";
import FeatureGrid from "../components/showcase/FeatureGrid.jsx";
import SystemArchitecture from "../components/showcase/SystemArchitecture.jsx";
import TechStack from "../components/showcase/TechStack.jsx";
import ProjectStats from "../components/showcase/ProjectStats.jsx";
import ActivityTimeline from "../components/premium/ActivityTimeline.jsx";
import { aggregateAll } from "../utils/globalStats.js";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const I = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

function Section({ title, sub, badge, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        {badge && (
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full border"
            style={{
              color: badge.color,
              borderColor: `${badge.color}30`,
              background: `${badge.color}0A`,
            }}
          >
            {badge.text}
          </span>
        )}
        <h2 className="text-[22px] font-black text-white">{title}</h2>
        {sub && (
          <p className="text-[12px] text-white/30 max-w-lg leading-relaxed">
            {sub}
          </p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

const WHY_POINTS = [
  {
    icon: Brain,
    color: "#00FFC8",
    title: "Real AI Integration",
    desc: "Not just a chatbot wrapper — the AI reads your quiz accuracy, focus streak, profile, and conversation memory to generate genuinely personalized responses using Gemini API.",
  },
  {
    icon: Zap,
    color: "#7C6FFF",
    title: "Zero-Backend Architecture",
    desc: "All 11+ modules — quiz, focus, planner, AI, gamification — run entirely in the browser with localStorage. Demonstrates mastery of client-side state management at scale.",
  },
  {
    icon: Trophy,
    color: "#FFD700",
    title: "Production Engineering Depth",
    desc: "Error boundaries, lazy loading, performance monitoring, mobile optimization, keyboard shortcuts, command palette — production patterns that most portfolio projects skip.",
  },
  {
    icon: Flame,
    color: "#FF6B2B",
    title: "End-to-End Product Thinking",
    desc: "Built as a real product: onboarding flow, demo mode, showcase page, README, Vercel config. Shows the ability to ship — not just code.",
  },
  {
    icon: Star,
    color: "#FF6B9D",
    title: "Gamification Systems",
    desc: "Unified XP engine aggregating data from 3 modules, 6-rank system, 30+ achievements, daily missions with auto-detection — a complete gamification OS.",
  },
];

export default function Showcase() {
  const navigate = useNavigate();
  const stats = useMemo(() => aggregateAll(), []);

  const LIVE_STATS = [
    {
      icon: Zap,
      val: (stats.totalXP ?? 0).toLocaleString(),
      label: "XP Earned",
      color: "#7C6FFF",
    },
    {
      icon: Flame,
      val: `${stats.streak ?? 0}d`,
      label: "Active Streak",
      color: "#FF6B2B",
    },
    {
      icon: Trophy,
      val: stats.achievementsUnlocked ?? 0,
      label: "Achievements",
      color: "#FFD700",
    },
  ];

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="min-h-full pb-20 space-y-16 max-w-5xl mx-auto"
    >
      {/* Nav */}
      <motion.div variants={I} className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.09] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <Globe size={13} /> Source
          </a>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px]"
            style={{
              background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
              color: "#000",
            }}
          >
            Open App <ArrowRight size={12} />
          </button>
        </div>
      </motion.div>

      {/* Hero */}
      <motion.div variants={I}>
        <HeroBanner />
      </motion.div>

      {/* Live stats */}
      {stats.totalXP > 0 && (
        <Section
          title="Your Live Stats"
          sub="These numbers are pulled from your actual StudyMind activity right now."
        >
          <div className="grid grid-cols-3 gap-4">
            {LIVE_STATS.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-2 py-6 rounded-2xl border"
                  style={{
                    background: `${s.color}08`,
                    borderColor: `${s.color}22`,
                  }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                  <p className="text-[28px] font-black text-white leading-none">
                    {s.val}
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">
                    {s.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Project stats */}
      <Section
        title="By the Numbers"
        sub="What's inside the ecosystem"
        badge={{ text: "10+ Phases · 13 iterations", color: "#00FFC8" }}
      >
        <ProjectStats />
      </Section>

      {/* Why this project matters */}
      <Section
        title="Why This Project Matters"
        sub="This isn't a todo app or a weather widget. Here's what it demonstrates."
        badge={{ text: "Recruiter Note", color: "#FFD700" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WHY_POINTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="flex gap-4 p-5 rounded-2xl border border-white/[0.07] hover:border-white/[0.12] transition-all cursor-default"
                style={{ background: `${p.color}06` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${p.color}15`,
                    border: `1px solid ${p.color}22`,
                  }}
                >
                  <Icon size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white mb-1">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Feature grid */}
      <Section
        title="Feature Ecosystem"
        sub="8 interconnected modules built over 13 phases"
        badge={{ text: "Fully Functional", color: "#7C6FFF" }}
      >
        <FeatureGrid />
      </Section>

      {/* Architecture */}
      <Section
        title="System Architecture"
        sub="Global stats engine connects every module in real time"
      >
        <SystemArchitecture />
      </Section>

      {/* Activity timeline (if data exists) */}
      {stats.totalQuizzes + stats.totalFocusSessions > 0 && (
        <Section
          title="Your Activity Timeline"
          sub="Real activity pulled live from your study sessions"
        >
          <div
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{ background: "#0A0A14" }}
          >
            <ActivityTimeline limit={20} />
          </div>
        </Section>
      )}

      {/* Tech stack */}
      <Section title="Tech Stack" sub="Production-grade tools · zero backend">
        <TechStack />
      </Section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-10 border-t border-white/[0.05] space-y-4"
      >
        <div className="flex justify-center">
          <div className="relative w-12 h-12 rounded-xl">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] opacity-20 blur-md" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
              <Brain size={22} className="text-black" strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[14px] font-black text-white">StudyMind AI</p>
          <p className="text-[11px] text-white/30 mt-1">
            Built across 13 phases · 60+ components · Zero backend · Powered by
            Google Gemini
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[12px]"
            style={{
              background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
              color: "#000",
            }}
          >
            Launch App <ArrowRight size={14} />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[12px] border border-white/[0.09] text-white/50 hover:text-white/75 hover:bg-white/[0.04] transition-all"
          >
            <Globe size={14} /> GitHub
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
