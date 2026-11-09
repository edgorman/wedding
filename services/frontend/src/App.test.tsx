import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the site title', () => {
  render(<App />)
  expect(screen.getByText("Ed and Katie's Wedding")).toBeInTheDocument()
})
