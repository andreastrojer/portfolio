import Lenis from 'lenis'

// Entspricht der Lenis-Komponente in Framer (smooth, vertikal, nicht endlos).
export const lenis = new Lenis({
  duration: 1.4, // Framer "Intensity 14"
  orientation: 'vertical',
  smoothWheel: true,
  infinite: false,
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
