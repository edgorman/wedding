const directions =
  "https://www.google.com/maps/dir/?api=1&origin=St+James'+Church,+Shere&destination=Burrows+Lea+Country+House&travelmode=driving"

export const calendarUrl =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Katie+%26+Ed%27s+Wedding&dates=20271016T130000/20271016T230000&ctz=Europe/London&location=St+James%27+Church,+Shere&details=Ceremony+at+1:00+pm+at+St+James%27+Church,+Shere.+Reception+at+Burrows+Lea+Country+House.'

export const directionsUrl = directions

export type Spot = {
  title: string
  lines: string[]
  linkText: string
  href: string
  label: string
  box: { left: string; top: string; width: string; height: string }
}

export const spots: Record<'church' | 'bus' | 'venue', Spot> = {
  church: {
    title: "St James' Church",
    lines: ['Ceremony at 1:00 pm. Guests arrive from 12:30 pm and ushers will show you to your seat.'],
    linkText: 'Church Lane, Shere, GU5 9HJ',
    href: 'https://maps.app.goo.gl/LxyWMHvFjjvrS6j67',
    label: "About St James' Church",
    box: { left: '30.2%', top: '14.2%', width: '14.4%', height: '11.2%' },
  },
  bus: {
    title: 'The guest bus',
    lines: ['Leaves the church at 2:30 pm and takes about 15 minutes to reach Burrows Lea.'],
    linkText: 'Open the route in Google Maps',
    href: directions,
    label: 'About the guest bus',
    box: { left: '50%', top: '52%', width: '13.5%', height: '7%' },
  },
  venue: {
    title: 'Burrows Lea Country House',
    lines: ['Wedding breakfast at 4:00 pm, boogie time at 7:00 pm and the send-off at 11:00 pm.'],
    linkText: 'Hook Lane, Shere, GU5 9QG',
    href: 'https://www.google.com/maps/search/?api=1&query=Burrows+Lea+Country+House',
    label: 'About Burrows Lea Country House',
    box: { left: '51.5%', top: '69.5%', width: '23.2%', height: '8.3%' },
  },
}
