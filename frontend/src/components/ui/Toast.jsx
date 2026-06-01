import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Flame, Trophy, CheckCircle2, X, Star } from "lucide-react";

// ─── CONTEXT ───────────────────────────────────────────────────────
const ToastContext = createContext(null);

const ICONS = {
  xp: Zap,
  streak: Flame,
  achievement: Trophy,
  mission: CheckCircle2,
  level: Star,
  info: CheckCircle2,
};

const COLORS = {
  xp: "#7C6FFF",
  streak: "#FF6B2B",
  achievement: "#FFD700",
  mission: "#00FFC8",
  level: "#FFB347",
  info: "#4FC3F7",
};

let _toast = null; // module-level ref for imperative use outside React

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const show = useCallback(
    ({ type = "info", title, message, duration = 3500 }) => {
      const id = `toast-${Date.now()}-${counterRef.current++}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration,
      );
      return id;
    },
    [],
  );

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose imperatively
  _toast = show;

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}

      {/* Toast portal */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] ?? ICONS.info;
            const color = COLORS[toast.type] ?? COLORS.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.88 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="pointer-events-auto relative flex items-center gap-3 px-4 py-3 rounded-xl border overflow-hidden min-w-[240px] max-w-[300px]"
                style={{
                  background: `linear-gradient(135deg,${color}14,rgba(5,5,12,0.96))`,
                  borderColor: `${color}38`,
                  boxShadow: `0 0 30px ${color}18, 0 4px 20px rgba(0,0,0,0.5)`,
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Top glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{
                    background: `linear-gradient(90deg,transparent,${color},transparent)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon size={15} style={{ color }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <p className="text-[12px] font-black text-white leading-tight">
                      {toast.title}
                    </p>
                  )}
                  {toast.message && (
                    <p className="text-[10px] text-white/45 leading-snug mt-0.5">
                      {toast.message}
                    </p>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismiss(toast.id)}
                  className="shrink-0 p-1 rounded-lg text-white/20 hover:text-white/55 transition-colors"
                >
                  <X size={11} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ─── HOOK ──────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

// ─── IMPERATIVE (usable outside React components) ──────────────────
export function toast(opts) {
  if (_toast) _toast(opts);
}
