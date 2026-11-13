import './framer/styles.css'

import { UnframerProvider } from 'unframer'
import { useEffect } from 'react'
import { findTarget, navigate, usePathname } from './router'

import Nav from './Nav'
import './touchCards'
import './heroAutoTrail'
import './patternBoost'
import PageHome from './framer/page-home'
import PageProjects from './framer/page-projects'
import ContactFooter from './ContactFooter'
import { lenis } from './smoothScroll'
import Page404 from './framer/page-404'
import ProjectDetail from './ProjectDetail'
import { toCmsSlug } from './slugs'
import { useFitHeadlines } from './fitHeadlines'
import MobileHero from './MobileHero'

const FULL = { style: { width: '100%' } } as const

const TITLES: Record<string, string> = {
  '/': 'Andreas Trojer',
  '/projects': 'Projekte – Andreas Trojer',
}

function Page({ path }: { path: string }) {
  if (path === '/') return <PageHome.Responsive {...FULL} />
  if (path === '/projects') return <PageProjects.Responsive {...FULL} />
  const m = path.match(/^\/projects\/([^/]+)$/)
  if (m) return <ProjectDetail slug={toCmsSlug(decodeURIComponent(m[1]))} />
  return <Page404.Responsive {...FULL} />
}

export default function App() {
  const path = usePathname()
  useFitHeadlines(path)
  useEffect(() => {
    document.title = TITLES[path] ?? 'Andreas Trojer'
    // iPhone: Statusleiste (Bereich um die Kamera) in der Farbe des oberen Seitenrands,
    // damit sie nahtlos ins Hero-Bild bzw. den blauen Header übergeht.
    const top = path === '/' ? '#bdc1ca' : path.startsWith('/projects') ? '#101b21' : '#e4e7ed'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', top)
    document.documentElement.style.backgroundColor = top
  }, [path])

  // Direkt mit Anker geöffnet (z. B. alte Adresse /contact → /#kontakt): nach dem Laden hinscrollen
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const t = window.setTimeout(() => {
      const el = findTarget(hash)
      if (el) lenis.scrollTo(el, { immediate: true })
    }, 600)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <UnframerProvider navigate={navigate}>
      {/* Navbar wie im Framer-Layout-Template: fixiert, oben mittig (Maße in index.css) */}
      <Nav path={path} />
      <main style={{ width: '100%' }} data-page={path === '/' ? 'home' : path === '/projects' ? 'projects' : path.startsWith('/projects/') ? 'detail' : path.slice(1)}>
        {path === '/' && <MobileHero />}
        <Page path={path} />
      </main>
      {/* Footer = Kontakt (ersetzt die frühere Kontaktseite) */}
      <ContactFooter />
    </UnframerProvider>
  )
}
