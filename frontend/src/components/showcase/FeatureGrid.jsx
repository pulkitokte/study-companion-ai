import { motion } from "framer-motion";
import {
  Brain,
  Swords,
  Timer,
  BarChart3,
  CalendarDays,
  Sparkles,
  Trophy,
  LayoutDashboard,
} from "lucide-react";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    desc: "Personalized mission control that reads your quiz history, focus sessions, and streak to surface contextual insights every time you open the app.",
    color: "#00FFC8",
    emoji: "🎯",
    highlights: ["Live XP sync", "Daily missions", "Smart recommendations"],
  },
  {
    icon: Brain,
    title: "AI Chat Companion",
    desc: "5 personality modes — Motivator, Chill, Strict, Roast, and Interviewer. Powered by Gemini API with word-by-word streaming and onboarding-aware memory.",
    color: "#FF6B9D",
    emoji: "🤖",
    highlights: ["Gemini streaming", "5 modes", "Memory system"],
  },
  {
    icon: Swords,
    title: "Quiz Arena",
    desc: "UPSC-focused MCQ engine with 8 subjects, 3 difficulty tiers, per-question timers, streak bonuses, XP rewards, and a full analytics hub.",
    color: "#FFB347",
    emoji: "⚔️",
    highlights: ["8 subjects", "Streak XP", "Performance radar"],
  },
  {
    icon: Timer,
    title: "Focus Mode",
    desc: "Pomodoro, Deep Work, and Sprint modes with circular countdown, ambient cyberpunk UI, keyboard shortcuts, fullscreen, and completion XP.",
    color: "#B5FF47",
    emoji: "🧠",
    highlights: ["3 session modes", "Ambient terminal", "Break management"],
  },
  {
    icon: BarChart3,
    title: "Progress System",
    desc: "Unified XP from quiz + focus + planner. Level system, 6 rank tiers, daily missions, 16 achievements, and a 6-axis productivity radar.",
    color: "#7C6FFF",
    emoji: "📈",
    highlights: ["Unified XP", "6 ranks", "16 achievements"],
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    desc: "Daily task scheduler with a cyberpunk calendar heatmap, priority levels, subject tagging, XP rewards per task, and GitHub-style activity grid.",
    color: "#4FC3F7",
    emoji: "📅",
    highlights: ["Task CRUD", "Calendar heatmap", "Priority system"],
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "Achievement system spanning quiz, focus, and streaks. Animated unlock popups, neon toast notifications, and rank progression that persists globally.",
    color: "#FFD700",
    emoji: "🏆",
    highlights: ["30+ achievements", "Neon toasts", "Rank journey"],
  },
  {
    icon: Sparkles,
    title: "AI Personalization",
    desc: "6-layer system prompts built from onboarding profile, live progress snapshot, AI memory, and personality mode — every response is uniquely contextualized.",
    color: "#FF6B2B",
    emoji: "✨",
    highlights: ["Onboarding-aware", "Memory extraction", "Progress injection"],
  },
];

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            whileHover={{ scale: 1.025, y: -4 }}
            className="relative flex flex-col gap-4 p-5 rounded-2xl border border-white/[0.07] hover:border-white/[0.14] group transition-all duration-300 overflow-hidden cursor-default"
            style={{ background: `${f.color}07` }}
          >
            {/* Top glow on hover */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{
                background: `linear-gradient(90deg,transparent,${f.color},transparent)`,
              }}
            />

            {/* Corner glow */}
            <div
              className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{ background: f.color }}
            />

            {/* Icon */}
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-110"
                style={{
                  background: `${f.color}15`,
                  borderColor: `${f.color}28`,
                }}
              >
                <Icon size={20} style={{ color: f.color }} />
              </div>
              <span className="text-2xl opacity-30 group-hover:opacity-80 transition-opacity duration-300">
                {f.emoji}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-[14px] font-black text-white mb-2 leading-tight">
                {f.title}
              </p>
              <p className="text-[11px] text-white/38 leading-relaxed">
                {f.desc}
              </p>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-1.5">
              {f.highlights.map((h) => (
                <span
                  key={h}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: f.color,
                    background: `${f.color}14`,
                    border: `1px solid ${f.color}22`,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
