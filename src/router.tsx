import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { lenis } from './smoothScroll'
import { withPageTransition } from './pageTransition'
import { prettyPath } from './slugs'

// Sprungziele innerhalb einer Seite (/#ueber-mich, /#kontakt). Framer-Bereiche haben keine
// eigene id – daher hier über ihren Namen gefunden.
const TARGETS: Record<string, string> = {
  'ueber-mich': '[data-framer-name="About Section"]',
  kontakt: '#kontakt',
}
export function findTarget(hash: string) {
  const id = hash.replace(/^#/, '')
  if (!id) return null
  const sel = TARGETS[id]
  return (sel ? document.querySelector<HTMLElement>(sel) : null) ?? document.getElementById(id)
}
// Ziel kann nach einem Seitenwechsel erst ein paar Frames später da sein → kurz nachschauen
function scrollToHash(hash: string, immediate = false, tries = 30) {
  const el = findTarget(hash)
  if (el) lenis.scrollTo(el, { immediate })
  else if (tries > 0) requestAnimationFrame(() => scrollToHash(hash, immediate, tries - 1))
}

// Minimaler Client-Router: reicht für 5 Seiten, keine zusätzliche Abhängigkeit.
export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  url.pathname = prettyPath(url.pathname) // alte CMS-Slugs → schöne URL
  if (url.origin !== window.location.origin) {
    window.location.href = to
    return
  }
  // Kontakt ist keine eigene Seite mehr, sondern der Footer jeder Seite → dorthin scrollen
  if (url.pathname.replace(/\/+$/, '') === '/contact') {
    url.pathname = window.location.pathname
    url.search = window.location.search
    url.hash = '#kontakt'
  }
  if (url.pathname + url.search + url.hash === window.location.pathname + window.location.search + window.location.hash) {
    // gleiche Adresse nochmal angeklickt: trotzdem hinscrollen (Ziel bzw. nach oben)
    if (url.hash) scrollToHash(url.hash)
    else lenis.scrollTo(0)
    return
  }
  const samePage = url.pathname === window.location.pathname
  const go = () => {
    flushSync(() => {
      window.history.pushState({}, '', url.pathname + url.search + url.hash)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    if (url.hash) {
      scrollToHash(url.hash, !samePage)
    } else if (samePage) {
      lenis.scrollTo(0) // z. B. „Startseite“ auf der Startseite → weich nach oben
    } else {
      lenis.scrollTo(0, { immediate: true })
    }
  }
  // Nur echte Seitenwechsel animieren, Sprünge innerhalb der Seite nicht
  if (samePage) go()
  else withPageTransition(go)
}

// alte Adresse (z. B. /projects/bloom) in der Adresszeile still auf die neue umstellen
function fixAddress() {
  // alte Kontaktseite → Startseite, Footer (Kontakt)
  if (window.location.pathname.replace(/\/+$/, '') === '/contact') {
    window.history.replaceState(window.history.state, '', '/#kontakt')
  }
  const pretty = prettyPath(window.location.pathname)
  if (pretty !== window.location.pathname)
    window.history.replaceState(window.history.state, '', pretty + window.location.search + window.location.hash)
  return window.location.pathname
}

export function usePathname() {
  const [path, setPath] = useState(fixAddress)
  useEffect(() => {
    const onPop = () => setPath(fixAddress())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path.replace(/\/+$/, '') || '/'
}
