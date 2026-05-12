import { useEffect, useState } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import ModalEditarMovimiento from './ModalEditarMovimiento'
import './TablaMovimientos.css'

const LIMITE = 3

export default function TablaMovimientos({ cuenta }) {
  const todasTransacciones      = useBancoStore(s => s.todasTransacciones)
  const fetchTodasTransacciones = useBancoStore(s => s.fetchTodasTransacciones)
  const eliminarTransaccion     = useBancoStore(s => s.eliminarTransaccion)

  const [expandido, setExpandido]     = useState(false)
  const [movEditando, setMovEditando] = useState(null)
  const [movConfirm, setMovConfirm]   = useState(null)
  const [eliminando, setEliminando]   = useState(false)

  useEffect(() => {
    if (todasTransacciones.length === 0) fetchTodasTransacciones()
  }, [cuenta])

  useEffect(() => { setExpandido(false); setMovConfirm(null) }, [cuenta?.id])

  const transacciones = todasTransacciones
    .filter(t => t.cuenta_id === cuenta.id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const visibles = expandido ? transacciones : transacciones.slice(0, LIMITE)
  const hayMas   = transacciones.length > LIMITE

  const fmt = (n) => Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2 })

  const handleEliminar = async (id) => {
    setEliminando(true)
    await eliminarTransaccion(id)
    setMovConfirm(null)
    setEliminando(false)
  }

  return (
    <div className="card movimientos-card">
      <p className="panel-title">📋 Movimientos recientes</p>

      {transacciones.length === 0 ? (
        <p className="mov-empty">Aún no hay movimientos para esta cuenta.</p>
      ) : (
        <>
          <div className="mov-lista">
            {visibles.map(t => {
              const esIngreso = t.tipo === 'ingreso'
              const confirmando = movConfirm === t.id

              return (
                <div key={t.id} className={`mov-fila ${confirmando ? 'confirmando' : ''}`}>
                  {confirmando ? (
                    <>
                      <span className="mov-confirm-txt">¿Eliminar este movimiento?</span>
                      <div className="mov-confirm-btns">
                        <button
                          className="mov-btn-cancel"
                          onClick={() => setMovConfirm(null)}
                          disabled={eliminando}
                        >Cancelar</button>
                        <button
                          className="mov-btn-delete"
                          onClick={() => handleEliminar(t.id)}
                          disabled={eliminando}
                        >{eliminando ? '...' : 'Eliminar'}</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`mov-dot ${esIngreso ? 'verde' : 'rojo'}`}>
                        {esIngreso ? '↑' : '↓'}
                      </div>
                      <div className="mov-info">
                        <span className="mov-desc">{t.descripcion || '—'}</span>
                        <span className="mov-fecha">{t.fecha}</span>
                      </div>
                      <div className="mov-derecha">
                        <span className={`mov-monto ${esIngreso ? 'verde' : 'rojo'}`}>
                          {esIngreso ? '+' : '-'}{fmt(t.monto)}
                        </span>
                        <span className={`chip ${esIngreso ? 'chip-green' : 'chip-red'}`} style={{ fontSize: 11 }}>
                          {t.tipo}
                        </span>
                      </div>
                      <div className="mov-acciones">
                        <button
                          className="mov-btn-accion editar"
                          onClick={() => setMovEditando(t)}
                          title="Editar"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="mov-btn-accion eliminar"
                          onClick={() => setMovConfirm(t.id)}
                          title="Eliminar"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {hayMas && (
            <button className="mov-toggle" onClick={() => setExpandido(e => !e)}>
              {expandido ? (
                <>Ver menos <span className="mov-chevron arriba">▲</span></>
              ) : (
                <>Ver {transacciones.length - LIMITE} más <span className="mov-chevron">▼</span></>
              )}
            </button>
          )}
        </>
      )}

      {movEditando && (
        <ModalEditarMovimiento
          transaccion={movEditando}
          onClose={() => setMovEditando(null)}
        />
      )}
    </div>
  )
}
