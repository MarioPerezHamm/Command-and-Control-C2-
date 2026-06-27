import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:8000'
const REFRESH_INTERVAL = 5000

export function useAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState('—')

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/agentes`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAgents(data.agentes ?? [])
      setError(null)
      setLastRefresh(new Date().toLocaleTimeString('en-GB'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
    const id = setInterval(fetchAgents, REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [fetchAgents])

  return { agents, loading, error, lastRefresh, refetch: fetchAgents }
}
