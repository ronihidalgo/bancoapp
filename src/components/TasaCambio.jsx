import { useEffect, useState } from 'react'
import './TasaCambio.css'

const INTERVALO_MS = 10 * 60 * 1000 // refresca cada 10 min

export default function TasaCambio() {
  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(false)

  const fetchTasa = async () => {
    try {
      const resp = await fetch('/api/tasa')
      if (!resp.ok) throw new Error()
      const json = await resp.json()
      if (json.error) throw new Error()
      setDatos(json)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    fetchTasa()
    const id = setInterval(fetchTasa, INTERVALO_MS)
    return () => clearInterval(id)
  }, [])

  if (cargando) return <div className="tasa-widget tasa-skeleton" />
  if (error)    return null

  const esBHD   = datos.fuente === 'BHD'
  const fmt     = (n) => Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="tasa-widget" title={`Actualizado: ${new Date(datos.ts).toLocaleTimeString('es-DO')}`}>
      <span className="tasa-flag">🇺🇸</span>
      <div className="tasa-rates">
        <span className="tasa-label">USD</span>
        <span className="tasa-par">
          <span className="tasa-tag compra">C</span>
          <span className="tasa-val">{fmt(datos.compra)}</span>
        </span>
        <span className="tasa-sep">·</span>
        <span className="tasa-par">
          <span className="tasa-tag venta">V</span>
          <span className="tasa-val">{fmt(datos.venta)}</span>
        </span>
      </div>
      <span className="tasa-fuente">{esBHD ? 'BHD' : '~mercado'}</span>
      <button className="tasa-refresh" onClick={fetchTasa} title="Actualizar tasa" aria-label="Actualizar">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
    </div>
  )
}
