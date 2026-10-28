// Exakter Nachbau des globalen Seitenübergangs aus deiner Framer-Seite
// (Website-Einstellungen → Transitions). Framer nutzt dafür die View-Transitions-API
// des Browsers; dieses CSS entspricht 1:1 dem, was Framer zur Laufzeit erzeugt.
//
// Exit (alte Seite):  opacity 1→0, y 0→-30%, Wipe 270° · 0,6 s · cubic-bezier(.73,0,.33,1)
// Enter (neue Seite): opacity 0→1, y 30%→0, Wipe 270° · 0,6 s · Verzögerung 0,5 s · cubic-bezier(.77,0,.175,1)
const STYLE_ID = 'view-transition-styles'
const CSS = `
@media (prefers-reduced-motion) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
::view-transition-old(*), ::view-transition-new(*) { mix-blend-mode: normal; }
::view-transition-old(*), ::view-transition-new(*) { backface-visibility: hidden; }

@property --vt-wipe-offset { syntax: '<number>'; initial-value: 0; inherits: false; }

@keyframes view-transition-exit {
  0%   { opacity: 1; transform: translate(0px, 0px) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg); --vt-wipe-offset: 0; }
  100% { opacity: 0; transform: translate(0px, -30%) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg); --vt-wipe-offset: 1; }
}
::view-transition-old(root) {
  animation-name: view-transition-exit;
  animation-duration: 0.6s;
  animation-delay: 0s;
  animation-timing-function: cubic-bezier(0.73, 0, 0.33, 1);
  animation-fill-mode: both;
  mask-image: linear-gradient(360deg, transparent calc(calc(0% - 0%) + calc(calc(100% + 0%) * var(--vt-wipe-offset))), black calc(calc(100% + 0%) * var(--vt-wipe-offset)));
  -webkit-mask-image: linear-gradient(360deg, transparent calc(calc(0% - 0%) + calc(calc(100% + 0%) * var(--vt-wipe-offset))), black calc(calc(100% + 0%) * var(--vt-wipe-offset)));
}

@keyframes view-transition-enter {
  0%   { opacity: 0; transform: translate(0px, 30%) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg); --vt-wipe-offset: 0; }
  100% { opacity: 1; transform: translate(0px, 0px) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg); --vt-wipe-offset: 1; }
}
::view-transition-new(root) {
  animation-name: view-transition-enter;
  animation-duration: 0.6s;
  animation-delay: 0.5s;
  animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  animation-fill-mode: both;
  mask-image: linear-gradient(360deg, black calc(calc(0% - 0%) + calc(calc(100% + 0%) * var(--vt-wipe-offset))), transparent calc(calc(100% + 0%) * var(--vt-wipe-offset)));
  -webkit-mask-image: linear-gradient(360deg, black calc(calc(0% - 0%) + calc(calc(100% + 0%) * var(--vt-wipe-offset))), transparent calc(calc(100% + 0%) * var(--vt-wipe-offset)));
}
`

export function withPageTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
  // Browser ohne View Transitions (z. B. ältere Firefox): wie in Framer ohne Animation wechseln
  if (!doc.startViewTransition) return update()
  document.getElementById(STYLE_ID)?.remove()
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
  try {
    let ran = false
    const transition = doc.startViewTransition(() => {
      ran = true
      update()
    })
    transition.finished.catch(() => {}).finally(() => style.remove())
    // Falls der Browser den Übergang verwirft, ohne die Seite zu wechseln: trotzdem wechseln
    ;(transition as any).ready?.catch?.(() => {
      if (!ran) update()
    })
  } catch {
    style.remove()
    update()
  }
}
