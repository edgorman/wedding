import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the church drawing and wedding details', () => {
  render(<App />)
  expect(screen.getByRole('img', { name: /St James' Church, Shere/ })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: "Ed & Katie's Wedding" })).toBeInTheDocument()
  expect(screen.getByText("St James' Church, Shere")).toBeInTheDocument()
  expect(screen.getByText('October 2027')).toBeInTheDocument()
})
