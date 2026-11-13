import { useEffect, useRef } from 'react'
import { ContactForm } from './framer/chunks/chunk-7A6ILFT3.js'
import { lenis } from './smoothScroll'

// Footer = Kontakt (ersetzt die frühere Kontaktseite /contact und den Framer-Footer).
// Erreichbar über den Menüpunkt „Kontakt“ und /#kontakt – alte Links auf /contact landen hier.
const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreas-trojer-7981a0377/' },
  { label: 'GitHub', href: 'https://github.com/andreastrojer' },
  { label: 'GitLab', href: 'https://gitlab.com/trojera' },
  { label: 'Lebenslauf', href: '/Lebenslauf_Andreas_Trojer.pdf?v=20261031' },
]

const PATTERN = '/assets-framerusercontent-com/images/YoHwlzW0DngKFOXEK6rsGwIjaWg.svg'

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

export default function ContactFooter() {
  const ref = useRef<HTMLElement>(null)

  // Überschrift und Inhalt erst einblenden, wenn der Footer ins Bild kommt
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
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <footer ref={ref} id="kontakt" className="c-page c-footer">
      <svg className="c-pattern" viewBox="0 0 249 287" aria-hidden="true">
        <defs>
          <filter id="c-mono" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="erode" radius="0.6" result="inner" />
            <feComposite in="SourceAlpha" in2="inner" operator="out" result="ring" />
            <feFlood floodColor="rgba(228, 231, 237, 0.16)" result="tint" />
            <feComposite in="tint" in2="ring" operator="in" />
          </filter>
        </defs>
        <image href={PATTERN} x="0" y="0" width="249" height="287" filter="url(#c-mono)" />
      </svg>

      <h6 className="c-label">Kontakt</h6>
      <h2 className="c-big">
        Schreib{' '}
        <br className="c-br" />
        mir.
      </h2>

      <div className="c-grid">
        <ul className="c-links">
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener">
                <span className="c-num">0{i + 1}</span>
                <span className="c-name">{l.label}</span>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
        <div className="c-form">
          <ContactForm accent="rgb(16, 27, 33)" accentInk="rgb(228, 231, 237)" />
        </div>
      </div>

      <div className="c-bottom">
        <span>© {new Date().getFullYear()} Andreas Trojer</span>
        <button type="button" onClick={() => lenis.scrollTo(0)}>
          Nach oben ↑
        </button>
      </div>
    </footer>
  )
}
