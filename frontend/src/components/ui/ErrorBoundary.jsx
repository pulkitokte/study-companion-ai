import { Component } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("[StudyMind Error Boundary]", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  handleHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const errMsg = this.state.error?.message ?? "Unknown error";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508] px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-6 text-center"
        >
          {/* Error icon */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute inset-0 rounded-2xl blur-xl bg-red-500"
              />
              <div className="relative w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={36} className="text-red-400" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <h2 className="text-[22px] font-black text-white mb-2">
              System Error
            </h2>
            <p className="text-[13px] text-white/45 leading-relaxed">
              Something crashed. Your data is safe in localStorage — this is a
              UI error only.
            </p>
          </div>

          {/* Error detail */}
          <div className="text-left px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/05 font-mono">
            <p className="text-[10px] text-red-400/70 truncate">{errMsg}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={this.handleRetry}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
            >
              <RefreshCw size={14} /> Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={this.handleHome}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[12px]"
              style={{
                background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
                color: "#fff",
              }}
            >
              <Home size={14} /> Dashboard
            </motion.button>
          </div>

          <p className="text-[10px] text-white/18">
            If this keeps happening, try Settings → Data Management → Full App
            Reset
          </p>
        </motion.div>
      </div>
    );
  }
}
