/**
 * useSyllabusSyncListener.js
 *
 * Phase 35 Batch E — reusable listener for the global
 * "studymind:syllabus-updated" event emitted by PostSessionTopicModal
 * (Phase 35 Batch D).
 *
 * Any component that displays syllabus-derived data can call this hook
 * with a refresh callback. The callback is invoked with the event's
 * `detail` payload whenever the event fires, so callers can optionally
 * filter (e.g. only refresh if detail.examId matches their own exam).
 *
 * GUARANTEES:
 *   - Exactly one listener is attached per mounted component instance.
 *   - Listener is removed on unmount (no memory leaks).
 *   - The latest callback is always used without re-attaching the
 *     listener on every render (via ref), so passing an inline
 *     function or a useCallback with changing deps is safe and will
 *     never create duplicate listeners or stale closures.
 *
 * CONSTRAINTS:
 *   - Does NOT rename or alter the event name/payload.
 *   - Does NOT dispatch the event — consumption only.
 *   - Does NOT introduce any new global state.
 */

import { useEffect, useRef } from "react";

export const SYLLABUS_UPDATED_EVENT = "studymind:syllabus-updated";

/**
 * @param {(detail: object) => void} onSyllabusUpdated
 *   Called with the event's `detail` payload whenever
 *   "studymind:syllabus-updated" fires. Receives:
 *   { examId, subjectId, completedTopics, xpEarned, timestamp }
 */
export function useSyllabusSyncListener(onSyllabusUpdated) {
  const callbackRef = useRef(onSyllabusUpdated);

  // Always keep the latest callback available without re-binding the
  // window listener (avoids duplicate listeners / stale closures).
  useEffect(() => {
    callbackRef.current = onSyllabusUpdated;
  }, [onSyllabusUpdated]);

  useEffect(() => {
    const handler = (event) => {
      try {
        callbackRef.current?.(event?.detail ?? null);
      } catch {
        // Never let a listener error break other listeners / the app
      }
    };

    window.addEventListener(SYLLABUS_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(SYLLABUS_UPDATED_EVENT, handler);
    };
  }, []);
}

export default useSyllabusSyncListener;
