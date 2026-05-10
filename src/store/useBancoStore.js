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
      set((state) => {
        // Actualiza transacciones (vista por cuenta) solo si la cuenta activa coincide
        const txActuales = state.transacciones
        const mismaCuenta = txActuales.some(t => t.cuenta_id === nueva.cuenta_id)
          || txActuales.length === 0
        return {
          transacciones: mismaCuenta
            ? [data, ...txActuales.filter(t => t.cuenta_id === nueva.cuenta_id)]
            : txActuales,
          todasTransacciones: [data, ...state.todasTransacciones],
        }
      })
    }
  },

  calcularSaldo: (cuenta) => {
    const txs      = get().transacciones
    const ingresos = txs.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + Number(t.monto), 0)
    const gastos   = txs.filter(t => t.tipo === 'gasto').reduce((a, t) => a + Number(t.monto), 0)
    return Number(cuenta.saldo_inicial) + ingresos - gastos
  },

  calcularSaldoCuenta: (cuenta) => {
    const txs      = get().todasTransacciones.filter(t => t.cuenta_id === cuenta.id)
    const ingresos = txs.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + Number(t.monto), 0)
    const gastos   = txs.filter(t => t.tipo === 'gasto').reduce((a, t) => a + Number(t.monto), 0)
    return Number(cuenta.saldo_inicial) + ingresos - gastos
  },

  getDashboardData: () => {
    const { cuentas, todasTransacciones, calcularSaldoCuenta } = get()

    // Clasificar cuentas por tipo
    // tipo: 'banco' | 'tarjeta' | 'prestado' | 'efectivo'
    // Si no tiene tipo, se infiere por nombre (efectivo) o se pone banco
    const clasif = (c) => {
      if (c.tipo) return c.tipo
      const n = c.nombre.toLowerCase()
      if (n.includes('efectivo') || n.includes('cash')) return 'efectivo'
      return 'banco'
    }

    const bancos    = cuentas.filter(c => clasif(c) === 'banco')
    const tarjetas  = cuentas.filter(c => clasif(c) === 'tarjeta')
    const prestados = cuentas.filter(c => clasif(c) === 'prestado')
    const efectivo  = cuentas.filter(c => clasif(c) === 'efectivo')

    const saldosPor = {}
    cuentas.forEach(c => { saldosPor[c.id] = calcularSaldoCuenta(c) })

    // Solo cuentas banco + efectivo para el total disponible
    const disponibles = [...bancos, ...efectivo]
    const totalRD  = disponibles.filter(c => c.moneda !== 'USD').reduce((a, c) => a + saldosPor[c.id], 0)
    const totalUSD = disponibles.filter(c => c.moneda === 'USD').reduce((a, c) => a + saldosPor[c.id], 0)

    const totalIngresos  = todasTransacciones.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + Number(t.monto), 0)
    const totalGastos    = todasTransacciones.filter(t => t.tipo === 'gasto').reduce((a, t) => a + Number(t.monto), 0)
    const netMovimientos = totalIngresos - totalGastos

    const cambioBalance = cuentas
      .filter(c => c.moneda !== 'USD')
      .reduce((a, c) => a + (saldosPor[c.id] - Number(c.saldo_inicial)), 0)
    const cuadre = cambioBalance - netMovimientos

    return {
      bancos, tarjetas, prestados, efectivo, saldosPor,
      totalRD, totalUSD,
      totalIngresos, totalGastos, netMovimientos,
      cuadre,
    }
  },

}))
