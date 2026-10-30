import { useEffect, useState } from 'react'
import { ContactForm } from './framer/chunks/chunk-7A6ILFT3.js'

// Kontaktseite: dunkel (#101B21 wie der Hero-Verlauf), große Typo wie der Name im Hero,
// nummerierte Links wie die Ordner-Karten auf der Startseite, Formular in dunkel.
const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andreas-trojer-7981a0377/' },
  { label: 'GitHub', href: 'https://github.com/andreastrojer' },
  { label: 'GitLab', href: 'https://gitlab.com/trojera' },
  { label: 'Lebenslauf', href: '/Lebenslauf_Andreas_Trojer.pdf' },
]

const PATTERN = '/assets-framerusercontent-com/images/YoHwlzW0DngKFOXEK6rsGwIjaWg.svg'

const timeNow = () =>
  new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' }).format(new Date())

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

export default function ContactPage() {
  const [time, setTime] = useState(timeNow)
  useEffect(() => {
    const id = setInterval(() => setTime(timeNow()), 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="c-page">
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

      <div className="c-meta">
        <span>Kontakt</span>
        <span>
          Seeboden, Kärnten · <time>{time}</time>
        </span>
      </div>

      <h1 className="c-big">
        Schreib{' '}
        <br className="c-br" />
        mir.
      </h1>

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
          {/* helle Karte auf dunklem Grund – das Formular sticht klar heraus */}
          <ContactForm accent="rgb(16, 27, 33)" accentInk="rgb(228, 231, 237)" />
        </div>
      </div>

      <div className="c-bottom">
        <span>© {new Date().getFullYear()} Andreas Trojer</span>
        <span>andreastrojer.at</span>
      </div>
    </div>
  )
}
