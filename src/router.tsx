import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { lenis } from './smoothScroll'
import { withPageTransition } from './pageTransition'

// Minimaler Client-Router: reicht für 5 Seiten, keine zusätzliche Abhängigkeit.
export function navigate(to: string) {
  const url = new URL(to, window.location.href)
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

export function usePathname() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path.replace(/\/+$/, '') || '/'
}
