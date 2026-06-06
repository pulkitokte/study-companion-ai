import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { useUser } from "../../context/UserContext.jsx";
import { useToast } from "../ui/Toast.jsx";
import { resetPreferences } from "../../lib/userPreferences.js";

const ACCENT_OPTIONS = [
  { id: "cyan", label: "Cyber Cyan", color: "#00FFC8" },
  { id: "purple", label: "Neon Purple", color: "#7C6FFF" },
  { id: "orange", label: "Blaze Orange", color: "#FF6B2B" },
  { id: "gold", label: "Gold Elite", color: "#FFD700" },
  { id: "pink", label: "Hot Pink", color: "#FF6B9D" },
];

function Toggle({ value, onChange, color = "#00FFC8" }) {
  return (
    <button onClick={() => onChange(!value)}>
      <div
        className="w-10 h-5 rounded-full relative transition-all duration-300"
        style={{ background: value ? color : "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
        />
      </div>
    </button>
  );
}

export default function ProfileSettings() {
  const { preferences, updatePreferences } = useUser();
  const { show } = useToast();
  const [saved, setSaved] = useState(false);
  const [local, setLocal] = useState({ ...preferences });

  const update = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const save = () => {
    updatePreferences(local);
    setSaved(true);
    show({
      type: "mission",
      title: "Preferences saved",
      message: "Changes applied immediately",
      duration: 2000,
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    const defaults = resetPreferences();
    setLocal({ ...defaults });
    updatePreferences(defaults);
    show({
      type: "info",
      title: "Preferences reset",
      message: "Restored to defaults",
      duration: 2000,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Sliders size={14} className="text-[#7C6FFF]" />
        <p className="text-[11px] font-bold text-white/38 uppercase tracking-widest">
          Preferences
        </p>
      </div>

      {/* Accent colour */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[11px] text-white/30 uppercase tracking-widest mb-3">
          Accent Colour
        </p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_OPTIONS.map((a) => {
            const on = local.accentColor === a.id;
            return (
              <motion.button
                key={a.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => update("accentColor", a.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all"
                style={{
                  background: on ? `${a.color}14` : "rgba(255,255,255,0.025)",
                  borderColor: on ? `${a.color}50` : "rgba(255,255,255,0.08)",
                  color: on ? a.color : "rgba(255,255,255,0.4)",
                  boxShadow: on ? `0 0 14px ${a.color}20` : "none",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: a.color,
                    boxShadow: on ? `0 0 6px ${a.color}` : "",
                  }}
                />
                {a.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Study goals */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[11px] text-white/30 uppercase tracking-widest mb-4">
          Daily Study Goals
        </p>
        <div className="space-y-4">
          {[
            {
              key: "dailyXPGoal",
              label: "Daily XP Target",
              unit: "XP",
              min: 100,
              max: 2000,
              step: 50,
            },
            {
              key: "dailyFocusMins",
              label: "Daily Focus Target",
              unit: "min",
              min: 15,
              max: 300,
              step: 15,
            },
            {
              key: "weeklyQuizTarget",
              label: "Weekly Quiz Target",
              unit: "quiz",
              min: 1,
              max: 50,
              step: 1,
            },
          ].map((g) => (
            <div key={g.key}>
              <div className="flex justify-between mb-1.5">
                <label className="text-[12px] text-white/55">{g.label}</label>
                <span className="text-[12px] font-bold text-white/70">
                  {local[g.key]} {g.unit}
                </span>
              </div>
              <input
                type="range"
                min={g.min}
                max={g.max}
                step={g.step}
                value={local[g.key]}
                onChange={(e) => update(g.key, Number(e.target.value))}
                className="w-full h-1.5 rounded-full outline-none appearance-none cursor-pointer"
                style={{
                  accentColor: "#7C6FFF",
                  background: `linear-gradient(90deg,#7C6FFF ${((local[g.key] - g.min) / (g.max - g.min)) * 100}%,rgba(255,255,255,0.08) 0%)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[11px] text-white/30 uppercase tracking-widest mb-4">
          Notifications
        </p>
        <div className="space-y-3">
          {[
            { key: "notifXP", label: "XP Earned" },
            { key: "notifStreak", label: "Streak Milestones" },
            { key: "notifAchieve", label: "Achievements" },
            { key: "notifMission", label: "Mission Completions" },
            { key: "notifFocus", label: "Focus Session Alerts" },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <span className="text-[12px] text-white/55">{n.label}</span>
              <Toggle
                value={!!local[n.key]}
                onChange={(v) => update(n.key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[11px] text-white/30 uppercase tracking-widest mb-4">
          Dashboard Widgets
        </p>
        <div className="space-y-3">
          {[
            { key: "showActivityFeed", label: "Live Activity Feed" },
            { key: "showSystemStatus", label: "System Status Panel" },
          ].map((w) => (
            <div key={w.key} className="flex items-center justify-between">
              <span className="text-[12px] text-white/55">{w.label}</span>
              <Toggle
                value={!!local[w.key]}
                onChange={(v) => update(w.key, v)}
                color="#00FFC8"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={save}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all"
          style={
            saved
              ? {
                  background: "rgba(0,255,100,0.1)",
                  border: "1px solid rgba(0,255,100,0.28)",
                  color: "#00FF64",
                }
              : {
                  background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
                  color: "#fff",
                }
          }
        >
          {saved ? (
            <>
              <CheckCircle2 size={14} />
              Saved!
            </>
          ) : (
            <>
              <Save size={14} />
              Save Preferences
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className="px-4 py-3 rounded-xl font-bold text-[13px] border border-white/[0.09] text-white/38 hover:text-white/65 hover:bg-white/[0.04] transition-all"
        >
          <RotateCcw size={14} />
        </motion.button>
      </div>
    </div>
  );
}
