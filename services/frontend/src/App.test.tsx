import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the church drawing and wedding details', () => {
  render(<App />)
  expect(screen.getByRole('img', { name: /St James' Church, Shere/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: "Ed & Katie's Wedding" })).toBeInTheDocument()
  const link = screen.getByRole('link', { name: "St James' Church, Shere" })
  expect(link).toHaveAttribute('href', 'https://maps.app.goo.gl/LxyWMHvFjjvrS6j67')
  expect(link).toHaveAttribute('target', '_blank')
  expect(screen.getByText('16th October 2027')).toBeInTheDocument()
})
