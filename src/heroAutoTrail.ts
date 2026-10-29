// Handy: die blauen Linien hinter der Person bewegen sich von selbst – ruhig und
// harmonisch in wechselnde Richtungen. Am Desktop folgen sie weiterhin dem Mauszeiger.
// Funktioniert, indem wir der Framer-Komponente (HeroLineTrail) sanfte Zeigerbewegungen
// entlang einer überlagerten Sinuskurve schicken.
const phone = window.matchMedia('(max-width: 809.98px)')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

let root: HTMLElement | null = null
let t = 0
let last = 0

const findRoot = () => {
  if (root?.isConnected) return root
  root = document.querySelector<HTMLElement>('main[data-page="home"] [data-framer-name="Hero Section"] canvas')
    ?.parentElement ?? null
  return root
}

const step = (now: number) => {
  requestAnimationFrame(step)
  const dt = last ? Math.min(now - last, 50) / 1000 : 0
  last = now
  if (!phone.matches || reduced.matches || document.hidden) return
  const el = findRoot()
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r.bottom <= 0 || r.top >= innerHeight || r.width === 0) return
  t += dt * 1.6
  // um die Person herum, mit leichten Schlenkern – wiederholt sich praktisch nie
  const x = r.left + r.width * (0.5 + 0.43 * Math.sin(0.9 * t) + 0.04 * Math.sin(2.3 * t))
  const y = r.top + r.height * (0.34 + 0.22 * Math.sin(0.61 * t + 1.2) + 0.05 * Math.cos(1.7 * t))
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'mouse' }))
}

setTimeout(() => {
  requestAnimationFrame(step)
}, 1200)

export {}
