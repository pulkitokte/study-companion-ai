import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ArrowRight,
  Github,
  ExternalLink,
  Zap,
  Flame,
  Trophy,
} from "lucide-react";
import { aggregateAll } from "../../utils/globalStats.js";

const TITLES = [
  "Study Smarter.",
  "Rank Higher.",
  "Stay Consistent.",
  "Break Through.",
];

function LivePill({ icon: Icon, val, label, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
      style={{ background: `${color}08`, borderColor: `${color}25` }}
    >
      <Icon size={13} style={{ color }} />
      <span className="text-[13px] font-black text-white">{val}</span>
      <span className="text-[10px] text-white/35">{label}</span>
    </motion.div>
  );
}

export default function HeroBanner() {
  const navigate = useNavigate();
  const [titleIdx, setTitleIdx] = useState(0);
  const stats = aggregateAll();

  useEffect(() => {
    const t = setInterval(
      () => setTitleIdx((i) => (i + 1) % TITLES.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] px-8 md:px-14 py-16 text-center">
      {/* Background radials */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle,#7C6FFF 0%,#00FFC8 50%,transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,#00FFC8,#7C6FFF,transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
          }}
        />
      </div>

      {/* Logo badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.8 }}
            className="absolute inset-0 rounded-2xl blur-xl"
            style={{ background: "linear-gradient(135deg,#00FFC8,#7C6FFF)" }}
          />
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center border border-white/[0.1]"
            style={{
              background: "linear-gradient(135deg,#00FFC840,#7C6FFF40)",
            }}
          >
            <Brain size={30} className="text-white" />
          </div>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="space-y-2 mb-4"
      >
        <p className="text-[12px] font-bold tracking-[0.4em] uppercase text-[#00FFC8]/60">
          AI Study Companion
        </p>
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
          StudyMind
        </h1>
        <motion.h2
          key={titleIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl md:text-3xl font-black"
          style={{
            background: "linear-gradient(90deg,#00FFC8,#7C6FFF,#FF6B9D)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {TITLES[titleIdx]}
        </motion.h2>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[14px] text-white/40 max-w-xl mx-auto leading-relaxed mb-8"
      >
        A full-stack AI-powered study OS built for UPSC and competitive exam
        aspirants. Real Gemini AI, gamified XP system, Pomodoro focus engine,
        adaptive quiz arena, and smart personalization — all in a single app.
      </motion.p>

      {/* Live stats from your data */}
      {stats.totalXP > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center flex-wrap gap-3 mb-8"
        >
          <LivePill
            icon={Zap}
            val={stats.totalXP.toLocaleString()}
            label="XP earned"
            color="#7C6FFF"
          />
          <LivePill
            icon={Flame}
            val={`${stats.streak}d`}
            label="streak"
            color="#FF6B2B"
          />
          <LivePill
            icon={Trophy}
            val={stats.achievementsUnlocked}
            label="achievements"
            color="#FFD700"
          />
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex items-center justify-center flex-wrap gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-black text-[14px] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
            color: "#000",
            boxShadow: "0 0 40px rgba(0,255,200,0.3)",
          }}
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
              repeatDelay: 1.5,
            }}
            className="absolute inset-y-0 w-1/3 opacity-20"
            style={{
              background:
                "linear-gradient(90deg,transparent,white,transparent)",
              transform: "skewX(-20deg)",
            }}
          />
          <span className="relative">Launch App</span>
          <ArrowRight size={16} className="relative" />
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-[14px] border border-white/[0.12] text-white/65 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <Github size={16} /> View Source
        </motion.a>
      </motion.div>
    </div>
  );
}
