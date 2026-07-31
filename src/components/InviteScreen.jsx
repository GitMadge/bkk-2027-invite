import { useRef, useState } from 'react'
import { Chars, Words } from '../lib/Split'
import { gsap, reducedMotion, useTimeline } from '../lib/anim'

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

const NO_BTN_CLASS =
  'whitespace-nowrap rounded-xl border px-7 py-3.5 font-mono text-sm font-semibold outline-none focus:outline-none focus-visible:outline-none'

const NO_BTN_STYLE = {
  borderColor: 'var(--border-strong, rgba(255,255,255,0.16))',
  color: '#ef4444',
  background: 'rgba(255,255,255,0.03)',
  outline: 'none',
  boxShadow: 'none',
  WebkitTapHighlightColor: 'transparent',
}

export default function InviteScreen({ onAccept }) {
  const arenaRef = useRef(null)
  const noBtnRef = useRef(null)
  const [noPos, setNoPos] = useState(null)
  const [dodgeCount, setDodgeCount] = useState(0)
  const [taunt, setTaunt] = useState(null)

  // The invite tells itself in order: the notification arrives and types out, the
  // greeting lands, the sentence assembles word by word, the tags drop in, and only
  // then is there anything to click.
  const scope = useTimeline(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.iv-badge', { opacity: 0, y: -14, scale: 0.9, duration: 0.5 })
      .from('.iv-badge .anim-char', { opacity: 0, duration: 0.01, stagger: 0.035 }, '-=0.12')
      .from(
        '.iv-emoji',
        { opacity: 0, scale: 0, rotate: -50, duration: 0.7, ease: 'back.out(2.6)' },
        '+=0.12',
      )
      .from(
        '.iv-title',
        { opacity: 0, scale: 0.55, rotate: -6, filter: 'blur(10px)', duration: 1, ease: 'elastic.out(1, 0.62)' },
        '-=0.25',
      )
      .from('.iv-word', { opacity: 0, y: 12, duration: 0.35, stagger: 0.07 }, '-=0.55')
      .from(
        '.iv-tag',
        { opacity: 0, y: 16, scale: 0.8, duration: 0.42, stagger: 0.13, ease: 'back.out(1.8)' },
        '-=0.05',
      )
      .from('.iv-prompt', { opacity: 0, y: 8, duration: 0.4 }, '+=0.15')
      .from('.iv-yes', { opacity: 0, scale: 0.6, duration: 0.6, ease: 'back.out(2)' }, '-=0.1')
      .from('.iv-no', { opacity: 0, y: 10, duration: 0.4 }, '-=0.3')
  }, [])

  // Hand off to the congrats screen only once this one has cleared out, so the two
  // don't swap mid-frame.
  function accept() {
    if (reducedMotion()) {
      onAccept()
      return
    }
    gsap.to(scope.current, {
      opacity: 0,
      scale: 0.94,
      filter: 'blur(6px)',
      duration: 0.42,
      ease: 'power2.in',
      onComplete: onAccept,
    })
  }

  function dodge() {
    const btn = noBtnRef.current;
    const btnW = btn?.offsetWidth || 120;
    const btnH = btn?.offsetHeight || 48;
    const pad = 24;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = Math.max(pad, vw - btnW - pad);
    const maxY = Math.max(pad, vh - btnH - pad);

    // Dead zone: the middle third on both axes, where the invite copy lives. Tested
    // against the button's whole rect, not just its origin, so it can't creep in.
    const zone = { left: vw / 3, right: (vw * 2) / 3, top: vh / 3, bottom: (vh * 2) / 3 };
    const hitsCopy = (x, y) =>
      x + btnW > zone.left && x < zone.right && y + btnH > zone.top && y < zone.bottom;

    // Far enough from the last spot that it reads as a dodge rather than a twitch.
    const minTravel = Math.min(vw, vh) * 0.3;
    const tooClose = (x, y) => noPos !== null && Math.hypot(x - noPos.x, y - noPos.y) < minTravel;

    const randX = () => pad + Math.random() * (maxX - pad);
    const randY = () => pad + Math.random() * (maxY - pad);

    // Rejection sampling: insist on both constraints, then drop the travel one rather
    // than risk landing on the copy.
    let nextX = randX();
    let nextY = randY();
    for (let tries = 0; tries < 40; tries += 1) {
      const needsTravel = tries < 25;
      if (!hitsCopy(nextX, nextY) && !(needsTravel && tooClose(nextX, nextY))) break;
      nextX = randX();
      nextY = randY();
    }

    // Cramped viewports can leave no valid random spot at all — fall back to whichever
    // corner is clear, else the top-left.
    if (hitsCopy(nextX, nextY)) {
      const corners = [
        [pad, pad],
        [maxX, pad],
        [pad, maxY],
        [maxX, maxY],
      ];
      const clear = corners.find(([x, y]) => !hitsCopy(x, y)) ?? corners[0];
      [nextX, nextY] = clear;
    }

    setNoPos({ x: nextX, y: nextY });
    setDodgeCount((c) => c + 1);
    setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
  }

  const yesScale = Math.min(1 + dodgeCount * 0.045, 1.9);

  return (
    <section ref={scope} className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="iv-badge mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cyan"
             style={{ borderColor: 'rgba(45,212,191,0.25)', background: 'rgba(45,212,191,0.05)', color: 'var(--color-cyan)' }}>
          <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full" style={{ background: 'var(--color-cyan)' }} />
          <Chars text="incoming invitation" />
        </div>

        {/* The float keeps running on the wrapper while GSAP owns the inner span's
            transform — one element can't take both without them fighting. */}
        <div className="mb-3 text-4xl animate-float-slow">
          <span className="iv-emoji inline-block">🙏</span>
        </div>

        <h1 className="iv-title mb-3 font-[var(--font-display)] text-5xl font-bold tracking-tight sm:text-6xl"
            style={{
              backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #b7c9c2 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
          Sawasdee!
        </h1>

        <p className="mx-auto mb-6 max-w-sm text-base" style={{ color: 'var(--color-text-2)' }}>
          <Words text="You're formally, officially, no-take-backsies invited to" className="iv-word" />
          <span className="iv-word" style={{ display: 'inline-block', color: 'var(--color-text)', fontWeight: 600 }}>
            Bangkok, Thailand
          </span>
          <span className="iv-word" style={{ display: 'inline-block' }}>.</span>
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {['🇹🇭 Bangkok', '📅 2027', '✈️ 7 Days', '🍃 Zero Regrets'].map((b) => (
            <span key={b} className="iv-tag glass rounded-full px-3.5 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-2)' }}>
              {b}
            </span>
          ))}
        </div>

        <p className="iv-prompt mb-4 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>
          so... you in?
        </p>

        <div ref={arenaRef} className="relative mx-auto h-40 w-full max-w-md sm:h-32">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4"
               style={{ transitionProperty: 'transform', transitionDuration: '300ms' }}>
            {/* Wrapped because the button's own transform is React's (it grows per dodge);
                GSAP animates the wrapper instead of fighting over the same property. */}
            <span className="iv-yes inline-block">
              <button
                type="button"
                onClick={accept}
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
            </span>

            <span className="iv-no inline-block">
              {noPos === null ? (
                <button
                  ref={noBtnRef}
                  type="button"
                  onMouseEnter={dodge}
                  onTouchStart={(e) => { e.preventDefault(); dodge(); }}
                  onClick={dodge}
                  tabIndex={-1}
                  className={NO_BTN_CLASS}
                  style={NO_BTN_STYLE}
                >
                  No
                </button>
              ) : (
                // once the real button goes fixed it leaves the column, so hold its slot
                // open with an identical hidden copy — otherwise Yes re-centers and jumps
                <button
                  type="button"
                  disabled
                  aria-hidden="true"
                  tabIndex={-1}
                  className={NO_BTN_CLASS}
                  style={{ ...NO_BTN_STYLE, visibility: 'hidden' }}
                >
                  No
                </button>
              )}
            </span>
          </div>

          {noPos !== null && (
            <button
              ref={noBtnRef}
              type="button"
              onMouseEnter={dodge}
              onTouchStart={(e) => { e.preventDefault(); dodge(); }}
              onClick={dodge}
              tabIndex={-1}
              className={NO_BTN_CLASS}
              style={{
                ...NO_BTN_STYLE,
                position: 'fixed',
                left: noPos.x,
                top: noPos.y,
                zIndex: 50,
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
