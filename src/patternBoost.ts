// Handy: das AJ-Muster rechts im Header (Übersicht + Detail) ist dort deutlich kleiner,
// darum die Kontur etwas kräftiger zeichnen, damit es gut sichtbar bleibt.
const phone = window.matchMedia('(max-width: 809.98px)')
let queued = false

const apply = () => {
  queued = false
  if (!phone.matches) return
  document.querySelectorAll('main filter[id^="mono"], #c-mono').forEach((f) => {
    const m = f.querySelector('feMorphology')
    if (m && m.getAttribute('radius') !== '1.6') m.setAttribute('radius', '1.6')
    const fl = f.querySelector('feFlood')
    if (fl && fl.getAttribute('flood-color') !== 'rgba(228, 231, 237, 0.5)')
      fl.setAttribute('flood-color', 'rgba(228, 231, 237, 0.5)')
  })
}

new MutationObserver(() => {
  if (!queued) {
    queued = true
    requestAnimationFrame(apply)
  }
}).observe(document.body, { childList: true, subtree: true })
apply()

export {}
