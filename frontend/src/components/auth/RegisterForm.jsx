import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { passwordStrength } from "../../lib/authClient.js";

export default function RegisterForm({ onSwitch }) {
  const { register, authError, isMockMode } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const strength = passwordStrength(password);
  const inputClass =
    "w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/22 text-[13px] rounded-xl px-4 py-2.5 outline-none transition-all duration-200 focus:border-[#00FFC8]/45 focus:bg-white/[0.06]";

  const handle = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErr("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setErr("");
    setLoading(true);
    const { ok, error } = await register({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (!ok) setErr(error ?? "Registration failed. Please try again.");
    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22 }}
      onSubmit={handle}
      className="space-y-4"
    >
      <div>
        <h3 className="text-[18px] font-black text-white mb-0.5">
          Create your account
        </h3>
        <p className="text-[11px] text-white/35">
          Join StudyMind — your progress syncs instantly
        </p>
        {isMockMode && (
          <div className="mt-2 px-3 py-2 rounded-xl border border-[#FFB347]/25 bg-[#FFB347]/06 text-[10px] text-[#FFB347]/80">
            📱 Mock mode — account saved locally. Add backend for real auth.
          </div>
        )}
      </div>

      {/* Name */}
      <div className="relative">
        <User
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} pl-9`}
        />
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
      <div className="space-y-2">
        <div className="relative">
          <Lock
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28 pointer-events-none"
          />
          <input
            type={show ? "text" : "password"}
            placeholder="Password (min 8 chars)"
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
        {/* Strength meter */}
        {password && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-1"
          >
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${strength.pct}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full"
                style={{ background: strength.color }}
              />
            </div>
            <p
              className="text-[9px] font-bold"
              style={{ color: strength.color }}
            >
              {strength.label}
            </p>
          </motion.div>
        )}
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
          background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
          color: "#fff",
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <UserPlus size={15} />
        )}
        {loading ? "Creating account…" : "Create Account"}
      </motion.button>

      <p className="text-center text-[12px] text-white/35">
        Already have one?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#7C6FFF] font-bold hover:text-[#7C6FFF]/80 transition-colors"
        >
          Sign in
        </button>
      </p>
    </motion.form>
  );
}
