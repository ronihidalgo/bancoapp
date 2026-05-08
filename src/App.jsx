import { useState } from 'react'
import ListaCuentas     from './components/ListaCuentas'
import FormTransaccion  from './components/FormTransaccion'
import TablaMovimientos from './components/TablaMovimientos'
import TarjetaSaldo     from './components/TarjetaSaldo'

export default function App() {
  const [cuentaActiva, setCuentaActiva] = useState(null)

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:24 }}>
      <h1>BancoApp</h1>

      <h2>Mis cuentas</h2>
      <ListaCuentas onSelect={setCuentaActiva} />

      {cuentaActiva && (
        <>
          <h2 style={{ marginTop:32 }}>
            {cuentaActiva.nombre}
            <span style={{ fontSize:13, color:'#888', marginLeft:8 }}>
              {cuentaActiva.banco}
            </span>
          </h2>

          <TarjetaSaldo cuenta={cuentaActiva} />

          <h3>Registrar movimiento</h3>
          <FormTransaccion cuenta={cuentaActiva} />

          <h3 style={{ marginTop:24 }}>Movimientos</h3>
          <TablaMovimientos cuenta={cuentaActiva} />
        </>
      )}
    </div>
  )
}