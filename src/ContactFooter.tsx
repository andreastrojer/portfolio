import { useEffect, useRef, useState } from 'react'
import { lenis } from './smoothScroll'

// Footer = Kontakt (ersetzt die frühere Kontaktseite /contact und den Framer-Footer).
// Oben ein dunkelblaues Laufband „Nachricht schreiben ✦“ – das ganze Band öffnet eine E-Mail.
// Darunter vier Spalten: E-Mail · Profile · Lebenslauf · Standort (mit Ortszeit).
// Erreichbar über den Menüpunkt „Kontakt“ und /#kontakt – alte Links auf /contact landen hier.
const EMAIL = 'andreas.trojer@gmail.com'
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Anfrage über andreastrojer.at')}`
const CV = '/Lebenslauf_Andreas_Trojer.pdf?v=20261113'

const PROFILES = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreas-trojer-7981a0377/' },
  { label: 'GitHub', href: 'https://github.com/andreastrojer' },
  { label: 'GitLab', href: 'https://gitlab.com/trojera' },
]

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="cf__arrow">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

// Ortszeit in Seeboden (Österreich), läuft mit
const timeNow = () =>
  new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' }).format(new Date())

function LocalTime() {
  const [t, setT] = useState(timeNow)
  useEffect(() => {
    const id = window.setInterval(() => setT(timeNow()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return <>{t} Ortszeit</>
}

export default function ContactFooter() {
  const ref = useRef<HTMLElement>(null)

  // Inhalt erst einblenden, wenn der Footer ins Bild kommt
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Laufband-Text: 4× pro Hälfte, zwei gleiche Hälften → nahtlose Schleife
  const half = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="cf__band-item">
      Nachricht schreiben<span className="cf__band-star">✦</span>
    </span>
  ))

  return (
    <footer ref={ref} id="kontakt" className="cf">
      <a className="cf__band" href={MAILTO} aria-label={`Nachricht schreiben an ${EMAIL}`}>
        <span className="cf__band-track" aria-hidden="true">
          <span className="cf__band-half">{half}</span>
          <span className="cf__band-half">{half}</span>
        </span>
      </a>

      <div className="cf__grid cf__reveal">
        <div>
          <h6 className="cf__label">E-Mail</h6>
          <a className="cf__link" href={MAILTO}>
            {EMAIL}
          </a>
        </div>
        <div>
          <h6 className="cf__label">Profile</h6>
          {PROFILES.map((p) => (
            <a key={p.href} className="cf__link" href={p.href} target="_blank" rel="noopener">
              {p.label}
              <Arrow />
            </a>
          ))}
        </div>
        <div>
          <h6 className="cf__label">Lebenslauf</h6>
          <a className="cf__link" href={CV} target="_blank" rel="noopener">
            PDF öffnen
            <Arrow />
          </a>
        </div>
        <div>
          <h6 className="cf__label">Standort</h6>
          <p className="cf__text">Seeboden, Kärnten</p>
          <p className="cf__sub">
            <LocalTime />
          </p>
        </div>
      </div>

      <div className="cf__bottom">
        <span>© {new Date().getFullYear()} Andreas Trojer</span>
        <button type="button" onClick={() => lenis.scrollTo(0)}>
          Nach oben ↑
        </button>
      </div>
    </footer>
  )
}
