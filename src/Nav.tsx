import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import Navbar from './framer/navbar'
import { flushSync } from 'react-dom'
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

  // Kompakt-Modus (nach dem Header): Nav rechts, nur Logo + Menüpunkt.
  // "wide" = Nav hat ihre volle Breite (offen oder gerade beim Auf-/Zuklappen) – bleibt dabei rechts.
  const [compact, setCompact] = useState(false)
  const compactRef = useRef(false)
  compactRef.current = compact
  const [wide, setWideState] = useState(false)
  const wideRef = useRef(false)
  wideRef.current = wide
  const checkRef = useRef<() => void>(() => {})

  // Auf- und Zuklappen weich animieren (Framers Handy-Varianten springen sonst hart um)
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const prev = openRef.current
    const value = typeof next === 'function' ? next(prev) : next
    if (value === prev || animating.current) return
    // Öffnen aus dem kompakten Zustand: erst nach links auf volle Breite aufziehen
    // (rechte Kante bleibt fix), danach den Inhalt aufklappen – sonst bricht der Text in 96 px um.
    if (value && compactRef.current && !wideRef.current) {
      animating.current = true
      setWideState(true)
      window.setTimeout(() => {
        animating.current = false
        setOpenState(true)
      }, 400)
      return
    }
    if (value) setWideState(true)
    const el = box()
    if (prev && !value && el && el.animate && custom()) {
      // Schließen: erst zuklappen, dann Variante wechseln
      const h = el.getBoundingClientRect().height
      const to = closedHeight.current || 74
      if (h > to + 4) {
        animating.current = true
        // Sichtbar bleibt immer nur der obere Streifen (von oben gemessen) – so blitzt
        // die offene Nav nicht noch einmal auf, wenn Framer danach umschaltet.
        const closedClip = `inset(0 0 calc(100% - ${to}px) 0 round 8px)`
        ref.current?.setAttribute('data-open', 'false') // Breite schon mit zuklappen
        const items = [...el.querySelectorAll<HTMLElement>('a, [data-framer-name="Nav Links & Place"] img')].filter(
          (n) => n.getBoundingClientRect().top > el.getBoundingClientRect().top + to - 8,
        )
        items.forEach((n) =>
          n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-out', fill: 'forwards' }),
        )
        const anim = el.animate([{ clipPath: 'inset(0 0 0% 0 round 8px)' }, { clipPath: closedClip }], {
          duration: 340,
          easing: EASE,
          fill: 'forwards',
        })
        anim.onfinish = () => {
          flushSync(() => setOpenState(false))
          setWideState(false) // erst jetzt wieder schmal werden
          // Clip erst lösen, wenn die Nav wirklich auf zugeklappter Höhe ist
          const start = performance.now()
          const wait = () => {
            const cur = box()
            const hh = cur?.getBoundingClientRect().height ?? 0
            if (hh <= to + 4 || performance.now() - start > 800) {
              anim.cancel()
              items.forEach((n) => n.getAnimations().forEach((a) => a.cancel()))
              animating.current = false
            } else requestAnimationFrame(wait)
          }
          requestAnimationFrame(wait)
        }
        return
      }
    }
    setOpenState(value)
    // Desktop schließt Framer selbst – danach wieder auf Kompakt-Breite
    if (!value) window.setTimeout(() => !openRef.current && setWideState(false), 350)
  }

  useLayoutEffect(() => {
    const el = box()
    if (!el) return
    const h = el.getBoundingClientRect().height
    if (!open) {
      // während des Zuklappens ist Framers Box evtl. noch hoch – dann nicht übernehmen
      if (!animating.current) closedHeight.current = h
      return
    }
    // Öffnen: von der geschlossenen Höhe aufklappen, Menüpunkte nacheinander einblenden
    const from = closedHeight.current || 74
    if (h > from + 4 && el.animate && custom()) {
      el.animate(
        [{ clipPath: `inset(0 0 calc(100% - ${from}px) 0 round 8px)` }, { clipPath: 'inset(0 0 0% 0 round 8px)' }],
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
  useEffect(() => {
    setOpenState(false)
    setWideState(false)
  }, [path])

  // Kompakt-Modus: Sobald das Ende des Headers (erster Bereich der Seite) erreicht ist,
  // gleitet die Nav nach rechts und schrumpft auf Logo + Menüpunkt (Maße in index.css).
  useEffect(() => {
    const header = () => {
      const list = document.querySelectorAll<HTMLElement>(
        'main [data-framer-name="Hero Section"], main section, main > *',
      )
      for (const el of list) {
        const r = el.getBoundingClientRect()
        if (r.height > 0 && r.width > 0) return el
      }
      return null
    }
    let frame = 0
    const check = () => {
      frame = 0
      if (openRef.current || wideRef.current) return // offenes Menü nicht verschieben
      const el = header()
      const end = el ? el.getBoundingClientRect().bottom : window.innerHeight - window.scrollY
      const navBottom = ref.current?.getBoundingClientRect().bottom ?? 80
      // kleiner Puffer, damit die Nav an der Kante nicht hin- und herspringt (z. B. iPhone-Nachfedern)
      setCompact((was) => (was ? end <= navBottom + 32 : end <= navBottom))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    checkRef.current = check
    check()
    const late = window.setTimeout(check, 400) // Seite rendert nach Seitenwechsel verzögert
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.clearTimeout(late)
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [path])

  // nach dem Schließen prüfen, ob die Nav (noch) kompakt sein soll
  useEffect(() => {
    if (!wide) checkRef.current()
  }, [wide])

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
    // kleine Nav: ganze Box ist ein Knopf – Framers eigene Links/Taps nicht auslösen
    if (compactRef.current && !openRef.current) {
      e.stopPropagation()
      return
    }
    if (t.closest(MENU) || t.closest('a')) e.stopPropagation()
  }

  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement
    // kleine Nav: Tippen irgendwo auf die Box öffnet sofort das ganze Menü (auch aufs Logo)
    if (compactRef.current && !openRef.current) {
      e.preventDefault()
      e.stopPropagation()
      setOpen(true)
      return
    }
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
      data-compact={compact ? 'true' : 'false'}
      data-wide={wide ? 'true' : 'false'}
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
