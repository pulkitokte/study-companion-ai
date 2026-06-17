// Syllabus Tracker service — all progress CRUD, XP, planner integration.
// Reads from: data/syllabusData.js   (static definitions)
// Writes to:  StorageAdapter → NAMESPACES.syllabus
//
// globalStats.js reads NAMESPACES.syllabus DIRECTLY (not via this service)
// to avoid the circular chain: syllabusService → useGlobalStats → globalStats → syllabusService

import StorageAdapter, { NAMESPACES } from "../lib/storageAdapter.js";
import { enqueueSync } from "../lib/cloudSync.js";
import { notifyStatsUpdate } from "../hooks/useGlobalStats.js";
import { getPlanner } from "../utils/plannerStorage.js";
import {
  getExam,
  getSubject,
  getTopics,
  getTopic,
  getSubjectsArray,
  getSubjectMaxXP,
  getExamMaxXP,
} from "../data/syllabusData.js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DEFAULT_ACTIVE_EXAM = "upsc";
const MAX_LOG_ENTRIES = 100;
const TOPIC_REVISION_XP = 20;
const TOPIC_MASTERY_XP = 30;
const SUBJECT_COMPLETE_XP = 200;
const SUBJECT_MASTERY_XP = 500;
const EXAM_HALF_XP = 500;
const EXAM_FULL_XP = 2000;

export const TOPIC_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REVISION_NEEDED: "revision_needed",
  REVISED: "revised",
  MASTERED: "mastered",
};

const DONE_STATUSES = new Set([
  TOPIC_STATUS.COMPLETED,
  TOPIC_STATUS.REVISION_NEEDED,
  TOPIC_STATUS.REVISED,
  TOPIC_STATUS.MASTERED,
]);

// ─── PRIVATE: STORAGE I/O ────────────────────────────────────────────────────

function _read() {
  return StorageAdapter.get(NAMESPACES.syllabus, null);
}

function _defaultData() {
  return {
    activeExam: DEFAULT_ACTIVE_EXAM,
    exams: {},
    activityLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function _readOrInit() {
  return _read() ?? _defaultData();
}

function _write(data) {
  const stamped = { ...data, updatedAt: new Date().toISOString() };
  StorageAdapter.set(NAMESPACES.syllabus, stamped);
  return stamped;
}

// ─── PRIVATE: TOPIC PROGRESS ACCESS ─────────────────────────────────────────

const EMPTY_TOPIC_PROGRESS = Object.freeze({
  status: TOPIC_STATUS.NOT_STARTED,
  completedAt: null,
  revisedAt: null,
  masteredAt: null,
  xpEarned: 0,
});

function _getTopicProgress(data, examId, subjectId, topicId) {
  return (
    data?.exams?.[examId]?.subjects?.[subjectId]?.topics?.[topicId] ?? {
      ...EMPTY_TOPIC_PROGRESS,
    }
  );
}

function _ensurePath(data, examId, subjectId) {
  if (!data.exams[examId]) {
    data.exams[examId] = { subjects: {}, bonusXPEarned: 0 };
  }
  if (!data.exams[examId].subjects[subjectId]) {
    data.exams[examId].subjects[subjectId] = { topics: {}, bonusXPEarned: 0 };
  }
}

// ─── PRIVATE: XP CALCULATION ─────────────────────────────────────────────────

function _transitionXP(topicDef, oldStatus, newStatus) {
  if (oldStatus === newStatus) return 0;

  if (
    (oldStatus === TOPIC_STATUS.NOT_STARTED ||
      oldStatus === TOPIC_STATUS.IN_PROGRESS) &&
    newStatus === TOPIC_STATUS.COMPLETED
  ) {
    return topicDef.xp;
  }

  if (
    (oldStatus === TOPIC_STATUS.COMPLETED ||
      oldStatus === TOPIC_STATUS.REVISION_NEEDED) &&
    newStatus === TOPIC_STATUS.REVISED
  ) {
    return TOPIC_REVISION_XP;
  }

  if (
    oldStatus === TOPIC_STATUS.REVISED &&
    newStatus === TOPIC_STATUS.MASTERED
  ) {
    return TOPIC_MASTERY_XP;
  }

  return 0;
}

// ─── PRIVATE: PROGRESS CALCULATION ──────────────────────────────────────────

function _calcSubjectProgress(data, examId, subjectId) {
  const topicDefs = getTopics(examId, subjectId);
  const totals = {
    total: topicDefs.length,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    revisionNeeded: 0,
    revised: 0,
    mastered: 0,
    done: 0,
    xpEarned: 0,
  };

  topicDefs.forEach((topicDef) => {
    const progress = _getTopicProgress(data, examId, subjectId, topicDef.id);
    const s = progress.status;

    if (s === TOPIC_STATUS.NOT_STARTED) totals.notStarted++;
    else if (s === TOPIC_STATUS.IN_PROGRESS) totals.inProgress++;
    else if (s === TOPIC_STATUS.COMPLETED) {
      totals.completed++;
      totals.done++;
    } else if (s === TOPIC_STATUS.REVISION_NEEDED) {
      totals.revisionNeeded++;
      totals.done++;
    } else if (s === TOPIC_STATUS.REVISED) {
      totals.revised++;
      totals.done++;
    } else if (s === TOPIC_STATUS.MASTERED) {
      totals.mastered++;
      totals.done++;
    }

    totals.xpEarned += progress.xpEarned ?? 0;
  });

  totals.xpEarned +=
    data?.exams?.[examId]?.subjects?.[subjectId]?.bonusXPEarned ?? 0;
  totals.pct =
    totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;
  totals.maxXP = getSubjectMaxXP(examId, subjectId);

  return totals;
}

function _calcExamProgress(data, examId) {
  const subjectDefs = getSubjectsArray(examId);
  const totals = {
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    revisionNeeded: 0,
    revised: 0,
    mastered: 0,
    done: 0,
    xpEarned: 0,
  };

  subjectDefs.forEach((subjectDef) => {
    const sp = _calcSubjectProgress(data, examId, subjectDef.id);
    totals.total += sp.total;
    totals.notStarted += sp.notStarted;
    totals.inProgress += sp.inProgress;
    totals.completed += sp.completed;
    totals.revisionNeeded += sp.revisionNeeded;
    totals.revised += sp.revised;
    totals.mastered += sp.mastered;
    totals.done += sp.done;
    totals.xpEarned += sp.xpEarned;
  });

  totals.xpEarned += data?.exams?.[examId]?.bonusXPEarned ?? 0;
  totals.pct =
    totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;
  totals.maxXP = getExamMaxXP(examId);

  return totals;
}

// ─── PRIVATE: MILESTONE BONUSES ──────────────────────────────────────────────

function _checkMilestones(data, examId, subjectId) {
  let bonusXP = 0;
  const now = new Date().toISOString();
  const examData = data.exams[examId];
  const subjectData = data.exams[examId]?.subjects[subjectId];

  if (!examData || !subjectData) return 0;

  if (!subjectData.completionBonusAwarded) {
    const topicDefs = getTopics(examId, subjectId);
    const allDone = topicDefs.every((td) =>
      DONE_STATUSES.has(
        subjectData.topics?.[td.id]?.status ?? TOPIC_STATUS.NOT_STARTED,
      ),
    );
    if (allDone) {
      bonusXP += SUBJECT_COMPLETE_XP;
      subjectData.completionBonusAwarded = true;
      subjectData.bonusXPEarned =
        (subjectData.bonusXPEarned ?? 0) + SUBJECT_COMPLETE_XP;
      subjectData.completedAt = now;
      data.activityLog = [
        {
          action: "subject_completed",
          exam: examId,
          subject: subjectId,
          xp: SUBJECT_COMPLETE_XP,
          timestamp: now,
        },
        ...(data.activityLog ?? []),
      ].slice(0, MAX_LOG_ENTRIES);
    }
  }

  if (!subjectData.masteryBonusAwarded) {
    const topicDefs = getTopics(examId, subjectId);
    const allMastered = topicDefs.every(
      (td) =>
        (subjectData.topics?.[td.id]?.status ?? TOPIC_STATUS.NOT_STARTED) ===
        TOPIC_STATUS.MASTERED,
    );
    if (allMastered) {
      bonusXP += SUBJECT_MASTERY_XP;
      subjectData.masteryBonusAwarded = true;
      subjectData.bonusXPEarned =
        (subjectData.bonusXPEarned ?? 0) + SUBJECT_MASTERY_XP;
      data.activityLog = [
        {
          action: "subject_mastered",
          exam: examId,
          subject: subjectId,
          xp: SUBJECT_MASTERY_XP,
          timestamp: now,
        },
        ...(data.activityLog ?? []),
      ].slice(0, MAX_LOG_ENTRIES);
    }
  }

  if (!examData.halfCompleteBonusAwarded) {
    const ep = _calcExamProgress(data, examId);
    if (ep.pct >= 50) {
      bonusXP += EXAM_HALF_XP;
      examData.halfCompleteBonusAwarded = true;
      examData.bonusXPEarned = (examData.bonusXPEarned ?? 0) + EXAM_HALF_XP;
      data.activityLog = [
        {
          action: "exam_half_complete",
          exam: examId,
          xp: EXAM_HALF_XP,
          timestamp: now,
        },
        ...(data.activityLog ?? []),
      ].slice(0, MAX_LOG_ENTRIES);
    }
  }

  if (!examData.fullCompleteBonusAwarded) {
    const ep = _calcExamProgress(data, examId);
    if (ep.pct >= 100) {
      bonusXP += EXAM_FULL_XP;
      examData.fullCompleteBonusAwarded = true;
      examData.bonusXPEarned = (examData.bonusXPEarned ?? 0) + EXAM_FULL_XP;
      data.activityLog = [
        {
          action: "exam_full_complete",
          exam: examId,
          xp: EXAM_FULL_XP,
          timestamp: now,
        },
        ...(data.activityLog ?? []),
      ].slice(0, MAX_LOG_ENTRIES);
    }
  }

  return bonusXP;
}

// ─── PRIVATE: ACHIEVEMENT CHECK ──────────────────────────────────────────────

function _checkAchievements(data) {
  try {
    const existingRaw = StorageAdapter.get(NAMESPACES.achievements, []);
    const existing = new Set(Array.isArray(existingRaw) ? existingRaw : []);
    const toUnlock = [];

    let totalDone = 0;
    let totalMastered = 0;
    Object.values(data.exams).forEach((exam) => {
      Object.values(exam.subjects ?? {}).forEach((subject) => {
        Object.values(subject.topics ?? {}).forEach((t) => {
          const s = t.status ?? TOPIC_STATUS.NOT_STARTED;
          if (DONE_STATUSES.has(s)) totalDone++;
          if (s === TOPIC_STATUS.MASTERED) totalMastered++;
        });
      });
    });

    const checks = [
      { id: "syllabus_first_topic", condition: totalDone >= 1 },
      { id: "syllabus_ten_topics", condition: totalDone >= 10 },
      { id: "syllabus_fifty_topics", condition: totalDone >= 50 },
      { id: "syllabus_ten_mastered", condition: totalMastered >= 10 },
    ];

    checks.forEach(({ id, condition }) => {
      if (condition && !existing.has(id)) {
        existing.add(id);
        toUnlock.push(id);
      }
    });

    const subjectCompleteId = "syllabus_subject_complete";
    if (!existing.has(subjectCompleteId)) {
      const anySubjectComplete = Object.values(data.exams).some((exam) =>
        Object.values(exam.subjects ?? {}).some(
          (sub) => sub.completionBonusAwarded === true,
        ),
      );
      if (anySubjectComplete) {
        existing.add(subjectCompleteId);
        toUnlock.push(subjectCompleteId);
      }
    }

    if (toUnlock.length > 0) {
      StorageAdapter.set(NAMESPACES.achievements, [...existing]);
    }

    return toUnlock;
  } catch {
    return [];
  }
}

// ─── PRIVATE: ID GENERATOR ───────────────────────────────────────────────────

function _makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SERVICE API
// ─────────────────────────────────────────────────────────────────────────────

export const syllabusService = {
  // ── STORAGE ───────────────────────────────────────────────────────────────

  getSyllabusData() {
    return _readOrInit();
  },

  // ── EXAM MANAGEMENT ───────────────────────────────────────────────────────

  getActiveExam() {
    return _readOrInit().activeExam ?? DEFAULT_ACTIVE_EXAM;
  },

  setActiveExam(examId) {
    if (!getExam(examId))
      return { ok: false, error: `Unknown exam: ${examId}` };
    const data = _readOrInit();
    data.activeExam = examId;
    _write(data);
    enqueueSync("syllabus_set_active_exam", { examId });
    return { ok: true, activeExam: examId };
  },

  // ── PROGRESS READS ────────────────────────────────────────────────────────

  getTopicProgress(examId, subjectId, topicId) {
    const data = _readOrInit();
    return _getTopicProgress(data, examId, subjectId, topicId);
  },

  getSubjectProgress(examId, subjectId) {
    const data = _readOrInit();
    return _calcSubjectProgress(data, examId, subjectId);
  },

  getExamProgress(examId) {
    const data = _readOrInit();
    return _calcExamProgress(data, examId);
  },

  getAllSubjectProgress(examId) {
    const data = _readOrInit();
    const subjectDefs = getSubjectsArray(examId);
    return subjectDefs.map((subjectDef) => ({
      ...subjectDef,
      progress: _calcSubjectProgress(data, examId, subjectDef.id),
    }));
  },

  getSyllabusXP() {
    const data = _read();
    if (!data?.exams) return 0;
    let total = 0;
    Object.values(data.exams).forEach((exam) => {
      total += exam.bonusXPEarned ?? 0;
      Object.values(exam.subjects ?? {}).forEach((subject) => {
        total += subject.bonusXPEarned ?? 0;
        Object.values(subject.topics ?? {}).forEach((topic) => {
          total += topic.xpEarned ?? 0;
        });
      });
    });
    return total;
  },

  // ── MUTATIONS ─────────────────────────────────────────────────────────────

  updateTopicStatus(examId, subjectId, topicId, newStatus) {
    const topicDef = getTopic(examId, subjectId, topicId);
    if (!topicDef) {
      return {
        ok: false,
        error: `Topic not found: ${examId}/${subjectId}/${topicId}`,
      };
    }
    if (!Object.values(TOPIC_STATUS).includes(newStatus)) {
      return { ok: false, error: `Invalid status: ${newStatus}` };
    }

    const data = _readOrInit();
    const now = new Date().toISOString();

    _ensurePath(data, examId, subjectId);

    const current = _getTopicProgress(data, examId, subjectId, topicId);
    const oldStatus = current.status;

    if (oldStatus === newStatus) {
      return {
        ok: true,
        xpEarned: 0,
        bonusXP: 0,
        newStatus,
        oldStatus,
        newAchievements: [],
      };
    }

    const xpEarned = _transitionXP(topicDef, oldStatus, newStatus);

    const updatedTopic = {
      ...current,
      status: newStatus,
      xpEarned: (current.xpEarned ?? 0) + xpEarned,
    };
    if (newStatus === TOPIC_STATUS.COMPLETED && !current.completedAt)
      updatedTopic.completedAt = now;
    if (newStatus === TOPIC_STATUS.REVISED && !current.revisedAt)
      updatedTopic.revisedAt = now;
    if (newStatus === TOPIC_STATUS.MASTERED && !current.masteredAt)
      updatedTopic.masteredAt = now;

    data.exams[examId].subjects[subjectId].topics[topicId] = updatedTopic;

    if (xpEarned > 0) {
      data.activityLog = [
        {
          action: `topic_${newStatus}`,
          exam: examId,
          subject: subjectId,
          topic: topicId,
          topicLabel: topicDef.label,
          xp: xpEarned,
          timestamp: now,
        },
        ...(data.activityLog ?? []),
      ].slice(0, MAX_LOG_ENTRIES);
    }

    const bonusXP = _checkMilestones(data, examId, subjectId);

    _write(data);

    const newAchievements = _checkAchievements(data);

    if (xpEarned > 0 || bonusXP > 0) notifyStatsUpdate();

    enqueueSync("syllabus_topic_update", {
      examId,
      subjectId,
      topicId,
      newStatus,
      xpEarned,
    });

    return {
      ok: true,
      xpEarned,
      bonusXP,
      newStatus,
      oldStatus,
      newAchievements,
    };
  },

  markComplete(examId, subjectId, topicId) {
    return this.updateTopicStatus(
      examId,
      subjectId,
      topicId,
      TOPIC_STATUS.COMPLETED,
    );
  },

  markRevised(examId, subjectId, topicId) {
    return this.updateTopicStatus(
      examId,
      subjectId,
      topicId,
      TOPIC_STATUS.REVISED,
    );
  },

  markMastered(examId, subjectId, topicId) {
    return this.updateTopicStatus(
      examId,
      subjectId,
      topicId,
      TOPIC_STATUS.MASTERED,
    );
  },

  flagForRevision(examId, subjectId, topicId) {
    return this.updateTopicStatus(
      examId,
      subjectId,
      topicId,
      TOPIC_STATUS.REVISION_NEEDED,
    );
  },

  // ── PLANNER INTEGRATION ───────────────────────────────────────────────────

  addTopicToPlanner(examId, subjectId, topicId) {
    const topicDef = getTopic(examId, subjectId, topicId);
    const examDef = getExam(examId);
    const subjectDef = getSubject(examId, subjectId);

    if (!topicDef || !examDef || !subjectDef) {
      return { ok: false, error: "Invalid syllabus reference" };
    }

    const planner = getPlanner();
    const now = new Date().toISOString();

    const newTask = {
      id: _makeId("task"),
      title: `[${examDef.shortLabel} · ${subjectDef.label}] ${topicDef.label}`,
      subject: subjectDef.label,
      date: now.slice(0, 10),
      priority:
        topicDef.difficulty === "hard"
          ? "high"
          : topicDef.difficulty === "medium"
            ? "medium"
            : "low",
      done: false,
      xp: 30,
      source: "syllabus",
      syllabusRef: { exam: examId, subject: subjectId, topic: topicId },
      createdAt: now,
    };

    StorageAdapter.set(NAMESPACES.planner, {
      ...planner,
      tasks: [newTask, ...(planner.tasks ?? [])],
    });

    enqueueSync("syllabus_add_to_planner", { examId, subjectId, topicId });

    return { ok: true, task: newTask };
  },

  // ── ACTIVITY LOG ─────────────────────────────────────────────────────────

  getActivityLog(limit = 20) {
    const data = _readOrInit();
    return (data.activityLog ?? []).slice(0, limit);
  },

  // ── NEXT TOPIC SUGGESTION ────────────────────────────────────────────────

  getNextTopic(examId = null) {
    const activeExam = examId ?? this.getActiveExam();
    const data = _readOrInit();
    const subjectDefs = getSubjectsArray(activeExam);

    for (const subjectDef of subjectDefs) {
      const topicDefs = getTopics(activeExam, subjectDef.id);
      for (const topicDef of topicDefs) {
        const progress = _getTopicProgress(
          data,
          activeExam,
          subjectDef.id,
          topicDef.id,
        );
        if (!DONE_STATUSES.has(progress.status)) {
          return {
            examId: activeExam,
            subjectId: subjectDef.id,
            topicId: topicDef.id,
            topic: topicDef,
            subject: subjectDef,
          };
        }
      }
    }
    return null;
  },

  getRevisionQueue(examId = null, limit = 10) {
    const activeExam = examId ?? this.getActiveExam();
    const data = _readOrInit();
    const queue = [];
    const subjectDefs = getSubjectsArray(activeExam);

    for (const subjectDef of subjectDefs) {
      const topicDefs = getTopics(activeExam, subjectDef.id);
      for (const topicDef of topicDefs) {
        const progress = _getTopicProgress(
          data,
          activeExam,
          subjectDef.id,
          topicDef.id,
        );
        if (progress.status === TOPIC_STATUS.REVISION_NEEDED) {
          queue.push({
            examId: activeExam,
            subjectId: subjectDef.id,
            topicId: topicDef.id,
            topic: topicDef,
            subject: subjectDef,
          });
          if (queue.length >= limit) return queue;
        }
      }
    }
    return queue;
  },

  // ── RESET ─────────────────────────────────────────────────────────────────

  resetExamProgress(examId) {
    const data = _readOrInit();
    if (data.exams[examId]) delete data.exams[examId];
    _write(data);
    enqueueSync("syllabus_exam_reset", { examId });
    notifyStatsUpdate();
    return { ok: true };
  },

  resetAllProgress() {
    _write(_defaultData());
    notifyStatsUpdate();
    return { ok: true };
  },
};

export default syllabusService;
