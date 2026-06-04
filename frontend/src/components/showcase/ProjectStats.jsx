import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Code2, Layers, Zap, Brain, Trophy, Database } from "lucide-react";

const STATS = [
  {
    icon: Layers,
    label: "Phases Built",
    value: 11,
    suffix: "",
    color: "#00FFC8",
  },
  {
    icon: Code2,
    label: "React Components",
    value: 60,
    suffix: "+",
    color: "#7C6FFF",
  },
  {
    icon: Brain,
    label: "AI Personality Modes",
    value: 5,
    suffix: "",
    color: "#FF6B9D",
  },
  { icon: Zap, label: "App Routes", value: 8, suffix: "", color: "#FFB347" },
  {
    icon: Trophy,
    label: "Achievements",
    value: 30,
    suffix: "+",
    color: "#FFD700",
  },
  {
    icon: Database,
    label: "localStorage Keys",
    value: 11,
    suffix: "",
    color: "#4FC3F7",
  },
];

function Counter({ target, suffix, duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setVal(Math.round(ease * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export default function ProjectStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {STATS.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            whileHover={{ scale: 1.04, y: -2 }}
            className="relative overflow-hidden flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/[0.07] text-center group cursor-default"
            style={{ background: `${s.color}06` }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(90deg,transparent,${s.color},transparent)`,
              }}
            />
            <div
              className="p-2.5 rounded-xl"
              style={{
                background: `${s.color}15`,
                border: `1px solid ${s.color}25`,
              }}
            >
              <Icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p
                className="text-[32px] font-black text-white leading-none tabular-nums"
                style={{ textShadow: `0 0 20px ${s.color}40` }}
              >
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[11px] text-white/35 mt-1.5 leading-tight uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
