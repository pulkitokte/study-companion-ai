import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Save } from "lucide-react";
import { useToast } from "../ui/Toast.jsx";

const ACCENTS = [
  { id: "cyan", label: "Cyber Cyan", color: "#00FFC8" },
  { id: "purple", label: "Neon Purple", color: "#7C6FFF" },
  { id: "orange", label: "Blaze Orange", color: "#FF6B2B" },
  { id: "gold", label: "Gold Elite", color: "#FFD700" },
  { id: "pink", label: "Hot Pink", color: "#FF6B9D" },
  { id: "lime", label: "Matrix Lime", color: "#B5FF47" },
];

const GLOW_LEVELS = [
  { id: "subtle", label: "Subtle" },
  { id: "normal", label: "Normal" },
  { id: "intense", label: "Intense" },
];

function getThemePrefs() {
  try {
    return (
      JSON.parse(localStorage.getItem("studymind_theme") ?? "null") ?? {
        accent: "cyan",
        glow: "normal",
      }
    );
  } catch {
    return { accent: "cyan", glow: "normal" };
  }
}

export default function ThemeSettings() {
  const { show } = useToast();
  const init = getThemePrefs();
  const [accent, setAccent] = useState(init.accent ?? "cyan");
  const [glow, setGlow] = useState(init.glow ?? "normal");

  const save = () => {
    localStorage.setItem("studymind_theme", JSON.stringify({ accent, glow }));
    show({
      type: "info",
      title: "Theme preferences saved",
      message: "Takes effect on next navigation",
      duration: 2500,
    });
  };

  return (
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: "#0A0A14" }}
    >
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3">
        <Palette size={15} className="text-[#7C6FFF]" />
        <h3 className="text-[14px] font-bold text-white">Theme & Appearance</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Accent colours */}
        <div className="space-y-3">
          <label className="text-[11px] text-white/35 uppercase tracking-widest">
            Accent Colour
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCENTS.map((a) => {
              const on = accent === a.id;
              return (
                <motion.button
                  key={a.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setAccent(a.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
                  style={{
                    background: on ? `${a.color}14` : "rgba(255,255,255,0.025)",
                    borderColor: on ? `${a.color}50` : "rgba(255,255,255,0.08)",
                    boxShadow: on ? `0 0 14px ${a.color}20` : "none",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      background: a.color,
                      boxShadow: on ? `0 0 6px ${a.color}` : "none",
                    }}
                  />
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: on ? a.color : "rgba(255,255,255,0.45)" }}
                  >
                    {a.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Glow intensity */}
        <div className="space-y-3">
          <label className="text-[11px] text-white/35 uppercase tracking-widest">
            Glow Intensity
          </label>
          <div className="flex gap-2">
            {GLOW_LEVELS.map((g) => {
              const on = glow === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGlow(g.id)}
                  className="flex-1 py-2 rounded-xl border text-[12px] font-bold transition-all"
                  style={{
                    background: on
                      ? "rgba(124,111,255,0.12)"
                      : "rgba(255,255,255,0.03)",
                    borderColor: on
                      ? "rgba(124,111,255,0.45)"
                      : "rgba(255,255,255,0.08)",
                    color: on ? "#7C6FFF" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dark mode note */}
        <div className="px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-[11px] text-white/35 leading-relaxed">
            StudyMind runs exclusively in{" "}
            <span className="text-white/60 font-semibold">Dark Mode</span> —
            optimized for long study sessions and reduced eye strain.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={save}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px]"
          style={{
            background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
            color: "#fff",
          }}
        >
          <Save size={14} /> Save Preferences
        </motion.button>
      </div>
    </div>
  );
}
