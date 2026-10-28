// Kleine Korrekturen am Framer-Export, die nach jedem "pnpm run framer" erneut angewendet werden.
import fs from 'node:fs'
import path from 'node:path'
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..')
const file = path.join(ROOT, 'src/framer/page-detailprojects.jsx')
let s = fs.readFileSync(file, 'utf8')
// Projektdetail-Header: Titel sofort zeigen statt erst nach dem Scrollen einzublenden
s = s.replace(
  /(__framer__styleAppearEffectEnabled=\{)true(\}[\s\S]{0,600}?data-framer-name=\{"Hero Headings"\})/,
  '$1false$2',
)
fs.writeFileSync(file, s)

// Projektdetail „Der Weg“: Bild (Image 4) nur zeigen, wenn im CMS eines hinterlegt ist –
// sonst zeigt Framer eine leere Fläche. Hat Framer schon eine Sichtbarkeits-Bedingung
// ("Bild 4 sichtbar"), wird isSet(...) dort ergänzt, sonst wird das Bild eingeklammert.
s = fs.readFileSync(file, 'utf8')
if (!s.includes('isSet(TTsZOLCba2)')) {
  const cond = /(\{[A-Za-z0-9_]+2 !== false && )\((\s*<Image1\s+suppressHydrationWarning=\{true\}\s+background=\{\{[\s\S]{0,600}?toResponsiveImage\(TTsZOLCba2\))/
  if (cond.test(s)) {
    s = s.replace(cond, '$1isSet(TTsZOLCba2) && ($2')
  } else {
    s = s.replace(
      /(\t*)<Image1(\s+suppressHydrationWarning=\{true\}\s+background=\{\{[\s\S]*?toResponsiveImage\(TTsZOLCba2\)[\s\S]*?\n\1\/>)/,
      '$1{isSet(TTsZOLCba2) && (<Image1$2)}',
    )
  }
}
fs.writeFileSync(file, s)

// Startseite: Hero-Bereich auf Desktop volle Bildschirmhöhe (100vh) wie auf der Live-Seite.
// Beim Umwandeln in eine Komponente hat Framer daraus feste 800px gemacht.
const homeFile = path.join(ROOT, 'src/framer/page-home.jsx')
let h = fs.readFileSync(homeFile, 'utf8')
const m = h.match(/className=\{"(framer-[a-z0-9]+)"\}\s*data-framer-name=\{"Hero Section"\}/)
if (m) {
  const cls = m[1]
  const re = new RegExp(`(\\.framer-[A-Za-z0-9]+ \\.${cls} \\{[^}]*?height: )800px`)
  h = h.replace(re, '$1calc(var(--framer-viewport-height, 100vh) * 1)')
  fs.writeFileSync(homeFile, h)
} else {
  console.warn('Hero Section auf der Startseite nicht gefunden – Höhe nicht angepasst')
}

// Startseite: "Lebenslauf herunterladen"-Button verlinkt auf die PDF in public/
// (Framer kann auf eine Datei außerhalb des Projekts nicht verlinken).
{
  const CV = '/Lebenslauf_Andreas_Trojer.pdf'
  let hp = fs.readFileSync(homeFile, 'utf8')
  if (!hp.includes(CV)) {
    hp = hp
      .replace(/(DVgymW1UZ: "Lebenslauf herunterladen[^"]*",)/g, `$1 lcgy4wTv3: "${CV}", S79CLCuIT: true,`)
      .replace(/(DVgymW1UZ=\{"Lebenslauf herunterladen[^"]*"\})/g, `$1 lcgy4wTv3={"${CV}"} S79CLCuIT={true}`)
    fs.writeFileSync(homeFile, hp)
  }
  if (!hp.includes(CV)) console.warn('Lebenslauf-Button nicht gefunden – erst "pnpm run framer" ausführen')
}

// Projekte-CMS: Chunk-Dateinamen ändern sich bei jedem Export → stabilen Verweis erzeugen
{
  const chunkDir = path.join(ROOT, 'src/framer/chunks')
  const hit = fs
    .readdirSync(chunkDir)
    .find((f) => f.endsWith('.js') && fs.readFileSync(path.join(chunkDir, f), 'utf8').includes('displayName: "Projects"'))
  if (hit) {
    fs.writeFileSync(
      path.join(ROOT, 'src/projectsCollection.js'),
      `// automatisch erzeugt von scripts/patch-export.mjs – nicht von Hand ändern\nexport { stdin_default as default } from './framer/chunks/${hit}'\n`,
    )
  } else {
    console.warn('Projekte-Collection im Export nicht gefunden')
  }
}

// Startseite: LinkedIn- und Lebenslauf-Button nebeneinander (Rahmen war "min-content" → untereinander)
{
  let hp = fs.readFileSync(homeFile, 'utf8')
  const m = hp.match(/className=\{"(framer-[a-z0-9]+)"\}\s*layoutDependency=\{layoutDependency\}\s*layoutId=\{"veFWJ7HBm"\}/)
  if (m) {
    const re = new RegExp(`(\\.framer-[A-Za-z0-9]+ \\.${m[1]} \\{[^}]*?)width: min-content;`)
    hp = hp.replace(re, '$1width: 100%;')
    fs.writeFileSync(homeFile, hp)
  }
}
console.log('Export-Korrekturen angewendet')
