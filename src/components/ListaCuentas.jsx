import { useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'

export default function ListaCuentas({ onSelect }) {
  const cuentas      = useBancoStore(s => s.cuentas)
  const fetchCuentas = useBancoStore(s => s.fetchCuentas)
  const cargando     = useBancoStore(s => s.cargando)

  useEffect(() => { fetchCuentas() }, [])

  if (cargando) return <p>Cargando cuentas...</p>

  return (
    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
      {cuentas.map(cuenta => (
        <div
          key={cuenta.id}
          onClick={() => onSelect(cuenta)}
          style={{
            border: `2px solid ${cuenta.color || '#333'}`,
            background: cuenta.fondo || '#f5f5f5',
            borderRadius: 12,
            padding: '16px 20px',
            cursor: 'pointer',
            minWidth: 180,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          {cuenta.logo_url && (
            <img
              src={cuenta.logo_url}
              alt={cuenta.banco}
              style={{ width:32, height:32, borderRadius:6 }}
            />
          )}
          <div>
            <p style={{ margin:0, fontWeight:600, color: cuenta.color || '#333' }}>
              {cuenta.nombre}
            </p>
            <p style={{ margin:0, fontSize:13, color: cuenta.color || '#333' }}>
              {cuenta.banco}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}