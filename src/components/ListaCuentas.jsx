import { useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './ListaCuentas.css'

const COLORES_DEFAULT = [
  { bg: '#EEEDFE', color: '#534AB7', icono: '🏦' },
  { bg: '#E1F5EE', color: '#0F6E56', icono: '💳' },
  { bg: '#FAEEDA', color: '#854F0B', icono: '💵' },
  { bg: '#E6F1FB', color: '#185FA5', icono: '🏧' },
]

export default function ListaCuentas({ onSelect, cuentaActiva }) {
  const cuentas      = useBancoStore(s => s.cuentas)
  const fetchCuentas = useBancoStore(s => s.fetchCuentas)
  const cargando     = useBancoStore(s => s.cargando)
  const calcularSaldo = useBancoStore(s => s.calcularSaldo)
  const transacciones = useBancoStore(s => s.transacciones)

  useEffect(() => { fetchCuentas() }, [])

  if (cargando) return (
    <div className="cuentas-loading">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  )

  return (
    <div className="cuentas-grid">
      {cuentas.map((cuenta, i) => {
        const esActiva = cuentaActiva?.id === cuenta.id
        const palette  = COLORES_DEFAULT[i % COLORES_DEFAULT.length]
        const bg       = cuenta.fondo  || palette.bg
        const color    = cuenta.color  || palette.color
        const icono    = palette.icono

        return (
          <div
            key={cuenta.id}
            className={`cuenta-card ${esActiva ? 'activa' : ''}`}
            style={{ '--c-border': color }}
            onClick={() => onSelect(cuenta)}
          >
            <div className="cuenta-icono" style={{ background: bg, color }}>
              {cuenta.logo_url
                ? <img src={cuenta.logo_url} alt={cuenta.banco} style={{ width:20, height:20, borderRadius:4 }} />
                : icono
              }
            </div>
            <div className="cuenta-nombre" style={{ color: esActiva ? color : 'var(--text-primary)' }}>
              {cuenta.nombre}
            </div>
            <div className="cuenta-banco">{cuenta.banco}</div>
          </div>
        )
      })}
    </div>
  )
}
