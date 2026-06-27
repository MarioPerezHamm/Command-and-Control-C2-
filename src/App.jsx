import { useState } from 'react'
import './index.css'
import { useAgents } from './hooks/useAgents'
import TopBar          from './components/TopBar'
import Sidebar         from './components/Sidebar'
import NodePanel       from './components/NodePanel'
import NetworkChart    from './components/NetworkChart'
import MetricCards     from './components/MetricCards'
import CommandConsole  from './components/CommandConsole'

export default function App() {
  const { agents, loading, error, lastRefresh, refetch } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [cmdCount, setCmdCount]           = useState(0)

  const validSelected = agents.find(a => a.id === selectedAgent?.id) ?? null

  return (
    <div className="flex flex-col h-screen w-screen bg-hmi-bg text-hmi-text overflow-hidden">

      {/* Top bar */}
      <TopBar agents={agents} selected={validSelected} error={error} />

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Sidebar */}
        <Sidebar agents={agents} error={error} onRefresh={refetch} />

        {/* Main grid */}
        <main className="flex-1 min-w-0 p-3 grid gap-3 overflow-hidden"
          style={{ gridTemplateRows: '1fr 1fr', gridTemplateColumns: '220px 1fr 1fr' }}>

          {/* Row 1 Col 1 — Node list */}
          <div style={{ gridRow: '1 / 3' }}>
            <NodePanel
              agents={agents}
              selected={validSelected}
              onSelect={setSelectedAgent}
              loading={loading}
              lastRefresh={lastRefresh}
            />
          </div>

          {/* Row 1 Col 2 — Network chart */}
          <div style={{ gridColumn: '2', gridRow: '1' }}>
            <NetworkChart agentCount={agents.length} />
          </div>

          {/* Row 1 Col 3 — Metric cards */}
          <div style={{ gridColumn: '3', gridRow: '1' }}>
            <MetricCards agents={agents.length} cmdCount={cmdCount} />
          </div>

          {/* Row 2 Col 2-3 — Command console */}
          <div style={{ gridColumn: '2 / 4', gridRow: '2' }}>
            <CommandConsole
              selectedAgent={validSelected}
              agents={agents}
              onCmdSent={() => setCmdCount(c => c + 1)}
            />
          </div>

        </main>
      </div>

      {/* Bottom status bar */}
      <footer className="h-6 flex-shrink-0 flex items-center px-4 gap-4 border-t border-hmi-border bg-hmi-surface">
        <span className="flex items-center gap-1.5">
          <span className={`led ${error ? 'led-red' : 'led-green'} w-2 h-2`} />
          <span className={`text-[10px] ${error ? 'text-hmi-red' : 'text-hmi-green'}`}>
            {error ? `Server error: ${error}` : 'Connected to C2 server'}
          </span>
        </span>
        <span className="text-hmi-muted text-[10px]">|</span>
        <span className="text-hmi-text-muted text-[10px]">Auto-refresh 5s</span>
        <div className="flex-1" />
        <span className="text-hmi-text-muted text-[10px]">C2 Operator Panel &bull; v2.0.0</span>
      </footer>

    </div>
  )
}

