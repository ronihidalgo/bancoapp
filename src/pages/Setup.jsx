import { useState } from 'react'
import { supabase } from '../lib/supabase'

const NUEVAS_CUENTAS = [
  { nombre: 'Platino BHD', banco: 'Banco BHD', saldo_inicial: -100000, moneda: 'DOP', tipo: 'tarjeta', limite: 100000 },
  { nombre: 'Black BHD',   banco: 'Banco BHD', saldo_inicial: -200000, moneda: 'DOP', tipo: 'tarjeta', limite: 200000 },
  { nombre: 'Efectivo',    banco: 'Efectivo',   saldo_inicial:   10000, moneda: 'DOP', tipo: 'efectivo', limite: 0    },
]

export default function Setup() {
  const [log, setLog]             = useState([])
  const [hecho, setHecho]         = useState(false)
  const [corriendo, setCorriendo] = useState(false)

  const agregar = (msg, ok = true) => setLog(l => [...l, { msg, ok }])

  const run = async () => {
    setCorriendo(true)
    setLog([])

    const { data: existentes } = await supabase.from('cuentas').select('nombre')
    const nombres = (existentes || []).map(c => c.nombre)
    agregar(`Cuentas actuales: ${nombres.join(', ') || 'ninguna'}`)

    for (const cuenta of NUEVAS_CUENTAS) {
      if (nombres.includes(cuenta.nombre)) {
        agregar(`⚠ "${cuenta.nombre}" ya existe, omitiendo`, false)
        continue
      }
      const { error } = await supabase.from('cuentas').insert([cuenta])
      if (error) {
        const { nombre, banco, saldo_inicial, moneda } = cuenta
        const { error: e2 } = await supabase.from('cuentas').insert([{ nombre, banco, saldo_inicial, moneda }])
        if (e2) agregar(`✗ "${cuenta.nombre}": ${e2.message}`, false)
        else    agregar(`✓ "${cuenta.nombre}" insertada (columnas tipo/limite pendientes)`)
      } else {
        agregar(`✓ "${cuenta.nombre}" insertada correctamente`)
      }
    }

    setHecho(true)
    setCorriendo(false)
  }

  return (
    <div style={{ maxWidth: 500, margin: '4rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 8, fontSize: 22, fontWeight: 500 }}>banco<span style={{ color: '#7F77DD' }}>app</span> — Setup</div>
      <p style={{ color: '#6b6375', fontSize: 14, marginBottom: 24 }}>
        Insertará Platino BHD, Black BHD y Efectivo en tu base de datos de Supabase.
      </p>

      {!hecho ? (
        <button onClick={run} disabled={corriendo}
          style={{ background: corriendo ? '#aaa' : '#7F77DD', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 500,
            cursor: corriendo ? 'not-allowed' : 'pointer' }}>
          {corriendo ? 'Ejecutando...' : 'Insertar cuentas'}
        </button>
      ) : (
        <a href="/" style={{ display: 'inline-block', background: '#3B6D11', color: '#fff',
            borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
          ✓ Listo — ir al Dashboard
        </a>
      )}

      {log.length > 0 && (
        <div style={{ marginTop: 20, background: '#f4f4f8', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.ok ? '#3B6D11' : '#A32D2D', padding: '3px 0' }}>{l.msg}</div>
          ))}
        </div>
      )}
    </div>
  )
}
