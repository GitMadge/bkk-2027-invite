import { Fragment } from 'react'

// Splits text into per-character spans for typewriter reveals. Spaces need `pre` or the
// inline-block collapses them.
export function Chars({ text, className = 'anim-char' }) {
  return [...text].map((ch, i) => (
    <span key={i} className={className} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
      {ch}
    </span>
  ))
}

// Splits text into per-word spans. The separating space stays a plain text node outside
// the span so lines still wrap normally.
export function Words({ text, className = 'anim-word' }) {
  return text.split(' ').map((w, i) => (
    <Fragment key={i}>
      <span className={className} style={{ display: 'inline-block' }}>
        {w}
      </span>{' '}
    </Fragment>
  ))
}
