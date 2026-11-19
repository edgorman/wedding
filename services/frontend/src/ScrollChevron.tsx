import { useEffect, useState } from 'react'

const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2

// Scroll down one viewport height, or to the next section if that comes first.
const scrollDown = () => {
  const y = window.scrollY
  let target = y + window.innerHeight
  document.querySelectorAll('[data-section]').forEach((s) => {
    const top = s.getBoundingClientRect().top + y
    if (top > y + 2 && top < target) target = top
  })
  window.scrollTo({ top: target, behavior: 'smooth' })
}

// Fixed chevron, bottom right. Hidden once the page is scrolled all the way down.
export function ScrollChevron() {
  const [bottom, setBottom] = useState(false)

  useEffect(() => {
    const update = () => setBottom(atBottom())
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  if (bottom) return null
  return (
    <button type="button" className="more" aria-label="Scroll down" onClick={scrollDown}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 9l7 7 7-7" />
      </svg>
    </button>
  )
}
