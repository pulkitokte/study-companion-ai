import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import StudyCalendar from "../components/planner/StudyCalendar.jsx";
import ScheduleBoard from "../components/planner/ScheduleBoard.jsx";
import { getProfile } from "../utils/userProfile.js";
import { getPlanner, generateDefaultTasks } from "../utils/plannerStorage.js";
import { syncTaskCompletionToSyllabus } from "../utils/plannerSyllabusSync.js";

export default function Planner() {
  const today = new Date().toISOString().slice(0, 10);
  const [selDate, setSelDate] = useState(today);

  // Generate default tasks on first visit
  const planner = getPlanner();
  if (planner.tasks.length === 0 && planner.lastGenerated !== today) {
    generateDefaultTasks(getProfile() ?? {});
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarDays size={20} className="text-[#7C6FFF]" />
        <div>
          <h2 className="text-[22px] font-black text-white">Study Planner</h2>
          <p className="text-[11px] text-white/30 mt-0.5">
            Organise your daily study sessions
          </p>
        </div>
      </div>

      {/* Two-column layout on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
        <StudyCalendar selectedDate={selDate} onDateSelect={setSelDate} />
        <ScheduleBoard dateStr={selDate} />
      </div>
    </motion.div>
  );
}
