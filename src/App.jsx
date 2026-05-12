import { useState } from 'react'
import ListaCuentas      from './components/ListaCuentas'
import FormTransaccion   from './components/FormTransaccion'
import TablaMovimientos  from './components/TablaMovimientos'
import TarjetaSaldo      from './components/TarjetaSaldo'
import ResumenMes        from './components/ResumenMes'
import Dashboard         from './components/Dashboard'
import ModalTransaccion  from './components/ModalTransaccion'
import Configuracion     from './components/Configuracion'
import Setup             from './pages/Setup'
import './App.css'

const TABS = ['Dashboard', 'Cuentas']

export default function App() {
  const [tab, setTab]           = useState('Dashboard')
  const [cuentaActiva, setCuentaActiva] = useState(null)
  const [modal, setModal]       = useState(null)
  const [config, setConfig]     = useState(false)

  // Ruta /setup para insertar cuentas iniciales
  if (window.location.pathname === '/setup') return <Setup />

  return (
    <div className="app-wrapper">

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">banco<span>app</span></div>
        <div className="app-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`app-tab ${tab === t ? 'activo' : ''}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>
        <div className="app-header-right">
          <button
            className="btn-config"
            onClick={() => setConfig(true)}
            title="Configuración"
            aria-label="Abrir configuración"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <div className="app-avatar">💰</div>
        </div>
      </header>

      {/* Botones de acción rápida */}
      <div className="acciones-rapidas">
        <button className="btn-accion ingreso" onClick={() => setModal('ingreso')}>
          <span className="btn-accion-icono">↑</span>
          Ingreso
        </button>
        <button className="btn-accion egreso" onClick={() => setModal('egreso')}>
          <span className="btn-accion-icono">↓</span>
          Egreso
        </button>
      </div>

      {/* Dashboard */}
      {tab === 'Dashboard' && <Dashboard />}

      {/* Cuentas */}
      {tab === 'Cuentas' && (
        <>
          <p className="section-label">Mis cuentas</p>
          <ListaCuentas onSelect={setCuentaActiva} cuentaActiva={cuentaActiva} />

          {cuentaActiva && (
            <>
              <TarjetaSaldo cuenta={cuentaActiva} />
              <div className="panel-grid">
                <div className="card">
                  <p className="panel-title">＋ Registrar movimiento</p>
                  <FormTransaccion cuenta={cuentaActiva} />
                </div>
                <div className="card">
                  <p className="panel-title">📊 Resumen del mes</p>
                  <ResumenMes cuenta={cuentaActiva} />
                </div>
              </div>
              <TablaMovimientos cuenta={cuentaActiva} />
            </>
          )}
        </>
      )}

      {/* Modal ingreso / egreso */}
      {modal && (
        <ModalTransaccion
          tipo={modal}
          onClose={() => setModal(null)}
        />
      )}

      {/* Panel de configuración */}
      {config && <Configuracion onClose={() => setConfig(false)} />}

    </div>
  )
}
