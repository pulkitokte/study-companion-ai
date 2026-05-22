import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function TimerBar({
  duration,
  onExpire,
  paused = false,
  accentColor = "#00FFC8",
}) {
  const [remaining, setRemaining] = useState(duration);
  const ref = useRef(null);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (paused) {
      clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [paused, duration, onExpire]);

  const pct = (remaining / duration) * 100;
  const isDanger = pct <= 25;
  const isWarn = pct <= 50;
  const color = isDanger ? "#FF3C3C" : isWarn ? "#FFB347" : accentColor;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={11} style={{ color }} />
          <span className="text-[10px] text-white/30 uppercase tracking-widest">
            Time
          </span>
        </div>
        <motion.span
          key={remaining}
          initial={{ scale: isDanger ? 1.15 : 1 }}
          animate={{ scale: 1 }}
          className="text-[13px] font-black tabular-nums"
          style={{ color }}
        >
          {remaining}s
        </motion.span>
      </div>
      <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
          style={{
            background: isDanger
              ? "linear-gradient(90deg,#FF3C3C,#FF6B6B)"
              : isWarn
                ? "linear-gradient(90deg,#FFB347,#FFD700)"
                : `linear-gradient(90deg,${accentColor}80,${accentColor})`,
            boxShadow: `0 0 8px ${color}50`,
          }}
        />
        {isDanger && (
          <motion.div
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ repeat: Infinity, duration: 0.55 }}
            className="absolute inset-0 rounded-full bg-red-500"
          />
        )}
      </div>
    </div>
  );
}
