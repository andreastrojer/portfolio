// Die blauen Linien hinter der Person bewegen sich auf allen Geräten von selbst –
// ruhig und harmonisch in wechselnde Richtungen. Bewegt jemand am Laptop/Desktop die
// Maus über das Bild, folgen die Linien kurz der Maus und laufen danach wieder automatisch.
// Funktioniert, indem wir der Framer-Komponente (HeroLineTrail) sanfte Zeigerbewegungen
// entlang einer überlagerten Sinuskurve schicken.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

let root: HTMLElement | null = null
let t = 0
let last = 0
let userUntil = 0

const findRoot = () => {
  if (root?.isConnected) return root
  root = document.querySelector<HTMLElement>('main[data-page="home"] [data-framer-name="Hero Section"] canvas')
    ?.parentElement ?? null
  return root
}

// echte Mausbewegung über dem Hero → Automatik kurz pausieren
window.addEventListener(
  'pointermove',
  (e) => {
    if (!e.isTrusted || e.pointerType !== 'mouse') return
    const el = findRoot()
    if (!el) return
    const r = el.getBoundingClientRect()
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)
      userUntil = performance.now() + 2500
  },
  { passive: true },
)

const step = (now: number) => {
  requestAnimationFrame(step)
  const dt = last ? Math.min(now - last, 50) / 1000 : 0
  last = now
  if (reduced.matches || document.hidden || now < userUntil) return
  const el = findRoot()
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r.bottom <= 0 || r.top >= innerHeight || r.width === 0) return
  // auf breiten Bildschirmen etwas langsamer, damit es ruhig bleibt
  t += dt * (r.width > 900 ? 1.1 : 1.6)
  const x = r.left + r.width * (0.5 + 0.43 * Math.sin(0.9 * t) + 0.04 * Math.sin(2.3 * t))
  const y = r.top + r.height * (0.34 + 0.22 * Math.sin(0.61 * t + 1.2) + 0.05 * Math.cos(1.7 * t))
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'mouse' }))
}

setTimeout(() => requestAnimationFrame(step), 1200)

export {}
