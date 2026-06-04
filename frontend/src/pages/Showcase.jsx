import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HeroBanner from "../components/showcase/HeroBanner.jsx";
import FeatureGrid from "../components/showcase/FeatureGrid.jsx";
import SystemArchitecture from "../components/showcase/SystemArchitecture.jsx";
import TechStack from "../components/showcase/TechStack.jsx";
import ProjectStats from "../components/showcase/ProjectStats.jsx";

const Section = ({ title, sub, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.4 }}
    className="space-y-6"
  >
    <div>
      <h2 className="text-[22px] font-black text-white">{title}</h2>
      {sub && <p className="text-[12px] text-white/30 mt-1">{sub}</p>}
    </div>
    {children}
  </motion.section>
);

export default function Showcase() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-16 space-y-14 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>

      {/* Hero */}
      <HeroBanner />

      {/* Project Stats */}
      <Section title="By the Numbers" sub="What's inside the ecosystem">
        <ProjectStats />
      </Section>

      {/* Features */}
      <Section
        title="Feature Ecosystem"
        sub="8 interconnected systems working as one"
      >
        <FeatureGrid />
      </Section>

      {/* Architecture */}
      <Section
        title="System Architecture"
        sub="How modules connect through the global stats engine"
      >
        <SystemArchitecture />
      </Section>

      {/* Tech Stack */}
      <Section title="Tech Stack" sub="Production-grade tools — zero backend">
        <TechStack />
      </Section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-8 border-t border-white/[0.05] space-y-2"
      >
        <p className="text-[13px] text-white/30">
          Built end-to-end in React · No backend · No database · No compromise
        </p>
        <p className="text-[12px] text-white/20">
          11 development phases · 60+ components · Powered by{" "}
          <span className="text-[#00FFC8]/50">Google Gemini AI</span>
        </p>
      </motion.div>
    </div>
  );
}
