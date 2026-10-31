import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { lenis } from './smoothScroll'
import { withPageTransition } from './pageTransition'
import { prettyPath } from './slugs'

// Minimaler Client-Router: reicht für 5 Seiten, keine zusätzliche Abhängigkeit.
export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  url.pathname = prettyPath(url.pathname) // alte CMS-Slugs → schöne URL
  if (url.origin !== window.location.origin) {
    window.location.href = to
    return
  }
  if (url.pathname + url.search + url.hash === window.location.pathname + window.location.search + window.location.hash) return
  const samePage = url.pathname === window.location.pathname
  const go = () => {
    flushSync(() => {
      window.history.pushState({}, '', url.pathname + url.search + url.hash)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    if (url.hash) {
      const el = document.getElementById(url.hash.slice(1))
      if (el) lenis.scrollTo(el, { immediate: !samePage })
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
