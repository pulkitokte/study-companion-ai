// FILE PATH: frontend/src/components/onboarding/steps/Step6_Goals.jsx
// STEP 6 — Dream Goal + Target Rank/Post + Personal Why
// The most emotionally engaging step. The user defines their north star.
// The AI companion references these goals in every conversation.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, Heart, Star, Sparkles } from "lucide-react";
import { useOnboarding } from "../../../context/OnboardingContext.jsx";
import { StepHeader } from "./Step1_Identity.jsx";

// Dream post presets by exam
const DREAM_POSTS = {
  UPSC: ["IAS", "IPS", "IFS", "IRS", "IES", "Other UPSC Post"],
  SSC: [
    "CGL Grade B",
    "CGL Grade C",
    "CHSL",
    "MTS",
    "CPO SI",
    "Other SSC Post",
  ],
  Banking: [
    "IBPS PO",
    "SBI PO",
    "RBI Grade B",
    "IBPS Clerk",
    "SBI Clerk",
    "Other Bank Post",
  ],
  Railway: [
    "RRB NTPC",
    "RRB ALP",
    "RRB JE",
    "RPF Constable",
    "Group D",
    "Other Railway Post",
  ],
  Insurance: [
    "LIC AAO",
    "LIC ADO",
    "NICL AO",
    "NIACL AO",
    "Other Insurance Post",
  ],
  Defence: ["NDA", "CDS", "CAPF AC", "AFCAT", "Other Defence Post"],
  "State PSC": [
    "Deputy Collector",
    "DSP",
    "Tahsildar",
    "SDO",
    "Other State Post",
  ],
  Other: [
    "Grade A Officer",
    "Grade B Officer",
    "Specialist Post",
    "Other Post",
  ],
};

// WHY prompts — one is randomly chosen to inspire the user
const WHY_PROMPTS = [
  "What drives you to crack this exam?",
  "Who are you doing this for?",
  "What will change in your life after you succeed?",
  "What will you tell yourself on results day?",
];

export default function Step6_Goals({ accentColor }) {
  const { data, update } = useOnboarding();
  const [focused, setFocused] = useState(null);

  const posts = DREAM_POSTS[data.targetExam] || DREAM_POSTS.Other;
  const promptIdx = 0; // stable prompt

  const charCount = data.whyUpsc.length;
  const charLimit = 280;
  const isWhyFilled = data.whyUpsc.trim().length >= 10;
  const isDreamFilled = data.dreamGoal.trim().length >= 2;

  return (
    <div className="space-y-6">
      <StepHeader
        step={6}
        title="Your north star"
        subtitle="The clearer your goal, the harder it is to quit. Your companion reads this every day."
        accentColor={accentColor}
      />

      {/* Dream post selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Trophy size={11} style={{ color: accentColor }} />
          Dream Post / Rank
        </label>
        <div className="flex flex-wrap gap-2">
          {posts.map((post, i) => {
            const isSelected = data.dreamGoal === post;
            return (
              <motion.button
                key={post}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => update({ dreamGoal: post })}
                className="px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-200"
                style={{
                  background: isSelected
                    ? `${accentColor}15`
                    : "rgba(255,255,255,0.03)",
                  borderColor: isSelected
                    ? `${accentColor}55`
                    : "rgba(255,255,255,0.07)",
                  color: isSelected ? accentColor : "rgba(255,255,255,0.45)",
                  boxShadow: isSelected ? `0 0 14px ${accentColor}18` : "none",
                }}
              >
                {post}
              </motion.button>
            );
          })}
        </div>

        {/* Custom goal input */}
        <input
          type="text"
          placeholder="Or type a custom goal…"
          value={posts.includes(data.dreamGoal) ? "" : data.dreamGoal}
          onChange={(e) => update({ dreamGoal: e.target.value })}
          onFocus={() => setFocused("goal")}
          onBlur={() => setFocused(null)}
          className="w-full px-4 py-3 rounded-xl border bg-white/[0.03] text-white placeholder-white/20 text-[13px] outline-none transition-all duration-200"
          style={{
            borderColor:
              focused === "goal"
                ? `${accentColor}50`
                : "rgba(255,255,255,0.08)",
            boxShadow:
              focused === "goal" ? `0 0 0 1px ${accentColor}20` : "none",
          }}
        />
      </div>

      {/* Target rank (optional) */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Target size={11} style={{ color: accentColor }} />
          Target Rank{" "}
          <span className="text-white/20 normal-case tracking-normal ml-1">
            (optional)
          </span>
        </label>
        <input
          type="text"
          placeholder={`e.g. "Top 100", "Under AIR 500", "First attempt"`}
          value={data.targetRank}
          onChange={(e) => update({ targetRank: e.target.value })}
          onFocus={() => setFocused("rank")}
          onBlur={() => setFocused(null)}
          className="w-full px-4 py-3 rounded-xl border bg-white/[0.03] text-white placeholder-white/20 text-[13px] outline-none transition-all duration-200"
          style={{
            borderColor:
              focused === "rank"
                ? `${accentColor}50`
                : "rgba(255,255,255,0.08)",
            boxShadow:
              focused === "rank" ? `0 0 0 1px ${accentColor}20` : "none",
          }}
        />
      </div>

      {/* Why — the personal statement */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest uppercase">
          <Heart size={11} style={{ color: "#FF6B9D" }} />
          {WHY_PROMPTS[promptIdx]}
        </label>
        <div className="relative">
          <textarea
            placeholder="Write from the heart. This is your fuel on hard days…"
            value={data.whyUpsc}
            onChange={(e) =>
              update({ whyUpsc: e.target.value.slice(0, charLimit) })
            }
            onFocus={() => setFocused("why")}
            onBlur={() => setFocused(null)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border bg-white/[0.03] text-white placeholder-white/20 text-[13px] outline-none transition-all duration-200 resize-none leading-relaxed"
            style={{
              borderColor:
                focused === "why"
                  ? "#FF6B9D50"
                  : isWhyFilled
                    ? "rgba(255,107,157,0.25)"
                    : "rgba(255,255,255,0.08)",
              boxShadow:
                focused === "why" ? "0 0 0 1px rgba(255,107,157,0.2)" : "none",
            }}
          />
          <div
            className="absolute bottom-2.5 right-3 text-[10px]"
            style={{
              color:
                charCount > charLimit * 0.85
                  ? "#FFB347"
                  : "rgba(255,255,255,0.2)",
            }}
          >
            {charCount}/{charLimit}
          </div>
        </div>
      </div>

      {/* Live preview card — shown when enough is filled */}
      <AnimatePresence>
        {isDreamFilled && isWhyFilled && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-xl overflow-hidden border p-5"
            style={{
              borderColor: `${accentColor}25`,
              background: `linear-gradient(135deg, ${accentColor}08, rgba(255,107,157,0.05))`,
            }}
          >
            {/* Sparkle corner */}
            <div className="absolute top-3 right-3">
              <Sparkles
                size={14}
                style={{ color: accentColor }}
                className="opacity-60"
              />
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                <Star size={16} style={{ color: accentColor }} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/30 tracking-widest uppercase">
                  Your Mission
                </p>
                <p className="text-[14px] font-black text-white">
                  {data.dreamGoal}
                  {data.targetRank ? ` · ${data.targetRank}` : ""}
                </p>
                <p className="text-[11px] text-white/45 leading-relaxed italic mt-1">
                  &ldquo;{data.whyUpsc.slice(0, 120)}
                  {data.whyUpsc.length > 120 ? "…" : ""}&rdquo;
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-white/25 leading-relaxed">
                Your companion will remind you of this when you're about to give
                up. It's now part of your AI profile. 🔒
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
