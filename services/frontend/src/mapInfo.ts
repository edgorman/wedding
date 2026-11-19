import type { Box } from './mapLayout'

export const directionsUrl =
  "https://www.google.com/maps/dir/?api=1&origin=St+James'+Church,+Shere&destination=Burrows+Lea+Country+House&travelmode=driving"

export const calendarUrl =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Katie+%26+Ed%27s+Wedding&dates=20271016T130000/20271016T230000&ctz=Europe/London&location=St+James%27+Church,+Shere&details=Ceremony+at+1:00+pm+at+St+James%27+Church,+Shere.+Reception+at+Burrows+Lea+Country+House.'

export type Spot = {
  title: string
  lines: string[]
  linkText: string
  href: string
  label: string
  // The tap target, in map units like the boxes in mapLayout.ts.
  box: Box
  // Nearby places only: the simple icon drawn in that box (the church, bus and venue have their own drawings).
  icon?: 'station' | 'hotel' | 'taxi'
}

const maps = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
// A simple square icon centred on a point of the map, in map units.
const pin = (x: number, y: number): Box => [x - 38, y - 38, 76, 76]

export const spots = {
  church: {
    title: "St James' Church",
    lines: ['Ceremony at 1:00 pm. Guests arrive from 12:30 pm and ushers will show you to your seat.'],
    linkText: 'Church Lane, Shere, GU5 9HJ',
    href: 'https://maps.app.goo.gl/LxyWMHvFjjvrS6j67',
    label: "About St James' Church",
    box: [181.2, 127.8, 86.4, 100.8],
  },
  bus: {
    title: 'The guest bus',
    lines: ['Leaves the church at 2:30 pm and takes about 15 minutes to reach Burrows Lea.'],
    linkText: 'Open the route in Google Maps',
    href: directionsUrl,
    label: 'About the guest bus',
    box: [285, 450, 111, 99],
  },
  venue: {
    title: 'Burrows Lea Country House',
    lines: ['Wedding breakfast at 4:00 pm, boogie time at 7:00 pm and the send-off at 11:00 pm.'],
    linkText: 'Hook Lane, Shere, GU5 9QG',
    href: 'https://www.google.com/maps/search/?api=1&query=Burrows+Lea+Country+House',
    label: 'About Burrows Lea Country House',
    box: [309, 625.5, 139.2, 74.7],
  },
  gomshall: {
    title: 'Gomshall station',
    lines: ['Great Western Railway, North Downs line, with trains to Guildford and Reigate. Check times before you travel: they are about hourly at peak times and less often otherwise, and Sunday trains eastbound only go as far as Redhill.'],
    linkText: 'Open in Google Maps',
    href: maps('Gomshall Railway Station'),
    label: 'About Gomshall station',
    box: pin(784, 165),
    icon: 'station',
  },
  hurtwood: {
    title: 'Hurtwood Hotel',
    lines: ['A hotel with a bar and restaurant in Peaslake, to the south of Shere.'],
    linkText: 'Open in Google Maps',
    href: maps('Hurtwood Hotel, Peaslake, GU5 9RR'),
    label: 'About Hurtwood Hotel',
    box: pin(650, 1361),
    icon: 'hotel',
  },
  wotton: {
    title: 'Wotton House',
    lines: ['A country house hotel in its own gardens, on the Guildford Road between Abinger and Dorking.'],
    linkText: 'Open in Google Maps',
    href: maps('Wotton House, Guildford Road, Dorking, RH5 6HS'),
    label: 'About Wotton House',
    box: pin(2067, 521),
    icon: 'hotel',
  },
  kingshead: {
    title: "The King's Head",
    lines: ['A village pub with rooms in Holmbury St Mary.'],
    linkText: 'Open in Google Maps',
    href: maps("The King's Head, Pitland Street, Holmbury St Mary, RH5 6NP"),
    label: "About The King's Head",
    box: pin(1637, 1649),
    icon: 'hotel',
  },
  premier: {
    title: 'Premier Inn Guildford North',
    lines: ['Just off the top of this map, on Parkway on the north side of Guildford.'],
    linkText: 'Open in Google Maps',
    href: 'https://maps.app.goo.gl/5TKQf6rJpCNem9Nj9',
    label: 'About Premier Inn Guildford North',
    box: pin(-2707, -965),
    icon: 'hotel',
  },
  supreme: {
    title: 'Supreme Taxis',
    lines: ['A taxi firm based in Dorking that covers Gomshall. Book ahead on the day.'],
    linkText: 'Find it in Google Maps',
    href: maps('Supreme Taxis Dorking'),
    label: 'About Supreme Taxis',
    box: pin(3764, -386),
    icon: 'taxi',
  },
  a3cars: {
    title: 'A3 Cars and Guildford Taxis',
    lines: ['A taxi firm based in Guildford.'],
    linkText: 'Find it in Google Maps',
    href: maps('A3 Cars and Guildford Taxis'),
    label: 'About A3 Cars and Guildford Taxis',
    box: pin(-2986, -628),
    icon: 'taxi',
  },
} satisfies Record<string, Spot>
