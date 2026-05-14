export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  // 1. API interna del backend de BHD (Strapi) — fuente oficial
  try {
    const resp = await fetch(
      'https://backend.bhd.com.do/api/t-4-5s/1?populate=deep',
      { headers: { 'Accept': 'application/json' } }
    )
    const json = await resp.json()
    const rowdata = json?.data?.attributes?.table_body?.[0]?.rowdata
    if (!rowdata) throw new Error('no_rowdata')

    // rowdata[2] = compra, rowdata[3] = venta  (ej: "57.10 DOP")
    const compra = parseFloat(rowdata[2]?.headname)
    const venta  = parseFloat(rowdata[3]?.headname)

    if (compra >= 40 && compra <= 120 && venta > compra) {
      return res.status(200).json({ compra, venta, fuente: 'BHD', ts: new Date().toISOString() })
    }
    throw new Error('valores_invalidos')
  } catch { /* continuar */ }

  // 2. API de mercado (fallback)
  try {
    const resp = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await resp.json()
    if (data.result !== 'success' || !data.rates?.DOP) throw new Error('no_dop')
    const venta  = parseFloat(data.rates.DOP.toFixed(2))
    const compra = parseFloat((venta * 0.9535).toFixed(2))
    return res.status(200).json({ compra, venta, fuente: 'mercado', ts: new Date().toISOString() })
  } catch { /* continuar */ }

  // 3. Último recurso
  try {
    const fb   = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await fb.json()
    const venta  = parseFloat(data.rates?.DOP?.toFixed(2))
    if (!venta) throw new Error('no_dop')
    const compra = parseFloat((venta * 0.9535).toFixed(2))
    return res.status(200).json({ compra, venta, fuente: 'mercado', ts: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'No se pudo obtener la tasa de cambio' })
  }
}
