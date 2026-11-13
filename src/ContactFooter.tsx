import { useEffect, useRef } from 'react'
import { ContactForm } from './framer/chunks/chunk-7A6ILFT3.js'
import { lenis } from './smoothScroll'

// Footer = Kontakt (ersetzt die frühere Kontaktseite /contact und den Framer-Footer).
// Gestaltung wie der Bereich „Kompetenzfelder“: hell, zentriert, große dunkelblaue Versalien.
// Erreichbar über den Menüpunkt „Kontakt“ und /#kontakt – alte Links auf /contact landen hier.
const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreas-trojer-7981a0377/' },
  { label: 'GitHub', href: 'https://github.com/andreastrojer' },
  { label: 'GitLab', href: 'https://gitlab.com/trojera' },
  { label: 'Lebenslauf', href: '/Lebenslauf_Andreas_Trojer.pdf?v=20261031' },
]

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

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

  return (
    <footer ref={ref} id="kontakt" className="cf">
      <div className="cf__inner">
        <div className="cf__reveal">
          <h6 className="cf__label">Kontakt</h6>
          <ul className="cf__links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener">
                  {l.label}
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="cf__form cf__reveal">
          <ContactForm accent="rgb(4, 0, 74)" accentInk="rgb(228, 231, 237)" />
        </div>

        <div className="cf__bottom">
          <span>© {new Date().getFullYear()} Andreas Trojer</span>
          <button type="button" onClick={() => lenis.scrollTo(0)}>
            Nach oben ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
