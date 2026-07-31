import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Chars, Words } from '../lib/Split'
import { gsap, useTimeline } from '../lib/anim'

export default function CongratsScreen({ onContinue }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current;
    const fire = confetti.create(canvas, { resize: true, useWorker: true });
    const colors = ['#2dd4bf', '#34d399', '#f5b354', '#f472b6', '#ffffff'];

    fire({ particleCount: 160, spread: 100, startVelocity: 55, origin: { y: 0.6 }, colors });

    const end = Date.now() + 4500;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      fire({
        particleCount: 45,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      fire({
        particleCount: 45,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
        colors,
      });
    }, 300);

    const burstTimeout = setTimeout(() => {
      fire({
        particleCount: 220,
        spread: 160,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors,
        scalar: 1.2,
      });
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(burstTimeout);
    };
  }, []);

  // Payoff first — emojis burst in and the title lands with the confetti — then the
  // details arrive in the same order the invite told them.
  const scope = useTimeline(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.cg-emoji', {
      opacity: 0,
      scale: 0,
      rotate: -200,
      y: -60,
      duration: 0.85,
      stagger: 0.11,
      ease: 'back.out(3)',
    })
      .from(
        '.cg-title',
        { opacity: 0, scale: 0.5, rotate: -9, duration: 1.1, ease: 'elastic.out(1, 0.55)' },
        '-=0.55',
      )
      // Opacity only — the rays' transform belongs to the CSS spin.
      .from('.cg-rays', { opacity: 0, duration: 1.4, ease: 'power2.out' }, '-=1.1')
      .from('.cg-kicker .anim-char', { opacity: 0, duration: 0.01, stagger: 0.028 }, '-=0.45')
      .from('.cg-word', { opacity: 0, y: 12, duration: 0.35, stagger: 0.06 }, '+=0.1')
      .from(
        '.cg-badge',
        { opacity: 0, y: 18, scale: 0.75, duration: 0.45, stagger: 0.14, ease: 'back.out(1.9)' },
        '-=0.05',
      )
      .from('.cg-cta', { opacity: 0, y: 16, scale: 0.9, duration: 0.55, ease: 'back.out(1.7)' }, '+=0.15')
  }, [])

  return (
    <section ref={scope} className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30 h-screen w-screen" />

      <div
        className="cg-rays pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-ray-spin opacity-40"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, rgba(45,212,191,0.16) 0deg 8deg, transparent 8deg 22deg)',
          maskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Each emoji is its own span so they can burst in one after another, while the
            float stays on the wrapper. */}
        <div className="mb-6 text-6xl animate-float-slow">
          {['🎊', '🙌', '🎊'].map((e, i) => (
            <span key={i} className="cg-emoji inline-block">{e}</span>
          ))}
        </div>

        {/* The entrance moved to GSAP; the CSS animation here is only the rainbow filter,
            which doesn't touch the transform GSAP is driving. */}
        <h1
          className="cg-title mb-4 whitespace-nowrap font-[var(--font-display)] font-extrabold leading-tight"
          style={{
            fontSize: 'clamp(1.5rem, 7.5vw, 4rem)',
            backgroundImage: 'linear-gradient(90deg, #2dd4bf, #34d399, #f5b354, #f472b6, #2dd4bf)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'rainbow-text 3s linear infinite',
          }}
        >
          CONGRATULATIONS
        </h1>

        <p className="cg-kicker mb-2 font-mono text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--color-cyan)' }}>
          <Chars text="you said yes. we knew you would." />
        </p>

        <p className="mx-auto mb-10 max-w-md text-lg" style={{ color: 'var(--color-text-2)' }}>
          <Words text="You are officially locked in for" className="cg-word" />
          <span className="cg-word" style={{ display: 'inline-block', color: 'var(--color-text)', fontWeight: 700 }}>
            Bangkok, Thailand 2027
          </span>
          <span className="cg-word" style={{ display: 'inline-block' }}>.</span>
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {['✅ Seat reserved', '🎉 Squad +2', '🛬 BKK bound'].map((b) => (
            // Outer span takes the GSAP entrance so the inner one keeps its shake.
            <span key={b} className="cg-badge inline-block">
              <span
                className="glass animate-shake-tilt inline-block rounded-full px-4 py-1.5 font-mono text-xs"
                style={{ color: 'var(--color-text)' }}
              >
                {b}
              </span>
            </span>
          ))}
        </div>

        <span className="cg-cta inline-block">
          <button
            type="button"
            onClick={onContinue}
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-8 py-4 font-mono text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ background: 'var(--color-cyan)', color: 'var(--color-bg)', boxShadow: '0 8px 32px rgba(45,212,191,0.35)' }}
          >
            Show me what's included
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </span>
      </div>
    </section>
  )
}
