import { useState, useEffect } from 'react'

function GaugeRing({ value, max, color, size = 80 }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const dash = circ * (1 - pct)

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="rotate-[-90deg]">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#252a38" strokeWidth="6" />
      <circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  )
}

function StatCard({ label, value, unit, color, colorClass, bgClass, max }) {
  return (
    <div className={`hmi-card p-3 flex items-center gap-3 ${bgClass}`}>
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <GaugeRing value={value} max={max} color={color} size={68} />
        <div className="absolute flex flex-col items-center">
          <span className={`text-base font-bold font-mono leading-none ${colorClass}`}>{value}</span>
          <span className="text-[9px] text-hmi-text-muted">{unit}</span>
        </div>
      </div>
      <div>
        <p className="text-hmi-text-muted text-[10px] uppercase tracking-widest">{label}</p>
        <p className={`text-lg font-bold font-mono leading-none mt-0.5 ${colorClass}`}>
          {Math.round((value / max) * 100)}<span className="text-xs font-normal text-hmi-text-muted">%</span>
        </p>
      </div>
    </div>
  )
}

function CommandsCard({ cmdCount }) {
  return (
    <div className="hmi-card p-3">
      <p className="text-hmi-text-muted text-[10px] uppercase tracking-widest mb-2">Commands Sent</p>
      <p className="text-2xl font-bold font-mono text-hmi-blue leading-none">{cmdCount}</p>
      <p className="text-[10px] text-hmi-text-muted mt-1">this session</p>
    </div>
  )
}

function UptimeCard({ agents }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const s = String(elapsed % 60).padStart(2, '0')
  return (
    <div className="hmi-card p-3">
      <p className="text-hmi-text-muted text-[10px] uppercase tracking-widest mb-2">Session Uptime</p>
      <p className="text-2xl font-bold font-mono text-hmi-amber leading-none tracking-wider">
        {h}:{m}:{s}
      </p>
      <p className="text-[10px] text-hmi-text-muted mt-1">{agents} node{agents !== 1 ? 's' : ''} connected</p>
    </div>
  )
}

export default function MetricCards({ agents, cmdCount }) {
  const [cpu, setCpu]     = useState(42)
  const [mem, setMem]     = useState(61)

  useEffect(() => {
    const id = setInterval(() => {
      setCpu(v => Math.min(98, Math.max(5, v + (Math.random() - 0.5) * 8)))
      setMem(v => Math.min(95, Math.max(20, v + (Math.random() - 0.5) * 4)))
    }, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      <StatCard
        label="CPU Load" value={Math.round(cpu)} unit="%" max={100}
        color="#0ea5e9" colorClass="text-hmi-blue" bgClass=""
      />
      <StatCard
        label="Memory"   value={Math.round(mem)} unit="%" max={100}
        color="#06b6d4" colorClass="text-hmi-cyan" bgClass=""
      />
      <CommandsCard cmdCount={cmdCount} />
      <UptimeCard agents={agents} />
    </div>
  )
}
