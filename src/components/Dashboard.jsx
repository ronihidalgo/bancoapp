import { useEffect } from 'react'
import { useBancoStore } from '../store/useBancoStore'
import './Dashboard.css'

const fmt = (n, decimals = 0) =>
  Number(n).toLocaleString('es-DO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export default function Dashboard() {
  const fetchCuentas             = useBancoStore(s => s.fetchCuentas)
  const fetchTodasTransacciones  = useBancoStore(s => s.fetchTodasTransacciones)
  const getDashboardData         = useBancoStore(s => s.getDashboardData)
  const cargandoDashboard        = useBancoStore(s => s.cargandoDashboard)
  const cuentas                  = useBancoStore(s => s.cuentas)
  const todasTransacciones       = useBancoStore(s => s.todasTransacciones)

  useEffect(() => {
    fetchCuentas()
    fetchTodasTransacciones()
  }, [])

  if (cargandoDashboard || cuentas.length === 0) {
    return (
      <div className="dash-loading">
        <div className="skeleton" style={{ height: 90 }} />
        <div className="skeleton" style={{ height: 90 }} />
        <div className="skeleton" style={{ height: 90 }} />
      </div>
    )
  }

  const {
    bancos, tarjetas, prestados, saldosPor,
    totalRD, totalUSD,
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
          <span className="metrica-label">Total US$</span>
          <span className="metrica-valor">US$ {fmt(totalUSD, 2)}</span>
        </div>
        <div className="metrica-card">
          <span className="metrica-label">Ingresos netos</span>
          <span className="metrica-valor verde">RD$ {fmt(netMovimientos)}</span>
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
      {bancos.length > 0 && (
        <section className="dash-seccion">
          <div className="seccion-header">
            <span className="seccion-titulo">🏦 Cuentas de banco</span>
            <span className="seccion-total">RD$ {fmt(bancos.filter(c => c.moneda !== 'USD').reduce((a,c) => a + saldosPor[c.id], 0))}</span>
          </div>
          <div className="cuentas-tabla">
            {bancos.map(c => {
              const saldo = saldosPor[c.id]
              const pos   = saldo >= 0
              return (
                <div key={c.id} className="tabla-fila">
                  <div className="tabla-nombre">
                    <div className="tabla-dot" style={{ background: c.color ? c.color + '22' : '#EEEDFE', color: c.color || '#534AB7' }}>
                      🏦
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
      )}

      {/* ── Tarjetas de crédito ── */}
      {tarjetas.length > 0 && (
        <section className="dash-seccion">
          <div className="seccion-header">
            <span className="seccion-titulo">💳 Tarjetas de crédito</span>
            <span className="seccion-total rojo">
              RD$ {fmt(tarjetas.reduce((a,c) => a + Math.abs(saldosPor[c.id]), 0))} adeudado
            </span>
          </div>
          <div className="cuentas-tabla">
            {tarjetas.map(c => {
              const saldo  = saldosPor[c.id]
              const limite = Number(c.limite || 0)
              const usado  = Math.abs(Math.min(saldo, 0))
              const pct    = limite > 0 ? Math.min((usado / limite) * 100, 100) : 0
              return (
                <div key={c.id} className="tabla-fila tarjeta-fila">
                  <div className="tabla-nombre">
                    <div className="tabla-dot" style={{ background: '#FCEBEB', color: '#A32D2D' }}>💳</div>
                    <div>
                      <span className="tabla-cuenta">{c.nombre}</span>
                      <span className="tabla-banco">{c.banco}</span>
                    </div>
                  </div>
                  <div className="tarjeta-detalle">
                    {limite > 0 && (
                      <>
                        <div className="tarjeta-barra-track">
                          <div className="tarjeta-barra-fill" style={{
                            width: `${pct}%`,
                            background: pct > 80 ? 'var(--red-bar)' : pct > 50 ? '#EF9F27' : 'var(--green-bar)'
                          }} />
                        </div>
                        <span className="tarjeta-pct">{Math.round(pct)}% usado</span>
                      </>
                    )}
                    <span className="tabla-saldo rojo">{c.moneda} {fmt(Math.abs(saldo), 2)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Prestado / Inversiones ── */}
      {prestados.length > 0 && (
        <section className="dash-seccion">
          <div className="seccion-header">
            <span className="seccion-titulo">📦 Prestado / Inversiones</span>
            <span className="seccion-total">RD$ {fmt(prestados.reduce((a,c) => a + saldosPor[c.id], 0))}</span>
          </div>
          <div className="cuentas-tabla">
            {prestados.map(c => {
              const saldo = saldosPor[c.id]
              const pos   = saldo >= 0
              return (
                <div key={c.id} className="tabla-fila">
                  <div className="tabla-nombre">
                    <div className="tabla-dot" style={{ background: '#FAEEDA', color: '#854F0B' }}>📦</div>
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
      )}

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
          <div
            className="barra-ing"
            style={{ width: `${(totalIngresos / (totalIngresos + totalGastos || 1)) * 100}%` }}
          />
          <div
            className="barra-gas"
            style={{ width: `${(totalGastos / (totalIngresos + totalGastos || 1)) * 100}%` }}
          />
        </div>
      </section>

    </div>
  )
}
