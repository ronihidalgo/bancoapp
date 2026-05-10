import { useState } from 'react'
import ListaCuentas      from './components/ListaCuentas'
import FormTransaccion   from './components/FormTransaccion'
import TablaMovimientos  from './components/TablaMovimientos'
import TarjetaSaldo      from './components/TarjetaSaldo'
import ResumenMes        from './components/ResumenMes'
import Dashboard         from './components/Dashboard'
import ModalTransaccion  from './components/ModalTransaccion'
import './App.css'

const TABS = ['Dashboard', 'Cuentas']

export default function App() {
  const [tab, setTab]               = useState('Dashboard')
  const [cuentaActiva, setCuentaActiva] = useState(null)
  const [modal, setModal]           = useState(null) // 'ingreso' | 'egreso' | null

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
        <div className="app-avatar">💰</div>
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

    </div>
  )
}
