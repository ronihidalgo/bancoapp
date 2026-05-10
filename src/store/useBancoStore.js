import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useBancoStore = create((set, get) => ({

  cuentas: [],
  transacciones: [],
  todasTransacciones: [],
  cargando: false,
  cargandoDashboard: false,

  fetchCuentas: async () => {
    set({ cargando: true })
    const { data, error } = await supabase
      .from('cuentas')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) set({ cuentas: data })
    set({ cargando: false })
  },

  fetchTransacciones: async (cuentaId) => {
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('cuenta_id', cuentaId)
      .order('fecha', { ascending: false })
    if (!error) set({ transacciones: data })
  },

  // Fetch ALL transactions from all accounts (for the dashboard)
  fetchTodasTransacciones: async () => {
    set({ cargandoDashboard: true })
    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
    if (!error) set({ todasTransacciones: data })
    set({ cargandoDashboard: false })
  },

  agregarTransaccion: async (nueva) => {
    const { data, error } = await supabase
      .from('transacciones')
      .insert([nueva])
      .select()
      .single()
    if (!error) {
      set((state) => ({
        transacciones: [data, ...state.transacciones],
        todasTransacciones: [data, ...state.todasTransacciones],
      }))
    }
  },

  // Calculate balance for a specific account using the per-account transactions
  calcularSaldo: (cuenta) => {
    const transacciones = get().transacciones
    const ingresos = transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((acc, t) => acc + Number(t.monto), 0)
    const gastos = transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((acc, t) => acc + Number(t.monto), 0)
    return Number(cuenta.saldo_inicial) + ingresos - gastos
  },

  // Calculate balance for any account using ALL transactions (used by dashboard)
  calcularSaldoCuenta: (cuenta) => {
    const todas = get().todasTransacciones
    const txs = todas.filter(t => t.cuenta_id === cuenta.id)
    const ingresos = txs.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + Number(t.monto), 0)
    const gastos   = txs.filter(t => t.tipo === 'gasto').reduce((a, t)   => a + Number(t.monto), 0)
    return Number(cuenta.saldo_inicial) + ingresos - gastos
  },

  // Dashboard aggregates
  getDashboardData: () => {
    const { cuentas, todasTransacciones, calcularSaldoCuenta } = get()

    // Group accounts by tipo (field we'll add to Supabase, fallback to 'banco')
    const bancos    = cuentas.filter(c => !c.tipo || c.tipo === 'banco')
    const tarjetas  = cuentas.filter(c => c.tipo === 'tarjeta')
    const prestados = cuentas.filter(c => c.tipo === 'prestado')

    // Per-account saldo
    const saldosPor = {}
    cuentas.forEach(c => { saldosPor[c.id] = calcularSaldoCuenta(c) })

    // Totals by currency for banco accounts
    const totalRD  = bancos.filter(c => c.moneda !== 'USD').reduce((a, c) => a + saldosPor[c.id], 0)
    const totalUSD = bancos.filter(c => c.moneda === 'USD').reduce((a, c) => a + saldosPor[c.id], 0)

    // Net ingresos - gastos (all accounts)
    const totalIngresos = todasTransacciones.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + Number(t.monto), 0)
    const totalGastos   = todasTransacciones.filter(t => t.tipo === 'gasto').reduce((a, t)   => a + Number(t.monto), 0)
    const netMovimientos = totalIngresos - totalGastos

    // Cuadre: change in balance vs registered movements (should be 0 if everything is recorded)
    const cambioBalance = cuentas
      .filter(c => c.moneda !== 'USD')
      .reduce((a, c) => a + (saldosPor[c.id] - Number(c.saldo_inicial)), 0)
    const cuadre = cambioBalance - netMovimientos

    return {
      bancos, tarjetas, prestados, saldosPor,
      totalRD, totalUSD,
      totalIngresos, totalGastos, netMovimientos,
      cuadre,
    }
  },

}))
