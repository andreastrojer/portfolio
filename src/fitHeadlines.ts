import { useEffect } from 'react'

// Auf dem Handy (< 810 px, Framer-Breakpoint „Phone“) große Seitenüberschriften
// so verkleinern, dass sie in eine Zeile passen. Desktop/Tablet bleiben unverändert.
const PHONE_MAX = 809.98
const MIN_SIZE = 18 // darunter lieber umbrechen als unlesbar klein
const SELECTORS = [
  // Projektdetail: Projekttitel im blauen Header
  '[data-framer-name="Hero Headings"] [data-framer-name="Title"] h1',
  // Projektübersicht: „Umgesetzte Projekte“
  '[data-framer-name="H1"] h1',
]

function fit() {
  const headings = SELECTORS.flatMap((s) => [...document.querySelectorAll<HTMLElement>(s)])
  for (const h of headings) {
    h.style.removeProperty('--framer-font-size')
    h.style.removeProperty('white-space')
    if (window.innerWidth > PHONE_MAX || h.getBoundingClientRect().width === 0) continue

    // verfügbare Breite = Breite des umgebenden Inhaltsbereichs
    let box = h.parentElement as HTMLElement | null
    while (box && box.getBoundingClientRect().width < 50) box = box.parentElement
    if (!box) continue
    const available = box.clientWidth

    const base = parseFloat(getComputedStyle(h).fontSize)
    h.style.setProperty('white-space', 'nowrap')
    const needed = h.scrollWidth
    if (needed <= available) {
      h.style.removeProperty('white-space')
      continue
    }
    const size = Math.floor(base * (available / needed) * 0.98)
    if (size >= MIN_SIZE) {
      h.style.setProperty('--framer-font-size', `${size}px`)
    } else {
      // zu lang für eine Zeile: auf Mindestgröße, dafür umbrechen
      h.style.setProperty('--framer-font-size', `${MIN_SIZE}px`)
      h.style.removeProperty('white-space')
    }
  }
}

export function useFitHeadlines(path: string) {
  useEffect(() => {
    let frame = 0
    const run = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fit)
    }
    // Inhalte (Schriften, CMS) laden etwas verzögert
    const timers = [0, 150, 600, 1500].map((t) => window.setTimeout(run, t))
    window.addEventListener('resize', run)
    document.fonts?.ready.then(run)
    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', run)
    }
  }, [path])
}
