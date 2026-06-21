import { useMemo } from "react";
import {
  buildSubjectBars,
  buildStatusSlices,
  buildWeeklyActivity,
  buildXPMetrics,
} from "../../../utils/syllabusAnalytics.js";
import XPProgressSummary from "./XPProgressSummary.jsx";
import SubjectCompletionChart from "./SubjectCompletionChart.jsx";
import TopicStatusDonut from "./TopicStatusDonut.jsx";
import WeeklyActivityChart from "./WeeklyActivityChart.jsx";

/**
 * SyllabusAnalyticsView
 *
 * Stateless container — calls all Batch A transforms and distributes
 * chart-ready data to Batch B components. No service calls here.
 *
 * Props:
 *   activeExam     {string}  - current exam id
 *   examProgress   {object}  - syllabusService.getExamProgress() result
 *   subjectProgress{Array}   - syllabusService.getAllSubjectProgress() result
 *   activityLog    {Array}   - syllabusService.getActivityLog(90) result
 */
export default function SyllabusAnalyticsView({
  activeExam,
  examProgress,
  subjectProgress,
  activityLog,
}) {
  // Filter log to the active exam so charts show per-exam analytics.
  // Entries without an exam field are included for safety.
  const examLog = useMemo(
    () => (activityLog ?? []).filter((e) => !e.exam || e.exam === activeExam),
    [activityLog, activeExam],
  );

  // ── Batch A transforms ───────────────────────────────────────────────────
  const subjectBars = useMemo(
    () => buildSubjectBars(subjectProgress ?? []),
    [subjectProgress],
  );
  const statusSlices = useMemo(
    () => buildStatusSlices(examProgress ?? {}),
    [examProgress],
  );
  const weeklyData = useMemo(() => buildWeeklyActivity(examLog), [examLog]);
  const xpMetrics = useMemo(
    () => buildXPMetrics(examProgress ?? {}, examLog),
    [examProgress, examLog],
  );

  return (
    <div className="space-y-4">
      {/* Row 1 — Stat cards */}
      <XPProgressSummary xpMetrics={xpMetrics} />

      {/* Row 2 — Bar chart (wider) + Donut (narrower) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SubjectCompletionChart subjectBars={subjectBars} />
        </div>
        <div className="lg:col-span-1">
          <TopicStatusDonut
            statusSlices={statusSlices}
            examPct={examProgress?.pct ?? 0}
          />
        </div>
      </div>

      {/* Row 3 — Activity trend full width */}
      <WeeklyActivityChart weeklyData={weeklyData} />
    </div>
  );
}
