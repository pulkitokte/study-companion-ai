import { motion, AnimatePresence } from "framer-motion";
import { X, Brain } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";

export default function AuthModal() {
  const { authModal, authTab, setAuthTab, closeAuthModal } = useAuth();

  return (
    <AnimatePresence>
      {authModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[700] flex items-center justify-center bg-black/72 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-sm rounded-3xl border border-white/[0.1] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,rgba(8,8,15,0.99),rgba(12,12,22,0.99))",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(124,111,255,0.1)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-[1.5px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
              }}
            />

            {/* Corner glow */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10"
              style={{ background: "#7C6FFF" }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FFC8] to-[#7C6FFF] flex items-center justify-center">
                  <Brain size={16} className="text-black" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-black text-white tracking-wide">
                  StudyMind
                </span>
              </div>
              <button
                onClick={closeAuthModal}
                className="p-1.5 rounded-xl text-white/28 hover:text-white/65 hover:bg-white/[0.07] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tab strip */}
            <div className="flex mx-6 mb-5 p-0.5 rounded-xl border border-white/[0.07] bg-white/[0.03]">
              {["login", "register"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAuthTab(tab)}
                  className="flex-1 py-1.5 rounded-[10px] text-[12px] font-bold transition-all duration-200"
                  style={{
                    background:
                      authTab === tab
                        ? "rgba(124,111,255,0.18)"
                        : "transparent",
                    color:
                      authTab === tab ? "#7C6FFF" : "rgba(255,255,255,0.32)",
                    border:
                      authTab === tab
                        ? "1px solid rgba(124,111,255,0.35)"
                        : "1px solid transparent",
                  }}
                >
                  {tab === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Forms */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {authTab === "login" ? (
                  <LoginForm
                    key="login"
                    onSwitch={() => setAuthTab("register")}
                  />
                ) : (
                  <RegisterForm
                    key="register"
                    onSwitch={() => setAuthTab("login")}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
