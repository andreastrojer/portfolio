// Framer lädt CMS-Daten stückweise mit "?range=von-bis" – das kann nur Framers eigener Server.
// Für die lokal gesicherten Dateien lädt dieses Zwischenstück die ganze Datei einmal
// und gibt die angefragten Stücke zurück. Verweise auf framerusercontent.com bleiben unberührt.
const LOCAL_PREFIX = '/assets-framerusercontent-com/'
const cache = new Map<string, Promise<Uint8Array>>()
const originalFetch = window.fetch.bind(window)

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const href = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const url = new URL(href, window.location.href)
  const range = url.searchParams.get('range')
  if (url.origin !== window.location.origin || !url.pathname.startsWith(LOCAL_PREFIX) || !range) {
    return originalFetch(input, init)
  }
  const fileUrl = url.origin + url.pathname
  if (!cache.has(fileUrl)) {
    cache.set(
      fileUrl,
      originalFetch(fileUrl).then(async (r) => {
        if (!r.ok) throw new Error(`Lokale CMS-Datei fehlt: ${fileUrl}`)
        return new Uint8Array(await r.arrayBuffer())
      }),
    )
  }
  const file = await cache.get(fileUrl)!
  const parts = range.split(',').map((p) => p.split('-').map(Number))
  const total = parts.reduce((n, [a, b]) => n + (b - a + 1), 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const [a, b] of parts) {
    out.set(file.subarray(a, b + 1), offset)
    offset += b - a + 1
  }
  return new Response(out, { status: 200 })
}
