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
 */

const STORAGE_KEY = "studymind_focus_syllabus_session";

// ─── PRIVATE HELPERS ─────────────────────────────────────────────────────────

/**
 * Reads and parses the session from localStorage.
 * Returns the parsed object, or null if absent or malformed.
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
 * Returns the currently stored syllabus session, or null if none exists
 * or the stored value is malformed.
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
 * Returns true if a valid syllabus session is currently stored,
 * false otherwise.
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
 * No-op (returns null) if no session currently exists.
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
