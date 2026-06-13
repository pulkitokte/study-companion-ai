// Conflict resolution strategies for local-vs-cloud data merges.
// Pure functions — no side effects, fully testable.

// ─── STRATEGIES ────────────────────────────────────────────────────
export const STRATEGIES = {
  LOCAL_WINS: "local_wins",
  CLOUD_WINS: "cloud_wins",
  NEWEST_WINS: "newest_wins",
  HIGHEST_WINS: "highest_wins", // for numeric values like XP
  MERGE_ARRAYS: "merge_arrays", // union of array-based data
};

// ─── GENERIC RESOLVER ───────────────────────────────────────────────
export function resolve(
  local,
  cloud,
  strategy = STRATEGIES.NEWEST_WINS,
  options = {},
) {
  if (local === undefined || local === null)
    return { value: cloud, source: "cloud", conflict: false };
  if (cloud === undefined || cloud === null)
    return { value: local, source: "local", conflict: false };

  switch (strategy) {
    case STRATEGIES.LOCAL_WINS:
      return {
        value: local,
        source: "local",
        conflict: !deepEqual(local, cloud),
      };

    case STRATEGIES.CLOUD_WINS:
      return {
        value: cloud,
        source: "cloud",
        conflict: !deepEqual(local, cloud),
      };

    case STRATEGIES.NEWEST_WINS: {
      const key = options.timestampKey ?? "updatedAt";
      const lt = new Date(local?.[key] ?? 0).getTime();
      const ct = new Date(cloud?.[key] ?? 0).getTime();
      if (lt === ct) return { value: local, source: "local", conflict: false };
      return lt > ct
        ? { value: local, source: "local", conflict: true }
        : { value: cloud, source: "cloud", conflict: true };
    }

    case STRATEGIES.HIGHEST_WINS: {
      const key = options.valueKey ?? "value";
      const lv = Number(local?.[key] ?? local ?? 0);
      const cv = Number(cloud?.[key] ?? cloud ?? 0);
      if (lv === cv) return { value: local, source: "local", conflict: false };
      return lv >= cv
        ? { value: local, source: "local", conflict: true }
        : { value: cloud, source: "cloud", conflict: true };
    }

    case STRATEGIES.MERGE_ARRAYS: {
      const localArr = Array.isArray(local) ? local : [];
      const cloudArr = Array.isArray(cloud) ? cloud : [];
      const idKey = options.idKey ?? "id";
      const map = new Map();
      [...cloudArr, ...localArr].forEach((item) => {
        const id = item?.[idKey] ?? JSON.stringify(item);
        map.set(id, item);
      });
      return {
        value: [...map.values()],
        source: "merged",
        conflict: localArr.length !== cloudArr.length,
      };
    }

    default:
      return { value: local, source: "local", conflict: false };
  }
}

// ─── SHAPE-SPECIFIC RESOLVERS ────────────────────────────────────────

// Profile: newest update wins
export function resolveProfile(local, cloud) {
  return resolve(local, cloud, STRATEGIES.NEWEST_WINS, {
    timestampKey: "updatedAt",
  });
}

// XP / progress: higher value wins (never lose progress)
export function resolveXP(localXP, cloudXP) {
  const lv = Number(localXP ?? 0);
  const cv = Number(cloudXP ?? 0);
  return {
    value: Math.max(lv, cv),
    source: lv >= cv ? "local" : "cloud",
    conflict: lv !== cv,
  };
}

// Achievements: union of unlocked IDs
export function resolveAchievements(localIds = [], cloudIds = []) {
  const merged = [...new Set([...(localIds ?? []), ...(cloudIds ?? [])])];
  return {
    value: merged,
    source: "merged",
    conflict: localIds.length !== cloudIds.length,
  };
}

// History arrays (quiz/focus sessions): merge by id, dedupe
export function resolveHistory(
  localHistory = [],
  cloudHistory = [],
  idKey = "id",
) {
  return resolve(localHistory, cloudHistory, STRATEGIES.MERGE_ARRAYS, {
    idKey,
  });
}

// Planner tasks: merge by id, prefer most recently updated per task
export function resolvePlannerTasks(localTasks = [], cloudTasks = []) {
  const map = new Map();
  [...(cloudTasks ?? []), ...(localTasks ?? [])].forEach((task) => {
    const existing = map.get(task.id);
    if (!existing) {
      map.set(task.id, task);
      return;
    }
    const lt = new Date(task.updatedAt ?? task.createdAt ?? 0).getTime();
    const et = new Date(
      existing.updatedAt ?? existing.createdAt ?? 0,
    ).getTime();
    if (lt >= et) map.set(task.id, task);
  });
  return {
    value: [...map.values()],
    source: "merged",
    conflict: localTasks.length !== cloudTasks.length,
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────
function deepEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

export default {
  STRATEGIES,
  resolve,
  resolveProfile,
  resolveXP,
  resolveAchievements,
  resolveHistory,
  resolvePlannerTasks,
};
