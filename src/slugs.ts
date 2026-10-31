// Schöne Projekt-URLs. In den Framer-CMS-Daten stehen noch die alten Vorlagen-Slugs
// (bloom, haus, …) – die bleiben intern, nach außen zeigen wir die Namen hier.
// Neue/geänderte URL: einfach hier eintragen (links alt aus dem CMS, rechts neu).
export const SLUGS: Record<string, string> = {
  'koto-running': 'conversio',
  haus: 'racenotes',
  norde: 'xxx-zero',
  meridian: 'filmwebsite',
  arkfield: 'lumni',
  'forma-labs': 'broschuere',
  bloom: 'aureon',
}

const CMS_BY_PRETTY = Object.fromEntries(Object.entries(SLUGS).map(([cms, pretty]) => [pretty, cms]))

/** schöne URL → Slug im CMS (unbekannte bleiben, wie sie sind) */
export const toCmsSlug = (slug: string) => CMS_BY_PRETTY[slug] ?? slug

/** /projects/bloom → /projects/aureon (alles andere unverändert) */
export const prettyPath = (path: string) =>
  path.replace(/^\/projects\/([^/?#]+)/, (m, s: string) => (SLUGS[s] ? `/projects/${SLUGS[s]}` : m))

// Links im Seiteninhalt (Projektkarten aus Framer) auf die schönen URLs umschreiben,
// damit auch Hover-Vorschau und „Link kopieren“ die richtige Adresse zeigen.
const rewrite = () => {
  document.querySelectorAll<HTMLAnchorElement>('a[href*="projects/"]').forEach((a) => {
    const href = a.getAttribute('href') || ''
    const m = href.match(/^(?:\.?\/)?projects\/([^/?#]+)(.*)$/)
    if (m && SLUGS[m[1]]) a.setAttribute('href', `/projects/${SLUGS[m[1]]}${m[2]}`)
  })
}
let queued = false
new MutationObserver(() => {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    rewrite()
  })
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] })
rewrite()
