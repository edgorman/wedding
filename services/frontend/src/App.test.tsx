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

test('the work-in-progress banner can be closed', () => {
  render(<App />)
  expect(screen.getByRole('status')).toHaveTextContent('Work in progress')
  fireEvent.click(screen.getByRole('button', { name: 'Close banner' }))
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
