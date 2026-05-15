import { useState } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './FormTransaccion.css'

export default function FormTransaccion({ cuenta }) {
  const agregarTransaccion = useBancoStore(s => s.agregarTransaccion)
  const [enviando, setEnviando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    tipo: 'gasto', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0]
  })

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.monto || parseFloat(form.monto) <= 0) return
    setEnviando(true)
    setErrorMsg('')
    const { error } = await agregarTransaccion({
      ...form,
      monto: parseFloat(form.monto),
      cuenta_id: cuenta.id
    })
    setEnviando(false)
    if (error) { setErrorMsg(error.message); return }
    setForm({ tipo: form.tipo, monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] })
  }

  return (
    <form onSubmit={handleSubmit} className="form-transaccion">
      <div className="tipo-toggle">
        <button
          type="button"
          className={`tipo-btn ${form.tipo === 'gasto' ? 'activo rojo' : ''}`}
          onClick={() => set('tipo', 'gasto')}
        >
          ↓ Gasto
        </button>
        <button
          type="button"
          className={`tipo-btn ${form.tipo === 'ingreso' ? 'activo verde' : ''}`}
          onClick={() => set('tipo', 'ingreso')}
        >
          ↑ Ingreso
        </button>
      </div>

      <input
        type="number"
        placeholder={`Monto (${cuenta.moneda})`}
        value={form.monto}
        onChange={e => set('monto', e.target.value)}
        min="0.01"
        step="0.01"
        required
      />
      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={form.descripcion}
        onChange={e => set('descripcion', e.target.value)}
      />
      <input
        type="date"
        value={form.fecha}
        onChange={e => set('fecha', e.target.value)}
      />

      {errorMsg && <p style={{ color: '#A32D2D', fontSize: 13, margin: '4px 0 0' }}>{errorMsg}</p>}
      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Registrar'}
      </button>
    </form>
  )
}
