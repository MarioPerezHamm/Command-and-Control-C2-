import { useState } from 'react'

const SERVER = 'http://localhost:8000'

export default function Sidebar({ agents, error, onRefresh }) {
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState('8000')
  const isConnected = !error && agents.length >= 0

  return (
    <aside className="w-48 flex-shrink-0 flex flex-col gap-3 p-3 border-r border-hmi-border">
      {/* Logo / branding */}
      <div className="flex flex-col items-center pt-2 pb-3 border-b border-hmi-border">
        <div className="w-12 h-12 rounded-full bg-hmi-card border border-hmi-border flex items-center justify-center mb-2">
          <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
            <circle cx="18" cy="18" r="7" stroke="#0ea5e9" strokeWidth="2" />
            <circle cx="18" cy="18" r="14" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M18 4 L18 32 M4 18 L32 18" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
            <circle cx="18" cy="18" r="2.5" fill="#0ea5e9" />
          </svg>
        </div>
        <p className="text-hmi-text text-xs font-semibold">C2 Operator</p>
        <p className="text-hmi-text-muted text-[10px]">v2.0.0</p>
      </div>

      {/* Connection settings */}
      <div className="space-y-2">
        <p className="text-hmi-text-muted text-[10px] uppercase tracking-widest">Connection</p>

        <div>
          <label className="text-[10px] text-hmi-text-muted block mb-1">Host</label>
          <input
            type="text"
            value={host}
            onChange={e => setHost(e.target.value)}
            className="w-full bg-hmi-surface border border-hmi-border rounded-btn px-2 py-1.5 text-xs text-hmi-text font-mono focus:outline-none focus:border-hmi-blue transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] text-hmi-text-muted block mb-1">Port</label>
          <input
            type="text"
            value={port}
            onChange={e => setPort(e.target.value)}
            className="w-full bg-hmi-surface border border-hmi-border rounded-btn px-2 py-1.5 text-xs text-hmi-text font-mono focus:outline-none focus:border-hmi-blue transition-colors"
          />
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 bg-hmi-surface border border-hmi-border rounded-btn px-3 py-2">
        <span className={`led ${error ? 'led-red' : 'led-green'}`} />
        <span className={`text-xs font-medium ${error ? 'text-hmi-red' : 'text-hmi-green'}`}>
          {error ? 'Disconnected' : 'Connected'}
        </span>
      </div>

      {/* Action buttons */}
      <button
        onClick={onRefresh}
        className="w-full py-2 bg-hmi-blue rounded-btn text-white text-xs font-semibold hover:bg-hmi-blue-dim transition-colors"
      >
        Refresh
      </button>

      <button
        className="w-full py-2 bg-hmi-red bg-opacity-10 border border-hmi-red border-opacity-30 rounded-btn text-hmi-red text-xs font-semibold hover:bg-opacity-20 transition-colors"
      >
        Disconnect
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer info */}
      <div className="border-t border-hmi-border pt-3 space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-hmi-text-muted">Server</span>
          <span className="text-hmi-text-dim font-mono">{host}:{port}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-hmi-text-muted">Nodes</span>
          <span className="text-hmi-green font-mono">{agents.length}</span>
        </div>
      </div>
    </aside>
  )
}
