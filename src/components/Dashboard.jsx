import { useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './Dashboard.css'

const fmt = (n, dec = 0) =>
  Number(n).toLocaleString('es-DO', { minimumFractionDigits: dec, maximumFractionDigits: dec })

function SeccionCuentas({ titulo, icono, cuentas, saldosPor, totalLabel, totalColor }) {
  if (cuentas.length === 0) return null

  const totalRD  = cuentas.filter(c => c.moneda !== 'USD').reduce((a, c) => a + saldosPor[c.id], 0)
  const totalUSD = cuentas.filter(c => c.moneda === 'USD').reduce((a, c) => a + saldosPor[c.id], 0)

  return (
    <section className="dash-seccion">
      <div className="seccion-header">
        <span className="seccion-titulo">{icono} {titulo}</span>
        <div style={{ display:'flex', gap:10 }}>
          {totalRD  !== 0 && <span className="seccion-total" style={{ color: totalColor }}>RD$ {fmt(totalRD)}</span>}
          {totalUSD !== 0 && <span className="seccion-total" style={{ color: totalColor }}>US$ {fmt(totalUSD,2)}</span>}
        </div>
      </div>
      <div className="cuentas-tabla">
        {cuentas.map(c => {
          const saldo = saldosPor[c.id]
          const pos   = saldo >= 0
          return (
            <div key={c.id} className="tabla-fila">
              <div className="tabla-nombre">
                <div className="tabla-dot" style={{ background: c.color ? c.color + '22' : '#EEEDFE', color: c.color || '#534AB7' }}>
                  {icono}
                </div>
                <div>
                  <span className="tabla-cuenta">{c.nombre}</span>
                  <span className="tabla-banco">{c.banco}</span>
                </div>
              </div>
              <span className={`tabla-saldo ${pos ? 'verde' : 'rojo'}`}>
                {c.moneda} {fmt(saldo, 2)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SeccionTarjetas({ tarjetas, saldosPor }) {
  if (tarjetas.length === 0) return null

  // adeudado = gastos - ingresos desde el saldo inicial (independiente de saldo_inicial)
  const adeudado = (c) => Math.max(0, Number(c.saldo_inicial) - saldosPor[c.id])

  const totalDOP = tarjetas.filter(c => c.moneda !== 'USD').reduce((a, c) => a + adeudado(c), 0)
  const totalUSD = tarjetas.filter(c => c.moneda === 'USD').reduce((a, c) => a + adeudado(c), 0)

  return (
    <section className="dash-seccion">
      <div className="seccion-header">
        <span className="seccion-titulo">💳 Tarjetas de crédito</span>
        <div style={{ display:'flex', gap:10 }}>
          {totalDOP > 0 && <span className="seccion-total rojo">RD$ {fmt(totalDOP)} adeudado</span>}
          {totalUSD > 0 && <span className="seccion-total rojo">US$ {fmt(totalUSD, 2)} adeudado</span>}
          {totalDOP === 0 && totalUSD === 0 && <span className="seccion-total rojo">RD$ 0 adeudado</span>}
        </div>
      </div>
      <div className="cuentas-tabla">
        {tarjetas.map(c => {
          const usado    = adeudado(c)
          const limite   = Number(c.limite || 0)
          const pct      = limite > 0 ? Math.min((usado / limite) * 100, 100) : 0
          const barColor = pct > 80 ? 'var(--red-bar)' : pct > 50 ? '#EF9F27' : 'var(--green-bar)'

          return (
            <div key={c.id} className="tabla-fila tarjeta-fila">
              <div className="tabla-nombre">
                <div className="tabla-dot" style={{ background:'#FCEBEB', color:'#A32D2D' }}>💳</div>
                <div>
                  <span className="tabla-cuenta">{c.nombre}</span>
                  <span className="tabla-banco">{c.banco}</span>
                </div>
              </div>
              <div className="tarjeta-detalle">
                {limite > 0 && (
                  <>
                    <div className="tarjeta-barra-track">
                      <div className="tarjeta-barra-fill" style={{ width:`${pct}%`, background: barColor }} />
                    </div>
                    <span className="tarjeta-pct">{Math.round(pct)}% usado</span>
                  </>
                )}
                <span className="tabla-saldo rojo">{c.moneda} {fmt(usado, 2)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Dashboard() {
  const fetchCuentas            = useBancoStore(s => s.fetchCuentas)
  const fetchTodasTransacciones = useBancoStore(s => s.fetchTodasTransacciones)
  const getDashboardData        = useBancoStore(s => s.getDashboardData)
  const cargandoDashboard       = useBancoStore(s => s.cargandoDashboard)
  const cuentas                 = useBancoStore(s => s.cuentas)
  // Suscripción necesaria: re-renderiza cuando cambian las transacciones
  useBancoStore(s => s.todasTransacciones)

  useEffect(() => {
    fetchCuentas()
    fetchTodasTransacciones()
  }, [])

  if (cargandoDashboard || cuentas.length === 0) {
    return (
      <div className="dash-loading">
        {[90,90,160,120].map((h,i) => (
          <div key={i} className="skeleton" style={{ height: h }} />
        ))}
      </div>
    )
  }

  const {
    bancos, tarjetas, prestados, efectivo, saldosPor,
    totalRD, disponible,
    totalIngresos, totalGastos, netMovimientos,
    cuadre,
  } = getDashboardData()

  const cuadreCero = Math.abs(cuadre) < 0.01

  return (
    <div className="dashboard">

      {/* ── Métricas principales ── */}
      <div className="dash-metricas">
        <div className="metrica-card">
          <span className="metrica-label">Total RD$</span>
          <span className="metrica-valor">RD$ {fmt(totalRD)}</span>
        </div>
        <div className="metrica-card">
          <span className="metrica-label">Disponible</span>
          <span className="metrica-valor" style={{ color: disponible >= 0 ? 'inherit' : 'var(--red-text)' }}>
            RD$ {fmt(disponible)}
          </span>
        </div>
        <div className="metrica-card">
          <span className="metrica-label">Ingresos − Gastos</span>
          <span className="metrica-valor" style={{ color: netMovimientos >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
            {netMovimientos >= 0 ? '+' : ''}RD$ {fmt(netMovimientos, 2)}
          </span>
        </div>
        <div className={`metrica-card cuadre ${cuadreCero ? 'ok' : 'alerta'}`}>
          <span className="metrica-label">Cuadre</span>
          <span className="metrica-valor" style={{ color: cuadreCero ? 'var(--green-text)' : 'var(--red-text)' }}>
            RD$ {fmt(Math.abs(cuadre), 2)}
          </span>
          <span className="cuadre-badge">
            {cuadreCero ? '✓ Todo cuadrado' : '⚠ Revisar'}
          </span>
        </div>
      </div>

      {/* ── Cuentas de banco ── */}
      <SeccionCuentas
        titulo="Cuentas de banco"
        icono="🏦"
        cuentas={bancos}
        saldosPor={saldosPor}
      />

      {/* ── Efectivo ── */}
      <SeccionCuentas
        titulo="Efectivo"
        icono="💵"
        cuentas={efectivo}
        saldosPor={saldosPor}
        totalColor="var(--amber-text)"
      />

      {/* ── Tarjetas de crédito ── */}
      <SeccionTarjetas tarjetas={tarjetas} saldosPor={saldosPor} />

      {/* ── Prestado / Inversiones ── */}
      <SeccionCuentas
        titulo="Prestado / Inversiones"
        icono="📦"
        cuentas={prestados}
        saldosPor={saldosPor}
      />

      {/* ── Ingresos vs Gastos ── */}
      <section className="dash-seccion">
        <div className="seccion-header">
          <span className="seccion-titulo">📊 Ingresos vs Gastos</span>
        </div>
        <div className="ing-gas-grid">
          <div className="ing-gas-card verde">
            <span className="ig-label">Ingresos totales</span>
            <span className="ig-valor">RD$ {fmt(totalIngresos)}</span>
          </div>
          <div className="ing-gas-card rojo">
            <span className="ig-label">Gastos totales</span>
            <span className="ig-valor">RD$ {fmt(totalGastos)}</span>
          </div>
        </div>
        <div className="barra-doble">
          <div className="barra-ing" style={{ width:`${(totalIngresos/(totalIngresos+totalGastos||1))*100}%` }} />
          <div className="barra-gas" style={{ width:`${(totalGastos/(totalIngresos+totalGastos||1))*100}%` }} />
        </div>
      </section>

    </div>
  )
}
