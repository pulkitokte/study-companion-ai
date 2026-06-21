import { Zap, TrendingUp, Target, Calendar } from "lucide-react";

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-4"
      style={{ background: "#0A0A14" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={12} style={{ color }} />
        <span className="text-[9px] font-black text-white/32 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-[24px] font-black text-white leading-none mb-1.5">
        {value}
      </p>
      <p className="text-[10px] text-white/28 leading-snug">{sub}</p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function XPProgressSummary({ xpMetrics }) {
  const m = xpMetrics ?? {};

  const cards = [
    {
      icon: Zap,
      label: "Total XP",
      value: (m.totalXP ?? 0).toLocaleString(),
      sub:
        m.maxXP > 0
          ? `of ${m.maxXP.toLocaleString()} possible`
          : "XP earned from syllabus",
      color: "#7C6FFF",
    },
    {
      icon: TrendingUp,
      label: "XP This Week",
      value: (m.xpThisWeek ?? 0).toLocaleString(),
      sub:
        m.topicsThisWeek > 0
          ? `${m.topicsThisWeek} topic${m.topicsThisWeek !== 1 ? "s" : ""} completed`
          : "No activity this week",
      color: "#00FFC8",
    },
    {
      icon: Target,
      label: "Avg Per Day",
      value: m.avgTopicsPerDay ?? 0,
      sub:
        m.daysActive > 0
          ? `over ${m.daysActive} active day${m.daysActive !== 1 ? "s" : ""}`
          : "No activity yet",
      color: "#FFB347",
    },
    {
      icon: Calendar,
      label: "Best Day",
      value: m.bestDay ? m.bestDay.topics : "—",
      sub: m.bestDay
        ? `${m.bestDay.label} · +${m.bestDay.xp} XP`
        : "No activity yet",
      color: "#FFD700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
