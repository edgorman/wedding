import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { art } from './artwork'
import { directionsUrl, spots } from './mapInfo'
import { houses, landmarks, MAP_H, MAP_W, MAP_X, route, trees, type Box } from './mapLayout'

type SpotKey = keyof typeof spots

// Position an icon on the map canvas, as percentages of the map's width and height.
const place = ([l, t, w, h]: Box): CSSProperties => ({
  left: `${((l - MAP_X) / MAP_W) * 100}%`,
  top: `${(t / MAP_H) * 100}%`,
  width: `${(w / MAP_W) * 100}%`,
  height: `${(h / MAP_H) * 100}%`,
})

// The map drawing never changes, so its ~1,200 images are built once here, outside the component.
// React then skips the whole layer when an info panel opens or closes.
const drawing = (
  <>
    <img
      className="base"
      src={art('map/map')}
      alt="Hand-drawn map of the bus route from St James' Church in Shere to Burrows Lea Country House"
    />
    <span className="icons" aria-hidden="true">
      {houses.map((b, i) => (
        <img key={`h${i}`} src={art('map/house')} alt="" style={place(b)} />
      ))}
      {trees.map((b, i) => (
        <img key={`t${i}`} src={art('map/tree')} alt="" style={place(b)} />
      ))}
      <img src={art('map/route')} alt="" style={place(route)} />
      {(['church', 'venue', 'bus'] as const).map((k) => (
        <img key={k} src={art(`map/${k}`)} alt="" style={place(landmarks[k])} />
      ))}
    </span>
  </>
)

export function RouteMap() {
  const [open, setOpen] = useState<SpotKey | null>(null)
  const [popPos, setPopPos] = useState({ left: 8, top: 8 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Partial<Record<SpotKey, HTMLButtonElement | null>>>({})

  // Place the panel under the pressed hotspot, or above it when there is no room below.
  // A layout effect, so the panel is never painted at its previous position first.
  useLayoutEffect(() => {
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
    <div className="mapwrap" ref={wrapRef}>
      {/* The canvas is the whole wide drawing, centred; the window crops it to what fits the screen. */}
      <div className="mapwindow">
        <div className="mapcanvas">
          <a
            className="map"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open directions from St James' Church to Burrows Lea Country House in Google Maps"
          >
            {drawing}
          </a>
          {(Object.keys(spots) as SpotKey[]).map((k) => (
            <button
              key={k}
              type="button"
              className="hot"
              ref={(el) => {
                btnRefs.current[k] = el
              }}
              style={place(spots[k].box)}
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
        </div>
      </div>
      <svg className="mapframe" aria-hidden="true">
        <rect width="100%" height="100%" rx="5" />
      </svg>
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
  )
}
