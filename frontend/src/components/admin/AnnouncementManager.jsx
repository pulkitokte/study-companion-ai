import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  Wrench,
  Info,
} from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useToast } from "../ui/Toast.jsx";

const TYPE_META = {
  info: { label: "Info", icon: Info, color: "#4FC3F7" },
  feature: { label: "New Feature", icon: Sparkles, color: "#00FFC8" },
  warning: { label: "Warning", icon: AlertTriangle, color: "#FFB347" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "#FF6B9D" },
};

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function AnnouncementManager() {
  const {
    announcements,
    addAnnouncement,
    flipAnnouncement,
    removeAnnouncement,
  } = useAdmin();
  const { show } = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("feature");

  const handleCreate = () => {
    if (!title.trim() || !message.trim()) {
      show({
        type: "info",
        title: "Validation failed",
        message: "Title and message are required",
        duration: 2200,
      });
      return;
    }
    addAnnouncement({
      title: title.trim(),
      message: message.trim(),
      type,
      active: true,
    });
    show({
      type: "mission",
      title: "Announcement created",
      message: "Now live for all users",
      duration: 2200,
    });
    setTitle("");
    setMessage("");
  };

  const handleToggle = (id, active) => {
    flipAnnouncement(id);
    show({
      type: "info",
      title: active ? "Announcement archived" : "Announcement activated",
      duration: 1800,
    });
  };

  const handleRemove = (id) => {
    removeAnnouncement(id);
    show({ type: "info", title: "Announcement deleted", duration: 1800 });
  };

  const active = announcements.filter((a) => a.active);
  const archived = announcements.filter((a) => !a.active);

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center gap-2">
          <Megaphone size={14} className="text-[#00FFC8]" />
          <span className="text-[12px] font-bold text-white">
            New Announcement
          </span>
        </div>

        <div>
          <p className="text-[10px] text-white/28 uppercase tracking-wider mb-1.5">
            Type
          </p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TYPE_META).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
                  style={{
                    background:
                      type === key
                        ? `${meta.color}14`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      type === key
                        ? `${meta.color}45`
                        : "rgba(255,255,255,0.08)",
                    color: type === key ? meta.color : "rgba(255,255,255,0.4)",
                  }}
                >
                  <Icon size={12} /> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#00FFC8]/40"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Announcement message…"
          rows={2}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#00FFC8]/40 resize-none"
        />

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px]"
          style={{
            background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
            color: "#000",
          }}
        >
          <Plus size={14} /> Publish Announcement
        </motion.button>
      </div>

      {/* Active */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <span className="text-[12px] font-bold text-white">
            Active Announcements
          </span>
          <span className="text-[10px] text-white/25">
            {active.length} live
          </span>
        </div>
        {active.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-2xl">📭</span>
            <p className="text-[12px] text-white/25">No active announcements</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence initial={false}>
              {active.map((a, i) => {
                const meta = TYPE_META[a.type] ?? TYPE_META.info;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${meta.color}12`,
                        border: `1px solid ${meta.color}24`,
                      }}
                    >
                      <Icon size={13} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white/75">
                        {a.title}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                        {a.message}
                      </p>
                      <p className="text-[9px] text-white/20 mt-1">
                        {fmtDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggle(a.id, a.active)}
                        className="p-1.5 rounded-lg text-white/25 hover:text-[#FFB347] transition-colors"
                      >
                        <EyeOff size={13} />
                      </button>
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="p-1.5 rounded-lg text-white/25 hover:text-red-400/60 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Archived */}
      {archived.length > 0 && (
        <div
          className="rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: "#0A0A14" }}
        >
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <span className="text-[12px] font-bold text-white/50">
              Archived ({archived.length})
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {archived.map((a) => {
              const meta = TYPE_META[a.type] ?? TYPE_META.info;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-2.5 opacity-50"
                >
                  <span className="text-[11px] text-white/45 flex-1 truncate">
                    {a.title}
                  </span>
                  <button
                    onClick={() => handleToggle(a.id, a.active)}
                    className="p-1 rounded text-white/25 hover:text-[#00FFC8] transition-colors"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => handleRemove(a.id)}
                    className="p-1 rounded text-white/25 hover:text-red-400/60 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
