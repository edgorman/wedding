import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { art } from './artwork'
import { directionsUrl, spots } from './mapInfo'
import { houses, landmarks, MAP_H, MAP_W, MAP_X, MAP_Y, route, trees, type Box } from './mapLayout'

type SpotKey = keyof typeof spots

// Position an icon on the map canvas, as percentages of the map's width and height.
const place = ([l, t, w, h]: Box): CSSProperties => ({
  left: `${((l - MAP_X) / MAP_W) * 100}%`,
  top: `${((t - MAP_Y) / MAP_H) * 100}%`,
  width: `${(w / MAP_W) * 100}%`,
  height: `${(h / MAP_H) * 100}%`,
})

// The map drawing never changes, so its images are built once here, outside the component.
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
        <img key={k} className={`lm lm-${k}`} src={art(`map/${k}`)} alt="" style={place(landmarks[k])} />
      ))}
    </span>
  </>
)

// Where the map is centred to begin with, in map units: the middle of the route.
const START = { x: 300, y: 450 }
const KEY_STEP = 80 // pixels moved by an arrow key

export function RouteMap() {
  const [open, setOpen] = useState<SpotKey | null>(null)
  const [popPos, setPopPos] = useState({ left: 8, top: 8 })
  const [full, setFull] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const winRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Partial<Record<SpotKey, HTMLButtonElement | null>>>({})
  // The map unit in the middle of the window. Panning moves the canvas directly instead of re-rendering.
  const centre = useRef(START)
  const drag = useRef<{ id: number; x: number; y: number; from: typeof START } | null>(null)
  const dragged = useRef(false)

  // Pixels per map unit: the canvas is drawn at 2 x --u tall (see App.css).
  const scale = () => (canvasRef.current?.offsetHeight ?? 0) / MAP_H

  // Slide the canvas so `centre` is in the middle of the window, never showing past the drawing's edge.
  const show = () => {
    const win = winRef.current
    const canvas = canvasRef.current
    const s = scale()
    if (!win || !canvas || !s) return
    const fit = (v: number, size: number, canvasSize: number) => Math.min(0, Math.max(size - canvasSize, v))
    const tx = fit(win.clientWidth / 2 - (centre.current.x - MAP_X) * s, win.clientWidth, canvas.offsetWidth)
    const ty = fit(win.clientHeight / 2 - (centre.current.y - MAP_Y) * s, win.clientHeight, canvas.offsetHeight)
    centre.current = { x: MAP_X + (win.clientWidth / 2 - tx) / s, y: MAP_Y + (win.clientHeight / 2 - ty) / s }
    canvas.style.transform = `translate(${tx}px, ${ty}px)`
  }

  // Keep the view in place when the window changes size (resizing, full screen).
  useLayoutEffect(() => {
    show()
    const win = winRef.current
    if (!win || typeof ResizeObserver === 'undefined') return
    const watcher = new ResizeObserver(show)
    watcher.observe(win)
    return () => watcher.disconnect()
  }, [])

  // Place the panel under the pressed hotspot, or above it when there is no room below. It lives on the
  // canvas, so it moves with the map; it is kept inside the part of the canvas the window shows.
  // A layout effect, so the panel is never painted at its previous position first.
  useLayoutEffect(() => {
    const btn = open && btnRefs.current[open]
    const win = winRef.current
    const canvas = canvasRef.current
    const pop = popRef.current
    if (!btn || !win || !canvas || !pop) return
    const w = win.getBoundingClientRect()
    const c = canvas.getBoundingClientRect()
    const r = btn.getBoundingClientRect()
    const left = Math.max(
      w.left - c.left + 8,
      Math.min(r.left - c.left + r.width / 2 - pop.offsetWidth / 2, w.right - c.left - pop.offsetWidth - 8),
    )
    let top = r.bottom - c.top + 10
    if (top + pop.offsetHeight > w.bottom - c.top) top = Math.max(w.top - c.top + 8, r.top - c.top - pop.offsetHeight - 10)
    setPopPos({ left, top })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    const onClick = (e: globalThis.MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  // Full screen: the browser's own full screen where it has one, otherwise the map just covers the page.
  useEffect(() => {
    if (!full) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setFull(false)
    const onChange = () => document.fullscreenElement || setFull(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onChange)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onChange)
      document.body.style.overflow = ''
      if (document.fullscreenElement) document.exitFullscreen()?.catch(() => {})
    }
  }, [full])

  const toggleFull = () => {
    setOpen(null)
    if (!full) wrapRef.current?.requestFullscreen?.()?.catch(() => {})
    setFull(!full)
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragged.current = false
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: centre.current }
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    const s = scale()
    if (!d || d.id !== e.pointerId || !s) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!dragged.current) {
      if (Math.hypot(dx, dy) < 5) return
      dragged.current = true
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    centre.current = { x: d.from.x - dx / s, y: d.from.y - dy / s }
    show()
  }
  // A drag finishes with a click on whatever is under the pointer; that click must not open a panel.
  const onClickCapture = (e: MouseEvent) => {
    if (!dragged.current) return
    dragged.current = false
    e.stopPropagation()
    e.preventDefault()
  }
  const onKeyDown = (e: KeyboardEvent) => {
    const s = scale()
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
    if (e.target !== e.currentTarget || !step || !s) return
    e.preventDefault()
    centre.current = { x: centre.current.x + (step[0] * KEY_STEP) / s, y: centre.current.y + (step[1] * KEY_STEP) / s }
    show()
  }

  const spot = open ? spots[open] : null

  return (
    <div className={full ? 'mapwrap full' : 'mapwrap'} ref={wrapRef}>
      {/* The window shows part of the drawing; drag (or use the arrow keys) to look around. */}
      <div
        className="mapwindow"
        ref={winRef}
        tabIndex={0}
        role="group"
        aria-label="Map of the route. Drag, or use the arrow keys, to look around."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={onKeyDown}
      >
        <div className="mapcanvas" ref={canvasRef}>
          {drawing}
          {(Object.keys(spots) as SpotKey[]).map((k) => (
            <button
              key={k}
              type="button"
              className="hot"
              data-spot={k}
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
          {spot && (
            <div
              className="pop"
              role="dialog"
              aria-label={spot.title}
              ref={popRef}
              style={popPos}
              onPointerDown={(e) => e.stopPropagation()}
            >
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
      </div>
      <svg className="mapframe" aria-hidden="true">
        <rect width="100%" height="100%" rx="5" />
      </svg>
      <a
        className="mapbtn share"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open directions from St James' Church to Burrows Lea Country House in Google Maps"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
          <path d="M16 6l-4-4-4 4" />
          <path d="M12 2v13" />
        </svg>
      </a>
      <button
        type="button"
        className="mapbtn fs"
        aria-label={full ? 'Exit full screen' : 'Full screen'}
        aria-pressed={full}
        onClick={toggleFull}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path
            d={
              full
                ? 'M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M8 21v-3a2 2 0 0 0-2-2H3M16 21v-3a2 2 0 0 1 2-2h3'
                : 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3'
            }
          />
        </svg>
      </button>
    </div>
  )
}
