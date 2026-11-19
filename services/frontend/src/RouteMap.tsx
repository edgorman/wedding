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
import { spots } from './mapInfo'
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
const ZOOM_STEP = 0.75 // each press of the zoom buttons; 1 is the view you start on, and you can only zoom out from it

export function RouteMap() {
  const [open, setOpen] = useState<SpotKey | null>(null)
  const [popPos, setPopPos] = useState({ left: 8, top: 8 })
  const [full, setFull] = useState(false)
  const [atMin, setAtMin] = useState(false)
  const [atMax, setAtMax] = useState(true)
  const wrapRef = useRef<HTMLDivElement>(null)
  const winRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Partial<Record<SpotKey, HTMLButtonElement | null>>>({})
  // The map unit in the middle of the window. Panning moves the canvas directly instead of re-rendering.
  const centre = useRef(START)
  const drag = useRef<{ id: number; x: number; y: number; from: typeof START } | null>(null)
  const dragged = useRef(false)
  // How far in the map is: 1 is the starting view, smaller shows more of the area.
  const zoom = useRef(1)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; zoom: number } | null>(null)

  // Pixels per map unit: the canvas is drawn --u x --z x 2.58 tall (see App.css).
  const scale = () => (canvasRef.current?.offsetHeight ?? 0) / MAP_H

  // The furthest out you can go: where the drawing just fills the window.
  const minZoom = () => {
    const win = winRef.current
    const canvas = canvasRef.current
    if (!win || !canvas || !zoom.current) return 1
    const w = canvas.offsetWidth / zoom.current
    const h = canvas.offsetHeight / zoom.current
    return w && h ? Math.min(1, Math.max(win.clientWidth / w, win.clientHeight / h)) : 1
  }
  const applyZoom = (z: number) => {
    zoom.current = z
    wrapRef.current?.style.setProperty('--z', String(z))
    setAtMin(z <= minZoom() + 1e-6)
    setAtMax(z >= 1)
  }

  // Slide the canvas so `centre` is in the middle of the window, never showing past the drawing's edge.
  const show = () => {
    const win = winRef.current
    const canvas = canvasRef.current
    if (!win || !canvas || !scale()) return
    if (zoom.current < minZoom()) applyZoom(minZoom())
    const s = scale()
    if (!s) return
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

  // Change the zoom, keeping the map unit under (fx, fy) in the window where it is. Defaults to the middle.
  const zoomTo = (z: number, fx?: number, fy?: number) => {
    const win = winRef.current
    const s0 = scale()
    if (!win || !s0) return
    const r = win.getBoundingClientRect()
    const dx = (fx === undefined ? r.left + win.clientWidth / 2 : fx) - r.left - win.clientWidth / 2
    const dy = (fy === undefined ? r.top + win.clientHeight / 2 : fy) - r.top - win.clientHeight / 2
    const x = centre.current.x + dx / s0
    const y = centre.current.y + dy / s0
    applyZoom(Math.min(1, Math.max(minZoom(), z)))
    const s1 = scale()
    centre.current = { x: x - dx / s1, y: y - dy / s1 }
    setOpen(null)
    show()
  }

  // Back to the view the page starts on.
  const recentre = () => {
    setOpen(null)
    applyZoom(1)
    centre.current = START
    show()
  }

  // Pinching a trackpad (or ctrl + wheel) zooms; in full screen the plain wheel does too, since nothing scrolls there.
  useEffect(() => {
    const win = winRef.current
    if (!win) return
    const onWheel = (e: globalThis.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && !full) return
      e.preventDefault()
      zoomTo(zoom.current * Math.exp(-e.deltaY / 300), e.clientX, e.clientY)
    }
    win.addEventListener('wheel', onWheel, { passive: false })
    return () => win.removeEventListener('wheel', onWheel)
  }, [full])

  const toggleFull = () => {
    setOpen(null)
    if (!full) wrapRef.current?.requestFullscreen?.()?.catch(() => {})
    setFull(!full)
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragged.current = false
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      // A second finger turns the drag into a pinch.
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: zoom.current }
      drag.current = null
      dragged.current = true
      return
    }
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, from: centre.current }
  }
  const onPointerEnd = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId)
    pinch.current = null
    drag.current = null
  }
  const onPointerMove = (e: PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      zoomTo((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist, (a.x + b.x) / 2, (a.y + b.y) / 2)
      return
    }
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
    if (e.target === e.currentTarget && (e.key === '+' || e.key === '=' || e.key === '-')) {
      zoomTo(zoom.current * (e.key === '-' ? ZOOM_STEP : 1 / ZOOM_STEP))
      return
    }
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
        aria-label="Map of the route. Drag, or use the arrow keys, to look around, and plus and minus to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
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
      <button type="button" className="mapbtn share" aria-label="Back to the starting view" onClick={recentre}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
      <button type="button" className="mapbtn zin" aria-label="Zoom in" disabled={atMax} onClick={() => zoomTo(zoom.current / ZOOM_STEP)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14M12 5v14" />
        </svg>
      </button>
      <button type="button" className="mapbtn zout" aria-label="Zoom out" disabled={atMin} onClick={() => zoomTo(zoom.current * ZOOM_STEP)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12h14" />
        </svg>
      </button>
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
