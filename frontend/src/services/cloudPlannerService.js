// Cloud planner service — task sync, schedule sync.

import { supabaseConfig, SUPABASE_TABLES } from "../config/supabaseConfig.js";
import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { getPlanner } from "../utils/plannerStorage.js";
import { syncNamespaceWithRetry } from "../lib/cloudSyncEngine.js";
import { resolvePlannerTasks } from "../lib/conflictResolver.js";

export const cloudPlannerService = {
  isCloudEnabled() {
    return supabaseConfig.configured;
  },

  // ─── TASK SYNC ──────────────────────────────────────────────
  getLocalTasks() {
    const { tasks = [] } = getPlanner();
    return tasks;
  },

  async syncTasks() {
    return syncNamespaceWithRetry(NAMESPACES.planner);
  },

  async pushTask(task) {
    if (!supabaseConfig.configured)
      return { ok: true, mock: true, table: SUPABASE_TABLES.plannerTasks };
    // TODO: real Supabase upsert into `planner_tasks`
    return { ok: true, table: SUPABASE_TABLES.plannerTasks };
  },

  mergeTasks(local, cloud) {
    return resolvePlannerTasks(local, cloud);
  },

  // ─── SCHEDULE SYNC ──────────────────────────────────────────
  // Aggregates tasks by date for calendar sync — same payload shape
  // future Supabase 'planner_tasks' table view would return.
  getScheduleByDate() {
    const tasks = this.getLocalTasks();
    const map = {};
    tasks.forEach((t) => {
      const key = t.date;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  },

  async pushSchedule() {
    const schedule = this.getScheduleByDate();
    if (!supabaseConfig.configured)
      return { ok: true, mock: true, days: Object.keys(schedule).length };
    // TODO: real Supabase batch upsert
    return { ok: true, days: Object.keys(schedule).length };
  },
};

export default cloudPlannerService;
