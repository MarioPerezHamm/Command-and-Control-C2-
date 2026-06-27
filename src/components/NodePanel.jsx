const OS_ICON = {
  windows: 'W',
  linux:   'L',
  darwin:  'M',
  android: 'A',
}

const OS_COLOR = {
  windows: 'text-hmi-blue',
  linux:   'text-hmi-amber',
  darwin:  'text-hmi-text-dim',
  android: 'text-hmi-green',
}

function NodeRow({ agent, selected, onSelect }) {
  const os = (agent.os ?? '').toLowerCase()
  const osKey = Object.keys(OS_ICON).find(k => os.includes(k)) ?? 'linux'
  const label = OS_ICON[osKey]
  const color = OS_COLOR[osKey]

  return (
    <button
      onClick={() => onSelect(agent)}
      className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 rounded-lg transition-colors
        ${selected ? 'bg-hmi-blue-faint border border-hmi-blue border-opacity-40' : 'hover:bg-hmi-card-hover border border-transparent'}`}
    >
      {/* LED status */}
      <span className="led led-green pulse-ring relative flex-shrink-0" />

      {/* OS badge */}
      <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold bg-hmi-surface flex-shrink-0 ${color}`}>
        {label}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-hmi-text text-xs font-medium truncate">Agent-{agent.id}</span>
          <span className="text-hmi-green text-[9px] font-mono flex-shrink-0">ONLINE</span>
        </div>
        <div className="text-hmi-text-muted text-[10px] font-mono truncate">{agent.ip ?? '—'}</div>
      </div>
    </button>
  )
}

export default function NodePanel({ agents, selected, onSelect, loading, lastRefresh }) {
  return (
    <div className="hmi-card flex flex-col h-full">
      <div className="hmi-card-title flex items-center justify-between">
        <span>Connected Nodes</span>
        <span className="text-hmi-green text-[10px] font-mono normal-case font-normal tracking-normal">
          {agents.length} online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && agents.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-hmi-text-muted text-xs">
            <span className="animate-pulse">Polling server...</span>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="led led-off" />
            <span className="text-hmi-text-muted text-xs text-center">No nodes connected</span>
          </div>
        ) : (
          agents.map(a => (
            <NodeRow
              key={a.id}
              agent={a}
              selected={selected?.id === a.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="border-t border-hmi-border px-3 py-2 flex items-center justify-between">
        <span className="text-hmi-text-muted text-[10px]">Last sync</span>
        <span className="text-hmi-text-dim text-[10px] font-mono">{lastRefresh}</span>
      </div>
    </div>
  )
}
