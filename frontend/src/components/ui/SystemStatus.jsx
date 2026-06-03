import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Wifi, Flame, Target, Zap, CheckCircle2 } from 'lucide-react'
import { aggregateAll } from '../../utils/globalStats.js'

function StatusDot({ active = true, color = '#00FFC8' }) {
  return (
    <div className="relative w-2 h-2 shrink-0">
      {active && (
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="absolute inset-0 rounded-full"
          style={{ background: color }}
        />
      )}
      <div className="relative w-2 h-2 rounded-full" style={{ background: active ? color : '#444' }} />
    </div>
  )
}

export default function SystemStatus() {
  const stats = useMemo(() => aggregateAll(), [])

  const missionPct = stats.missions.total > 0
    ? Math.round((stats.missions.done / stats.missions.total) * 100) : 0

  const ITEMS = [
    {
      icon:  Brain,
      label: 'AI Companion',
      val:   'Online',
      color: '#00FFC8',
      active: true,
    },
    {
      icon:  Flame,
      label: 'Streak Health',
      val:   stats.streak >= 3 ? 'Strong' : stats.streak >= 1 ? 'Active' : 'At Risk',
      color: stats.streak >= 3 ? '#FF6B2B' : stats.streak >= 1 ? '#FFB347' : '#FF3C3C',
      active: stats.streak >= 1,
    },
    {
      icon:  Target,
      label: 'Productivity',
      val:   `${stats.prodScore}%`,
      color: stats.prodScore >= 70 ? '#00FFC8' : stats.prodScore >= 40 ? '#FFB347' : '#FF6B9D',
      active: stats.prodScore > 0,
    },
    {
      icon:  Zap,
      label: 'Missions Today',
      val:   `${stats.missions.done}/${stats.missions.total}`,
      color: missionPct === 100 ? '#00FFC8' : '#7C6FFF',
      active: stats.missions.total > 0,
    },
  ]

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-4 space-y-3"
      style={{ background: '#0A0A14' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Wifi size={12} className="text-[#00FFC8]" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">System Status</span>
        <div className="ml-auto flex items-center gap-1.5">
          <StatusDot active color="#00FFC8" />
          <span className="text-[9px] text-[#00FFC8]/60">All Systems Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.05]"
              style={{ background: `${item.color}06` }}
            >
              <StatusDot active={item.active} color={item.color} />
              <div className="min-w-0">
                <p className="text-[9px] text-white/28 truncate">{item.label}</p>
                <p className="text-[12px] font-black leading-tight" style={{ color: item.color }}>
                  {item.val}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Level progress mini bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/28">Level {stats.level} progress</span>
          <span style={{ color: stats.rank.color }}>{stats.rank.emoji} {stats.rank.label}</span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.levelPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg,${stats.rank.color}70,${stats.rank.color})`,
              boxShadow: `0 0 8px ${stats.rank.color}50`,
            }}
          />
        </div>
        <p className="text-[9px] text-white/18 text-right">
          {stats.xpToNextLevel.toLocaleString()} XP to Level {stats.level + 1}
        </p>
      </div>
    </div>
  )
}