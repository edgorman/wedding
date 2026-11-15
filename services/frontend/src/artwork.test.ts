import { art } from './artwork'
import { events } from './timeline'

test('every drawn asset the page uses has an artwork file', () => {
  const names = [
    'hero/church',
    'background/paper',
    'couple/photo',
    'couple/frame',
    ...events.map((e) => `timeline/${e.icon}`),
    ...['map', 'route', 'church', 'venue', 'bus', 'house', 'tree'].map((n) => `map/${n}`),
  ]
  for (const name of names) expect(art(name)).toBeTruthy()
})

test('a missing artwork file is reported by name', () => {
  expect(() => art('timeline/nope')).toThrow('src/artwork/timeline/nope')
})
