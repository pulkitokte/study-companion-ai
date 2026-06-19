import { CheckCircle2, Star, Zap, Award } from "lucide-react";

export default function SyllabusStats({
  done = 0,
  total = 0,
  mastered = 0,
  xpEarned = 0,
  subjectCount = 0,
  examColor = "#7C6FFF",
}) {
  const STATS = [
    {
      icon: CheckCircle2,
      val: `${done} / ${total}`,
      label: "topics done",
      color: examColor,
    },
    { icon: Star, val: mastered, label: "mastered", color: "#FFD700" },
    {
      icon: Zap,
      val: xpEarned.toLocaleString(),
      label: "XP earned",
      color: "#7C6FFF",
    },
    { icon: Award, val: subjectCount, label: "subjects", color: "#4FC3F7" },
  ];

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {STATS.map(({ icon: Icon, val, label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon size={13} style={{ color }} />
          <span className="text-[13px] font-black text-white">{val}</span>
          <span className="text-[10px] text-white/28">{label}</span>
        </div>
      ))}
    </div>
  );
}
