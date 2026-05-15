import { useEffect, useState } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './TasaCambio.css'

const INTERVALO_MS = 10 * 60 * 1000

export default function TasaCambio() {
  const [datos,    setDatos]    = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error,    setError]    = useState(false)
  const setTasaVenta = useBancoStore(s => s.setTasaVenta)

  const fetchTasa = async () => {
    try {
      const resp = await fetch('/api/tasa')
      if (!resp.ok) throw new Error()
      const json = await resp.json()
      if (json.error) throw new Error()
      setDatos(json)
      setTasaVenta(json.venta)
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

  if (error) return null

  const fmt = (n) => Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
      <div
        className={`btn-tasa compra ${cargando ? 'cargando' : ''}`}
        title={datos ? `Actualizado: ${new Date(datos.ts).toLocaleTimeString('es-DO')}` : ''}
        onClick={fetchTasa}
      >
        <span className="btn-tasa-icono">↓</span>
        <div className="btn-tasa-info">
          <span className="btn-tasa-label">Compra USD</span>
          <span className="btn-tasa-valor">{cargando ? '···' : `RD$ ${fmt(datos.compra)}`}</span>
        </div>
      </div>

      <div
        className={`btn-tasa venta ${cargando ? 'cargando' : ''}`}
        title={datos ? `Actualizado: ${new Date(datos.ts).toLocaleTimeString('es-DO')}` : ''}
        onClick={fetchTasa}
      >
        <span className="btn-tasa-icono">↑</span>
        <div className="btn-tasa-info">
          <span className="btn-tasa-label">Venta USD</span>
          <span className="btn-tasa-valor">{cargando ? '···' : `RD$ ${fmt(datos.venta)}`}</span>
        </div>
      </div>
    </>
  )
}
