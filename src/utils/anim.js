import { useEffect, useState } from 'react'

export function useInView(ref, options = { threshold: 0.15 }) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), options)
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, options])
  return inView
}

export function useTilt(ref, strength = 10) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`
    }
    const reset = () => { el.style.transform = 'rotateX(0deg) rotateY(0deg)' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', reset)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', reset) }
  }, [ref, strength])
}

export function animateCounter(el, to, duration = 1400) {
  let start = 0
  const t0 = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration)
    const v = Math.floor(start + (to - start) * p)
    el.textContent = v.toLocaleString()
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export function animateBars(container, max = 56) {
  const bars = container.querySelectorAll('span')
  bars.forEach((b, i) => {
    const h = Math.floor(Math.random() * max) + 12
    b.style.height = `${h}px`
    b.style.transition = 'height 800ms cubic-bezier(.2,.8,.2,1)'
    b.style.transitionDelay = `${i * 80}ms`
  })
}

export function startBarsLoop(container, max = 56, period = 1400) {
  const update = () => {
    const bars = container.querySelectorAll('span')
    bars.forEach((b, i) => {
      const h = Math.floor(Math.random() * max) + 12
      b.style.height = `${h}px`
      b.style.transition = 'height 800ms cubic-bezier(.2,.8,.2,1)'
      b.style.transitionDelay = `${i * 60}ms`
    })
  }
  update()
  const id = setInterval(update, period)
  return () => clearInterval(id)
}