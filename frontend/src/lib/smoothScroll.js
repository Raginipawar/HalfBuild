import Lenis from 'lenis'

// One shared Lenis instance so the menu can pause scrolling while open.
export let lenis = null

export function startSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({ duration: 1.1 })
  const raf = (t) => {
    lenis.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}
