import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

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

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30 h-screen w-screen" />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-ray-spin opacity-40"
        style={{
          background:
            'repeating-conic-gradient(from 0deg, rgba(45,212,191,0.16) 0deg 8deg, transparent 8deg 22deg)',
          maskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-6 text-6xl animate-float-slow">🎊🙌🎊</div>

        <h1
          className="animate-grand-title mb-4 whitespace-nowrap font-[var(--font-display)] font-extrabold leading-tight"
          style={{
            fontSize: 'clamp(1.5rem, 7.5vw, 4rem)',
            backgroundImage: 'linear-gradient(90deg, #2dd4bf, #34d399, #f5b354, #f472b6, #2dd4bf)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'grand-title 1.1s cubic-bezier(.17,.89,.32,1.28) both, rainbow-text 3s linear infinite',
          }}
        >
          CONGRATULATIONS
        </h1>

        <p className="mb-2 font-mono text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--color-cyan)' }}>
          you said yes. we knew you would.
        </p>

        <p className="mx-auto mb-10 max-w-md text-lg" style={{ color: 'var(--color-text-2)' }}>
          You are officially locked in for{' '}
          <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>Bangkok, Thailand 2027</span>.
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {['✅ Seat reserved', '🎉 Squad +2', '🛬 BKK bound'].map((b) => (
            <span
              key={b}
              className="glass animate-shake-tilt rounded-full px-4 py-1.5 font-mono text-xs"
              style={{ color: 'var(--color-text)' }}
            >
              {b}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-xl px-8 py-4 font-mono text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ background: 'var(--color-cyan)', color: 'var(--color-bg)', boxShadow: '0 8px 32px rgba(45,212,191,0.35)' }}
        >
          Show me what's included
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </section>
  )
}
