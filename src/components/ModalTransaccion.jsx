import { useState, useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './ModalTransaccion.css'

export default function ModalTransaccion({ tipo, onClose }) {
  const cuentas            = useBancoStore(s => s.cuentas)
  const fetchCuentas       = useBancoStore(s => s.fetchCuentas)
  const agregarTransaccion = useBancoStore(s => s.agregarTransaccion)

  const [cuentaId, setCuentaId] = useState('')
  const [monto, setMonto]       = useState('')
  const [desc, setDesc]         = useState('')
  const [fecha, setFecha]       = useState(new Date().toISOString().split('T')[0])
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk]             = useState(false)

  const esIngreso = tipo === 'ingreso'

  useEffect(() => {
    if (cuentas.length === 0) fetchCuentas()
  }, [])

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cuentaId || !monto || parseFloat(monto) <= 0) return
    setEnviando(true)
    await agregarTransaccion({
      tipo,
      monto: parseFloat(monto),
      descripcion: desc,
      fecha,
      cuenta_id: cuentaId,
    })
    setOk(true)
    setTimeout(() => { onClose() }, 900)
  }

  const cuenta = cuentas.find(c => c.id === cuentaId)

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${esIngreso ? 'verde' : 'rojo'}`}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-titulo-wrap">
            <div className={`modal-icono ${esIngreso ? 'verde' : 'rojo'}`}>
              {esIngreso ? '↑' : '↓'}
            </div>
            <div>
              <p className="modal-titulo">{esIngreso ? 'Registrar ingreso' : 'Registrar egreso'}</p>
              <p className="modal-subtitulo">{esIngreso ? 'Dinero que entra a tu cuenta' : 'Dinero que sale de tu cuenta'}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {ok ? (
          <div className="modal-ok">
            <div className={`ok-circulo ${esIngreso ? 'verde' : 'rojo'}`}>✓</div>
            <p>¡Registrado!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">

            {/* Selector de cuenta */}
            <div className="form-field">
              <label className="form-label">
                {esIngreso ? 'Depositado en' : 'Salió de'}
              </label>
              <div className="cuenta-opciones">
                {cuentas.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`cuenta-opcion ${cuentaId === c.id ? 'seleccionada' : ''}`}
                    style={cuentaId === c.id ? { borderColor: c.color || (esIngreso ? 'var(--green-text)' : 'var(--red-text)') } : {}}
                    onClick={() => setCuentaId(c.id)}
                  >
                    <span className="opcion-nombre">{c.nombre}</span>
                    <span className="opcion-banco">{c.banco}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monto */}
            <div className="form-field">
              <label className="form-label">Monto {cuenta ? `(${cuenta.moneda})` : ''}</label>
              <div className="monto-wrap">
                <span className={`monto-signo ${esIngreso ? 'verde' : 'rojo'}`}>
                  {esIngreso ? '+' : '-'}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="monto-input"
                  autoFocus
                />
              </div>
            </div>

            {/* Descripción y fecha en fila */}
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
              disabled={enviando || !cuentaId || !monto}
            >
              {enviando ? 'Guardando...' : `Registrar ${esIngreso ? 'ingreso' : 'egreso'}`}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
