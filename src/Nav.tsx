import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import Navbar from './framer/navbar'
import { navigate } from './router'

// Navigation aus Framer, aber Öffnen/Schließen und die Links steuern wir selbst.
// Grund: Auf dem iPhone kommen Fingertipps bei Framers eigener Tap-Erkennung nicht
// zuverlässig an (Menü ließ sich nicht schließen, Links taten nichts).
const MENU = '[data-framer-name="Menu "], [data-framer-name="Menu Icon"]'

export default function Nav({ path }: { path: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // bei Seitenwechsel schließen
  useEffect(() => setOpen(false), [path])

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
