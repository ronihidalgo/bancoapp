import { useBancoStore } from '../store/useBancoStore'
import './ResumenMes.css'

export default function ResumenMes({ cuenta }) {
  const todasTransacciones = useBancoStore(s => s.todasTransacciones)
  const transacciones = todasTransacciones.filter(t => t.cuenta_id === cuenta.id)

  const ingresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((acc, t) => acc + Number(t.monto), 0)

  const gastos = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, t) => acc + Number(t.monto), 0)

  const total    = ingresos + gastos || 1
  const pctIng   = Math.round((ingresos / total) * 100)
  const pctGas   = Math.round((gastos   / total) * 100)
  const balance  = ingresos - gastos
  const positivo = balance >= 0

  const fmt = (n) => n.toLocaleString('es-DO', { minimumFractionDigits: 0 })

  return (
    <div className="resumen">
      <div className="resumen-fila">
        <span className="resumen-label">Ingresos</span>
        <span className="resumen-valor verde">{cuenta.moneda} {fmt(ingresos)}</span>
      </div>
      <div className="barra-track">
        <div className="barra-fill verde" style={{ width: `${pctIng}%` }} />
      </div>

      <div className="resumen-fila">
        <span className="resumen-label">Gastos</span>
        <span className="resumen-valor rojo">{cuenta.moneda} {fmt(gastos)}</span>
      </div>
      <div className="barra-track">
        <div className="barra-fill rojo" style={{ width: `${pctGas}%` }} />
      </div>

      <div className="resumen-divider" />

      <div className="resumen-fila">
        <span className="resumen-label" style={{ fontWeight: 500 }}>Balance neto</span>
        <span className="resumen-valor" style={{ color: positivo ? 'var(--green-text)' : 'var(--red-text)', fontWeight: 500 }}>
          {positivo ? '+' : ''}{cuenta.moneda} {fmt(balance)}
        </span>
      </div>
    </div>
  )
}
