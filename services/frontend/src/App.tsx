import { useEffect, useRef, useState, type CSSProperties } from 'react'
import church from './assets/church.webp'
import couple from './assets/couple.webp'
import frame from './assets/frame.svg'
import map from './assets/map.svg'
import { calendarUrl, directionsUrl, spots } from './mapInfo'
import { events } from './timeline'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/caveat/500.css'
import './App.css'

type SpotKey = keyof typeof spots

const wavePath =
  'M500 0 C500 42.5 550 42.5 550 85 C550 170 450 170 450 255 C450 340 550 340 550 425 C550 510 450 510 450 595 C450 680 550 680 550 765 C550 850 450 850 450 935 C450 977.5 500 977.5 500 1020'

function App() {
  const [bannerOpen, setBannerOpen] = useState(true)
  const [open, setOpen] = useState<SpotKey | null>(null)
  const [popPos, setPopPos] = useState({ left: 8, top: 8 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Partial<Record<SpotKey, HTMLButtonElement | null>>>({})

  // Place the panel under the pressed hotspot, or above it when there is no room below.
  useEffect(() => {
    const btn = open && btnRefs.current[open]
    const wrap = wrapRef.current
    const pop = popRef.current
    if (!btn || !wrap || !pop) return
    const w = wrap.getBoundingClientRect()
    const r = btn.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.left - w.left + r.width / 2 - pop.offsetWidth / 2, w.width - pop.offsetWidth - 8))
    let top = r.bottom - w.top + 10
    if (top + pop.offsetHeight > w.height) top = Math.max(8, r.top - w.top - pop.offsetHeight - 10)
    setPopPos({ left, top })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    const onClick = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  const spot = open ? spots[open] : null

  return (
    <main className="page">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
      </svg>

      {bannerOpen && (
        <div className="wip" role="status">
          <span>
            <strong>Work in progress.</strong>
            <br />
            Thanks for visiting, but it&apos;s not ready yet.
          </span>
          <button type="button" className="wip-x" aria-label="Close banner" onClick={() => setBannerOpen(false)}>
            &times;
          </button>
        </div>
      )}

      <header className="hero">
        <img className="church" src={church} alt="Watercolour drawing of St James' Church, Shere" />
        <h1 className="names">Katie &amp; Ed&apos;s Wedding</h1>
        <p>
          <a className="datelink" href={calendarUrl} target="_blank" rel="noopener noreferrer">
            Saturday 16th October 2027
          </a>
        </p>
      </header>

      <section>
        <h2>The day</h2>
        <ol className="timeline">
          <svg className="wave" viewBox="0 0 1000 1020" preserveAspectRatio="none" aria-hidden="true">
            <path d={wavePath} />
          </svg>
          {events.map((e) => (
            <li
              key={e.time}
              className={`ev ${e.side}`}
              style={{ '--row': `${e.row}px`, '--dx': e.side === 'r' ? '5%' : '-5%' } as CSSProperties}
            >
              <span className="dot" />
              <div className="txt">
                <div className="time">{e.time}</div>
                <p className="what">{e.what}</p>
                <p className="where">{e.where}</p>
              </div>
              <div className="pic">
                <svg viewBox="0 0 80 80" filter="url(#wobble)" aria-hidden="true">
                  {e.shapes.map((s, i) =>
                    'd' in s ? (
                      <path key={i} d={s.d} className={s.tint ? 'tint' : undefined} />
                    ) : (
                      <circle key={i} cx={s.cx} cy={s.cy} r={s.r} className={s.tint ? 'tint' : undefined} />
                    ),
                  )}
                </svg>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>The map</h2>
        <div className="mapwrap" ref={wrapRef}>
          <a
            className="map"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open directions from St James' Church to Burrows Lea Country House in Google Maps"
          >
            <img src={map} alt="Hand-drawn map of the bus route from St James' Church in Shere to Burrows Lea Country House" />
          </a>
          {(Object.keys(spots) as SpotKey[]).map((k) => (
            <button
              key={k}
              type="button"
              className="hot"
              ref={(el) => {
                btnRefs.current[k] = el
              }}
              style={spots[k].box}
              aria-label={spots[k].label}
              aria-expanded={open === k}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(open === k ? null : k)
              }}
            >
              <i aria-hidden="true">i</i>
            </button>
          ))}
          {spot && (
            <div className="pop" role="dialog" aria-label={spot.title} ref={popRef} style={popPos}>
              <button type="button" className="pop-x" aria-label="Close" onClick={() => setOpen(null)}>
                &times;
              </button>
              <h3>{spot.title}</h3>
              {spot.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <a href={spot.href} target="_blank" rel="noopener noreferrer">
                {spot.linkText}
              </a>
            </div>
          )}
        </div>
        <p className="maptext">
          <a className="cta" href={directionsUrl} target="_blank" rel="noopener noreferrer">
            click for directions
          </a>
        </p>
      </section>

      <p className="closing">We can&apos;t wait to see you all!</p>
      <figure className="couple">
        <div className="oval">
          <img className="photo" src={couple} alt="Katie and Ed laughing together" />
          <img className="frame" src={frame} alt="" />
        </div>
      </figure>
    </main>
  )
}

export default App
