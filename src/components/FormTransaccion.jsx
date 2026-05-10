import { useState } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './FormTransaccion.css'

export default function FormTransaccion({ cuenta }) {
  const agregarTransaccion = useBancoStore(s => s.agregarTransaccion)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({
    tipo: 'gasto', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0]
  })

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.monto || parseFloat(form.monto) <= 0) return
    setEnviando(true)
    await agregarTransaccion({
      ...form,
      monto: parseFloat(form.monto),
      cuenta_id: cuenta.id
    })
    setForm({ tipo: form.tipo, monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] })
    setEnviando(false)
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

      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Registrar'}
      </button>
    </form>
  )
}
