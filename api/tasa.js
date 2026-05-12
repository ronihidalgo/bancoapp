export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

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

    // Extraer precios en formato $XX.XX dentro del rango válido para DOP/USD (40–120)
    const precios = [...html.matchAll(/\$\s*(\d{2,3}\.\d{2})/g)]
      .map(m => parseFloat(m[1]))
      .filter(v => v >= 40 && v <= 120)

    if (precios.length < 2) throw new Error('parse_failed')

    // infodolar muestra compra primero, luego venta
    return res.status(200).json({
      compra: precios[0],
      venta:  precios[1],
      fuente: 'BHD',
      ts:     new Date().toISOString(),
    })
  } catch {
    // Fallback: tasa de mercado desde API pública gratuita
    try {
      const fb = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      const data = await fb.json()
      const venta = parseFloat(data.rates?.DOP?.toFixed(2))
      const compra = parseFloat((venta * 0.955).toFixed(2))
      return res.status(200).json({ compra, venta, fuente: 'mercado', ts: new Date().toISOString() })
    } catch {
      return res.status(502).json({ error: 'No se pudo obtener la tasa de cambio' })
    }
  }
}
