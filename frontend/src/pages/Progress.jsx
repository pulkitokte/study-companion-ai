import { motion } from "framer-motion";
import { ProgressProvider } from "../context/ProgressContext.jsx";
import ProgressHome from "../components/progress/ProgressHome.jsx";

export default function Progress() {
  return (
    <ProgressProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-full pb-10"
      >
        <ProgressHome />
      </motion.div>
    </ProgressProvider>
  );
}
