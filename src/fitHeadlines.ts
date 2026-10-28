import { useEffect } from 'react'

// Auf dem Handy (< 810 px, Framer-Breakpoint „Phone“) große Überschriften so verkleinern,
// dass sie in eine Zeile passen. Desktop/Tablet bleiben unverändert.
// Läuft mehrmals nach dem Laden erneut, weil die Schrift „Geist“ auf der Live-Seite
// später nachlädt als die Seite selbst (sonst wird mit der schmaleren Ersatzschrift gemessen).
const PHONE_MAX = 809.98
const MIN_SIZE = 18
// Seitentitel nie größer als das (sonst wirken kurze Titel wie „LUMNI“ zu wuchtig)
const TITLE_MAX = 40

// Einzelne Überschriften
const SINGLE: [string, number][] = [
  ['[data-framer-name="Hero Headings"] [data-framer-name="Title"] h1', TITLE_MAX], // Projektdetail-Titel
  ['[data-framer-name="H1"] h1', TITLE_MAX], // „Umgesetzte Projekte“
  ['[data-framer-name="Headings & Button"] h2', 999], // „Arbeiten“
]
// füllt die verfügbare Breite genau aus (darf auch größer werden)
const FILL = ['[data-framer-name="Hero Name"] p, [data-framer-name="Hero Name"] h1']
// Gruppen: alle Zeilen bekommen dieselbe (kleinste nötige) Größe
const GROUPS = ['[data-framer-name="Service Section"] h1, [data-framer-name="Service Section"] h2']

function availableWidth(h: HTMLElement) {
  // breitester sichtbarer Inhaltsbereich um die Überschrift, nie breiter als der Bildschirm
  let box = h.parentElement
  let best = 0
  for (let i = 0; i < 6 && box; i++, box = box.parentElement) {
    const w = box.clientWidth
    if (w > best) best = w
    if (box.getAttribute('data-framer-name')?.includes('Section')) break
  }
  return Math.min(best, document.documentElement.clientWidth - 40)
}

function neededSize(h: HTMLElement): number | null {
  h.style.removeProperty('--framer-font-size')
  h.style.removeProperty('white-space')
  if (h.getBoundingClientRect().width === 0) return null
  const base = parseFloat(getComputedStyle(h).fontSize)
  const available = availableWidth(h)
  h.style.setProperty('white-space', 'nowrap')
  const needed = h.scrollWidth
  h.style.removeProperty('white-space')
  if (needed <= available) return base
  return Math.max(MIN_SIZE, Math.floor(base * (available / needed) * 0.94))
}

function apply(h: HTMLElement, base: number, size: number, max = 999) {
  size = Math.min(size, max)
  if (size >= base) return
  h.style.setProperty('--framer-font-size', `${size}px`, 'important')
  if (size > MIN_SIZE) h.style.setProperty('white-space', 'nowrap')
}

function fill(h: HTMLElement) {
  h.style.removeProperty('--framer-font-size')
  h.style.setProperty('white-space', 'nowrap')
  if (h.getBoundingClientRect().width === 0) return
  const base = parseFloat(getComputedStyle(h).fontSize)
  const available = Math.min(availableWidth(h), document.documentElement.clientWidth - 40)
  const size = Math.floor(base * (available / h.scrollWidth) * 0.98)
  h.style.setProperty('--framer-font-size', `${Math.min(size, 140)}px`, 'important')
}

function fit() {
  const phone = window.innerWidth <= PHONE_MAX
  for (const sel of FILL) {
    for (const h of document.querySelectorAll<HTMLElement>(sel)) {
      if (!phone) {
        h.style.removeProperty('--framer-font-size')
        h.style.removeProperty('white-space')
      } else fill(h)
    }
  }
  for (const [sel, max] of SINGLE) {
    for (const h of document.querySelectorAll<HTMLElement>(sel)) {
      if (!phone) {
        h.style.removeProperty('--framer-font-size')
        h.style.removeProperty('white-space')
        continue
      }
      const base = (h.style.removeProperty('--framer-font-size'), parseFloat(getComputedStyle(h).fontSize))
      const size = neededSize(h)
      if (size !== null) apply(h, base, size, max)
    }
  }
  for (const sel of GROUPS) {
    const list = [...document.querySelectorAll<HTMLElement>(sel)]
    if (!phone) {
      list.forEach((h) => (h.style.removeProperty('--framer-font-size'), h.style.removeProperty('white-space')))
      continue
    }
    const bases = list.map((h) => (h.style.removeProperty('--framer-font-size'), parseFloat(getComputedStyle(h).fontSize)))
    const sizes = list.map(neededSize).filter((s): s is number => s !== null)
    if (!sizes.length) continue
    const size = Math.min(...sizes)
    list.forEach((h, i) => apply(h, bases[i], size))
  }
}

export function useFitHeadlines(path: string) {
  useEffect(() => {
    let frame = 0
    const run = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fit)
    }
    const timers = [0, 150, 500, 1200, 2500, 4500].map((t) => window.setTimeout(run, t))
    window.addEventListener('resize', run)
    document.fonts?.addEventListener?.('loadingdone', run)
    document.fonts?.ready.then(run)
    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', run)
      document.fonts?.removeEventListener?.('loadingdone', run)
    }
  }, [path])
}
