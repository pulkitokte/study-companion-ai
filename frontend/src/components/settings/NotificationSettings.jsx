import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Save } from 'lucide-react'
import { useToast } from '../ui/Toast.jsx'

const NOTIF_OPTS = [
  { id: 'xp',          label: 'XP Earned',           sub: 'Show toast when XP is earned'          },
  { id: 'streak',      label: 'Streak Milestones',   sub: 'Alerts for streak achievements'        },
  { id: 'achievement', label: 'Achievements',         sub: 'Popup when achievements unlock'        },
  { id: 'mission',     label: 'Mission Completions', sub: 'Daily mission completion alerts'        },
  { id: 'focus',       label: 'Focus Session Alerts', sub: 'Session start/end notifications'       },
]

function getNotifPrefs() {
  try {
    const raw = localStorage.getItem('studymind_notif_prefs')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { xp: true, streak: true, achievement: true, mission: true, focus: true }
}

export default function NotificationSettings() {
  const { show }   = useToast()
  const [prefs, setPrefs] = useState(getNotifPrefs)

  const toggle = (id) => setPrefs(p => ({ ...p, [id]: !p[id] }))

  const save = () => {
    localStorage.setItem('studymind_notif_prefs', JSON.stringify(prefs))
    show({ type: 'info', title: 'Notification settings saved', message: 'Changes applied', duration: 2500 })
  }

  const test = () => {
    show({ type: 'xp',          title: '+150 XP earned',              message: 'Quiz completed',          duration: 2000 })
    setTimeout(() => show({ type: 'streak',      title: '7-day streak! 🔥',             message: 'Bonus XP included',       duration: 2000 }), 600)
    setTimeout(() => show({ type: 'achievement', title: 'Achievement Unlocked!',        message: 'consistency · 3-day run', duration: 2000 }), 1200)
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#0A0A14' }}>
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3">
        <Bell size={15} className="text-[#FFB347]" />
        <h3 className="text-[14px] font-bold text-white">Notifications</h3>
      </div>

      <div className="p-6 space-y-4">
        {NOTIF_OPTS.map((opt, i) => (
          <motion.div key={opt.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-white/75">{opt.label}</p>
              <p className="text-[11px] text-white/30">{opt.sub}</p>
            </div>
            <button onClick={() => toggle(opt.id)}>
              <div
                className="w-10 h-5 rounded-full relative transition-all duration-300"
                style={{ background: prefs[opt.id] ? '#00FFC8' : 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  animate={{ x: prefs[opt.id] ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
                />
              </div>
            </button>
          </motion.div>
        ))}

        <div className="flex gap-3 pt-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={test}
            className="px-4 py-2.5 rounded-xl border border-white/[0.09] text-[12px] font-bold text-white/45 hover:text-white/70 hover:bg-white/[0.04] transition-all">
            Test Notifications
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={save}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[12px]"
            style={{ background: 'linear-gradient(135deg,#FFB347,#FF6B2B)', color: '#000' }}>
            <Save size={13} /> Save
          </motion.button>
        </div>
      </div>
    </div>
  )
}