import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import syllabusService from "../../services/syllabusService.js";
import { getAllExams } from "../../data/syllabusData.js";
import { useToast } from "../ui/Toast.jsx";

// ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────
function ConfirmModal({ target, onConfirm, onCancel }) {
  const isAll = target.examId === "all";

  return (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[400] backdrop-blur-[3px]"
        onClick={onCancel}
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[401]
                   w-[calc(100vw-32px)] max-w-sm rounded-2xl border border-white/[0.1] p-6"
        style={{ background: "#0D0D1A" }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Warning icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#FF6B2B12", border: "1px solid #FF6B2B2A" }}
          >
            <AlertTriangle size={22} className="text-[#FF6B2B]" />
          </div>

          {/* Copy */}
          <div>
            <h3 className="text-[16px] font-black text-white mb-2">
              Reset {target.label}?
            </h3>
            <p className="text-[12px] text-white/40 leading-relaxed">
              {isAll
                ? "All topic progress across every exam will be permanently deleted. This cannot be undone."
                : `All topic progress for ${target.label} will be permanently deleted. This cannot be undone.`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full pt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.1]
                         text-[12px] font-bold text-white/45
                         hover:text-white/70 hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl text-[12px] font-black text-white
                         transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#FF6B2B,#CC4400)" }}
            >
              Reset
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
export default function SyllabusSettingsSection() {
  const { show } = useToast();
  const [confirm, setConfirm] = useState(null);

  const exams = getAllExams();

  const requestReset = (examId, label) => setConfirm({ examId, label });

  const handleConfirm = () => {
    try {
      if (confirm.examId === "all") {
        syllabusService.resetAllProgress();
        show({
          type: "info",
          title: "All syllabus progress cleared",
          message: "Your tracker has been fully reset.",
          duration: 2500,
        });
      } else {
        syllabusService.resetExamProgress(confirm.examId);
        show({
          type: "info",
          title: `${confirm.label} progress cleared`,
          duration: 2000,
        });
      }
    } catch {
      show({
        type: "info",
        title: "Reset failed — please try again.",
        duration: 2500,
      });
    }
    setConfirm(null);
  };

  return (
    <>
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        {/* Section header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
          <BookOpen size={14} className="text-[#7C6FFF]" />
          <span className="text-[13px] font-black text-white">
            Syllabus Data
          </span>
        </div>

        {/* Per-exam rows */}
        <div className="divide-y divide-white/[0.04]">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg leading-none shrink-0">
                  {exam.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white/70 truncate">
                    {exam.shortLabel}
                  </p>
                  <p className="text-[10px] text-white/28">
                    Reset all topic progress
                  </p>
                </div>
              </div>
              <button
                onClick={() => requestReset(exam.id, exam.shortLabel)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                           text-[11px] font-bold border border-[#FF6B2B]/20 text-[#FF6B2B]
                           hover:bg-[#FF6B2B]/10 transition-all ml-3"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
          ))}
        </div>

        {/* Reset all footer */}
        <div className="px-5 py-4 border-t border-white/[0.05] space-y-2">
          <button
            onClick={() => requestReset("all", "All Syllabus Data")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       text-[12px] font-bold border border-[#FF6B2B]/16 text-[#FF6B2B]/65
                       hover:text-[#FF6B2B] hover:bg-[#FF6B2B]/08 transition-all"
          >
            <Trash2 size={13} />
            Reset All Syllabus Progress
          </button>
          <p className="text-[10px] text-white/20 text-center">
            Destructive — this action cannot be undone.
          </p>
        </div>
      </div>

      {/* Confirmation modal portal */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            key="syllabus-reset-confirm"
            target={confirm}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
