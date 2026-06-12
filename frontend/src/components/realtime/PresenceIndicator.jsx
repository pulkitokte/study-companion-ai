import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "../../hooks/useRealtime.js";

const ACTIVITY_META = {
  idle: { label: "Idle", color: "#888" },
  quiz: { label: "Quizzing", color: "#FFB347" },
  focus: { label: "Focusing", color: "#00FFC8" },
  planner: { label: "Planning", color: "#7C6FFF" },
  chat: { label: "Chatting", color: "#FF6B9D" },
};

export default function PresenceIndicator({ compact = true, maxAvatars = 4 }) {
  const { presence } = useRealtime();
  const users = presence.users ?? [];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-2">
          {users.slice(0, maxAvatars).map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              title={`${u.name} · ${ACTIVITY_META[u.activity]?.label ?? "Idle"}`}
              className="relative w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold text-black"
              style={{ background: u.color, borderColor: "#0A0A14" }}
            >
              {u.avatar}
              {u.status === "online" && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0A0A14]"
                  style={{ background: "#00FF64" }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <span className="text-[10px] text-white/30 font-bold">
          {presence.online} online
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {users.map((u, i) => {
        const act = ACTIVITY_META[u.activity] ?? ACTIVITY_META.idle;
        return (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/[0.05]"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            <div
              className="relative w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-black shrink-0"
              style={{ background: u.color }}
            >
              {u.avatar}
              {u.status === "online" && (
                <motion.div
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: "#00FF64" }}
                />
              )}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0A0A14]"
                style={{
                  background: u.status === "online" ? "#00FF64" : "#888",
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/70 truncate">
                {u.name}
              </p>
              <p className="text-[10px]" style={{ color: act.color }}>
                {act.label}
              </p>
            </div>
            <span className="text-[9px] text-white/20 capitalize">
              {u.status}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
