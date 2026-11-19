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
  const link = screen.getByRole('link', { name: /Open directions/ })
  expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
  expect(link).toHaveAttribute('target', '_blank')
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.getByRole('dialog', { name: 'The guest bus' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('the map is not a link; share opens directions and full screen toggles', () => {
  render(<App />)
  expect(document.querySelector('.mapcanvas a')).toBeNull()
  expect(screen.getByRole('link', { name: /Open directions/ })).toHaveAttribute('target', '_blank')
  expect(screen.getByRole('link', { name: 'Click here for directions' })).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'))
  const wrap = document.querySelector('.mapwrap')
  fireEvent.click(screen.getByRole('button', { name: 'Full screen' }))
  expect(wrap).toHaveClass('full')
  expect(screen.getByRole('button', { name: 'Exit full screen' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(wrap).not.toHaveClass('full')
  expect(document.body.style.overflow).toBe('')
})

test('dragging pans the map, and the click that ends a drag opens nothing', () => {
  // jsdom has no layout: give the window 300 x 450 and the canvas 1200 x 900 (half a pixel per map unit).
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(450)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(1200)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(900)
  render(<App />)
  const canvas = document.querySelector('.mapcanvas') as HTMLElement
  const win = document.querySelector('.mapwindow') as HTMLElement
  expect(canvas.style.transform).toBe('translate(-450px, -240px)')
  const pointer = (type: string, clientX: number) => fireEvent(win, new MouseEvent(type, { bubbles: true, clientX, clientY: 100 }))
  pointer('pointerdown', 200)
  pointer('pointermove', 100)
  pointer('pointerup', 100)
  expect(canvas.style.transform).toBe('translate(-550px, -240px)')
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.getByRole('dialog', { name: 'The guest bus' })).toBeInTheDocument()
  // The arrow keys move it too, and it stops at the edge of the drawing.
  fireEvent.keyDown(win, { key: 'ArrowRight' })
  expect(canvas.style.transform).toBe('translate(-630px, -240px)')
  for (let i = 0; i < 30; i++) fireEvent.keyDown(win, { key: 'ArrowRight' })
  expect(canvas.style.transform).toBe('translate(-900px, -240px)')
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
