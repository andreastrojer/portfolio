import { ContactForm } from './framer/chunks/chunk-7A6ILFT3.js'

// Eigene Kontaktseite: gleicher blauer Header wie die Projektseiten, darunter
// links kurzer Einstieg + Links, rechts das bestehende Kontaktformular (FormSubmit).
const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreas-trojer-7981a0377/' },
  { label: 'GitHub', href: 'https://github.com/andreastrojer' },
  { label: 'GitLab', href: 'https://gitlab.com/trojera' },
  { label: 'Lebenslauf (PDF)', href: '/Lebenslauf_Andreas_Trojer.pdf' },
]

const PATTERN = '/assets-framerusercontent-com/images/YoHwlzW0DngKFOXEK6rsGwIjaWg.svg'

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

export default function ContactPage() {
  return (
    <div className="c-page">
      <header className="c-head">
        <svg className="c-head__pattern" viewBox="0 0 249 287" aria-hidden="true">
          <defs>
            <filter id="c-mono" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="0.6" result="inner" />
              <feComposite in="SourceAlpha" in2="inner" operator="out" result="ring" />
              <feFlood floodColor="rgba(228, 231, 237, 0.4)" result="tint" />
              <feComposite in="tint" in2="ring" operator="in" />
            </filter>
          </defs>
          <image href={PATTERN} x="0" y="0" width="249" height="287" filter="url(#c-mono)" />
        </svg>
        <h1 className="c-head__title">Kontakt</h1>
      </header>

      <section className="c-body">
        <div className="c-intro">
          <p className="c-label">Schreib mir</p>
          <h2 className="c-title">
            Du hast ein Projekt
            <br />
            im Kopf?
          </h2>
          <p className="c-text">Website, Web-App, Praktikum oder einfach eine Frage – ich melde mich bei dir.</p>
          <ul className="c-links">
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
        <div className="c-form">
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
