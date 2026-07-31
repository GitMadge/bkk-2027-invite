import { useEffect, useState } from 'react'

const DAYS = [
  {
    title: 'Day 1 — Arrival',
    date: 'Sun, Feb 28 · Flying in',
    items: ['Fly in', 'Check in together', 'Welcome dinner', 'Sleep'],
  },
 {
    title: 'Day 2 — TBD',
    date: 'Mon, Mar 1  · BKK',
    items: [ 'TBD' ]
  },
  {
    title: 'Day 3 — Tour & Chinatown Day',
    date: 'Tue, Mar 2 · BKK',
    items: [ 'Jim Thompson House', '420 @ NNH/Chronic', 'Chinatown Night Market'],
  },
  {
    title: 'Day 4 — Mall Day & Night Market',
    date: 'Wed, Mar 3 · BKK',
    items: ['Kush House', 'Emsphere', 'LV Cannabis Boutique', 'Terminal 21'],
  },
  {
    title: 'Day 5 — Buffet and Farm tour',
    date: 'Thu, Mar 4· BKK',
    items: ['Medicana Lab Co.', 'Baiyoke Sky Buffet'],
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

const LODGING = [
  { tag: 'Groups of 2', name: 'S Box Sukhumvit Hotel', note: 'Cheapest and most convenient, walkable to everything.', link: 'https://www.agoda.com/s-box-sukhumvit-hotel/hotel/bangkok-th.html?countryId=106&finalPriceView=1&isShowMobileAppPrice=false&cid=1917614&numberOfBedrooms=&familyMode=false&adults=2&children=0&rooms=1&maxRooms=0&checkIn=2026-08-1&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=1&showReviewSubmissionEntry=false&currencyCode=PHP&isFreeOccSearch=false&los=1&searchrequestid=d4d56c5f-c811-462f-8e42-ed60662620f4&ds=ntoUW0SiFx2PSUI8' },
  { tag: 'Groups of 2', name: 'W22 by Burasari', note: 'Around Chinatown', link: 'https://www.agoda.com/w22-by-burasari/hotel/bangkok-th.html?countryId=106&finalPriceView=1&isShowMobileAppPrice=false&cid=1844104&numberOfBedrooms=&familyMode=false&adults=4&children=0&rooms=2&maxRooms=0&checkIn=2027-02-28&isCalendarCallout=false&childAges=&numberOfGuest=0&missingChildAges=false&travellerType=3&showReviewSubmissionEntry=false&currencyCode=PHP&isFreeOccSearch=false&flightSearchCriteria=%5Bobject%20Object%5D&los=6&searchrequestid=3e0961ec-0a1f-454d-937e-869d3dcb997c' },
  { tag: 'Open slot', name: 'Suggest a place to stay', note: 'Know a better spot? Let us know and we’ll add it here.', link: '' },
  { tag: 'Groups of 4', name: 'Fat Buds Ekkamai', note: 'Kinda far but 420 friendly', link: 'https://www.airbnb.com/rooms/1063137268505378988?source_impression_id=p3_1785362045_P3c_WaPT-SWsrI35' },
]

const MAP_SHARE_URL = 'https://maps.app.goo.gl/YAUz9NXLgToCrZGY7'

const GUIDE = [
  {
    title: 'Getting around',
    lines: ['MRT / BTS for efficiency', 'Grab for convenience'],
  },
  {
    title: 'Travel Guide',
    lines: ["🛂 Visa & entry: Filipino passport holders currently get visa-free entry to Thailand for tourism (around 30 days). We'll need to submit the Thailand Digital Arrival Card (TDAC) online within 72 hours before landing, and your passport should be valid for at least 6 moremonths from entry. Rules can shift, so double-check official sources closer to the date.",
      '💵 Money: Local currency is the Thai Baht (฿). Cards are fine at malls, but bring cash for markets, street food, and cannabis stops. ATMs are everywhere in Bangkok.',
      '📱 Getting connected: Grab a tourist SIM (AIS or dtac) at the airport for data. Install Grab and Klook before you land.',
      "🌿 Cannabis note: Buy only from licensed dispensaries, keep it low-key in public, and don't bring any of it back to the Philippines — it's illegal and it's not worth the risk.",
      '🗣️ A few local basics: "Sawasdee" (hello) and "khob khun ka / khob khun khrap" (thank you) go a long way.',
      '🚨 Emergency numbers: Tourist Police: 1155 · General emergency: 191'],
  },
  {
    title: 'Health corner',
    lines: ['🥵 Irritable from the heat? A couple hours in the sun can wear you down fast. Take a break, hydrate, cool off before it gets worse.', 
      '🍃 Bad trip from weed? Hydrate and take a break. No pressure to push through, we can step back and rest with you.', 
      '🤕 Wound, cough, fever, or dysmenorrhea? First aid or buy medicine. Speak up early so we can help.',
      "🍪 Edibles are an alternative if you can't smoke.",
      "🧘 Need alone time? That's okay. Just let someone know so we're not worried.",
    ],
  },
]

const RULES = [
  'Set and setting is important this is a 420 trip.',
  'Uncomfortable situations are normal. Assume the kinder read of every situation.',
  "Acknowledge each other's needs and find a good compromise.",
  'No judging. Respect individual strengths and differences.',
  "If you don't know, look it up together. Learning together is growing together.",
  'No blame games, follow the golden rule.',
  "Acknowledge mistakes, and apologize early, forgive fast, help fix the situation.",
  'Friends keep secrets. Cherish good memories.',
  '420 invites are welcome.',
  'Peace and love :P',
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
    <div className="mb-7">
      <div className="mb-2.5 font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-violet)' }}>{tag}</div>
      <div className="font-[var(--font-display)] text-3xl font-semibold tracking-tight">{title}</div>
      {sub && <div className="mt-2 max-w-lg text-sm" style={{ color: 'var(--color-text-2)' }}>{sub}</div>}
    </div>
  )
}

export default function PerksSection() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
      <section className="py-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest"
             style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.06)', color: 'var(--color-violet)' }}>
          🎁 unlocked by saying yes
        </div>
        <h2 className="mb-3 font-[var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          The perks of traveling<br className="hidden sm:block" /> with people who've done this
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-base" style={{ color: 'var(--color-text-2)' }}>
          Because we've done this, the itinerary's already started. <br></br> Tell us what you don't want to miss, and it's in.
        </p>
        <Readout />
      </section>

      <section id="plan" className="py-10">
        <SectionHead tag="// perk 01 — we planned it" title="A day-by-day plan, already built" sub="No blank itinerary, no group-chat chaos. Tap a day to see it." />

        <div className="glass mb-4 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Itinerary</span>
            <span className="rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>Feb 28 – Mar 6, 2027</span>
          </div>

          <div className="flex flex-col gap-2">
            {DAYS.map((day) => (
              <details key={day.title} className="rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)' }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-['']">
                  <div>
                    <div className="font-[var(--font-display)] text-sm font-semibold">{day.title}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>{day.date}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-3)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <ul className="px-4 pb-4">
                  {day.items.map((it) => (
                    <li key={it} className="relative py-1 pl-4 text-sm" style={{ color: 'var(--color-text-2)' }}>
                      <span className="absolute left-0" style={{ color: 'var(--color-text-3)' }}>—</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <div className="glass mb-4 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Map</span>
            <a href={MAP_SHARE_URL} target="_blank" rel="noopener noreferrer"
               className="rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors hover:border-white/30"
               style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>
              Open & save to your maps ↗
            </a>
          </div>
          <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold">Every spot, already pinned</h3>
          <p className="mb-5 text-sm" style={{ color: 'var(--color-text-2)' }}>Shared list of spots we're considering. Add yours, and we'll fold them into the itinerary!</p>
          <a href={MAP_SHARE_URL} target="_blank" rel="noopener noreferrer"
             className="flex items-center justify-center gap-2 rounded-xl py-4 font-mono text-sm font-medium transition-colors hover:bg-white/[0.04]"
             style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)', color: 'var(--color-cyan)' }}>
            🗺️ Open the saved places list ↗
          </a>
        </div>

        <div className="glass mb-4 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Budget</span>
            <span className="rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>Already scoped</span>
          </div>
          <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold">We already know what this costs</h3>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-2)' }}>No surprise expenses — here's the real per-person range.</p>
          <div className="overflow-x-auto">
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
            </table>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <span className="mb-3 inline-block font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-cyan)' }}>Lodging</span>
          <h3 className="mb-1 font-[var(--font-display)] text-lg font-semibold">Options to stay</h3>
          <p className="mb-5 text-sm" style={{ color: 'var(--color-text-2)' }}>Vetted listings to choose from.</p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {LODGING.map((l) => (
              <div key={l.name} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <span className="mb-3 inline-block rounded-full border px-2.5 py-1 font-mono text-[10px]" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-3)' }}>{l.tag}</span>
                <div className="mb-1.5 font-[var(--font-display)] text-sm font-semibold">{l.name}</div>
                <p className="mb-2 text-xs" style={{ color: 'var(--color-text-2)' }}>{l.note}</p>
                {l.link && (
                  <a href={l.link} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 font-mono text-xs font-medium"
                     style={{ color: 'var(--color-cyan)' }}>
                    View listing ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="guide" className="py-10">
        <SectionHead tag="// perk 02 — we scoped it" title="The insider guide" sub="Everything we wish someone told us before our first Bangkok trip." />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <details className="glass rounded-2xl p-5">
            <summary className="cursor-pointer list-none">
              <h4 className="flex items-center gap-2 font-[var(--font-display)] text-base font-semibold">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-violet)' }} />
                Rules & values
              </h4>
              <div className="mt-2 text-sm" style={{ color: 'var(--color-text-2)' }}>🤫 A few things we live by — tap to reveal.</div>
            </summary>
            <ul className="mt-3.5">
              {RULES.map((r) => (
                <li key={r} className="border-t py-2 text-sm first:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-2)' }}>{r}</li>
              ))}
            </ul>
            <img src="/no-fighting-sign.png" alt="Police reminder sign: fighting is prohibited" className="mt-3.5 w-full rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.09)' }} />
          </details>

          {GUIDE.map((g) => (
            <details key={g.title} className="glass rounded-2xl p-5">
              <summary className="cursor-pointer list-none">
                <h4 className="flex items-center gap-2 font-[var(--font-display)] text-base font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-violet)' }} />
                  {g.title}
                </h4>
              </summary>
              <ul className="mt-3.5">
                {g.lines.map((l) => (
                  <li key={l} className="border-t py-2 text-sm first:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'var(--color-text-2)' }}>{l}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section className="py-10 text-center">
        <div className="glass mx-auto max-w-md rounded-2xl p-8">
          <div className="mb-3 text-3xl">🧳</div>
          <h3 className="mb-2 font-[var(--font-display)] text-xl font-semibold">That's the deal.</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>
            We handle the planning, you just have to show up. See you in Bangkok, 2027. 🇹🇭
          </p>
        </div>
      </section>
    </div>
  )
}
