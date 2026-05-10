import { useBancoStore } from '../store/useBancoStore'
import './TarjetaSaldo.css'

export default function TarjetaSaldo({ cuenta }) {
  const calcularSaldo  = useBancoStore(s => s.calcularSaldo)
  const transacciones  = useBancoStore(s => s.transacciones)

  const saldo    = calcularSaldo(cuenta)
  const positivo = saldo >= 0

  const ingresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((acc, t) => acc + Number(t.monto), 0)

  const gastos = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, t) => acc + Number(t.monto), 0)

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
        <span className="chip chip-green">
          ↑ {cuenta.moneda} {fmt(ingresos)} ingresos
        </span>
        <span className="chip chip-red">
          ↓ {cuenta.moneda} {fmt(gastos)} gastos
        </span>
      </div>
    </div>
  )
}
