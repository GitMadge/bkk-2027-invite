import { useRef, useState } from 'react'

const TAUNTS = [
  'nice try',
  'not today',
  'nope',
  'try again',
  'so close',
  'almost',
  "you can't catch me",
  'Bangkok misses you already',
  'the answer is yes btw',
  'keep trying, I dare you',
  'this button has trust issues',
  'yeah... no',
]

export default function InviteScreen({ onAccept }) {
  const arenaRef = useRef(null)
  const noBtnRef = useRef(null)
  const [noPos, setNoPos] = useState(null)
  const [dodgeCount, setDodgeCount] = useState(0)
  const [taunt, setTaunt] = useState(null)

  function dodge() {
    const btn = noBtnRef.current;
    const btnW = btn?.offsetWidth || 120;
    const btnH = btn?.offsetHeight || 48;
    const pad = 24;

    const maxX = Math.max(pad, window.innerWidth - btnW - pad);
    const maxY = Math.max(pad, window.innerHeight - btnH - pad);

    let nextX = pad + Math.random() * (maxX - pad);
    let nextY = pad + Math.random() * (maxY - pad);

    // keep some distance from wherever it currently is, so it feels like a real dodge
    if (noPos) {
      const dist = Math.hypot(nextX - noPos.x, nextY - noPos.y);
      if (dist < Math.min(window.innerWidth, window.innerHeight) * 0.3) {
        nextX = maxX - nextX + pad;
        nextY = maxY - nextY + pad;
      }
    }

    setNoPos({ x: nextX, y: nextY });
    setDodgeCount((c) => c + 1);
    setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
  }

  const yesScale = Math.min(1 + dodgeCount * 0.045, 1.9);

  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cyan"
             style={{ borderColor: 'rgba(45,212,191,0.25)', background: 'rgba(45,212,191,0.05)', color: 'var(--color-cyan)' }}>
          <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full" style={{ background: 'var(--color-cyan)' }} />
          incoming invitation
        </div>

        <div className="mb-3 text-4xl animate-float-slow">🙏</div>

        <h1 className="mb-3 font-[var(--font-display)] text-5xl font-bold tracking-tight sm:text-6xl"
            style={{
              backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #b7c9c2 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
          Sawasdee!
        </h1>

        <p className="mx-auto mb-6 max-w-sm text-base" style={{ color: 'var(--color-text-2)' }}>
          You're formally, officially, no-take-backsies invited to{' '}
          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Bangkok, Thailand</span>.
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {['🇹🇭 Bangkok', '📅 2027', '✈️ 7 Days', '🌶️ Zero Regrets'].map((b) => (
            <span key={b} className="glass rounded-full px-3.5 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-2)' }}>
              {b}
            </span>
          ))}
        </div>

        <p className="mb-4 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>
          so... you in?
        </p>

        <div ref={arenaRef} className="relative mx-auto h-40 w-full max-w-md sm:h-32">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4"
               style={{ transitionProperty: 'transform', transitionDuration: '300ms' }}>
            <button
              type="button"
              onClick={onAccept}
              className="cursor-pointer whitespace-nowrap rounded-xl px-7 py-3.5 font-mono text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
              style={{
                background: 'var(--color-cyan)',
                color: 'var(--color-bg)',
                transform: `scale(${yesScale})`,
                transition: 'transform 200ms ease, box-shadow 200ms ease',
                boxShadow: dodgeCount > 3 ? '0 8px 32px rgba(45,212,191,0.4)' : '0 8px 24px rgba(45,212,191,0.2)',
              }}
            >
              Yes, I'm in! 🎉
            </button>

            {noPos === null && (
              <button
                ref={noBtnRef}
                type="button"
                onMouseEnter={dodge}
                onTouchStart={(e) => { e.preventDefault(); dodge(); }}
                onClick={dodge}
                className="whitespace-nowrap rounded-xl border px-7 py-3.5 font-mono text-sm font-semibold"
                style={{ borderColor: 'var(--border-strong, rgba(255,255,255,0.16))', color: '#ef4444', background: 'rgba(255,255,255,0.03)' }}
              >
                No
              </button>
            )}
          </div>

          {noPos !== null && (
            <button
              ref={noBtnRef}
              type="button"
              onMouseEnter={dodge}
              onTouchStart={(e) => { e.preventDefault(); dodge(); }}
              onClick={dodge}
              className="whitespace-nowrap rounded-xl border px-7 py-3.5 font-mono text-sm font-semibold"
              style={{
                position: 'fixed',
                left: noPos.x,
                top: noPos.y,
                zIndex: 50,
                borderColor: 'var(--border-strong, rgba(255,0,0,0.42))',
                color: '#ef4444',
                background: 'rgba(255,255,255,0.03)',
                transition: 'left 220ms cubic-bezier(.34,1.56,.64,1), top 220ms cubic-bezier(.34,1.56,.64,1)',
              }}
            >
              No
            </button>
          )}
        </div>

        <div className="mt-2 h-5 font-mono text-xs" style={{ color: 'var(--color-amber)' }}>
          {taunt ? `"${taunt}" ${dodgeCount > 1 ? `(attempt #${dodgeCount})` : ''}` : ' '}
        </div>
      </div>
    </section>
  )
}
