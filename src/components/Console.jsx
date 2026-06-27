import { useState, useRef, useEffect, useCallback } from 'react'

const API = 'http://localhost:8000'

function TerminalLine({ entry }) {
  const isError = entry.type === 'error'
  const isBroadcast = entry.type === 'broadcast'
  const isSystem = entry.type === 'system'

  const prefixColor = isError
    ? 'text-terminal-red'
    : isBroadcast
    ? 'text-terminal-amber'
    : isSystem
    ? 'text-terminal-gray-light'
    : 'text-terminal-green-dim'

  return (
    <div className="animate-fadeIn">
      {/* Command line */}
      <div className="flex items-start gap-2 group">
        <span className={`shrink-0 select-none ${prefixColor}`}>
          {isSystem ? '#' : isBroadcast ? '>>>' : '>'}
        </span>
        <span className={`font-bold ${isBroadcast ? 'text-terminal-amber' : isSystem ? 'text-terminal-gray-light' : 'text-terminal-green'}`}>
          {entry.cmd}
        </span>
        <span className="ml-auto text-[9px] text-terminal-gray-mid shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {entry.timestamp}
        </span>
      </div>

      {/* Output */}
      {entry.output && (
        <div className={`ml-4 mt-1 mb-2 whitespace-pre-wrap break-all leading-relaxed ${isError ? 'text-terminal-red' : 'text-terminal-green-dim'}`}>
          {entry.output}
        </div>
      )}

      {/* Broadcast results */}
      {entry.results && Object.entries(entry.results).map(([agentId, res]) => (
        <div key={agentId} className="ml-4 mb-1">
          <span className="text-terminal-amber text-[10px]">[node:{agentId}] </span>
          <span className={`whitespace-pre-wrap break-all leading-relaxed text-terminal-green-dim`}>
            {res.resultado ?? res.error ?? JSON.stringify(res)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Console({ selectedAgent, agents }) {
  const [history, setHistory] = useState([
    { type: 'system', cmd: 'C2 Operator Panel initialized. Select a node to begin.', timestamp: new Date().toLocaleTimeString('en-GB') },
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [cmdIdx, setCmdIdx] = useState(-1)
  const [executing, setExecuting] = useState(false)
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  const addLine = useCallback((entry) => {
    setHistory(h => [...h, { ...entry, timestamp: new Date().toLocaleTimeString('en-GB') }])
  }, [])

  const execCommand = useCallback(async (cmd, broadcast = false) => {
    if (!cmd.trim()) return
    setExecuting(true)

    if (broadcast) {
      addLine({ type: 'broadcast', cmd: `[BROADCAST] ${cmd}` })
      try {
        const res = await fetch(`${API}/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agente_id: 0, cmd }),
        })
        const data = await res.json()
        addLine({ type: 'broadcast', cmd: '', results: data.broadcast ?? data })
      } catch (err) {
        addLine({ type: 'error', cmd: '', output: `BROADCAST ERROR: ${err.message}` })
      }
    } else {
      if (!selectedAgent) {
        addLine({ type: 'error', cmd, output: 'ERROR: No node selected. Select a node from the left panel.' })
        setExecuting(false)
        return
      }
      addLine({ type: 'cmd', cmd: `[node:${selectedAgent.id}] $ ${cmd}` })
      try {
        const res = await fetch(`${API}/ejecutar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agente_id: selectedAgent.id, cmd }),
        })
        const data = await res.json()
        if (data.error) {
          addLine({ type: 'error', cmd: '', output: data.error })
        } else {
          addLine({ type: 'output', cmd: '', output: data.resultado })
        }
      } catch (err) {
        addLine({ type: 'error', cmd: '', output: `CONNECTION ERROR: ${err.message}` })
      }
    }

    setCmdHistory(h => [cmd, ...h.slice(0, 49)])
    setCmdIdx(-1)
    setExecuting(false)
  }, [selectedAgent, addLine])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      execCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(cmdIdx + 1, cmdHistory.length - 1)
      setCmdIdx(next)
      setInput(cmdHistory[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(cmdIdx - 1, -1)
      setCmdIdx(next)
      setInput(next === -1 ? '' : cmdHistory[next])
    }
  }

  const handleBroadcast = () => {
    if (!input.trim()) return
    execCommand(input, true)
    setInput('')
  }

  const clearConsole = () => {
    setHistory([{ type: 'system', cmd: 'Console cleared.', timestamp: new Date().toLocaleTimeString('en-GB') }])
  }

  const prompt = selectedAgent
    ? `[node:${selectedAgent.id}@${selectedAgent.addr?.split(':')[0] ?? '?'}]$`
    : '[no-node]$'

  return (
    <div className="flex flex-col flex-1 min-w-0 bg-terminal-bg">
      {/* Console header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border bg-terminal-panel shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-red opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-amber opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-terminal-green opacity-70 shadow-glow-sm" />
          </div>
          <span className="text-[10px] text-terminal-gray-light uppercase tracking-widest">
            {selectedAgent
              ? `SHELL — node:${selectedAgent.id} / ${selectedAgent.addr?.split(':')[0]} / ${selectedAgent.os}`
              : 'SHELL — no node selected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-terminal-gray-mid">{agents.length} nodes online</span>
          <button
            onClick={clearConsole}
            className="text-[10px] text-terminal-gray-mid hover:text-terminal-green transition-colors px-2 py-0.5 border border-terminal-border hover:border-terminal-green rounded"
          >
            CLR
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed space-y-0.5 grid-bg"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <TerminalLine key={i} entry={entry} />
        ))}
        {executing && (
          <div className="flex items-center gap-2 text-terminal-green-dim animate-pulse">
            <span>{'>'}</span>
            <span>executing</span>
            <span className="animate-blink">_</span>
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="shrink-0 border-t border-terminal-border bg-terminal-panel">
        <div className="flex items-center px-4 py-3 gap-3">
          <span className="text-terminal-green text-glow-sm shrink-0 text-[11px]">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={executing}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="enter command..."
            className={[
              'flex-1 bg-transparent border-none outline-none',
              'font-mono text-[12px] text-terminal-green placeholder-terminal-green-muted',
              'caret-terminal-green',
              executing ? 'opacity-40 cursor-not-allowed' : '',
            ].join(' ')}
          />
          {/* Broadcast button */}
          <button
            onClick={handleBroadcast}
            disabled={executing || !input.trim()}
            className={[
              'shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded',
              'border transition-all duration-150',
              executing || !input.trim()
                ? 'border-terminal-border text-terminal-gray-mid cursor-not-allowed opacity-40'
                : 'border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-black shadow-[0_0_8px_rgba(255,170,0,0.3)] hover:shadow-[0_0_12px_rgba(255,170,0,0.5)]',
            ].join(' ')}
            title="Send command to ALL nodes"
          >
            BROADCAST
          </button>
          {/* Execute single */}
          <button
            onClick={() => { execCommand(input); setInput('') }}
            disabled={executing || !input.trim() || !selectedAgent}
            className={[
              'shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded',
              'border transition-all duration-150',
              executing || !input.trim() || !selectedAgent
                ? 'border-terminal-border text-terminal-gray-mid cursor-not-allowed opacity-40'
                : 'border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black shadow-glow-sm hover:shadow-glow',
            ].join(' ')}
            title="Send command to selected node"
          >
            EXEC
          </button>
        </div>

        {/* Command history hints */}
        {cmdHistory.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
            {cmdHistory.slice(0, 5).map((c, i) => (
              <button
                key={i}
                onClick={() => setInput(c)}
                className="shrink-0 text-[9px] text-terminal-gray-mid hover:text-terminal-green border border-terminal-border hover:border-terminal-border-bright rounded px-2 py-0.5 transition-colors"
              >
                {c.length > 20 ? c.slice(0, 20) + '…' : c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
