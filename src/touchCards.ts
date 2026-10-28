// Projektkarten auf Touch-Geräten: 1. Tippen zeigt die Infos (schön eingeblendet),
// 2. Tippen auf dieselbe Karte öffnet das Projekt. Tippen woanders blendet die Infos aus.
const touch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

if (touch) {
  let armed: HTMLAnchorElement | null = null

  const setReveal = (a: HTMLAnchorElement | null, on: boolean) => {
    a?.querySelectorAll('[data-hover-reveal]').forEach((o) => o.setAttribute('data-hover-reveal', on ? 'on' : 'off'))
  }

  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
      const isCard = !!a?.querySelector('[data-hover-reveal]')
      if (!isCard) {
        if (armed) setReveal(armed, false)
        armed = null
        return
      }
      if (armed !== a) {
        e.preventDefault()
        e.stopPropagation()
        if (armed) setReveal(armed, false)
        armed = a
        setReveal(a, true)
        a!.setAttribute('data-tapped', 'true')
        return
      }
      armed = null // 2. Tippen: normal weiter zum Projekt
    },
    true,
  )
  // Framers Komponente blendet bei touchstart sofort ein – das übernehmen wir oben selbst
  document.addEventListener(
    'touchstart',
    () => {
      requestAnimationFrame(() => {
        document.querySelectorAll('a').forEach((a) => {
          if (a !== armed && a.querySelector('[data-hover-reveal="on"]')) setReveal(a as HTMLAnchorElement, false)
        })
      })
    },
    { passive: true, capture: true },
  )
}
export {}
