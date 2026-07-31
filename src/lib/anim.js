import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Every timeline in the app is built out of `.from()` tweens, which write their start
// state the moment the timeline is created. Building them in useLayoutEffect means that
// happens before paint — so nothing flashes at full opacity first, and if JS never runs
// the markup is simply visible as authored.
export function useTimeline(setup, deps = []) {
  const scope = useRef(null)

  useLayoutEffect(() => {
    if (reducedMotion()) return
    const ctx = gsap.context(setup, scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}

export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Shared reveal for the long-scroll content: each `[data-reveal-group]` fades up as a
// block when it reaches the viewport, then staggers its own `[data-reveal]` children.
// Groups must not nest — a group's querySelectorAll would swallow the inner one's items.
export function revealGroups(root) {
  gsap.utils.toArray(root.querySelectorAll('[data-reveal-group]')).forEach((group) => {
    const items = gsap.utils.toArray(group.querySelectorAll('[data-reveal]'))
    const tl = gsap.timeline({
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    })

    // clearProps hands the transform back to CSS once the reveal is done — several of
    // these cards lift on hover, and a leftover inline transform would outrank it.
    tl.from(group, { opacity: 0, y: 26, duration: 0.55, ease: 'power3.out', clearProps: 'all' })
    if (items.length) {
      tl.from(
        items,
        { opacity: 0, y: 14, duration: 0.45, stagger: 0.07, ease: 'power2.out', clearProps: 'all' },
        '-=0.3',
      )
    }
  })
}

export { gsap, ScrollTrigger }
