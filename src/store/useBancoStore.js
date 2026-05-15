import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useBancoStore = create((set, get) => ({

  cuentas: [],
  transacciones: [],
  todasTransacciones: [],
  cargando: false,
  cargandoDashboard: false,
  tasaVenta: 0,
  setTasaVenta: (v) => set({ tasaVenta: v }),

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
    return { error }
  },

  editarTransaccion: async (id, campos) => {
    const { error } = await supabase.from('transacciones').update(campos).eq('id', id)
    if (!error) {
      set(state => ({
        transacciones:      state.transacciones.map(t => t.id === id ? { ...t, ...campos } : t),
        todasTransacciones: state.todasTransacciones.map(t => t.id === id ? { ...t, ...campos } : t),
      }))
    }
    return { error }
  },

  eliminarTransaccion: async (id) => {
    const { error } = await supabase.from('transacciones').delete().eq('id', id)
    if (!error) {
      set(state => ({
        transacciones:      state.transacciones.filter(t => t.id !== id),
        todasTransacciones: state.todasTransacciones.filter(t => t.id !== id),
      }))
    }
    return { error }
  },

  agregarCuenta: async (nueva) => {
    // eslint-disable-next-line no-unused-vars
    const { limite, tipo, ...payload } = nueva
    const { data, error } = await supabase
      .from('cuentas')
      .insert([payload])
      .select()
      .single()
    if (!error) set(state => ({ cuentas: [...state.cuentas, { ...data, limite: nueva.limite ?? 0, tipo: nueva.tipo }] }))
    return { error }
  },

  editarCuenta: async (id, campos) => {
    // eslint-disable-next-line no-unused-vars
    const { limite, tipo, ...payload } = campos
    const { error } = await supabase
      .from('cuentas')
      .update(payload)
      .eq('id', id)
    if (!error) {
      set(state => ({
        cuentas: state.cuentas.map(c => c.id === id ? { ...c, ...campos } : c),
      }))
    }
    return { error }
  },

  eliminarCuenta: async (id) => {
    await supabase.from('transacciones').delete().eq('cuenta_id', id)
    const { error } = await supabase.from('cuentas').delete().eq('id', id)
    if (!error) {
      set(state => ({
        cuentas:            state.cuentas.filter(c => c.id !== id),
        transacciones:      state.transacciones.filter(t => t.cuenta_id !== id),
        todasTransacciones: state.todasTransacciones.filter(t => t.cuenta_id !== id),
      }))
    }
    return { error }
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
      if (n.includes('platino') || n.includes('platinum') || n.includes('black') ||
          n.includes('visa') || n.includes('master') || n.includes('tarjeta') ||
          n.includes('credito') || n.includes('crédito')) return 'tarjeta'
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
    const totalRD_base = disponibles.filter(c => c.moneda !== 'USD').reduce((a, c) => a + saldosPor[c.id], 0)
    const totalUSD     = disponibles.filter(c => c.moneda === 'USD').reduce((a, c) => a + saldosPor[c.id], 0)

    // Tarjetas USD: restar gasto neto convertido a DOP (gastos - ingresos desde saldo_inicial)
    const tasaVenta = get().tasaVenta || 0
    const tarjetasUSDenDOP = tasaVenta > 0
      ? tarjetas.filter(c => c.moneda === 'USD').reduce((a, c) => {
          const gastoNeto = Math.max(0, Number(c.saldo_inicial) - saldosPor[c.id])
          return a - gastoNeto * tasaVenta
        }, 0)
      : 0
    const totalRD = totalRD_base + tarjetasUSDenDOP

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
