import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useBancoStore = create((set, get) => ({

  cuentas: [],
  transacciones: [],
  cargando: false,

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

  agregarTransaccion: async (nueva) => {
    const { data, error } = await supabase
      .from('transacciones')
      .insert([nueva])
      .select()
      .single()
    if (!error)
      set((state) => ({
        transacciones: [data, ...state.transacciones]
      }))
  },

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

}))