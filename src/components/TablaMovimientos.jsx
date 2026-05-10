import { useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './TablaMovimientos.css'

export default function TablaMovimientos({ cuenta }) {
  const todasTransacciones     = useBancoStore(s => s.todasTransacciones)
  const fetchTodasTransacciones = useBancoStore(s => s.fetchTodasTransacciones)

  useEffect(() => {
    if (todasTransacciones.length === 0) fetchTodasTransacciones()
  }, [cuenta])

  const transacciones = todasTransacciones
    .filter(t => t.cuenta_id === cuenta.id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const fmt = (n) => Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2 })

  return (
    <div className="card movimientos-card">
      <p className="panel-title">📋 Movimientos recientes</p>

      {transacciones.length === 0 ? (
        <p className="mov-empty">Aún no hay movimientos para esta cuenta.</p>
      ) : (
        <div className="mov-lista">
          {transacciones.map(t => {
            const esIngreso = t.tipo === 'ingreso'
            return (
              <div key={t.id} className="mov-fila">
                <div className={`mov-dot ${esIngreso ? 'verde' : 'rojo'}`}>
                  {esIngreso ? '↑' : '↓'}
                </div>
                <div className="mov-info">
                  <span className="mov-desc">{t.descripcion || '—'}</span>
                  <span className="mov-fecha">{t.fecha}</span>
                </div>
                <div className="mov-derecha">
                  <span className={`mov-monto ${esIngreso ? 'verde' : 'rojo'}`}>
                    {esIngreso ? '+' : '-'}{fmt(t.monto)}
                  </span>
                  <span className={`chip ${esIngreso ? 'chip-green' : 'chip-red'}`} style={{ fontSize: 11 }}>
                    {t.tipo}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
