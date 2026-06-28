import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle2, Flame } from "lucide-react";
import RevisionCard from "./RevisionCard.jsx";

/**
 * RevisionQueue — Phase 31 update
 *
 * Now receives a FLAT sorted array from syllabusService.getTodayRevisionQueue()
 * (items already sorted by priorityScore DESC).
 *
 * Internally splits into two tabs:
 *   Overdue   — item.isOverdue === true
 *   Due Today — item.isOverdue === false
 *
 * Props:
 *   queue    {Array}    flat sorted array from getTodayRevisionQueue()
 *   onAction {function} (item, actionType) => void
 */

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────

const TABS = [
  {
    id: "overdue",
    label: "Overdue",
    icon: Flame,
    color: "#FF6B2B",
    emptyTitle: "No overdue topics",
    emptySub: "All overdue revisions are cleared — great work!",
  },
  {
    id: "dueToday",
    label: "Due Today",
    icon: RotateCcw,
    color: "#FFB347",
    emptyTitle: "Nothing due today",
    emptySub: "You're caught up — check back tomorrow.",
  },
];

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ title, sub, color }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-1"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}
      >
        <CheckCircle2 size={18} style={{ color: `${color}80` }} />
      </div>
      <p className="text-[13px] font-bold text-white/40">{title}</p>
      <p className="text-[11px] text-white/22 max-w-xs leading-relaxed">
        {sub}
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function RevisionQueue({ queue, onAction }) {
  // Split flat array into categorised groups.
  // Both groups are already sorted by priorityScore DESC from the engine.
  const overdue = useMemo(
    () => (queue ?? []).filter((i) => i.isOverdue === true),
    [queue],
  );
  const dueToday = useMemo(
    () => (queue ?? []).filter((i) => i.isOverdue === false),
    [queue],
  );

  // Default to the first non-empty tab, preferring overdue
  const defaultTab = useMemo(() => {
    if (overdue.length > 0) return "overdue";
    if (dueToday.length > 0) return "dueToday";
    return "overdue";
  }, [overdue.length, dueToday.length]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Resolve active list
  const activeList = activeTab === "overdue" ? overdue : dueToday;
  const activeCfg = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  // Count map for tab badges
  const counts = { overdue: overdue.length, dueToday: dueToday.length };

  return (
    <div>
      {/* ── Summary line ──────────────────────────────────────────────── */}
      <p className="text-[10px] font-black text-white/28 uppercase tracking-widest mb-3">
        {(queue ?? []).length} topic{(queue ?? []).length !== 1 ? "s" : ""} to
        review — sorted by priority
      </p>

      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const count = counts[tab.id] ?? 0;
          const active = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border
                         text-[11px] font-bold transition-all duration-150"
              style={{
                background: active
                  ? `${tab.color}14`
                  : "rgba(255,255,255,0.025)",
                borderColor: active
                  ? `${tab.color}38`
                  : "rgba(255,255,255,0.07)",
                color: active ? tab.color : "rgba(255,255,255,0.30)",
              }}
            >
              <Icon size={12} />
              {tab.label}
              <span
                className="ml-0.5 min-w-[18px] px-1 py-0.5 rounded-md
                           text-[9px] font-black text-center leading-none"
                style={{
                  background: active
                    ? `${tab.color}22`
                    : "rgba(255,255,255,0.06)",
                  color: active ? tab.color : "rgba(255,255,255,0.28)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Card list ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeList.length === 0 ? (
            <EmptyState
              title={activeCfg.emptyTitle}
              sub={activeCfg.emptySub}
              color={activeCfg.color}
            />
          ) : (
            <div className="space-y-3">
              {activeList.map((item, i) => (
                <motion.div
                  key={`${item.subjectId}-${item.topicId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22 }}
                >
                  <RevisionCard item={item} onAction={onAction} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
