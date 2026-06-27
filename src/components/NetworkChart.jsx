import { useEffect, useRef, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function generatePoint(prev) {
  const rx = prev ? Math.max(0, prev.rx + (Math.random() - 0.48) * 12) : Math.random() * 40
  const tx = prev ? Math.max(0, prev.tx + (Math.random() - 0.52) * 8)  : Math.random() * 20
  return { rx: parseFloat(rx.toFixed(1)), tx: parseFloat(tx.toFixed(1)) }
}

function buildInitial() {
  const pts = []
  let prev = null
  for (let i = 14; i >= 0; i--) {
    const t = new Date(Date.now() - i * 2000)
    const p = generatePoint(prev)
    prev = p
    pts.push({ time: t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), ...p })
  }
  return pts
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-hmi-surface border border-hmi-border rounded-lg px-3 py-2 text-xs font-mono">
      <p className="text-hmi-cyan">RX: {payload[0]?.value} KB/s</p>
      <p className="text-hmi-blue">TX: {payload[1]?.value} KB/s</p>
    </div>
  )
}

export default function NetworkChart({ agentCount }) {
  const [data, setData] = useState(buildInitial)

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1]
        const next = generatePoint(last)
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        return [...prev.slice(-29), { time, ...next }]
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const last = data[data.length - 1] ?? { rx: 0, tx: 0 }

  return (
    <div className="hmi-card flex flex-col h-full">
      <div className="hmi-card-title flex items-center justify-between">
        <span>Network Activity</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-hmi-cyan inline-block" />
            <span className="text-hmi-text-muted normal-case font-normal tracking-normal">RX {last.rx} KB/s</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-hmi-blue inline-block" />
            <span className="text-hmi-text-muted normal-case font-normal tracking-normal">TX {last.tx} KB/s</span>
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252a38" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#4b5568', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: '#4b5568', fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="rx" stroke="#06b6d4" strokeWidth={1.5} fill="url(#colorRx)" dot={false} />
            <Area type="monotone" dataKey="tx" stroke="#0ea5e9" strokeWidth={1.5} fill="url(#colorTx)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
