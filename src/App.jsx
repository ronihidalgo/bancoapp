import { useState } from 'react'
import ListaCuentas     from './components/ListaCuentas'
import FormTransaccion  from './components/FormTransaccion'
import TablaMovimientos from './components/TablaMovimientos'
import TarjetaSaldo     from './components/TarjetaSaldo'
import ResumenMes       from './components/ResumenMes'
import './App.css'

export default function App() {
  const [cuentaActiva, setCuentaActiva] = useState(null)

  return (
    <div className="app-wrapper">

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">banco<span>app</span></div>
        <div className="app-user">
          <span className="app-user-name">Mis finanzas</span>
          <div className="app-avatar">💰</div>
        </div>
      </header>

      {/* Cuentas */}
      <p className="section-label">Mis cuentas</p>
      <ListaCuentas onSelect={setCuentaActiva} cuentaActiva={cuentaActiva} />

      {/* Detalle de cuenta */}
      {cuentaActiva && (
        <>
          <TarjetaSaldo cuenta={cuentaActiva} />

          <div className="panel-grid">
            <div className="card">
              <p className="panel-title">
                ＋ Registrar movimiento
              </p>
              <FormTransaccion cuenta={cuentaActiva} />
            </div>
            <div className="card">
              <p className="panel-title">
                📊 Resumen del mes
              </p>
              <ResumenMes cuenta={cuentaActiva} />
            </div>
          </div>

          <TablaMovimientos cuenta={cuentaActiva} />
        </>
      )}

    </div>
  )
}
