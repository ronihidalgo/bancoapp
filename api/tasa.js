export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  // 1. API confiable (actualiza cada hora, sin clave)
  try {
    const resp = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await resp.json()
    if (data.result !== 'success' || !data.rates?.DOP) throw new Error('no_dop')
    const venta  = parseFloat(data.rates.DOP.toFixed(2))
    const compra = parseFloat((venta * 0.9535).toFixed(2))
    return res.status(200).json({ compra, venta, fuente: 'mercado', ts: new Date().toISOString() })
  } catch { /* continuar */ }

  // 2. Scraper BHD (puede fallar si el sitio bloquea Vercel)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const resp = await fetch(
      'https://www.infodolar.com.do/precio-dolar-entidad-banco-bhd.aspx',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-DO,es;q=0.9',
        },
      }
    )
    clearTimeout(timeout)
    const html = await resp.text()

    const compraM = html.match(/[Cc]ompra[\s\S]{0,80}?(\d{2,3}\.\d{2})/)
    const ventaM  = html.match(/[Vv]enta[\s\S]{0,80}?(\d{2,3}\.\d{2})/)

    if (compraM && ventaM) {
      const compra = parseFloat(compraM[1])
      const venta  = parseFloat(ventaM[1])
      if (compra >= 50 && compra <= 100 && venta >= 50 && venta <= 100 && venta > compra) {
        return res.status(200).json({ compra, venta, fuente: 'BHD', ts: new Date().toISOString() })
      }
    }
  } catch { /* continuar */ }

  // 3. Último recurso
  try {
    const fb   = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await fb.json()
    const venta  = parseFloat(data.rates?.DOP?.toFixed(2))
    const compra = parseFloat((venta * 0.9535).toFixed(2))
    if (!venta) throw new Error('no_dop')
    return res.status(200).json({ compra, venta, fuente: 'mercado', ts: new Date().toISOString() })
  } catch {
    return res.status(502).json({ error: 'No se pudo obtener la tasa de cambio' })
  }
}
