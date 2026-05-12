import { useState } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './Configuracion.css'

const TIPOS   = ['banco', 'tarjeta', 'efectivo', 'prestado']
const MONEDAS = ['DOP', 'USD']
const CUENTA_VACIA = { nombre: '', banco: '', saldo_inicial: 0, moneda: 'DOP', tipo: 'banco', limite: 0, color: '#7F77DD' }

export default function Configuracion({ onClose }) {
  const cuentas            = useBancoStore(s => s.cuentas)
  const todasTransacciones = useBancoStore(s => s.todasTransacciones)
  const agregarCuenta      = useBancoStore(s => s.agregarCuenta)
  const editarCuenta       = useBancoStore(s => s.editarCuenta)
  const eliminarCuenta     = useBancoStore(s => s.eliminarCuenta)

  const [seccion,       setSeccion]       = useState('cuentas')
  const [editando,      setEditando]      = useState(null)
  const [formEdit,      setFormEdit]      = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formNueva,     setFormNueva]     = useState(CUENTA_VACIA)
  const [guardando,     setGuardando]     = useState(false)
  const [eliminando,    setEliminando]    = useState(false)
  const [errorMsg,      setErrorMsg]      = useState('')

  const iniciarEdicion = (cuenta) => {
    setEditando(cuenta.id)
    setFormEdit({
      nombre:        cuenta.nombre,
      banco:         cuenta.banco,
      saldo_inicial: cuenta.saldo_inicial,
      moneda:        cuenta.moneda  || 'DOP',
      tipo:          cuenta.tipo    || 'banco',
      limite:        cuenta.limite  || 0,
      color:         cuenta.color   || '#7F77DD',
    })
    setErrorMsg('')
  }

  const guardarEdicion = async () => {
    if (!formEdit.nombre.trim() || !formEdit.banco.trim()) {
      setErrorMsg('Nombre y banco son requeridos.')
      return
    }
    setGuardando(true)
    const { error } = await editarCuenta(editando, {
      ...formEdit,
      saldo_inicial: parseFloat(formEdit.saldo_inicial) || 0,
      limite:        parseFloat(formEdit.limite)        || 0,
    })
    setGuardando(false)
    if (error) { setErrorMsg(error.message); return }
    setEditando(null)
    setErrorMsg('')
  }

  const confirmarEliminar = async () => {
    setEliminando(true)
    await eliminarCuenta(confirmDelete)
    setConfirmDelete(null)
    setEliminando(false)
  }

  const handleAgregar = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setGuardando(true)
    const { error } = await agregarCuenta({
      ...formNueva,
      saldo_inicial: parseFloat(formNueva.saldo_inicial) || 0,
      limite:        parseFloat(formNueva.limite)        || 0,
    })
    setGuardando(false)
    if (error) { setErrorMsg(error.message); return }
    setFormNueva(CUENTA_VACIA)
    setSeccion('cuentas')
  }

  const exportarCSV = () => {
    const cabecera = ['fecha', 'cuenta', 'banco', 'tipo', 'monto', 'descripcion']
    const filas = todasTransacciones
      .slice()
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .map(t => {
        const c = cuentas.find(x => x.id === t.cuenta_id)
        return [t.fecha, c?.nombre || '', c?.banco || '', t.tipo, t.monto, `"${(t.descripcion || '').replace(/"/g, '""')}"`]
      })
    const csv  = [cabecera, ...filas].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `bancoapp-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cuentaAEliminar = cuentas.find(c => c.id === confirmDelete)

  return (
    <div className="cfg-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cfg-panel">

        {/* Header */}
        <div className="cfg-header">
          <span className="cfg-titulo">Configuración</span>
          <button className="cfg-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Nav */}
        <div className="cfg-nav">
          {[
            ['cuentas',  '🏦', 'Cuentas'],
            ['nueva',    '＋', 'Nueva cuenta'],
            ['exportar', '📥', 'Exportar'],
          ].map(([k, ico, lbl]) => (
            <button
              key={k}
              className={`cfg-nav-btn ${seccion === k ? 'activo' : ''}`}
              onClick={() => { setSeccion(k); setEditando(null); setErrorMsg('') }}
            >
              <span className="cfg-nav-ico">{ico}</span>
              {lbl}
            </button>
          ))}
        </div>

        {/* ── Sección: Cuentas ── */}
        {seccion === 'cuentas' && (
          <div className="cfg-body">
            {cuentas.length === 0 && (
              <p className="cfg-empty">No hay cuentas registradas.</p>
            )}
            {cuentas.map(cuenta => (
              <div key={cuenta.id} className={`cfg-item ${editando === cuenta.id ? 'editando' : ''}`}>
                {editando === cuenta.id ? (
                  <div className="cfg-edit-form">
                    <div className="cfg-row-2">
                      <div className="cfg-field">
                        <label className="cfg-label">Nombre</label>
                        <input value={formEdit.nombre} onChange={e => setFormEdit(f => ({ ...f, nombre: e.target.value }))} />
                      </div>
                      <div className="cfg-field">
                        <label className="cfg-label">Banco / institución</label>
                        <input value={formEdit.banco} onChange={e => setFormEdit(f => ({ ...f, banco: e.target.value }))} />
                      </div>
                    </div>
                    <div className="cfg-row-3">
                      <div className="cfg-field">
                        <label className="cfg-label">Saldo inicial</label>
                        <input type="number" value={formEdit.saldo_inicial} onChange={e => setFormEdit(f => ({ ...f, saldo_inicial: e.target.value }))} />
                      </div>
                      <div className="cfg-field">
                        <label className="cfg-label">Moneda</label>
                        <select value={formEdit.moneda} onChange={e => setFormEdit(f => ({ ...f, moneda: e.target.value }))}>
                          {MONEDAS.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="cfg-field">
                        <label className="cfg-label">Tipo</label>
                        <select value={formEdit.tipo} onChange={e => setFormEdit(f => ({ ...f, tipo: e.target.value }))}>
                          {TIPOS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    {formEdit.tipo === 'tarjeta' && (
                      <div className="cfg-field">
                        <label className="cfg-label">Límite de crédito</label>
                        <input type="number" value={formEdit.limite} onChange={e => setFormEdit(f => ({ ...f, limite: e.target.value }))} />
                      </div>
                    )}
                    <div className="cfg-field cfg-color-field">
                      <label className="cfg-label">Color de acento</label>
                      <div className="cfg-color-wrap">
                        <input type="color" value={formEdit.color} onChange={e => setFormEdit(f => ({ ...f, color: e.target.value }))} className="cfg-color-input" />
                        <span className="cfg-color-hex">{formEdit.color}</span>
                      </div>
                    </div>
                    {errorMsg && <p className="cfg-error">{errorMsg}</p>}
                    <div className="cfg-edit-actions">
                      <button className="cfg-btn-cancel" onClick={() => { setEditando(null); setErrorMsg('') }}>Cancelar</button>
                      <button className="cfg-btn-save" onClick={guardarEdicion} disabled={guardando}>
                        {guardando ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="cfg-item-row">
                    <div className="cfg-dot" style={{ background: (cuenta.color || '#7F77DD') + '22', color: cuenta.color || '#7F77DD' }}>
                      {{ banco: '🏦', tarjeta: '💳', efectivo: '💵', prestado: '📦' }[cuenta.tipo] || '🏦'}
                    </div>
                    <div className="cfg-item-info">
                      <span className="cfg-item-nombre">{cuenta.nombre}</span>
                      <span className="cfg-item-banco">{cuenta.banco} · {cuenta.moneda || 'DOP'}</span>
                    </div>
                    <div className="cfg-item-btns">
                      <button className="cfg-icon-btn edit" onClick={() => iniciarEdicion(cuenta)} title="Editar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="cfg-icon-btn delete" onClick={() => setConfirmDelete(cuenta.id)} title="Eliminar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Sección: Nueva cuenta ── */}
        {seccion === 'nueva' && (
          <form className="cfg-body" onSubmit={handleAgregar}>
            <div className="cfg-row-2">
              <div className="cfg-field">
                <label className="cfg-label">Nombre *</label>
                <input required placeholder="Ej: Cuenta corriente" value={formNueva.nombre} onChange={e => setFormNueva(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="cfg-field">
                <label className="cfg-label">Banco / institución *</label>
                <input required placeholder="Ej: Banco Popular" value={formNueva.banco} onChange={e => setFormNueva(f => ({ ...f, banco: e.target.value }))} />
              </div>
            </div>
            <div className="cfg-row-3">
              <div className="cfg-field">
                <label className="cfg-label">Saldo inicial</label>
                <input type="number" step="0.01" value={formNueva.saldo_inicial} onChange={e => setFormNueva(f => ({ ...f, saldo_inicial: e.target.value }))} />
              </div>
              <div className="cfg-field">
                <label className="cfg-label">Moneda</label>
                <select value={formNueva.moneda} onChange={e => setFormNueva(f => ({ ...f, moneda: e.target.value }))}>
                  {MONEDAS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="cfg-field">
                <label className="cfg-label">Tipo</label>
                <select value={formNueva.tipo} onChange={e => setFormNueva(f => ({ ...f, tipo: e.target.value }))}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {formNueva.tipo === 'tarjeta' && (
              <div className="cfg-field">
                <label className="cfg-label">Límite de crédito</label>
                <input type="number" step="0.01" placeholder="0" value={formNueva.limite} onChange={e => setFormNueva(f => ({ ...f, limite: e.target.value }))} />
              </div>
            )}
            <div className="cfg-field cfg-color-field">
              <label className="cfg-label">Color de acento</label>
              <div className="cfg-color-wrap">
                <input type="color" value={formNueva.color} onChange={e => setFormNueva(f => ({ ...f, color: e.target.value }))} className="cfg-color-input" />
                <span className="cfg-color-hex">{formNueva.color}</span>
              </div>
            </div>
            {errorMsg && <p className="cfg-error">{errorMsg}</p>}
            <button type="submit" className="cfg-btn-save" style={{ marginTop: 8 }} disabled={guardando}>
              {guardando ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {/* ── Sección: Exportar ── */}
        {seccion === 'exportar' && (
          <div className="cfg-body">
            <div className="cfg-export-card">
              <div className="cfg-export-ico">📊</div>
              <p className="cfg-export-titulo">Exportar a CSV</p>
              <p className="cfg-export-desc">
                Descarga todas tus transacciones en formato CSV, listo para abrir en Excel, Google Sheets u otras herramientas.
              </p>
              <div className="cfg-export-stat">
                <span>{todasTransacciones.length} movimientos</span>
                <span>·</span>
                <span>{cuentas.length} cuentas</span>
              </div>
              <button className="cfg-btn-save" onClick={exportarCSV} disabled={todasTransacciones.length === 0}>
                📥 Descargar CSV
              </button>
            </div>
          </div>
        )}

        {/* ── Modal: confirmar eliminar ── */}
        {confirmDelete && (
          <div className="cfg-confirm-overlay">
            <div className="cfg-confirm-box">
              <div className="cfg-confirm-ico">🗑️</div>
              <p className="cfg-confirm-titulo">¿Eliminar cuenta?</p>
              <p className="cfg-confirm-nombre">"{cuentaAEliminar?.nombre}"</p>
              <p className="cfg-confirm-desc">
                Se eliminarán también todos los movimientos de esta cuenta. Esta acción no se puede deshacer.
              </p>
              <div className="cfg-confirm-actions">
                <button className="cfg-btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="cfg-btn-delete" onClick={confirmarEliminar} disabled={eliminando}>
                  {eliminando ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
