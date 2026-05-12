import { useState, useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './ModalTransaccion.css'

export default function ModalEditarMovimiento({ transaccion, onClose }) {
  const editarTransaccion = useBancoStore(s => s.editarTransaccion)

  const [tipo, setTipo]               = useState(transaccion.tipo)
  const [montoRaw, setMontoRaw]       = useState(String(transaccion.monto))
  const [montoDisplay, setMontoDisplay] = useState(
    Number(transaccion.monto).toLocaleString('es-DO', { minimumFractionDigits: 2 })
  )
  const [desc, setDesc]     = useState(transaccion.descripcion || '')
  const [fecha, setFecha]   = useState(transaccion.fecha)
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk]             = useState(false)

  const esIngreso = tipo === 'ingreso'

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const handleMonto = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw
    setMontoRaw(clean)
    if (clean === '' || clean === '.') { setMontoDisplay(clean); return }
    const [intPart, decPart] = clean.split('.')
    const formatted = Number(intPart || 0).toLocaleString('es-DO')
    setMontoDisplay(decPart !== undefined ? formatted + '.' + decPart : formatted)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!montoRaw || parseFloat(montoRaw) <= 0) return
    setEnviando(true)
    await editarTransaccion(transaccion.id, {
      tipo,
      monto: parseFloat(montoRaw),
      descripcion: desc,
      fecha,
    })
    setOk(true)
    setTimeout(() => { onClose() }, 900)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${esIngreso ? 'verde' : 'rojo'}`}>

        <div className="modal-header">
          <div className="modal-titulo-wrap">
            <div className={`modal-icono ${esIngreso ? 'verde' : 'rojo'}`}>✎</div>
            <div>
              <p className="modal-titulo">Editar movimiento</p>
              <p className="modal-subtitulo">Modificá los datos del movimiento</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {ok ? (
          <div className="modal-ok">
            <div className={`ok-circulo ${esIngreso ? 'verde' : 'rojo'}`}>✓</div>
            <p>¡Actualizado!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">

            <div className="form-field">
              <label className="form-label">Tipo</label>
              <div className="tipo-toggle">
                <button
                  type="button"
                  className={`tipo-btn ${tipo === 'ingreso' ? 'activo-verde' : ''}`}
                  onClick={() => setTipo('ingreso')}
                >↑ Ingreso</button>
                <button
                  type="button"
                  className={`tipo-btn ${tipo === 'gasto' ? 'activo-rojo' : ''}`}
                  onClick={() => setTipo('gasto')}
                >↓ Gasto</button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Monto</label>
              <div className="monto-wrap">
                <span className={`monto-signo ${esIngreso ? 'verde' : 'rojo'}`}>
                  {esIngreso ? '+' : '-'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={montoDisplay}
                  onChange={handleMonto}
                  required
                  className="monto-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  placeholder="¿De dónde / para qué?"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-modal ${esIngreso ? 'verde' : 'rojo'}`}
              disabled={enviando || !montoRaw}
            >
              {enviando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
