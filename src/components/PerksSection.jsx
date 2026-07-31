import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { revealGroups, useTimeline } from '../lib/anim'

// Every stop below is a real pin from the shared list (see PINS). This builds the one
// link that isn't a pin — the Clark → Suvarnabhumi flight leg — via Google's documented
// directions URL scheme, no API key needed.
const mapsRoute = (origin, destination) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`

// Pin URLs copied straight from the shared list, minus the ?entry/g_ep telemetry tail.
const PINS = {
  jimThompson:
    'https://www.google.com/maps/place/Jim+Thompson+House+Museum/@13.7461149,100.4817265,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e2993284fb5459:0xe984516d7ba19318!8m2!3d13.7493569!4d100.5281613!16s%2Fm%2F03hlbr1',
  nnh:
    'https://www.google.com/maps/place/NNH+(Soi+Nana+-+Chinatown)/@13.7408624,100.4705685,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e299003369081f:0x3d47ccda8b524336!8m2!3d13.7398483!4d100.5139754!16s%2Fg%2F11wxvm4w4w',
  chinatown:
    'https://www.google.com/maps/place/Chinatown+Bangkok+(Yaowarat)/@13.7408624,100.4705685,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e2999370ced7ad:0x5857f80ee7e16ad4!8m2!3d13.7408624!4d100.5086773!16s%2Fg%2F11t6wxn1ry',
  kushHouse:
    'https://www.google.com/maps/place/Kush+House+(Medical+Prescriptions)/@13.7408624,100.4705685,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e29fda0bbab9cb:0x869c6928ee293539!8m2!3d13.7330093!4d100.5654958!16s%2Fg%2F11jt0dmn3k',
  emsphere:
    'https://www.google.com/maps/place/EmSphere/@13.7330093,100.527387,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e29ff5758b5139:0x40e4e1d1d4e46bc1!8m2!3d13.7322349!4d100.5662949!16s%2Fg%2F11sv6s2lfx',
  lvCannabis:
    'https://www.google.com/maps/place/LV+Cannabis+Boutique+BKK/@13.7330093,100.527387,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e29f5903e05c67:0xb6dce77885c92572!8m2!3d13.7320577!4d100.5650066!16s%2Fg%2F11sbkxrqms',
  terminal21:
    'https://www.google.com/maps/place/Terminal+21+Asok/@13.7330093,100.527387,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e29f1e6e996bb9:0x3383716c9b049379!8m2!3d13.7379635!4d100.5604058!16s%2Fg%2F11h7ps3x1v',
  medicana:
    'https://www.google.com/maps/place/Medicana+Lab+Co.,+Ltd./@13.7330093,100.527387,14z/data=!4m10!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m5!1s0x30e29f12d3f0b35d:0xc3693b462c9aeba!8m2!3d13.7656218!4d100.6072148!16s%2Fg%2F11rql69ry5',
  baiyoke:
    'https://www.google.com/maps/place/Baiyoke+Sky+Hotel/@13.7330093,100.527387,14z/data=!4m13!1m3!11m2!2s6eCp2KMO70RRSMOwaMCKnQ!3e3!3m8!1s0x30e29ec870c41a2f:0xf07222978e9f826f!5m2!4m1!1i2!8m2!3d13.7541027!4d100.5403735!16s%2Fg%2F1228lvfc',
}

// An item is either a plain string (no link) or { label, href }. Internal hrefs start
// with '#' and scroll in-page instead of opening a tab.
const DAYS = [
  {
    title: 'Day 1 — Arrival',
    date: 'Sun, Feb 28 · Flying in',
    items: [
      { label: 'Fly in', href: mapsRoute('Clark International Airport', 'Suvarnabhumi Airport') },
      { label: 'Check in together', href: '#lodging' },
      'Welcome dinner',
      'Sleep',
    ],
  },
 {
    title: 'Day 2 — TBD',
    date: 'Mon, Mar 1  · BKK',
    items: [ 'TBD' ]
  },
  {
    title: 'Day 3 — Tour & Chinatown Day',
    date: 'Tue, Mar 2 · BKK',
    items: [
      { label: 'Jim Thompson House', href: PINS.jimThompson },
      { label: '420 @ NNH/Chronic', href: PINS.nnh },
      { label: 'Chinatown Night Market', href: PINS.chinatown },
    ],
  },
  {
    title: 'Day 4 — Mall Day & Night Market',
    date: 'Wed, Mar 3 · BKK',
    items: [
      { label: 'Kush House', href: PINS.kushHouse },
      { label: 'Emsphere', href: PINS.emsphere },
      { label: 'LV Cannabis Boutique', href: PINS.lvCannabis },
      { label: 'Terminal 21', href: PINS.terminal21 },
    ],
  },
  {
    title: 'Day 5 — Buffet and Farm tour',
    date: 'Thu, Mar 4· BKK',
    items: [
      { label: 'Medicana Lab Co.', href: PINS.medicana },
      { label: 'Baiyoke Sky Buffet', href: PINS.baiyoke },
    ],
  },
  {
    title: 'Day 6 — TBD',
    date: 'Fri, Mar 5 · BKK',
    items: ['TBD'],
  },
  {
    title: 'Day 7 — Departure',
    date: 'Sat, Mar 6 · BKK → Home',
    items: ['Slow morning, pack up together', 'Final tally & settle-ups'],
  },
]

const EXPENSES = [
  ['✈️ RT Flight', '₱10,000', 'Estimated max budget'],
  ['🏡 Stay', '₱11,000', 'Estimated max budget'],
  ['🍜 Food', '₱10,000', ''],
  ['🌿 Extras', '₱5,000', ''],
  ['🚌 Transportation', '₱3,000', ''],
  ['🎟️ Activities', 'TBD', ''],
  ['🆘 Emergency fund', '₱5,000', ''],
]

// Rows like 'TBD' carry no number, so they contribute 0 and get called out in the note.
const EXPENSE_TOTAL = EXPENSES.reduce(
  (sum, [, amt]) => sum + (Number(amt.replace(/[^\d.]/g, '')) || 0),
  0,
)
const UNPRICED = EXPENSES.filter(([, amt]) => !/\d/.test(amt)).length

// Declared above LODGING because the open-slot card links to it — a const referenced
// before its initializer would throw at module load.
const MAP_SHARE_URL = 'https://maps.app.goo.gl/YAUz9NXLgToCrZGY7'

const LODGING = [
  { tag: 'Groups of 2', name: 'S Box Sukhumvit Hotel', note: 'Cheapest and most convenient, walkable to everything.', link: 'https://www.agoda.com/s-box-sukhumvit-hotel/hotel/bangkok-th.html?countryId=106&finalPriceView=1&isShowMobileAppPrice=false&cid=1917614&numberOfBedrooms=&familyMode=false&adults=2&children=0&rooms=1&maxRooms=0&checkIn=2026-08-1&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=PHP&isFreeOccSearch=false&los=1&searchrequestid=d4d56c5f-c811-462f-8e42-ed60662620f4&ds=ntoUW0SiFx2PSUI8' },
  { tag: 'Groups of 2', name: 'W22 by Burasari', note: 'Around Chinatown', link: 'https://www.agoda.com/w22-by-burasari/hotel/bangkok-th.html?countryId=106&finalPriceView=1&isShowMobileAppPrice=false&cid=1844104&numberOfBedrooms=&familyMode=false&adults=4&children=0&rooms=2&maxRooms=0&checkIn=2027-02-28&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=3&showReviewSubmissionEntry=false&currencyCode=PHP&isFreeOccSearch=false&flightSearchCriteria=%5Bobject%20Object%5D&los=6&searchrequestid=3e0961ec-0a1f-454d-937e-869d3dcb997c' },
  { tag: 'Groups of 4', name: 'Fat Buds Ekkamai', note: 'Kinda far but 420 friendly', link: 'https://www.airbnb.com/rooms/1063137268505378988?source_impression_id=p3_1785362045_P3c_WaPT-SWsrI35' },
  { tag: 'Open slot', name: 'Suggest a place to stay', note: 'Know a better spot? Drop a pin and we’ll fold it in.', link: MAP_SHARE_URL, cta: 'Add to maps ↗' },
]

const GUIDE = [
  {
    title: 'Getting around',
    blurb: '🚇 A couple of ways to move around town.',
    lines: ['🚆 MRT / BTS for efficiency', '🚗 Grab for convenience'],
  },
  {
    title: 'Travel Guide',
    blurb: '🛂 A few things to sort before you fly.',
    lines: ["🛂 Visa & entry: Filipino passport holders currently get visa-free entry to Thailand for tourism (around 30 days). We'll need to submit the Thailand Digital Arrival Card (TDAC) online within 72 hours before landing, and your passport should be valid for at least 6 moremonths from entry. Rules can shift, so double-check official sources closer to the date.",
      '💵 Money: Local currency is the Thai Baht (฿). Cards are fine at malls, but bring cash for markets, street food, and cannabis stops. ATMs are everywhere in Bangkok.',
      '📱 Getting connected: Grab a tourist SIM (AIS or dtac) at the airport for data. Install Grab and Klook before you land.',
      "🌿 Cannabis note: Buy only from licensed dispensaries, keep it low-key in public, and don't bring any of it back to the Philippines — it's illegal and it's not worth the risk.",
      '🗣️ A few local basics: "Sawasdee" (hello) and "khob khun ka / khob khun khrap" (thank you) go a long way.',
      '🚨 Emergency numbers: Tourist Police: 1155 · General emergency: 191'],
  },
  {
    title: 'Health corner',
    blurb: '🩹 A few ways we look after each other.',
    lines: ['🥵 Irritable from the heat? A couple hours in the sun can wear you down fast. Take a break, hydrate, cool off before it gets worse.', 
      '🍃 Bad trip from weed? Hydrate and take a break. No pressure to push through, we can step back and rest with you.', 
      '🤕 Wound, cough, fever, or dysmenorrhea? First aid or buy medicine. Speak up early so we can help.',
      "🍪 Edibles are an alternative if you can't smoke.",
      "🧘 Need alone time? That's okay. Just let someone know so we're not worried.",
    ],
  },
]

const RULES = [
  '🌿 Set and setting is important this is a 420 trip.',
  '💭 Uncomfortable situations are normal. Assume the kinder read of every situation.',
  "⚖️ Acknowledge each other's needs and find a good compromise.",
  '🌈 No judging. Respect individual strengths and differences.',
  "📚 If you don't know, look it up together. Learning together is growing together.",
  '🙅 No blame games, follow the golden rule.',
  "🛠️ Acknowledge mistakes, and apologize early, forgive fast, help fix the situation.",
  '🤐 Friends keep secrets. Cherish good memories.',
  '🎟️ 420 invites are welcome.',
  '☮️ Peace and love :P',
]

// Rules is just another guide card, so it shares the grid + modal instead of being
// special-cased in the markup. Only it carries an image.
const GUIDE_CARDS = [
  {
    title: 'Rules & values',
    blurb: '🤫 A few things we live by.',
    lines: RULES,
    image: { src: '/no-fighting-sign.png', alt: 'Police reminder sign: fighting is prohibited' },
  },
  ...GUIDE,
]

function tripCountdown() {
  const tripDate = new Date('2027-02-28T00:00:00');
  const now = new Date();
  const diff = tripDate - now;
  return {
    d: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
    h: Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24)),
    m: Math.max(0, Math.floor((diff / (1000 * 60)) % 60)),
    s: Math.max(0, Math.floor((diff / 1000) % 60)),
  };
}

function Readout() {
  const [t, setT] = useState(tripCountdown());
  useEffect(() => {
    const id = setInterval(() => setT(tripCountdown()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass mx-auto inline-flex overflow-hidden rounded-2xl">
      {[
        ['Days', t.d],
        ['Hours', t.h],
        ['Minutes', t.m],
        ['Seconds', t.s],
      ].map(([label, val], i) => (
        <div key={label} className={`px-5 py-4 text-center ${i < 3 ? 'border-r' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.09)' }}>
          <div className="font-mono text-2xl font-medium">{String(val).padStart(2, '0')}</div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function SectionHead({ tag, title, sub }) {
  return (
    <div className="mb-7" data-reveal-group>
      <div className="mb-2.5 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-violet)' }} data-reveal>{tag}</div>
      <div className="font-[var(--font-display)] text-3xl font-semibold tracking-tight" data-reveal>{title}</div>
      {sub && <div className="mt-2 max-w-lg text-sm" style={{ color: 'var(--color-text-2)' }} data-reveal>{sub}</div>}
    </div>
  )
}

function GuideModal({ card, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const restoreFocusTo = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Keep Tab inside the dialog — the panel itself is tabindex=-1 so it stays out of the cycle.
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      restoreFocusTo?.focus?.()
    }
  }, [onClose])

  // Portalled to body so the fixed overlay can't be clipped by any positioned ancestor.
  return createPortal(
    <div
      className="animate-modal-fade fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      style={{ background: 'rgba(3,8,7,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`animate-modal-rise max-h-[85vh] w-full overflow-y-auto rounded-t-2xl p-6 outline-none sm:rounded-2xl ${
          card.image ? 'max-w-3xl' : 'max-w-lg'
        }`}
        style={{ background: 'rgba(13,26,24,0.97)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h4 id="guide-modal-title" className="flex items-center gap-2 font-[var(--font-display)] text-lg font-semibold">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--color-violet)' }} />
            {card.title}
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border font-mono text-xs leading-none transition-colors hover:border-white/30"
            style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}
          >
            ✕
          </button>
        </div>
        {/* With an image, split into text | image columns; without one, the list runs full width. */}
        <div className={card.image ? 'grid gap-6 sm:grid-cols-[1.35fr_1fr]' : undefined}>
          <ul>
            {card.lines.map((l) => (
              <li key={l} className="border-t py-2.5 text-sm first:border-t-0"
                  style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-2)' }}>
                {l}
              </li>
            ))}
          </ul>
          {card.image && (
            <img src={card.image.src} alt={card.image.alt} className="w-full self-start rounded-xl"
                 style={{ border: '1px solid rgba(255,255,255,0.09)' }} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function PerksSection() {
  const [openCard, setOpenCard] = useState(null)
  const closeCard = useCallback(() => setOpenCard(null), [])

  // Days open on hover only. Touch and keyboard get there via "Expand all", since
  // neither fires mouseenter.
  const [hoverDay, setHoverDay] = useState(null)
  const [allDaysOpen, setAllDaysOpen] = useState(false)

  // One reveal per section: the block eases up as it reaches the viewport, then its own
  // rows follow. See revealGroups for the contract behind the data attributes below.
  const scope = useTimeline(() => revealGroups(scope.current), [])

  return (
    <div ref={scope} className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
      <section className="py-14 text-center" data-reveal-group>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest"
             style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.06)', color: 'var(--color-violet)' }}
             data-reveal>
          🎁 unlocked by saying yes
        </div>
        <h2 className="mb-3 font-[var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl" data-reveal>
          The perks of traveling<br className="hidden sm:block" /> with people who've done this
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-base" style={{ color: 'var(--color-text-2)' }} data-reveal>
          Because we've done this, the itinerary's already started. <br></br> Tell us what you don't want to miss, and it's in.
        </p>
        <div data-reveal>
          <Readout />
        </div>
      </section>

      <section id="plan" className="py-10">
        <SectionHead tag="// perk 01 — we planned it" title="A day-by-day plan, already built" sub="No blank itinerary, no group-chat chaos. Hover a day to peek, or expand all." />

        <div className="glass mb-4 rounded-2xl p-6" data-reveal-group>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2" data-reveal>
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Itinerary</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllDaysOpen((v) => !v)}
                aria-expanded={allDaysOpen}
                className="cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors hover:border-white/30"
                style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}
              >
                {allDaysOpen ? 'Collapse all' : 'Expand all'}
              </button>
              <span className="rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>Feb 28 – Mar 6, 2027</span>
            </div>
          </div>

          {/* -my-1 cancels the outer rows' padding so the list's overall spacing is unchanged. */}
          <div className="-my-1 flex flex-col">
            {DAYS.map((day, i) => {
              const open = allDaysOpen || hoverDay === i
              return (
                // The gap between days lives inside this padding rather than as flex gap, so
                // the hover targets touch and sliding between days never drops the hover.
                <div
                  key={day.title}
                  className="py-1"
                  data-reveal
                  onMouseEnter={() => setHoverDay(i)}
                  onMouseLeave={() => setHoverDay((cur) => (cur === i ? null : cur))}
                >
                <div
                  className="rounded-xl border transition-colors duration-300"
                  style={{
                    borderColor: open ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.09)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="px-4 py-3.5">
                    <div className="font-[var(--font-display)] text-sm font-semibold">{day.title}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>{day.date}</div>
                  </div>
                  {/* 0fr → 1fr animates to the content's natural height, which max-height can't do
                      without hardcoding a guess. <details> can't be transitioned at all. */}
                  <div className="grid transition-[grid-template-rows] duration-300 ease-out"
                       style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                      {/* Stops laid out as a route: pills joined by dashed connectors. */}
                      <ol className="flex flex-wrap items-center gap-y-2 px-4 pb-4">
                        {day.items.map((it, idx) => {
                          const label = typeof it === 'string' ? it : it.label
                          const href = typeof it === 'string' ? null : it.href
                          const internal = href?.startsWith('#')
                          const Stop = href ? 'a' : 'span'
                          return (
                            <li key={label} className="flex items-center">
                              {idx > 0 && (
                                <span aria-hidden="true" className="mx-1.5 w-5 shrink-0 border-t border-dashed"
                                      style={{ borderColor: 'rgba(255,255,255,0.22)' }} />
                              )}
                              <Stop
                                {...(href
                                  ? internal
                                    ? { href }
                                    : { href, target: '_blank', rel: 'noopener noreferrer' }
                                  : {})}
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors duration-200 ${
                                  href ? 'cursor-pointer hover:border-white/25' : ''
                                }`}
                                style={{
                                  borderColor: 'rgba(255,255,255,0.09)',
                                  background: 'rgba(255,255,255,0.03)',
                                  color: 'var(--color-text)',
                                }}
                              >
                                <span className="h-1 w-1 shrink-0 rounded-full"
                                      style={{ background: href ? 'var(--color-cyan)' : 'var(--color-text-3)' }} />
                                {label}
                              </Stop>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass mb-4 rounded-2xl p-6" data-reveal-group>
          <div className="mb-4 flex items-center justify-between" data-reveal>
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Map</span>
            <a href={MAP_SHARE_URL} target="_blank" rel="noopener noreferrer"
               className="rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors hover:border-white/30"
               style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>
              Open & save to your maps ↗
            </a>
          </div>
          <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold" data-reveal>Every spot, already pinned</h3>
          <p className="mb-5 text-sm" style={{ color: 'var(--color-text-2)' }} data-reveal>Shared list of spots we're considering. Add yours, and we'll fold them into the itinerary!</p>
          <a href={MAP_SHARE_URL} target="_blank" rel="noopener noreferrer"
             data-reveal
             className="flex items-center justify-center gap-2 rounded-xl py-4 font-mono text-sm font-medium transition-colors hover:bg-white/[0.04]"
             style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)', color: 'var(--color-cyan)' }}>
            🗺️ Open the saved places list ↗
          </a>
        </div>

        <div className="glass mb-4 rounded-2xl p-6" data-reveal-group>
          <div className="mb-4 flex items-center justify-between" data-reveal>
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Budget</span>
            <span className="rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>Already scoped</span>
          </div>
          <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold" data-reveal>We already know what this costs</h3>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-2)' }} data-reveal>No surprise expenses. Here's the real per-person range.</p>
          <div className="overflow-x-auto" data-reveal>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Category', 'Amount', 'Note'].map((h) => (
                    <th key={h} className="border-b px-2.5 py-2 text-left font-mono text-[10.5px] uppercase tracking-wide" style={{ borderColor: 'rgba(255,255,255,0.16)', color: 'var(--color-text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXPENSES.map(([cat, amt, note]) => (
                  <tr key={cat}>
                    <td className="border-b px-2.5 py-2.5 font-medium" style={{ borderColor: 'rgba(255,255,255,0.09)' }}>{cat}</td>
                    <td className="border-b px-2.5 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-2)' }}>{amt}</td>
                    <td className="border-b px-2.5 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-2)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="px-2.5 py-3 font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Total</td>
                  <td className="px-2.5 py-3 font-semibold" style={{ color: 'var(--color-cyan)' }}>
                    ₱{EXPENSE_TOTAL.toLocaleString('en-US')}
                  </td>
                  <td className="px-2.5 py-3 text-xs" style={{ color: 'var(--color-text-3)' }}>
                    {UNPRICED > 0 ? `Per person, excl. ${UNPRICED} TBD item${UNPRICED > 1 ? 's' : ''}` : 'Per person'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* id is the target of the "Check in together" stop; scroll-mt keeps the heading
            clear of the viewport edge when jumped to. */}
        <div id="lodging" className="glass scroll-mt-6 rounded-2xl p-6" data-reveal-group>
          <span className="mb-3 inline-block font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }} data-reveal>Lodging</span>
          <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold" data-reveal>Options to stay</h3>
          <p className="mb-5 text-sm" style={{ color: 'var(--color-text-2)' }} data-reveal>Vetted listings to choose from.</p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {LODGING.map((l) => {
              // The open slot has no link, so it stays a plain div — only real listings
              // become anchors. Border lives in classes, not inline style, so :hover can win.
              const Card = l.link ? 'a' : 'div'
              return (
                <Card
                  key={l.name}
                  {...(l.link ? { href: l.link, target: '_blank', rel: 'noopener noreferrer' } : {})}
                  data-reveal
                  className={`flex h-full flex-col rounded-xl border border-white/[0.09] p-4 transition-[transform,border-color] duration-200 ${
                    l.link ? 'cursor-pointer hover:-translate-y-0.5 hover:border-white/20' : ''
                  }`}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="mb-3 inline-block self-start rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>{l.tag}</span>
                  <div className="mb-1.5 font-[var(--font-display)] text-sm font-semibold">{l.name}</div>
                  <p className="mb-2 text-xs" style={{ color: 'var(--color-text-2)' }}>{l.note}</p>
                  {l.link && (
                    <span className="mt-auto inline-flex items-center gap-1 font-mono text-xs font-medium"
                          style={{ color: 'var(--color-cyan)' }}>
                      {l.cta ?? 'View listing ↗'}
                    </span>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="guide" className="py-10">
        <SectionHead tag="// perk 02 — we scoped it" title="The insider guide" sub="Everything we wish someone told us before our first Bangkok trip." />
        <div className="grid gap-3.5 sm:grid-cols-2" data-reveal-group>
          {GUIDE_CARDS.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => setOpenCard(card)}
              aria-haspopup="dialog"
              data-reveal
              className="glass flex h-full cursor-pointer flex-col rounded-2xl p-5 text-left transition-[transform,border-color] duration-200 hover:-translate-y-0.5"
            >
              <h4 className="flex items-center gap-2 font-[var(--font-display)] text-base font-semibold">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--color-violet)' }} />
                {card.title}
              </h4>
              <div className="mt-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                {card.blurb}
              </div>
              <span className="mt-auto pt-3.5 font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-cyan)' }}>
                Tap to open →
              </span>
            </button>
          ))}
        </div>
      </section>

      {openCard && <GuideModal card={openCard} onClose={closeCard} />}

      <section className="py-10 text-center">
        <div className="glass mx-auto max-w-md rounded-2xl p-8" data-reveal-group>
          <div className="mb-3 text-3xl" data-reveal>🧳</div>
          <h3 className="mb-2 font-[var(--font-display)] text-xl font-semibold" data-reveal>That's the deal.</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-2)' }} data-reveal>
            We handle the planning, you just have to show up. See you in Bangkok, 2027. 🇹🇭
          </p>
        </div>
      </section>
    </div>
  )
}
