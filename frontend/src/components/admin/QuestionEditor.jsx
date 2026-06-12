import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useToast } from "../ui/Toast.jsx";
import { CATEGORIES, DIFFICULTIES } from "../../data/mockQuizData.js";

const EMPTY = {
  category: "",
  difficulty: "medium",
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
};

export default function QuestionEditor() {
  const {
    customQuestions,
    questionBank,
    createQuestion,
    editQuestion,
    removeQuestion,
  } = useAdmin();
  const { show } = useToast();

  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});

  const updateField = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const updateOption = (idx, val) =>
    setForm((p) => ({
      ...p,
      options: p.options.map((o, i) => (i === idx ? val : o)),
    }));

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = "Select a category";
    if (!form.question.trim()) errs.question = "Question text is required";
    if (form.options.some((o) => !o.trim()))
      errs.options = "All 4 options are required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      show({
        type: "info",
        title: "Validation failed",
        message: "Please fill in all required fields",
        duration: 2500,
      });
      return;
    }
    if (editing) {
      editQuestion(editing, form);
      show({ type: "mission", title: "Question updated", duration: 2000 });
    } else {
      createQuestion(form);
      show({
        type: "mission",
        title: "Question created",
        message: "Added to custom question bank",
        duration: 2000,
      });
    }
    setForm({ ...EMPTY });
    setEditing(null);
    setErrors({});
  };

  const startEdit = (q) => {
    setForm({
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
    });
    setEditing(q.id);
  };

  const cancelEdit = () => {
    setForm({ ...EMPTY });
    setEditing(null);
    setErrors({});
  };

  const handleDelete = (id) => {
    removeQuestion(id);
    show({ type: "info", title: "Question deleted", duration: 1800 });
    if (editing === id) cancelEdit();
  };

  return (
    <div className="space-y-5">
      {/* Form */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5 space-y-4"
        style={{ background: "#0A0A14" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 size={14} className="text-[#7C6FFF]" />
            <span className="text-[12px] font-bold text-white">
              {editing ? "Edit Question" : "New Quiz Question"}
            </span>
          </div>
          {editing && (
            <button
              onClick={cancelEdit}
              className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1"
            >
              <X size={12} /> Cancel
            </button>
          )}
        </div>

        {/* Category + Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-white/28 uppercase tracking-wider mb-1.5">
              Category
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateField("category", c.id)}
                  className="px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all"
                  style={{
                    background:
                      form.category === c.id
                        ? `${c.color}14`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      form.category === c.id
                        ? `${c.color}45`
                        : "rgba(255,255,255,0.08)",
                    color:
                      form.category === c.id
                        ? c.color
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-[10px] text-[#FF6B6B] mt-1">
                {errors.category}
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-white/28 uppercase tracking-wider mb-1.5">
              Difficulty
            </p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => updateField("difficulty", d.id)}
                  className="flex-1 py-1.5 rounded-xl border text-[11px] font-bold transition-all"
                  style={{
                    background:
                      form.difficulty === d.id
                        ? `${d.color}14`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      form.difficulty === d.id
                        ? `${d.color}45`
                        : "rgba(255,255,255,0.08)",
                    color:
                      form.difficulty === d.id
                        ? d.color
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <div>
          <p className="text-[10px] text-white/28 uppercase tracking-wider mb-1.5">
            Question
          </p>
          <textarea
            value={form.question}
            onChange={(e) => updateField("question", e.target.value)}
            placeholder="Enter the question text…"
            rows={2}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#7C6FFF]/40 resize-none"
          />
          {errors.question && (
            <p className="text-[10px] text-[#FF6B6B] mt-1">{errors.question}</p>
          )}
        </div>

        {/* Options */}
        <div>
          <p className="text-[10px] text-white/28 uppercase tracking-wider mb-1.5">
            Options (select correct answer)
          </p>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => updateField("correctIndex", i)}
                  className="shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all"
                  style={{
                    borderColor:
                      form.correctIndex === i
                        ? "#00FFC8"
                        : "rgba(255,255,255,0.12)",
                    background:
                      form.correctIndex === i
                        ? "rgba(0,255,200,0.12)"
                        : "transparent",
                  }}
                >
                  {form.correctIndex === i && (
                    <CheckCircle2 size={13} className="text-[#00FFC8]" />
                  )}
                </button>
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#00FFC8]/40"
                />
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-[10px] text-[#FF6B6B] mt-1">{errors.options}</p>
          )}
        </div>

        {/* Explanation */}
        <div>
          <p className="text-[10px] text-white/28 uppercase tracking-wider mb-1.5">
            Explanation (optional)
          </p>
          <textarea
            value={form.explanation}
            onChange={(e) => updateField("explanation", e.target.value)}
            placeholder="Why is this the correct answer?"
            rows={2}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder-white/22 outline-none focus:border-[#7C6FFF]/40 resize-none"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px]"
          style={{
            background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
            color: "#000",
          }}
        >
          <Plus size={14} /> {editing ? "Save Changes" : "Add Question"}
        </motion.button>
      </div>

      {/* Question bank stats */}
      <div
        className="rounded-2xl border border-white/[0.06] p-5"
        style={{ background: "#0A0A14" }}
      >
        <p className="text-[10px] text-white/22 uppercase tracking-widest mb-3">
          Custom Question Bank ({questionBank.totalCustom})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {questionBank.byCategory.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-white/[0.05]"
              style={{ background: `${c.color}06` }}
            >
              <span className="text-sm">{c.emoji}</span>
              <div className="min-w-0">
                <p className="text-[10px] text-white/55 truncate">{c.label}</p>
                <p className="text-[12px] font-bold" style={{ color: c.color }}>
                  {c.customCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05]">
          <span className="text-[12px] font-bold text-white">
            Custom Questions
          </span>
        </div>
        {customQuestions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-2xl">📝</span>
            <p className="text-[12px] text-white/25">No custom questions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-[320px] overflow-y-auto scrollbar-none">
            <AnimatePresence initial={false}>
              {customQuestions.map((q, i) => {
                const cat = CATEGORIES.find((c) => c.id === q.category);
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <span className="text-sm shrink-0">
                      {cat?.emoji ?? "📘"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white/70 leading-snug line-clamp-2">
                        {q.question}
                      </p>
                      <p className="text-[10px] text-white/22 mt-1">
                        {cat?.label ?? q.category} · {q.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(q)}
                        className="p-1.5 rounded-lg text-white/25 hover:text-[#7C6FFF] transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
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
    </div>
  );
}
