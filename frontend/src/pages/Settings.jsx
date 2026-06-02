import { motion } from "framer-motion";
import ProfileCard from "../components/settings/ProfileCard.jsx";
import ThemeSettings from "../components/settings/ThemeSettings.jsx";
import NotificationSettings from "../components/settings/NotificationSettings.jsx";
import DataManagement from "../components/settings/DataManagement.jsx";

const C = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const I = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};

export default function Settings() {
  return (
    <motion.div
      variants={C}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl mx-auto pb-10"
    >
      <motion.div variants={I}>
        <h2 className="text-[24px] font-black text-white">Settings</h2>
        <p className="text-[12px] text-white/30 mt-1">
          Manage your profile, appearance, and data.
        </p>
      </motion.div>
      <motion.div variants={I}>
        <ProfileCard />
      </motion.div>
      <motion.div variants={I}>
        <ThemeSettings />
      </motion.div>
      <motion.div variants={I}>
        <NotificationSettings />
      </motion.div>
      <motion.div variants={I}>
        <DataManagement />
      </motion.div>
    </motion.div>
  );
}
