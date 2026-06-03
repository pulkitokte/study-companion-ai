import { useState, useCallback, useEffect, useRef } from 'react'
import { aggregateAll } from '../utils/globalStats.js'

// Singleton event bus — any module can call notifyStatsUpdate()
// to trigger re-renders in all useGlobalStats consumers
const listeners = new Set()

export function notifyStatsUpdate() {
  listeners.forEach(fn => fn())
}

export function useGlobalStats() {
  const [stats, setStats] = useState(() => aggregateAll())
  const mountedRef = useRef(true)

  const refresh = useCallback(() => {
    if (mountedRef.current) setStats(aggregateAll())
  }, [])

  useEffect(() => {
    listeners.add(refresh)
    return () => {
      mountedRef.current = false
      listeners.delete(refresh)
    }
  }, [refresh])

  return { stats, refresh }
}