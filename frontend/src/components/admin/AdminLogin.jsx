import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useToast } from "../ui/Toast.jsx";

export default function AdminLogin() {
  const { login } = useAdmin();
  const { show } = useToast();
  const [passcode, setPasscode] = useState("");
  const [show_, setShow_] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError("Enter the admin passcode.");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      const ok = login(passcode.trim());
      if (ok) {
        show({
          type: "mission",
          title: "Admin access granted",
          message: "Welcome to the control panel",
          duration: 2500,
        });
      } else {
        setError("Invalid passcode. Access denied.");
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative w-full max-w-sm rounded-3xl border border-white/[0.1] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,rgba(8,8,15,0.99),rgba(12,12,22,0.99))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#FF6B9D,#7C6FFF,transparent)",
          }}
        />
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10"
          style={{ background: "#7C6FFF" }}
        />

        <div className="relative p-7 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -inset-2 rounded-full blur-xl"
                style={{
                  background: "linear-gradient(135deg,#FF6B9D,#7C6FFF)",
                }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#7C6FFF] flex items-center justify-center">
                <ShieldCheck size={28} className="text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-[18px] font-black text-white">
              Admin Control Panel
            </h2>
            <p className="text-[11px] text-white/35 mt-1">
              Restricted access · System administrators only
            </p>
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
              />
              <input
                type={show_ ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Admin passcode"
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/22 text-[13px] rounded-xl px-4 py-3 pl-9 pr-9 outline-none transition-all duration-200 focus:border-[#FF6B9D]/45 focus:bg-white/[0.06]"
              />
              <button
                type="button"
                onClick={() => setShow_((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/28 hover:text-white/55 transition-colors"
              >
                {show_ ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-[11px] text-[#FF6B6B] bg-[#FF6B6B]/08 border border-[#FF6B6B]/20 rounded-xl px-3 py-2"
              >
                <AlertTriangle size={12} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] transition-all disabled:opacity-55"
              style={{
                background: "linear-gradient(135deg,#FF6B9D,#7C6FFF)",
                color: "#fff",
              }}
            >
              <LogIn size={15} className={loading ? "animate-pulse" : ""} />
              {loading ? "Verifying…" : "Unlock Admin Panel"}
            </motion.button>
          </form>

          <div className="px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-[10px] text-white/28 leading-relaxed font-mono">
              Demo passcode:{" "}
              <span className="text-[#7C6FFF]">studymind-admin</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
