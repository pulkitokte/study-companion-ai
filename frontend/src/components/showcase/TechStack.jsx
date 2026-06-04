import { motion } from "framer-motion";

const STACK = [
  {
    name: "React 18",
    desc: "UI framework with hooks & context",
    emoji: "⚛️",
    color: "#61DAFB",
  },
  {
    name: "Vite",
    desc: "Lightning-fast build tool & dev server",
    emoji: "⚡",
    color: "#FFB347",
  },
  {
    name: "Framer Motion",
    desc: "Production-grade animation library",
    emoji: "🎭",
    color: "#FF6B9D",
  },
  {
    name: "Tailwind CSS",
    desc: "Utility-first styling framework",
    emoji: "🎨",
    color: "#06B6D4",
  },
  {
    name: "React Router",
    desc: "Client-side routing & navigation",
    emoji: "🔀",
    color: "#F44250",
  },
  {
    name: "Gemini API",
    desc: "Google AI — real LLM with streaming",
    emoji: "🤖",
    color: "#00FFC8",
  },
  {
    name: "Context API",
    desc: "Global state without external libraries",
    emoji: "🌐",
    color: "#7C6FFF",
  },
  {
    name: "localStorage",
    desc: "Zero-backend client-side persistence",
    emoji: "💾",
    color: "#FFD700",
  },
  {
    name: "Lucide React",
    desc: "Consistent icon library",
    emoji: "🎯",
    color: "#4FC3F7",
  },
  {
    name: "CSS Grid/Flex",
    desc: "Responsive layout system",
    emoji: "📐",
    color: "#B5FF47",
  },
];

export default function TechStack() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STACK.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl border border-white/[0.07] hover:border-white/[0.12] group transition-all duration-200 cursor-default"
            style={{ background: `${tech.color}07` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border transition-all duration-200 group-hover:scale-110"
              style={{
                background: `${tech.color}14`,
                borderColor: `${tech.color}28`,
              }}
            >
              {tech.emoji}
            </div>
            <div className="min-w-0">
              <p
                className="text-[13px] font-bold leading-tight"
                style={{ color: tech.color }}
              >
                {tech.name}
              </p>
              <p className="text-[10px] text-white/30 leading-snug mt-0.5">
                {tech.desc}
              </p>
            </div>
            {/* Hover glow line */}
            <div
              className="ml-auto w-[2px] h-6 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-200 shrink-0"
              style={{ background: tech.color }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
