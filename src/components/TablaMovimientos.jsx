import { useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'

export default function TablaMovimientos({ cuenta }) {
  const transacciones      = useBancoStore(s => s.transacciones)
  const fetchTransacciones = useBancoStore(s => s.fetchTransacciones)

  useEffect(() => {
    if (cuenta) fetchTransacciones(cuenta.id)
  }, [cuenta])

  return (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
      <thead>
        <tr style={{ borderBottom:'1px solid #eee', textAlign:'left' }}>
          <th>Fecha</th>
          <th>Descripción</th>
          <th>Tipo</th>
          <th style={{ textAlign:'right' }}>Monto</th>
        </tr>
      </thead>
      <tbody>
        {transacciones.map(t => (
          <tr key={t.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
            <td>{t.fecha}</td>
            <td>{t.descripcion}</td>
            <td style={{ color: t.tipo === 'ingreso' ? 'green' : 'red' }}>
              {t.tipo}
            </td>
            <td style={{ textAlign:'right' }}>
              {t.monto.toLocaleString('es-DO')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}