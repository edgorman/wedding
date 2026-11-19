import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

test('renders the church drawing and wedding details', () => {
  render(<App />)
  expect(screen.getByRole('img', { name: /St James' Church, Shere/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: "Katie & Ed's Wedding" })).toBeInTheDocument()
  const church = screen.getByRole('link', { name: "St James' Church, Shere" })
  expect(church).toHaveAttribute('href', expect.stringContaining('maps.app.goo.gl'))
  const date = screen.getByRole('link', { name: 'Saturday, 16th October 2027' })
  expect(date).toHaveAttribute('href', expect.stringContaining('calendar.google.com'))
})

test('shows the day timeline', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'The day' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(6)
  expect(screen.getByText('Boogie time')).toBeInTheDocument()
})

test('map opens directions and the info panels toggle', () => {
  render(<App />)
  const link = screen.getByRole('link', { name: 'Click here for directions' })
  expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
  expect(link).toHaveAttribute('target', '_blank')
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.getByRole('dialog', { name: 'The guest bus' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('the map is not a link; full screen toggles and the directions link stays below', () => {
  render(<App />)
  expect(document.querySelector('.mapcanvas a')).toBeNull()
  expect(screen.queryByRole('link', { name: /Open directions/ })).toBeNull()
  expect(screen.getByRole('link', { name: 'Click here for directions' })).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
  const wrap = document.querySelector('.mapwrap')
  fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
  expect(wrap).toHaveClass('full')
  expect(screen.getByRole('button', { name: 'Exit full screen' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(wrap).not.toHaveClass('full')
  expect(document.body.style.overflow).toBe('')
})

test('dragging pans, zooming only goes out, and the clicks that end a drag open nothing', () => {
  // jsdom has no layout: give the window 300 x 450 and the canvas 2450 x 1160 at zoom 1 (half a pixel per
  // map unit), scaled by the zoom the page sets.
  const zoomOf = (el: HTMLElement) => parseFloat((el.closest('.mapwrap') as HTMLElement).style.getPropertyValue('--z') || '1')
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(450)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return 2450 * zoomOf(this)
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return 1160 * zoomOf(this)
  })
  render(<App />)
  const canvas = document.querySelector('.mapcanvas') as HTMLElement
  const win = document.querySelector('.mapwindow') as HTMLElement
  expect(canvas.style.transform).toBe('translate(-1700px, -500px)')
  const pointer = (type: string, clientX: number) => fireEvent(win, new MouseEvent(type, { bubbles: true, clientX, clientY: 100 }))
  pointer('pointerdown', 200)
  pointer('pointermove', 100)
  pointer('pointerup', 100)
  expect(canvas.style.transform).toBe('translate(-1800px, -500px)')
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.getByRole('dialog', { name: 'The guest bus' })).toBeInTheDocument()
  // The arrow keys move it too, and it stops at the edge of the drawing.
  fireEvent.keyDown(win, { key: 'ArrowRight' })
  expect(canvas.style.transform).toBe('translate(-1880px, -500px)')
  for (let i = 0; i < 30; i++) fireEvent.keyDown(win, { key: 'ArrowRight' })
  expect(canvas.style.transform).toBe('translate(-2150px, -500px)')

  // Zooming: you start fully in, so zoom in is off; zoom out stops where the drawing fills the window.
  const wrap = document.querySelector('.mapwrap') as HTMLElement
  const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
  const zoomOut = screen.getByRole('button', { name: 'Zoom out' })
  expect(zoomIn).toBeDisabled()
  fireEvent.click(zoomOut)
  expect(wrap.style.getPropertyValue('--z')).toBe('0.75')
  expect(zoomIn).toBeEnabled()
  for (let i = 0; i < 6; i++) fireEvent.click(zoomOut)
  expect(parseFloat(wrap.style.getPropertyValue('--z'))).toBeCloseTo(450 / 1160, 3)
  expect(zoomOut).toBeDisabled()
  fireEvent.keyDown(win, { key: '=' })
  expect(parseFloat(wrap.style.getPropertyValue('--z'))).toBeGreaterThan(450 / 1160)

  // The button in the corner goes back to the starting view.
  fireEvent.click(screen.getByRole('button', { name: 'Back to the starting view' }))
  expect(wrap.style.getPropertyValue('--z')).toBe('1')
  expect(canvas.style.transform).toBe('translate(-1700px, -500px)')
  vi.restoreAllMocks()
})

test('the work-in-progress banner can be closed', () => {
  render(<App />)
  expect(screen.getByRole('status')).toHaveTextContent('Work in progress')
  fireEvent.click(screen.getByRole('button', { name: 'Close banner' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('the work-in-progress banner closes once the hero has scrolled away', () => {
  render(<App />)
  const hero = document.querySelector('.hero') as HTMLElement
  const rect = vi.spyOn(hero, 'getBoundingClientRect')
  rect.mockReturnValue({ top: 0, bottom: 500 } as DOMRect)
  fireEvent.scroll(window)
  expect(screen.getByRole('status')).toBeInTheDocument()
  rect.mockReturnValue({ top: -600, bottom: -100 } as DOMRect)
  window.scrollBy = vi.fn()
  fireEvent.scroll(window)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('the scroll chevron scrolls down and hides at the bottom of the page', () => {
  const height = vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(5000)
  window.scrollTo = vi.fn()
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Scroll down' }))
  expect(window.scrollTo).toHaveBeenCalledWith({ top: window.innerHeight, behavior: 'smooth' })
  height.mockReturnValue(100)
  fireEvent.scroll(window)
  expect(screen.queryByRole('button', { name: 'Scroll down' })).not.toBeInTheDocument()
  height.mockRestore()
})
