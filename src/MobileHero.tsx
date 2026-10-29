import { lenis } from './smoothScroll'

// Startansicht nur fürs Handy (< 810 px). Liegt über dem Framer-Hero (Foto + Linien bleiben),
// Framers eigener Name wird am Handy ausgeblendet – Desktop bleibt unverändert.
export default function MobileHero() {
  const toAbout = () => {
    const el = document.querySelector<HTMLElement>('[data-framer-name="About Section"]')
    if (el) lenis.scrollTo(el, { offset: -90, duration: 1.4 })
  }
  return (
    <div className="m-hero">
      <div className="m-hero__inner">
        <p className="m-hero__eyebrow">Web Development &amp; Design</p>
        <h1 className="m-hero__name">
          Andreas
          <br />
          Trojer
        </h1>
        <button type="button" className="m-link" onClick={toAbout}>
          Über mich&nbsp;&nbsp;↓
        </button>
      </div>
    </div>
  )
}
