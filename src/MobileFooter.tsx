import { navigate } from './router'
import { lenis } from './smoothScroll'

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreas-trojer-7981a0377/' },
  { label: 'GitHub', href: 'https://github.com/andreastrojer' },
  { label: 'GitLab', href: 'https://gitlab.com/trojera' },
  { label: 'Lebenslauf (PDF)', href: '/Lebenslauf_Andreas_Trojer.pdf?v=20261031' },
]

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

// Footer nur fürs Handy (< 810 px) – Framers Footer bleibt für Tablet & Desktop.
export default function MobileFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="m-footer">
      <p className="m-footer__eyebrow">Kontakt</p>
      <h2 className="m-footer__title">
        Du hast ein
        <br />
        Projekt im Kopf?
      </h2>
      <a
        className="m-link m-footer__cta"
        href="/contact"
        onClick={(e) => {
          e.preventDefault()
          navigate('/contact')
        }}
      >
        Kontakt aufnehmen&nbsp;&nbsp;→
      </a>
      <ul className="m-footer__links">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener">
              {l.label}
              <Arrow />
            </a>
          </li>
        ))}
      </ul>
      <div className="m-footer__bottom">
        <span>© {year} Andreas Trojer</span>
        <button type="button" onClick={() => lenis.scrollTo(0, { duration: 1.4 })}>
          Nach oben ↑
        </button>
      </div>
    </footer>
  )
}
