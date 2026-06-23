import { AlertTriangle, Clock, CalendarClock } from "lucide-react";

const STAT_CONFIG = [
  {
    key: "totalOverdue",
    label: "Overdue",
    icon: AlertTriangle,
    color: "#FF6B2B",
    sub: "past due date",
  },
  {
    key: "dueToday",
    label: "Due Today",
    icon: Clock,
    color: "#FFB347",
    sub: "review now",
    count: (q) => q.dueToday?.length ?? 0,
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: CalendarClock,
    color: "#4FC3F7",
    sub: "within 7 days",
    count: (q) => q.upcoming?.length ?? 0,
  },
];

function StatPill({ icon: Icon, label, count, color, sub }) {
  const empty = count === 0;
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl border p-4 transition-all"
      style={{
        background: empty ? "#0A0A14" : `${color}0C`,
        borderColor: empty ? "rgba(255,255,255,0.06)" : `${color}28`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          size={13}
          style={{ color: empty ? "rgba(255,255,255,0.22)" : color }}
        />
        <span
          className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: empty ? "rgba(255,255,255,0.22)" : `${color}AA` }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-[26px] font-black leading-none mb-1"
        style={{ color: empty ? "rgba(255,255,255,0.20)" : color }}
      >
        {count}
      </p>
      <p className="text-[10px] text-white/25">{sub}</p>
    </div>
  );
}

export default function RevisionStats({ queue }) {
  const q = queue ?? {};

  const stats = [
    { ...STAT_CONFIG[0], count: q.totalOverdue ?? 0 },
    { ...STAT_CONFIG[1], count: q.dueToday?.length ?? 0 },
    { ...STAT_CONFIG[2], count: q.upcoming?.length ?? 0 },
  ];

  return (
    <div className="flex gap-3">
      {stats.map((s) => (
        <StatPill key={s.label} {...s} />
      ))}
    </div>
  );
}
