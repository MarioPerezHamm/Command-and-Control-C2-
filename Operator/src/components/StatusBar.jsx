import { useState, useEffect } from 'react'

export default function StatusBar({ agents, selected }) {
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = clock.toLocaleTimeString('en-GB')
  const dateStr = clock.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-panel shrink-0">
      {/* Left: branding */}
      <div className="flex items-center gap-3">
        <span className="text-terminal-green text-glow font-bold tracking-widest text-[13px]">
          C2::OPERATOR
        </span>
        <span className="text-terminal-border-bright text-[10px]">/</span>
        <span className="text-terminal-gray-mid text-[10px] uppercase tracking-wider">
          Remote Infrastructure Control Panel
        </span>
      </div>

      {/* Center: selected node */}
      <div className="flex items-center gap-2">
        {selected ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-terminal-green shadow-glow-sm animate-pulse" />
            <span className="text-[10px] text-terminal-green">
              ACTIVE NODE: <span className="font-bold">#{selected.id}</span>
              <span className="text-terminal-green-dim"> — {selected.addr?.split(':')[0]} — {selected.os}</span>
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-terminal-gray-mid" />
            <span className="text-[10px] text-terminal-gray-mid">NO NODE SELECTED</span>
          </>
        )}
      </div>

      {/* Right: stats + clock */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-terminal-gray-mid uppercase">NODES</span>
          <span className="text-[11px] font-bold text-terminal-green text-glow-sm">{agents.length}</span>
        </div>
        <span className="text-terminal-border text-[10px]">|</span>
        <div className="text-[10px] text-terminal-gray-mid font-mono">
          {dateStr} <span className="text-terminal-green">{timeStr}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-terminal-green shadow-glow-sm" />
          <span className="text-[9px] text-terminal-green uppercase tracking-wider">ONLINE</span>
        </div>
      </div>
    </header>
  )
}
