// Lädt alle Bilder, Schriften und CMS-Daten, die der Framer-Export von
// framerusercontent.com bezieht, nach public/ herunter und stellt die Verweise
// auf diese lokalen Kopien um. Danach braucht die Seite Framers Server nicht mehr.
//
// Aufruf: node scripts/localize-assets.mjs   (läuft auch automatisch nach "pnpm run framer")
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..')
const SRC = path.join(ROOT, 'src', 'framer')
const ORIGIN = 'https://framerusercontent.com'
// Gleich lang wie ORIGIN (29 Zeichen) — wichtig, damit die binären CMS-Dateien gültig bleiben.
const LOCAL = '/assets-framerusercontent-com'
if (LOCAL.length !== ORIGIN.length) throw new Error('Präfix-Länge stimmt nicht')
const PUBLIC = path.join(ROOT, 'public', LOCAL.slice(1))

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  )
const codeFiles = walk(SRC).filter((f) => /\.(jsx?|css|ts|tsx)$/.test(f))

const URL_RE = /https:\/\/framerusercontent\.com\/(?:images|assets|third-party-assets)\/[^"'`\s)\\,]+/g
const assetUrls = new Set()
const cmsUrls = new Set()

for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8')
  for (const m of text.matchAll(URL_RE)) assetUrls.add(m[0].split('?')[0])
  // CMS-Daten:  new URL("./X.framercms", "https://framerusercontent.com/modules/.../X.js")
  for (const m of text.matchAll(/new URL\(\s*"([^"]+\.framercms)"\s*,\s*"(https:\/\/framerusercontent\.com\/modules\/[^"]+)"\s*\)/g)) {
    cmsUrls.add(new URL(m[1], m[2]).href.replace('/modules/', '/cms/'))
  }
}

async function download(url, { optimize = false } = {}) {
  const dest = path.join(PUBLIC, decodeURIComponent(new URL(url).pathname))
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest
  const isRaster = /\/images\/.+\.(jpe?g|png|webp|avif)$/i.test(url)
  // Riesige Originale (z. B. 6000 px) auf max. 2560 px verkleinert laden – für Web mehr als genug.
  const fetchUrl = optimize && isRaster ? `${url}?scale-down-to=2560` : url
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
      return dest
    } catch (err) {
      if (attempt === 3) {
        console.warn(`  ✗ ${url}: ${err.message}`)
        return null
      }
    }
  }
}

async function pool(items, size, fn) {
  const queue = [...items]
  let done = 0
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) {
        await fn(queue.shift())
        done++
        if (done % 20 === 0) console.log(`  ${done}/${items.length}`)
      }
    }),
  )
}

console.log(`CMS-Dateien: ${cmsUrls.size}`)
const cmsFiles = []
for (const url of cmsUrls) {
  const dest = await download(url)
  if (dest) cmsFiles.push(dest)
}
// Bild-URLs aus den CMS-Daten einsammeln und dort auf lokal umstellen (gleiche Byte-Länge).
for (const file of cmsFiles) {
  const buf = fs.readFileSync(file)
  const text = buf.toString('latin1')
  for (const m of text.matchAll(URL_RE)) assetUrls.add(m[0].split('?')[0])
  const patched = Buffer.from(text.split(ORIGIN).join(LOCAL), 'latin1')
  if (patched.length !== buf.length) throw new Error(`Länge geändert: ${file}`)
  fs.writeFileSync(file, patched)
}

console.log(`Bilder & Schriften: ${assetUrls.size}`)
await pool([...assetUrls], 6, (u) => download(u, { optimize: true }))

// Verweise im Code umstellen
let changed = 0
for (const file of codeFiles) {
  const before = fs.readFileSync(file, 'utf8')
  const after = before
    .replace(/https:\/\/framerusercontent\.com\/(images|assets|third-party-assets)\//g, `${LOCAL}/$1/`)
    // Basis-URL für CMS-Dateien muss absolut sein
    .replace(
      /"https:\/\/framerusercontent\.com\/modules\//g,
      `(typeof location !== "undefined" ? location.origin : "http://localhost") + "${LOCAL}/modules/`,
    )
  if (after !== before) {
    fs.writeFileSync(file, after)
    changed++
  }
}
console.log(`Fertig: ${changed} Dateien umgestellt, Dateien liegen in public${LOCAL}`)
