import { useEffect, useRef } from 'react'

const OS_ICONS = {
  windows: 'WIN',
  linux:   'LNX',
  darwin:  'MAC',
  android: 'AND',
}

function osTag(osStr) {
  const lower = (osStr || '').toLowerCase()
  if (lower.includes('windows')) return { label: OS_ICONS.windows, color: 'text-blue-400' }
  if (lower.includes('darwin') || lower.includes('mac')) return { label: OS_ICONS.darwin, color: 'text-terminal-amber' }
  if (lower.includes('android')) return { label: OS_ICONS.android, color: 'text-green-400' }
  return { label: OS_ICONS.linux, color: 'text-terminal-green' }
}

function PulsingDot() {
  return (
    <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
      <span className="absolute inline-flex w-full h-full rounded-full bg-terminal-green opacity-60 animate-ping" />
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-terminal-green" />
    </span>
  )
}

export default function NodeList({ agents, selected, onSelect, loading, lastRefresh }) {
  const listRef = useRef(null)

  // Scroll to newly connected agent
  useEffect(() => {
    if (listRef.current && agents.length > 0) {
      const lastItem = listRef.current.querySelector('[data-last="true"]')
      if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [agents.length])

  return (
    <aside className="flex flex-col w-72 shrink-0 border-r border-terminal-border bg-terminal-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border">
        <div className="flex items-center gap-2">
          <span className="text-terminal-gray-light text-[10px] uppercase tracking-widest">Nodes</span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-terminal-green-muted text-terminal-green border border-terminal-border-bright shadow-glow-sm">
            {agents.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {loading && (
            <span className="text-terminal-gray-light text-[9px] animate-pulse">SYNC</span>
          )}
          <span className="text-terminal-gray-mid text-[9px]">{lastRefresh}</span>
        </div>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 px-4 py-1.5 border-b border-terminal-border text-[9px] text-terminal-gray-mid uppercase tracking-wider">
        <span>ID</span>
        <span>NODE</span>
        <span>TIME</span>
      </div>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-terminal-gray-mid">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            <span className="text-[10px]">NO NODES CONNECTED</span>
          </div>
        ) : (
          agents.map((agent, idx) => {
            const isSelected = selected?.id === agent.id
            const { label: osLabel, color: osColor } = osTag(agent.os)
            const isLast = idx === agents.length - 1

            return (
              <button
                key={agent.id}
                data-last={isLast ? 'true' : undefined}
                onClick={() => onSelect(agent)}
                className={[
                  'w-full text-left px-4 py-2.5 transition-all duration-150',
                  'border-b border-terminal-border',
                  'hover:bg-terminal-green-faint',
                  isSelected
                    ? 'bg-terminal-green-faint border-l-2 border-l-terminal-green shadow-glow-sm'
                    : 'border-l-2 border-l-transparent',
                  'animate-fadeIn',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <PulsingDot />
                  <span className="text-terminal-gray-light text-[10px] w-5 shrink-0">#{agent.id}</span>
                  <span className={`text-[10px] font-bold px-1 rounded ${osColor} bg-black border border-current border-opacity-30`}>
                    {osLabel}
                  </span>
                  <span className={`text-[10px] font-mono truncate flex-1 ${isSelected ? 'text-terminal-green text-glow-sm' : 'text-terminal-green-dim'}`}>
                    {agent.addr?.split(':')[0] ?? '—'}
                  </span>
                  <span className="text-[9px] text-terminal-gray-mid shrink-0">{agent.connected_at}</span>
                </div>
                <div className="ml-7 mt-0.5 text-[10px] text-terminal-gray-mid truncate">
                  {agent.os || 'unknown'}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Footer status */}
      <div className="px-4 py-2 border-t border-terminal-border flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-terminal-green shadow-glow-sm" />
        <span className="text-[9px] text-terminal-gray-mid uppercase tracking-wider">
          C2 LINK ACTIVE — AUTO-REFRESH 5s
        </span>
      </div>
    </aside>
  )
}
