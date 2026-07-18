/**
 * useSyllabusSyncListener.js
 *
 * Phase 35 Batch E — reusable listener for the global
 * "studymind:syllabus-updated" event emitted by PostSessionTopicModal
 * (Phase 35 Batch D).
 *
 * Phase 35 Batch G — added cross-tab recovery via the native `storage`
 * event, so syllabus-derived UI in OTHER open tabs also refreshes after
 * a topic completion, without requiring a manual page refresh.
 *
 * Any component that displays syllabus-derived data can call this hook
 * with a refresh callback. The callback is invoked with the relevant
 * event's `detail` payload whenever the custom event fires (same tab),
 * or with `null` whenever a cross-tab localStorage change to syllabus
 * data is detected (other tabs). Every current consumer already treats
 * a null/missing detail as "refresh unconditionally", so no consumer
 * needs to change to benefit from cross-tab recovery.
 *
 * GUARANTEES:
 *   - Exactly one pair of listeners (custom event + storage event) is
 *     attached per mounted component instance.
 *   - Listeners are removed on unmount (no memory leaks).
 *   - The latest callback is always used without re-attaching listeners
 *     on every render (via ref), so passing an inline function or a
 *     useCallback with changing deps is safe and will never create
 *     duplicate listeners or stale closures.
 *
 * CONSTRAINTS:
 *   - Does NOT rename or alter the event name/payload.
 *   - Does NOT dispatch the event — consumption only.
 *   - Does NOT introduce any new global state.
 */

import { useEffect, useRef } from "react";
import { NAMESPACES } from "../lib/storageAdapter.js";

export const SYLLABUS_UPDATED_EVENT = "studymind:syllabus-updated";

// StorageAdapter prefixes every namespace key with "studymind_" (see
// storageAdapter.js — `key(namespace) => \`${PREFIX}${namespace}\``).
// Reconstructed here (rather than duplicating StorageAdapter's CRUD
// logic) purely to identify which native `storage` events correspond to
// syllabus data changes made in OTHER browser tabs. The native `storage`
// event never fires in the tab that made the change, so this is purely a
// cross-tab-recovery mechanism and does not overlap with the custom
// "studymind:syllabus-updated" event, which only ever fires same-tab.
const SYLLABUS_STORAGE_KEY = `studymind_${NAMESPACES.syllabus}`;

/**
 * @param {(detail: object|null) => void} onSyllabusUpdated
 *   Called whenever syllabus data changes:
 *   - Same tab: with the custom event's `detail` payload —
 *     { examId, subjectId, completedTopics, xpEarned, timestamp }
 *   - Other tabs (Phase 35 Batch G): with `null`, signalling
 *     "syllabus data changed elsewhere — refresh unconditionally".
 */
export function useSyllabusSyncListener(onSyllabusUpdated) {
  const callbackRef = useRef(onSyllabusUpdated);

  // Always keep the latest callback available without re-binding the
  // window listeners (avoids duplicate listeners / stale closures).
  useEffect(() => {
    callbackRef.current = onSyllabusUpdated;
  }, [onSyllabusUpdated]);

  useEffect(() => {
    const handleCustomEvent = (event) => {
      try {
        callbackRef.current?.(event?.detail ?? null);
      } catch {
        // Never let a listener error break other listeners / the app
      }
    };

    // Phase 35 Batch G: cross-tab recovery.
    // Fires in every OTHER tab sharing this origin whenever localStorage
    // changes — scoped here to only the syllabus namespace key so
    // unrelated storage writes (focus history, planner, etc.) are ignored.
    const handleStorageEvent = (event) => {
      if (event.key !== SYLLABUS_STORAGE_KEY) return;
      try {
        callbackRef.current?.(null);
      } catch {
        // Never let a listener error break other listeners / the app
      }
    };

    window.addEventListener(SYLLABUS_UPDATED_EVENT, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener(SYLLABUS_UPDATED_EVENT, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);
}

export default useSyllabusSyncListener;
