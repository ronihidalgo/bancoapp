import { useState } from 'react'
import { useBancoStore } from '../store/useBancoStore'

export default function FormTransaccion({ cuenta }) {
  const agregarTransaccion = useBancoStore(s => s.agregarTransaccion)
  const [form, setForm] = useState({
    tipo: 'gasto', monto: '', descripcion: '', fecha: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await agregarTransaccion({
      ...form,
      monto: parseFloat(form.monto),
      cuenta_id: cuenta.id
    })
    setForm({ tipo:'gasto', monto:'', descripcion:'', fecha:'' })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:400 }}>
      <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
        <option value="gasto">Gasto</option>
        <option value="ingreso">Ingreso</option>
      </select>
      <input
        type="number" placeholder="Monto" value={form.monto}
        onChange={e => setForm({...form, monto: e.target.value})}
        required
      />
      <input
        type="text" placeholder="Descripción" value={form.descripcion}
        onChange={e => setForm({...form, descripcion: e.target.value})}
      />
      <input
        type="date" value={form.fecha}
        onChange={e => setForm({...form, fecha: e.target.value})}
      />
      <button type="submit">Registrar</button>
    </form>
  )
}