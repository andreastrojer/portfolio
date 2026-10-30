import './framer/styles.css'

import { UnframerProvider } from 'unframer'
import { useEffect } from 'react'
import { navigate, usePathname } from './router'

import Nav from './Nav'
import './touchCards'
import './heroAutoTrail'
import './patternBoost'
import Footer from './framer/footer'
import PageHome from './framer/page-home'
import PageProjects from './framer/page-projects'
import ContactPage from './ContactPage'
import Page404 from './framer/page-404'
import ProjectDetail from './ProjectDetail'
import { useFitHeadlines } from './fitHeadlines'
import MobileHero from './MobileHero'

const FULL = { style: { width: '100%' } } as const

const TITLES: Record<string, string> = {
  '/': 'Andreas Trojer',
  '/projects': 'Projekte – Andreas Trojer',
  '/contact': 'Kontakt – Andreas Trojer',
}

function Page({ path }: { path: string }) {
  if (path === '/') return <PageHome.Responsive {...FULL} />
  if (path === '/projects') return <PageProjects.Responsive {...FULL} />
  if (path === '/contact') return <ContactPage />
  const m = path.match(/^\/projects\/([^/]+)$/)
  if (m) return <ProjectDetail slug={decodeURIComponent(m[1])} />
  return <Page404.Responsive {...FULL} />
}

export default function App() {
  const path = usePathname()
  useFitHeadlines(path)
  useEffect(() => {
    document.title = TITLES[path] ?? 'Andreas Trojer'
    // iPhone: Statusleiste (Bereich um die Kamera) in der Farbe des oberen Seitenrands,
    // damit sie nahtlos ins Hero-Bild bzw. den blauen Header übergeht.
    const top = path === '/' ? '#bdc1ca' : path === '/contact' || path.startsWith('/projects') ? '#101b21' : '#e4e7ed'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', top)
    document.documentElement.style.backgroundColor = top
  }, [path])

  return (
    <UnframerProvider navigate={navigate}>
      {/* Navbar wie im Framer-Layout-Template: fixiert, oben mittig (Maße in index.css) */}
      <Nav path={path} />
      <main style={{ width: '100%' }} data-page={path === '/' ? 'home' : path === '/projects' ? 'projects' : path.startsWith('/projects/') ? 'detail' : path.slice(1)}>
        {path === '/' && <MobileHero />}
        <Page path={path} />
      </main>
      {/* Kontaktseite ohne Footer – der gleiche Inhalt steht dort schon */}
      {path !== '/contact' && (
        <>
          <div className="framer-footer">
            <Footer.Responsive
              style={{ width: '100%' }}
              variants={{ base: 'Mobile', md: 'Tabket', xl: 'Desktop' } as any}
            />
          </div>
        </>
      )}
    </UnframerProvider>
  )
}
