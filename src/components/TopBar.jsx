import { useState, useEffect } from 'react'

export default function TopBar({ agents, selected, error }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = time.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <header className="h-11 flex-shrink-0 flex items-center px-4 gap-4 border-b border-hmi-border bg-hmi-surface">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-4 bg-hmi-blue rounded-full" />
        <h1 className="text-hmi-text text-sm font-semibold tracking-tight">C2 Control Panel</h1>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-hmi-border" />

      {/* Active node */}
      <div className="flex items-center gap-1.5">
        <span className="text-hmi-text-muted text-xs">Active:</span>
        {selected ? (
          <span className="text-hmi-cyan text-xs font-mono">Agent-{selected.id} &bull; {selected.ip}</span>
        ) : (
          <span className="text-hmi-text-muted text-xs italic">None selected</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Server status */}
      <div className="flex items-center gap-1.5">
        <span className={`led ${error ? 'led-red' : 'led-green'}`} />
        <span className={`text-xs ${error ? 'text-hmi-red' : 'text-hmi-green'}`}>
          {error ? 'Server unreachable' : `${agents.length} node${agents.length !== 1 ? 's' : ''} online`}
        </span>
      </div>

      <div className="h-5 w-px bg-hmi-border" />

      {/* Clock */}
      <div className="text-right">
        <p className="text-hmi-text text-xs font-mono font-semibold">{timeStr}</p>
        <p className="text-hmi-text-muted text-[10px]">{dateStr}</p>
      </div>
    </header>
  )
}
