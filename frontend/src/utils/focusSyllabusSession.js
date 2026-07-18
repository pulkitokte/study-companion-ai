/**
 * focusSyllabusSession.js
 *
 * Lightweight session manager that remembers which syllabus subject
 * (and optionally topic) the user intends to study during the current
 * Focus session.
 *
 * The Focus timer reads this in a later batch to display context and
 * offer post-session topic completion prompts.
 *
 * CONSTRAINTS:
 *   - No React, no JSX, no hooks
 *   - No service imports
 *   - No side effects beyond localStorage reads/writes
 *   - Never throws — all functions are fully defensive
 *
 * STORAGE:
 *   Key: studymind_focus_syllabus_session
 *   Value: JSON-serialised FocusSyllabusSession object (or absent)
 *
 * SESSION SHAPE:
 *   {
 *     examId:       string          — e.g. 'upsc'
 *     subjectId:    string          — e.g. 'polity'
 *     subjectLabel: string          — e.g. 'Indian Polity & Governance'
 *     topicId:      string | null   — specific topic, or null for whole subject
 *     topicLabel:   string | null   — human-readable topic name, or null
 *     startedAt:    string          — ISO timestamp of when the session started
 *   }
 *
 * PHASE 35 BATCH G — ROBUSTNESS:
 *   A session written here is only ever meant to live for the duration of
 *   one Focus session + the post-session modal. If a tab is closed or
 *   refreshed while the modal is pending, or the modal is otherwise never
 *   resolved, the mapping previously stayed in localStorage indefinitely
 *   and could silently resurface days later (e.g. re-triggering the modal
 *   for a stale subject on the next unrelated Focus session, if some
 *   future code path re-reads it before Batch B's overwrite-or-clear logic
 *   runs). All reads now transparently expire sessions older than
 *   MAX_SESSION_AGE_MS and self-heal by clearing them — no caller needs
 *   to change, since expired sessions simply behave as "no session".
 */

const STORAGE_KEY = "studymind_focus_syllabus_session";

// Phase 35 Batch G: any stored session older than this is considered
// abandoned/stale and is treated as absent (and cleared) on next read.
// 6 hours comfortably covers the longest realistic Deep Work session +
// break + time spent on the post-session modal, while still guaranteeing
// a forgotten mapping cannot leak into an unrelated session days later.
const MAX_SESSION_AGE_MS = 6 * 60 * 60 * 1000;

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

/**
 * Returns true if the session's startedAt timestamp is missing, invalid,
 * or older than MAX_SESSION_AGE_MS.
 */
function _isExpired(session) {
  try {
    if (!session || typeof session.startedAt !== "string") return true;
    const startedMs = new Date(session.startedAt).getTime();
    if (isNaN(startedMs)) return true;
    return Date.now() - startedMs > MAX_SESSION_AGE_MS;
  } catch {
    return true;
  }
}

/**
 * Reads and parses the session from localStorage.
 * Returns the parsed object, or null if absent, malformed, or expired.
 * Expired sessions are proactively cleared from storage so subsequent
 * reads/writes never have to repeat the same expiry check.
 */
function _readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic shape validation — must have the two mandatory string fields
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.examId === "string" &&
      typeof parsed.subjectId === "string"
    ) {
      if (_isExpired(parsed)) {
        // Self-heal: silently drop the stale mapping so it can never
        // resurface for a later, unrelated Focus session.
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        return null;
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Writes a session object to localStorage.
 * Returns true on success, false on failure.
 */
function _writeRaw(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * startFocusSyllabusSession
 *
 * Persists a new syllabus context for the upcoming (or just-started)
 * Focus session. Any previous session is silently overwritten.
 *
 * @param {object} payload
 *   {
 *     examId:       string          REQUIRED
 *     subjectId:    string          REQUIRED
 *     subjectLabel: string          REQUIRED
 *     topicId:      string | null   optional — specific topic
 *     topicLabel:   string | null   optional — human-readable topic name
 *     startedAt:    string          optional — ISO timestamp;
 *                                   defaults to now if absent or invalid
 *   }
 *
 * @returns {object | null}  The stored session object, or null if storage failed.
 */
export function startFocusSyllabusSession(payload) {
  try {
    if (!payload || typeof payload !== "object") return null;

    const { examId, subjectId, subjectLabel, topicId, topicLabel, startedAt } =
      payload;

    // Mandatory fields — silently abort if missing
    if (
      typeof examId !== "string" ||
      !examId.trim() ||
      typeof subjectId !== "string" ||
      !subjectId.trim() ||
      typeof subjectLabel !== "string" ||
      !subjectLabel.trim()
    ) {
      return null;
    }

    // Validate / default the timestamp
    let resolvedStartedAt;
    try {
      resolvedStartedAt =
        startedAt && !isNaN(new Date(startedAt).getTime())
          ? startedAt
          : new Date().toISOString();
    } catch {
      resolvedStartedAt = new Date().toISOString();
    }

    const session = {
      examId: examId.trim(),
      subjectId: subjectId.trim(),
      subjectLabel: subjectLabel.trim(),
      topicId:
        typeof topicId === "string" && topicId.trim() ? topicId.trim() : null,
      topicLabel:
        typeof topicLabel === "string" && topicLabel.trim()
          ? topicLabel.trim()
          : null,
      startedAt: resolvedStartedAt,
    };

    const ok = _writeRaw(session);
    return ok ? session : null;
  } catch {
    return null;
  }
}

/**
 * getCurrentFocusSyllabusSession
 *
 * Returns the currently stored syllabus session, or null if none exists,
 * the stored value is malformed, or it has expired (Phase 35 Batch G).
 *
 * @returns {object | null}
 *   {
 *     examId, subjectId, subjectLabel,
 *     topicId, topicLabel, startedAt
 *   }
 */
export function getCurrentFocusSyllabusSession() {
  return _readRaw();
}

/**
 * clearFocusSyllabusSession
 *
 * Removes the current session from localStorage.
 * Safe to call even if no session exists.
 *
 * @returns {boolean}  true if removal succeeded (or key was already absent),
 *                     false if localStorage threw.
 */
export function clearFocusSyllabusSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * hasActiveFocusSyllabusSession
 *
 * Returns true if a valid, non-expired syllabus session is currently
 * stored, false otherwise.
 *
 * @returns {boolean}
 */
export function hasActiveFocusSyllabusSession() {
  return _readRaw() !== null;
}

/**
 * updateFocusSyllabusSession
 *
 * Merges partial updates into the existing session without replacing it.
 * Useful for adding a topicId after the session has already started.
 * No-op (returns null) if no session currently exists (including if the
 * existing session has expired — Phase 35 Batch G).
 *
 * @param {object} updates  Partial session fields to merge
 * @returns {object | null} The updated session, or null on failure / no session.
 */
export function updateFocusSyllabusSession(updates) {
  try {
    const current = _readRaw();
    if (!current) return null;
    if (!updates || typeof updates !== "object") return current;

    const merged = { ...current };

    // Only allow updating safe optional fields — never overwrite mandatory keys
    // with empty/invalid values
    if (typeof updates.topicId === "string" && updates.topicId.trim()) {
      merged.topicId = updates.topicId.trim();
    } else if (updates.topicId === null) {
      merged.topicId = null;
    }

    if (typeof updates.topicLabel === "string" && updates.topicLabel.trim()) {
      merged.topicLabel = updates.topicLabel.trim();
    } else if (updates.topicLabel === null) {
      merged.topicLabel = null;
    }

    const ok = _writeRaw(merged);
    return ok ? merged : null;
  } catch {
    return null;
  }
}

export default {
  startFocusSyllabusSession,
  getCurrentFocusSyllabusSession,
  clearFocusSyllabusSession,
  hasActiveFocusSyllabusSession,
  updateFocusSyllabusSession,
};
