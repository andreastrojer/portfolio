import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import Navbar from './framer/navbar'
import { navigate } from './router'

// Navigation aus Framer, aber Öffnen/Schließen und die Links steuern wir selbst.
// Grund: Auf dem iPhone kommen Fingertipps bei Framers eigener Tap-Erkennung nicht
// zuverlässig an (Menü ließ sich nicht schließen, Links taten nichts).
const MENU = '[data-framer-name="Menu "], [data-framer-name="Menu Icon"]'

export default function Nav({ path }: { path: string }) {
  const [open, setOpenState] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const closedHeight = useRef(0)
  const animating = useRef(false)
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
  // nur Tablet & Handy – am Desktop animiert Framer selbst
  // Animiert wird die Box selbst (hat den Weichzeichner) – nicht der Rahmen drumherum,
  // sonst schaltet der Browser den Weichzeichner während der Animation kurz ab.
  const box = () =>
    ([...(ref.current?.querySelectorAll('nav') ?? [])].find((n) => n.getBoundingClientRect().width > 0) as
      | HTMLElement
      | undefined) || ref.current
  const custom = () => typeof window !== 'undefined' && window.innerWidth < 1200

  const openRef = useRef(false)
  openRef.current = open

  // Auf- und Zuklappen weich animieren (Framers Handy-Varianten springen sonst hart um)
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const prev = openRef.current
    const value = typeof next === 'function' ? next(prev) : next
    if (value === prev || animating.current) return
    const el = box()
    if (prev && !value && el && el.animate && custom()) {
      // Schließen: erst zuklappen, dann Variante wechseln
      const h = el.getBoundingClientRect().height
      const to = closedHeight.current || 74
      if (h > to + 4) {
        animating.current = true
        const anim = el.animate(
          [{ clipPath: 'inset(0 0 0 0 round 8px)' }, { clipPath: `inset(0 0 ${h - to}px 0 round 8px)` }],
          { duration: 320, easing: EASE, fill: 'forwards' },
        )
        anim.onfinish = () => {
          animating.current = false
          setOpenState(false)
          requestAnimationFrame(() => anim.cancel())
        }
        return
      }
    }
    setOpenState(value)
  }

  useLayoutEffect(() => {
    const el = box()
    if (!el) return
    const h = el.getBoundingClientRect().height
    if (!open) {
      closedHeight.current = h
      return
    }
    // Öffnen: von der geschlossenen Höhe aufklappen, Menüpunkte nacheinander einblenden
    const from = closedHeight.current || 74
    if (h > from + 4 && el.animate && custom()) {
      el.animate(
        [{ clipPath: `inset(0 0 ${h - from}px 0 round 8px)` }, { clipPath: 'inset(0 0 0 0 round 8px)' }],
        { duration: 520, easing: EASE },
      )
      const items = [...el.querySelectorAll<HTMLElement>('a, [data-framer-name="Nav Links & Place"] img')].filter(
        (n) => n.getBoundingClientRect().top > el.getBoundingClientRect().top + from - 8,
      )
      items.forEach((n, i) =>
        n.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
          duration: 420,
          delay: 90 + i * 45,
          easing: EASE,
          fill: 'backwards',
        }),
      )
    }
  }, [open])

  // bei Seitenwechsel schließen
  useEffect(() => setOpenState(false), [path])

  // Tippen außerhalb schließt das Menü
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('click', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  // Framers eigene Tap-Logik nicht auslösen (sonst Doppel-Umschalten)
  const swallow = (e: PointerEvent) => {
    const t = e.target as HTMLElement
    if (t.closest(MENU) || t.closest('a')) e.stopPropagation()
  }

  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement
    const a = t.closest('a')
    if (a) {
      const href = a.getAttribute('href') || ''
      const internal = href.startsWith('/') || href.startsWith('./') || href.startsWith('#')
      setOpen(false)
      if (internal && a.target !== '_blank') {
        e.preventDefault()
        e.stopPropagation()
        navigate(new URL(href, window.location.href).pathname + new URL(href, window.location.href).hash)
      }
      return
    }
    if (t.closest(MENU)) {
      e.preventDefault()
      e.stopPropagation()
      setOpen((o) => !o)
    }
  }

  return (
    <div
      ref={ref}
      className="nav-shell"
      data-open={open ? 'true' : 'false'}
      onClickCapture={onClick}
      onPointerDownCapture={swallow}
      onPointerUpCapture={swallow}
    >
      <Navbar.Responsive
        style={{ width: '100%' }}
        variants={
          {
            base: open ? 'Tablet & Mobile / Opened' : 'Tablet & Mobile Closed',
            xl: open ? 'Desktop Opened' : 'Desktop / Closed',
          } as any
        }
      />
    </div>
  )
}
