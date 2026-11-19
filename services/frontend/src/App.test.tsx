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
  // jsdom has no layout: give the window 300 x 450 and the canvas 3700 x 1450 at zoom 1 (half a pixel per
  // map unit); zooming scales it with a transform.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(450)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(3700)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(1450)
  render(<App />)
  const canvas = document.querySelector('.mapcanvas') as HTMLElement
  const win = document.querySelector('.mapwindow') as HTMLElement
  expect(canvas.style.transform).toBe('translate(-1700px, -500px) scale(1)')
  // Nothing has moved yet, so there is nothing to go back to.
  expect(screen.queryByRole('button', { name: 'Back to the route' })).not.toBeInTheDocument()
  const pointer = (type: string, clientX: number) => fireEvent(win, new MouseEvent(type, { bubbles: true, clientX, clientY: 100 }))
  pointer('pointerdown', 200)
  pointer('pointermove', 100)
  pointer('pointerup', 100)
  expect(canvas.style.transform).toBe('translate(-1800px, -500px) scale(1)')
  expect(screen.getByRole('button', { name: 'Back to the route' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'About the guest bus' }))
  expect(screen.getByRole('dialog', { name: 'The guest bus' })).toBeInTheDocument()
  // The arrow keys move it too, and it stops at the edge of the drawing.
  fireEvent.keyDown(win, { key: 'ArrowRight' })
  expect(canvas.style.transform).toBe('translate(-1880px, -500px) scale(1)')
  for (let i = 0; i < 40; i++) fireEvent.keyDown(win, { key: 'ArrowRight' })
  expect(canvas.style.transform).toBe('translate(-3400px, -500px) scale(1)')

  // The button back to the route only shows once you have moved away from it.
  fireEvent.click(screen.getByRole('button', { name: 'Back to the route' }))
  expect(canvas.style.transform).toBe('translate(-1700px, -500px) scale(1)')
  expect(screen.queryByRole('button', { name: 'Back to the route' })).not.toBeInTheDocument()

  // Zooming: you start fully in, so zoom in is off; zoom out stops where the drawing fills the window.
  const wrap = document.querySelector('.mapwrap') as HTMLElement
  const zoomIn = screen.getByRole('button', { name: 'Zoom in' })
  const zoomOut = screen.getByRole('button', { name: 'Zoom out' })
  expect(zoomIn).toBeDisabled()
  fireEvent.click(zoomOut)
  expect(wrap.style.getPropertyValue('--z')).toBe('0.75')
  expect(zoomIn).toBeEnabled()
  for (let i = 0; i < 6; i++) fireEvent.click(zoomOut)
  expect(parseFloat(wrap.style.getPropertyValue('--z'))).toBeCloseTo(450 / 1450, 3)
  expect(zoomOut).toBeDisabled()
  fireEvent.keyDown(win, { key: '=' })
  expect(parseFloat(wrap.style.getPropertyValue('--z'))).toBeGreaterThan(450 / 1450)

  // The recentre button also undoes any zoom.
  fireEvent.click(document.querySelector('.mapbtn.share') as HTMLElement)
  expect(wrap.style.getPropertyValue('--z')).toBe('1')
  expect(canvas.style.transform).toBe('translate(-1700px, -500px) scale(1)')
  vi.restoreAllMocks()
})

test('the work-in-progress banner can be closed', () => {
  render(<App />)
  expect(screen.getByRole('status')).toHaveTextContent('Work in progress')
  fireEvent.click(screen.getByRole('button', { name: 'Close banner' }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('the dev site says it is not the real site and links to it', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ environment: 'staging', siteUrl: 'https://katieanded.com' }) }))
  render(<App />)
  expect(await screen.findByText("This isn't the real site.")).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Go to the real site' })).toHaveAttribute('href', 'https://katieanded.com')
  vi.unstubAllGlobals()
})

test('the work-in-progress banner closes once the hero has scrolled away', () => {
  render(<App />)
  const hero = document.querySelector('.hero') as HTMLElement
  const rect = vi.spyOn(hero, 'getBoundingClientRect')
  rect.mockReturnValue({ top: 0, bottom: 500 } as DOMRect)
  fireEvent.scroll(window)
  expect(screen.getByRole('status')).toBeInTheDocument()
  rect.mockReturnValue({ top: -600, bottom: -100 } as DOMRect)
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

test('nearby places open a panel that links to Google Maps', () => {
  render(<App />)
  for (const name of ['Gomshall station', 'Hurtwood Hotel', 'Wotton House', "The King's Head", 'Premier Inn Guildford North', 'Supreme Taxis', 'A3 Cars and Guildford Taxis']) {
    fireEvent.click(screen.getByRole('button', { name: `About ${name}` }))
    const panel = screen.getByRole('dialog', { name })
    expect(panel.querySelector('a')).toHaveAttribute('href', expect.stringMatching(/google\.com\/maps|maps\.app\.goo\.gl/))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  }
})
