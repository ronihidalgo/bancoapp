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

    // Intentar parsear buscando "Compra" y "Venta" como contexto
    const compraM = html.match(/[Cc]ompra[\s\S]{0,80}?(\d{2,3}\.\d{2})/)
    const ventaM  = html.match(/[Vv]enta[\s\S]{0,80}?(\d{2,3}\.\d{2})/)

    if (compraM && ventaM) {
      const compra = parseFloat(compraM[1])
      const venta  = parseFloat(ventaM[1])
      if (compra >= 40 && compra <= 120 && venta >= 40 && venta <= 120) {
        return res.status(200).json({ compra, venta, fuente: 'BHD', ts: new Date().toISOString() })
      }
    }

    // Fallback: extraer todos los números en rango válido para DOP/USD, deduplicar y ordenar.
    // Compra (banco compra al cliente) < Venta (banco vende al cliente), siempre.
    const todos = [...html.matchAll(/(\d{2,3}\.\d{2})/g)]
      .map(m => parseFloat(m[1]))
      .filter(v => v >= 50 && v <= 100)

    const unicos = [...new Set(todos.map(n => n.toFixed(2)))]
      .map(Number)
      .sort((a, b) => a - b)

    if (unicos.length < 2) throw new Error('parse_failed')

    return res.status(200).json({
      compra: unicos[0],
      venta:  unicos[unicos.length - 1],
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
