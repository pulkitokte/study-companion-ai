import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginForm({ onSwitch }) {
  const { login, authError, isMockMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErr("Please fill in all fields.");
      return;
    }
    setErr("");
    setLoading(true);
    const { ok, error } = await login({ email: email.trim(), password });
    if (!ok) setErr(error ?? "Login failed. Please try again.");
    setLoading(false);
  };

  const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/22 text-[13px] rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:border-[#00FFC8]/45 focus:bg-white/[0.06]";

  return (
    <motion.form
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22 }}
      onSubmit={handle}
      className="space-y-4"
    >
      <div>
        <h3 className="text-[18px] font-black text-white mb-0.5">
          Welcome back
        </h3>
        <p className="text-[11px] text-white/35">
          Sign in to sync your study progress
        </p>
        {isMockMode && (
          <div className="mt-2 px-3 py-2 rounded-xl border border-[#FFB347]/25 bg-[#FFB347]/06 text-[10px] text-[#FFB347]/80 leading-relaxed">
            📱 Mock mode — any email/password works. Add{" "}
            <code>VITE_BACKEND_URL</code> for real auth.
          </div>
        )}
      </div>

      {/* Email */}
      <div className="relative">
        <Mail
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} pl-9`}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
        />
        <input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} pl-9 pr-9`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/28 hover:text-white/55 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* Error */}
      {(err || authError) && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-[#FF6B6B] bg-[#FF6B6B]/08 border border-[#FF6B6B]/20 rounded-xl px-3 py-2"
        >
          {err || authError}
        </motion.p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] transition-all disabled:opacity-55 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
          color: "#000",
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogIn size={15} />
        )}
        {loading ? "Signing in…" : "Sign In"}
      </motion.button>

      {/* Switch */}
      <p className="text-center text-[12px] text-white/35">
        No account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#00FFC8] font-bold hover:text-[#00FFC8]/80 transition-colors"
        >
          Create one
        </button>
      </p>
    </motion.form>
  );
}
