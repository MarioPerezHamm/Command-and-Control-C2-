import { useState } from 'react'
import './index.css'
import { useAgents } from './hooks/useAgents'
import StatusBar from './components/StatusBar'
import NodeList from './components/NodeList'
import Console from './components/Console'

function ConnectionError({ error }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-terminal-red bg-opacity-10 border-b border-terminal-red border-opacity-30 shrink-0">
      <span className="text-terminal-red text-[10px] font-bold">ERR</span>
      <span className="text-terminal-red text-[10px]">
        Cannot reach C2 server at localhost:8000 — {error}
      </span>
      <span className="ml-auto text-terminal-red text-[10px] opacity-60">Retrying in 5s...</span>
    </div>
  )
}

export default function App() {
  const { agents, loading, error, lastRefresh } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState(null)

  // If selected agent disconnects, deselect it
  const validSelected = agents.find(a => a.id === selectedAgent?.id) ?? null

  return (
    <div className="flex flex-col h-screen w-screen bg-terminal-bg text-terminal-green font-mono overflow-hidden">
      {/* CRT overlay effect */}
      <div className="crt-overlay" aria-hidden="true" />

      {/* Top status bar */}
      <StatusBar agents={agents} selected={validSelected} />

      {/* Connection error banner */}
      {error && <ConnectionError error={error} />}

      {/* Main layout */}
      <main className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: node list */}
        <NodeList
          agents={agents}
          selected={validSelected}
          onSelect={setSelectedAgent}
          loading={loading}
          lastRefresh={lastRefresh}
        />

        {/* Right: terminal console */}
        <Console
          selectedAgent={validSelected}
          agents={agents}
        />
      </main>
    </div>
  )
}

