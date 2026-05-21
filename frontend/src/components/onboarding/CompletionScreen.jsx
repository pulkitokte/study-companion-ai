// FILE PATH: frontend/src/components/onboarding/CompletionScreen.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Brain,
  Target,
  Flame,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Sparkles,
  Star,
} from "lucide-react";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

// ─── PARTICLE BURST ────────────────────────────────────────────────
const COLORS = ["#00FFC8", "#7C6FFF", "#FF6B9D", "#FFB347", "#FFD700"];

function Particles() {
  const items = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    dur: 2.5 + Math.random() * 2,
    size: 4 + Math.random() * 7,
    color: COLORS[i % COLORS.length],
    drift: (Math.random() - 0.5) * 220,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          initial={{ y: 0, opacity: 1, scale: 1, x: 0 }}
          animate={{
            y: -(450 + Math.random() * 350),
            opacity: 0,
            scale: 0.1,
            x: p.drift,
          }}
          transition={{ delay: p.delay, duration: p.dur, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── UNLOCKED BADGES ───────────────────────────────────────────────
const BADGES = [
  {
    icon: Brain,
    label: "AI Profile",
    sub: "Personalised",
    color: "#00FFC8",
    delay: 0.5,
  },
  {
    icon: Target,
    label: "Study Plan",
    sub: "Week 1 Ready",
    color: "#7C6FFF",
    delay: 0.65,
  },
  {
    icon: Flame,
    label: "Streak Ready",
    sub: "Day 0",
    color: "#FF6B2B",
    delay: 0.8,
  },
  {
    icon: Zap,
    label: "Level 1",
    sub: "The Aspirant",
    color: "#FFD700",
    delay: 0.95,
  },
  {
    icon: Shield,
    label: "Companion",
    sub: "Active",
    color: "#FF6B9D",
    delay: 1.1,
  },
  {
    icon: Star,
    label: "Missions",
    sub: "Day 1 Queued",
    color: "#FFB347",
    delay: 1.25,
  },
];

// ─── PLAN LOG GENERATOR ────────────────────────────────────────────
function buildPlanLines(data) {
  const name = (data.name || "Scholar").toUpperCase();
  const exam = (data.targetExam || "YOUR EXAM").toUpperCase();
  const goal = (data.dreamGoal || "YOUR GOAL").toUpperCase();
  const hours = data.dailyStudyHours || 4;
  const style = (data.studyStyle || "balanced").toUpperCase();
  return [
    `> BUILDING PLAN FOR ${name} → ${goal}`,
    `> TARGET EXAM: ${exam} · DAILY STUDY: ${hours}H`,
    `> TECHNIQUE: ${style} · REVISION: SCHEDULED`,
    `> BURNOUT GUARD ACTIVE · STREAK SYSTEM: ON`,
    `> WEEK 1 SCHEDULE: GENERATED SUCCESSFULLY`,
    `> COMPANION PERSONALITY: CALIBRATED`,
    `> ✓ PROFILE LOCKED IN. WELCOME, ${name}.`,
  ];
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function CompletionScreen() {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [lines, setLines] = useState([]);
  const [showBadges, setShowBadges] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const planLines = buildPlanLines(data);

  useEffect(() => {
    const timers = [];
    const BASE = 350;

    planLines.forEach((line, i) => {
      timers.push(
        setTimeout(
          () => {
            setLines((prev) => [...prev, line]);
          },
          BASE + i * 420,
        ),
      );
    });

    const afterLast = BASE + planLines.length * 420;
    timers.push(setTimeout(() => setShowBadges(true), afterLast + 200));
    timers.push(setTimeout(() => setShowCTA(true), afterLast + 700));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = () => navigate("/dashboard", { replace: true });

  const firstName = data.name ? data.name.trim().split(" ")[0] : "Scholar";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="fixed inset-0 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto"
    >
      <Particles />

      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,255,200,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-lg">
        {/* ── TROPHY ICON ── */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 16,
            delay: 0.05,
          }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.35, 0, 0.35],
            }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, #FFD700, transparent 70%)",
            }}
          />
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center border-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(124,111,255,0.12))",
              borderColor: "rgba(255,215,0,0.35)",
              boxShadow:
                "0 0 60px rgba(255,215,0,0.25), 0 0 120px rgba(124,111,255,0.12)",
            }}
          >
            <Trophy size={46} style={{ color: "#FFD700" }} strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* ── HEADLINE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={13} style={{ color: "#FFD700" }} />
            <span
              className="text-[10px] tracking-[0.35em] font-bold uppercase"
              style={{ color: "#FFD700" }}
            >
              Profile Complete
            </span>
            <Sparkles size={13} style={{ color: "#FFD700" }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            You&apos;re ready, {firstName}!
          </h1>
          <p className="text-[12px] text-white/35 max-w-xs mx-auto leading-relaxed">
            {data.dreamGoal
              ? `Companion calibrated for ${data.dreamGoal}. Your journey begins now.`
              : "Your AI study companion is active. Time to dominate."}
          </p>
        </motion.div>

        {/* ── PLAN TERMINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="w-full rounded-xl border border-white/[0.07] overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(14px)",
          }}
        >
          {/* Chrome bar */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05]"
            style={{ background: "rgba(255,255,255,0.025)" }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#00FFC8", opacity: 0.6 }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#7C6FFF", opacity: 0.6 }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#FFD700", opacity: 0.6 }}
            />
            <span className="ml-2 text-[9px] text-white/18 tracking-widest uppercase font-mono">
              ai plan generation
            </span>
          </div>

          {/* Log lines */}
          <div className="p-4 space-y-1.5 min-h-[110px] font-mono">
            <AnimatePresence>
              {lines.map((line, i) => {
                const isLast = i === lines.length - 1;
                const isDone = isLast && showBadges;
                return (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22 }}
                    className="text-[10px] md:text-[11px] leading-relaxed"
                    style={{
                      color: isDone
                        ? "#00FFC8"
                        : isLast
                          ? "#ffffff"
                          : "rgba(255,255,255,0.33)",
                    }}
                  >
                    {line}
                    {isLast && !showBadges && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="inline-block ml-1 w-1.5 h-3 align-middle"
                        style={{ background: "rgba(255,255,255,0.7)" }}
                      />
                    )}
                  </motion.p>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── BADGES ── */}
        <AnimatePresence>
          {showBadges && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-3"
            >
              <p className="text-[9px] text-white/20 tracking-[0.3em] uppercase text-center">
                Unlocked
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {BADGES.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <motion.div
                      key={badge.label}
                      initial={{ opacity: 0, scale: 0.4, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        delay: badge.delay,
                        type: "spring",
                        stiffness: 280,
                        damping: 18,
                      }}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center"
                      style={{
                        borderColor: `${badge.color}25`,
                        background: `${badge.color}08`,
                        boxShadow: `0 0 10px ${badge.color}0A`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${badge.color}14` }}
                      >
                        <Icon size={15} style={{ color: badge.color }} />
                      </div>
                      <p className="text-[10px] font-bold text-white/65">
                        {badge.label}
                      </p>
                      <p className="text-[8px] text-white/22">{badge.sub}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ENTER DASHBOARD CTA ── */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <motion.button
                onClick={handleEnter}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 0 64px rgba(0,255,200,0.38)",
                }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden w-full max-w-sm flex items-center justify-center gap-3 py-4 rounded-xl font-black text-[13px] tracking-widest uppercase"
                style={{
                  background: "linear-gradient(135deg, #00FFC8, #7C6FFF)",
                  boxShadow:
                    "0 0 40px rgba(0,255,200,0.25), 0 0 80px rgba(124,111,255,0.14)",
                  color: "#000",
                }}
              >
                {/* Shimmer */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                  className="absolute inset-y-0 w-1/3 opacity-25"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, white, transparent)",
                    transform: "skewX(-20deg)",
                  }}
                />
                <span className="relative">Enter Mission Control</span>
                <ArrowRight size={16} className="relative" />
              </motion.button>

              <div className="flex items-center gap-1.5 text-[10px] text-white/18">
                <Check size={9} />
                <span>
                  Profile saved locally · Accessible anytime in Settings
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
