// Startansicht (alle Geräte). Liegt über dem Framer-Hero (Foto + Linien bleiben),
// Framers eigener Name wird ausgeblendet. Größen je Gerät in index.css.
export default function MobileHero() {
  return (
    <div className="m-hero">
      <div className="m-hero__inner">
        <p className="m-hero__eyebrow">Web Development &amp; Design</p>
        <h1 className="m-hero__name">
          Andreas{' '}
          <br />
          Trojer
        </h1>
      </div>
    </div>
  )
}
