import { useBancoStore } from '../store/useBancoStore'

export default function TarjetaSaldo({ cuenta }) {
  const calcularSaldo  = useBancoStore(s => s.calcularSaldo)
  const transacciones  = useBancoStore(s => s.transacciones)

  const saldo    = calcularSaldo(cuenta)
  const positivo = saldo >= 0

  return (
    <div style={{
      background: positivo ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${positivo ? '#86efac' : '#fca5a5'}`,
      borderRadius: 12, padding: '16px 20px', marginBottom: 20
    }}>
      <p style={{ margin:0, fontSize:13, color: positivo ? '#166534' : '#991b1b' }}>
        Saldo actual — {cuenta.nombre}
      </p>
      <p style={{
        margin:'4px 0 0', fontSize:28, fontWeight:600,
        color: positivo ? '#15803d' : '#dc2626'
      }}>
        {cuenta.moneda} {saldo.toLocaleString('es-DO', {
          minimumFractionDigits: 2
        })}
      </p>
      <p style={{ margin:'6px 0 0', fontSize:12, color:'#888' }}>
        Saldo inicial: {cuenta.moneda} {Number(cuenta.saldo_inicial).toLocaleString('es-DO')}
      </p>
    </div>
  )
}