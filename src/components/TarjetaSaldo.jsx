import { useBancoStore } from '../store/useBancoStore'
import './TarjetaSaldo.css'

export default function TarjetaSaldo({ cuenta }) {
  const calcularSaldoCuenta = useBancoStore(s => s.calcularSaldoCuenta)
  // Suscripción necesaria: re-renderiza al cambiar transacciones
  const todasTransacciones  = useBancoStore(s => s.todasTransacciones)

  const txsCuenta = todasTransacciones.filter(t => t.cuenta_id === cuenta.id)
  const ingresos  = txsCuenta.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + Number(t.monto), 0)
  const gastos    = txsCuenta.filter(t => t.tipo === 'gasto').reduce((a, t) => a + Number(t.monto), 0)
  const saldo     = calcularSaldoCuenta(cuenta)
  const positivo  = saldo >= 0

  const fmt = (n) => n.toLocaleString('es-DO', { minimumFractionDigits: 2 })

  return (
    <div className="saldo-banner card">
      <div className="saldo-info">
        <p className="saldo-label">
          Saldo actual — {cuenta.nombre}
          <span className="saldo-banco"> · {cuenta.banco}</span>
        </p>
        <p className="saldo-monto" style={{ color: positivo ? 'var(--green-text)' : 'var(--red-text)' }}>
          {cuenta.moneda} {fmt(saldo)}
        </p>
        <p className="saldo-inicial">
          Saldo inicial: {cuenta.moneda} {Number(cuenta.saldo_inicial).toLocaleString('es-DO')}
        </p>
      </div>
      <div className="saldo-chips">
        <span className="chip chip-green">↑ {cuenta.moneda} {fmt(ingresos)} ingresos</span>
        <span className="chip chip-red">↓ {cuenta.moneda} {fmt(gastos)} gastos</span>
      </div>
    </div>
  )
}
