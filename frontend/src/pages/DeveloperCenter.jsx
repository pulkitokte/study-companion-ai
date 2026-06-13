import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Server,
  Code2,
  FileJson,
  AlertTriangle,
  Layers,
  Zap,
} from "lucide-react";
import { useBackend } from "../hooks/useBackend.js";
import { useToast } from "../components/ui/Toast.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

const PROVIDER_LABELS = {
  localStorage: { label: "localStorage", color: "#FFB347" },
  supabase: { label: "Supabase", color: "#00FFC8" },
  rest: { label: "Custom REST", color: "#7C6FFF" },
  gemini: { label: "Gemini AI", color: "#FF6B9D" },
  mock: { label: "Mock", color: "#888" },
  "custom-rest": { label: "Custom REST", color: "#7C6FFF" },
};

function ServiceRow({ service }) {
  const meta = PROVIDER_LABELS[service.provider] ?? {
    label: service.provider,
    color: "#888",
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0">
      {service.ready ? (
        <CheckCircle2 size={15} className="text-[#00FFC8] shrink-0" />
      ) : (
        <XCircle size={15} className="text-[#FF3C3C] shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white/72">
          {service.name}
        </p>
        <p className="text-[10px] text-white/28">{service.description}</p>
      </div>
      <span
        className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{
          color: meta.color,
          background: `${meta.color}14`,
          border: `1px solid ${meta.color}28`,
        }}
      >
        {meta.label}
      </span>
    </div>
  );
}

export default function DeveloperCenter() {
  const navigate = useNavigate();
  const {
    registry,
    storageInfo,
    schemaVersion,
    backendMode,
    isMock,
    exportData,
    importData,
    validateImport,
    refresh,
  } = useBackend();
  const { show } = useToast();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleExport = () => {
    const result = exportData();
    show({
      type: "mission",
      title: "Ecosystem exported",
      message: result.filename,
      duration: 3000,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const validation = validateImport(reader.result);
      if (!validation.ok) {
        show({
          type: "info",
          title: "Invalid file",
          message: validation.error,
          duration: 3000,
        });
        setPreview(null);
        return;
      }
      setPreview({
        raw: reader.result,
        meta: validation.meta,
        coverage: validation.coverage,
      });
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!preview) return;
    const result = importData(preview.raw, { overwrite: true });
    if (result.ok) {
      show({
        type: "mission",
        title: "Import successful",
        message: `${result.restored} data modules restored`,
        duration: 3000,
      });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      show({
        type: "info",
        title: "Import failed",
        message: result.error,
        duration: 3000,
      });
    }
  };

  const handleRefresh = () => {
    refresh();
    show({
      type: "info",
      title: "Refreshed",
      message: "Service registry reloaded",
      duration: 1500,
    });
  };

  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* Header */}
      <motion.div
        variants={I}
        className="flex items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-[12px] text-white/30 hover:text-white/65 transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-all"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </motion.div>

      {/* Hero */}
      <motion.div
        variants={I}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-6"
        style={{
          background:
            "linear-gradient(135deg,rgba(124,111,255,0.1),rgba(0,255,200,0.06),rgba(5,5,12,0))",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background:
              "linear-gradient(90deg,transparent,#7C6FFF,#00FFC8,transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-1">
          <Code2 size={15} className="text-[#7C6FFF]" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C6FFF]">
            Developer Center
          </span>
        </div>
        <h2 className="text-[24px] font-black text-white">Backend Readiness</h2>
        <p className="text-[12px] text-white/35 mt-1 max-w-lg">
          Service registry, data migration tools, and storage diagnostics.
          Schema v{schemaVersion} · {registry.services.length} services
          registered.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              icon: Server,
              val: registry.pct + "%",
              label: "Services Ready",
              color: "#00FFC8",
            },
            {
              icon: Layers,
              val: registry.total,
              label: "Total Services",
              color: "#7C6FFF",
            },
            {
              icon: Database,
              val: `${storageInfo.kb} KB`,
              label: "Storage Used",
              color: "#FFB347",
            },
            {
              icon: Zap,
              val: isMock ? "Mock" : "Live",
              label: "Backend Mode",
              color: isMock ? "#FFB347" : "#00FFC8",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/[0.06]"
                style={{ background: `${s.color}06` }}
              >
                <Icon size={14} style={{ color: s.color }} />
                <span className="text-[16px] font-black text-white leading-none">
                  {s.val}
                </span>
                <span className="text-[9px] text-white/25 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Service registry */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
        style={{ background: "#0A0A14" }}
      >
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
          <Server size={13} className="text-[#00FFC8]" />
          <span className="text-[12px] font-bold text-white">
            Service Registry
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#FFB347]/12 text-[#FFB347] border border-[#FFB347]/25">
            {backendMode === "mock"
              ? "Mock Mode"
              : backendMode === "supabase"
                ? "Supabase"
                : "Custom REST"}
          </span>
        </div>
        {registry.services.map((s) => (
          <ServiceRow key={s.key} service={s} />
        ))}
      </motion.div>

      {/* Data migration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export */}
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5 space-y-3"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2">
            <Download size={14} className="text-[#00FFC8]" />
            <span className="text-[12px] font-bold text-white">
              Export Ecosystem
            </span>
          </div>
          <p className="text-[11px] text-white/35 leading-relaxed">
            Download a full JSON snapshot of all 16 data namespaces — profile,
            quiz, focus, planner, achievements, AI memory, and more.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px]"
            style={{
              background: "linear-gradient(135deg,#00FFC8,#7C6FFF)",
              color: "#000",
            }}
          >
            <FileJson size={14} /> Export Full Backup
          </motion.button>
        </motion.div>

        {/* Import */}
        <motion.div
          variants={I}
          className="rounded-2xl border border-white/[0.06] p-5 space-y-3"
          style={{ background: "#0A0A14" }}
        >
          <div className="flex items-center gap-2">
            <Upload size={14} className="text-[#7C6FFF]" />
            <span className="text-[12px] font-bold text-white">
              Import Ecosystem
            </span>
          </div>
          <p className="text-[11px] text-white/35 leading-relaxed">
            Restore from a previously exported StudyMind backup file. This
            overwrites existing data for matched modules.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelect}
            className="block w-full text-[11px] text-white/45 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#7C6FFF]/15 file:text-[#7C6FFF] file:text-[11px] file:font-bold cursor-pointer"
          />

          {preview && (
            <div className="px-3 py-2.5 rounded-xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/06 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={11} className="text-[#7C6FFF]" />
                <span className="text-[10px] font-bold text-[#7C6FFF]">
                  Valid backup detected
                </span>
              </div>
              <p className="text-[10px] text-white/40">
                Schema v{preview.meta.schemaVersion} · {preview.coverage.found}/
                {preview.coverage.total} modules · exported{" "}
                {new Date(preview.meta.exportedAt).toLocaleString()}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleImport}
                className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-[11px]"
                style={{
                  background: "linear-gradient(135deg,#7C6FFF,#4A3FCC)",
                  color: "#fff",
                }}
              >
                <Upload size={12} /> Confirm Restore
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Env config hint */}
      <motion.div
        variants={I}
        className="rounded-2xl border border-[#7C6FFF]/20 bg-[#7C6FFF]/05 p-5"
      >
        <p className="text-[11px] font-bold text-[#7C6FFF] mb-2">
          Next steps for real backend
        </p>
        <pre className="text-[10px] text-white/45 leading-relaxed font-mono whitespace-pre-wrap">
          {`1. Set VITE_BACKEND_URL or VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env
2. Implement remoteProvider in services/storageService.js
3. Switch _provider to remoteProvider once endpoints are live
4. Each service (quiz/focus/progress/chat) already enqueues sync actions
   via cloudSync.enqueueSync() — syncScheduler.js will replay them
5. dataMigration.js handles export/import for moving between environments`}
        </pre>
      </motion.div>
    </motion.div>
  );
}
