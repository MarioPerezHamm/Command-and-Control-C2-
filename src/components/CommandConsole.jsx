import { useState, useRef, useEffect, useCallback } from 'react'

const API = 'http://localhost:8000'

function OutputLine({ entry }) {
  const colors = {
    cmd:       'text-hmi-cyan',
    broadcast: 'text-hmi-amber',
    success:   'text-hmi-green',
    error:     'text-hmi-red',
    info:      'text-hmi-text-dim',
    system:    'text-hmi-blue',
  }
  const prefixes = {
    cmd:       '> ',
    broadcast: '>> [BROADCAST] ',
    success:   '',
    error:     '[ERR] ',
    info:      '[INFO] ',
    system:    '[SYS] ',
  }
  return (
    <div className={`console-text leading-relaxed ${colors[entry.type] ?? 'text-hmi-text-dim'}`}>
      <span className="text-hmi-text-muted text-[10px] mr-2 select-none">{entry.ts}</span>
      <span className="opacity-60 mr-1">{prefixes[entry.type] ?? ''}</span>
      <span className="whitespace-pre-wrap break-all">{entry.text}</span>
    </div>
  )
}

export default function CommandConsole({ selectedAgent, agents, onCmdSent }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([
    { id: 0, type: 'system', text: 'C2 Operator Console ready. Select a node or use BROADCAST.', ts: new Date().toLocaleTimeString('en-GB') },
    { id: 1, type: 'info',   text: 'Endpoints: POST /ejecutar  |  POST /broadcast  |  GET /historial/{id}', ts: new Date().toLocaleTimeString('en-GB') },
  ])
  const [cmdHistory, setCmdHistory]   = useState([])
  const [histIdx, setHistIdx]         = useState(-1)
  const [loading, setLoading]         = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  const addLine = useCallback((type, text) => {
    setHistory(h => [...h, { id: Date.now() + Math.random(), type, text, ts: new Date().toLocaleTimeString('en-GB') }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const runCommand = useCallback(async (cmd, isBroadcast) => {
    if (!cmd.trim()) return
    const ts = new Date().toLocaleTimeString('en-GB')
    const type = isBroadcast ? 'broadcast' : 'cmd'
    setHistory(h => [...h, { id: Date.now(), type, text: cmd, ts }])
    setCmdHistory(h => [cmd, ...h.slice(0, 49)])
    setHistIdx(-1)
    setLoading(true)
    onCmdSent?.()
    try {
      const body = isBroadcast
        ? { agente_id: 0, cmd }
        : { agente_id: selectedAgent?.id, cmd }
      const endpoint = isBroadcast ? '/broadcast' : '/ejecutar'
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const out = data.resultado ?? data.output ?? JSON.stringify(data)
      addLine('success', out)
    } catch (err) {
      addLine('error', err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedAgent, addLine, onCmdSent])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!input.trim() || loading) return
      runCommand(input.trim(), false)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, cmdHistory.length - 1)
        setInput(cmdHistory[next] ?? '')
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? '' : cmdHistory[next] ?? '')
        return next
      })
    }
  }

  const canExec      = !!selectedAgent && !loading
  const canBroadcast = agents.length > 0 && !loading

  return (
    <div className="hmi-card flex flex-col h-full">
      {/* Header */}
      <div className="hmi-card-title flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span>Command Console</span>
          {selectedAgent && (
            <span className="bg-hmi-blue-faint border border-hmi-blue border-opacity-30 text-hmi-blue text-[10px] px-2 py-0.5 rounded-full normal-case font-normal tracking-normal">
              Agent-{selectedAgent.id} &bull; {selectedAgent.ip}
            </span>
          )}
        </div>
        {loading && (
          <span className="text-hmi-amber text-[10px] animate-pulse normal-case font-normal tracking-normal">Executing...</span>
        )}
      </div>

      {/* Output */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-0.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map(e => <OutputLine key={e.id} entry={e} />)}
        {loading && (
          <div className="console-text text-hmi-amber animate-pulse">
            <span className="text-hmi-text-muted text-[10px] mr-2 select-none">{new Date().toLocaleTimeString('en-GB')}</span>
            Awaiting response...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="border-t border-hmi-border p-3 flex gap-2 shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-hmi-surface border border-hmi-border rounded-btn px-3 focus-within:border-hmi-blue transition-colors">
          <span className="text-hmi-blue text-xs font-mono select-none">
            {selectedAgent ? `${selectedAgent.ip}>` : 'C2>'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedAgent ? 'Enter command...' : 'Select a node first...'}
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-hmi-text font-mono text-xs py-2 placeholder-hmi-text-muted disabled:opacity-50"
            aria-label="Command input"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          onClick={() => { if (canExec) { runCommand(input.trim(), false); setInput('') } }}
          disabled={!canExec || !input.trim()}
          className="px-4 py-2 bg-hmi-blue rounded-btn text-white text-xs font-semibold hover:bg-hmi-blue-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          EXEC
        </button>

        <button
          onClick={() => { if (canBroadcast && input.trim()) { runCommand(input.trim(), true); setInput('') } }}
          disabled={!canBroadcast || !input.trim()}
          className="px-4 py-2 bg-hmi-amber-faint border border-hmi-amber border-opacity-40 rounded-btn text-hmi-amber text-xs font-semibold hover:bg-hmi-amber hover:text-hmi-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          BROADCAST
        </button>

        <button
          onClick={() => setHistory(h => h.slice(0, 2))}
          className="px-3 py-2 bg-hmi-surface border border-hmi-border rounded-btn text-hmi-text-muted text-xs hover:text-hmi-text hover:border-hmi-border-alt transition-colors"
          title="Clear console"
        >
          CLR
        </button>
      </div>
    </div>
  )
}
