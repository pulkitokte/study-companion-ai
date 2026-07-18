/**
 * useRevisionQueue.js
 *
 * Phase 36 Batch A — Smart Revision Queue Integration.
 *
 * Single, reusable source of revision-queue loading + synchronization.
 * Consolidates the three previously-duplicated loader implementations
 * that existed independently inside RevisionView, SyllabusTracker, and
 * Dashboard (each calling syllabusService.getTodayRevisionQueue() /
 * getRevisionStats() and wiring its own useSyllabusSyncListener).
 *
 * This hook does NOT change any business logic, scoring formulas, or
 * data shapes — it wraps the exact same syllabusService calls those
 * components already made, and reuses the exact same Phase 35 Batch E/F/G
 * synchronization primitive (useSyllabusSyncListener), which already
 * handles same-tab custom-event sync and cross-tab localStorage sync.
 *
 * CONSTRAINTS PRESERVED FROM ORIGINAL CONSUMERS:
 *   - Reload is skipped when the sync event's detail.examId is present
 *     and does not match the requested examId (exactly as RevisionView's
 *     Batch E wiring already did) — avoids unnecessary re-renders for
 *     updates concerning a different exam.
 *   - Cross-tab storage events (detail === null) always trigger a reload,
 *     since there is no way to know which exam changed in another tab.
 *
 * @param {string} examId  active exam id ('upsc' | 'ssc_cgl' | 'banking_po')
 * @returns {{
 *   queue:   Array,    syllabusService.getTodayRevisionQueue(examId) result
 *   stats:   object,   syllabusService.getRevisionStats(examId) result
 *   loading: boolean,  true only during the very first load
 *   refresh: () => void  manually re-run the loader (e.g. on a Refresh button)
 * }}
 */

import { useState, useEffect, useCallback } from "react";
import syllabusService from "../services/syllabusService.js";
import { useSyllabusSyncListener } from "./useSyllabusSyncListener.js";

const EMPTY_STATS = {
  totalScheduled: 0,
  dueToday: 0,
  overdueCount: 0,
  graduatedCount: 0,
  nextDueDate: null,
};

export function useRevisionQueue(examId) {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  const loadRevisionData = useCallback(() => {
    try {
      const todayQueue = syllabusService.getTodayRevisionQueue(examId);
      const revisionStats = syllabusService.getRevisionStats(examId);
      setQueue(Array.isArray(todayQueue) ? todayQueue : []);
      setStats(revisionStats ?? EMPTY_STATS);
    } catch {
      setQueue([]);
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    setLoading(true);
    loadRevisionData();
  }, [loadRevisionData]);

  // Reuse the existing Phase 35 sync architecture (same-tab custom event +
  // cross-tab storage event) — no new listener mechanism introduced.
  useSyllabusSyncListener(
    useCallback(
      (detail) => {
        if (detail && detail.examId && detail.examId !== examId) {
          return; // update concerns a different exam — skip reload
        }
        loadRevisionData();
      },
      [examId, loadRevisionData],
    ),
  );

  return { queue, stats, loading, refresh: loadRevisionData };
}

export default useRevisionQueue;
