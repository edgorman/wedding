export type TimelineEvent = {
  side: 'l' | 'r'
  row: number
  time: string
  what: string
  where: string
  icon: string
}

export const events: TimelineEvent[] = [
  {
    side: 'r',
    row: 0,
    time: "12:30 pm",
    what: "Guests arrive",
    where: "Ushers will show you to your seat",
    icon: 'guests-arrive',
  },
  {
    side: 'l',
    row: 170,
    time: "1:00 pm",
    what: "The ceremony",
    where: "St James' Church",
    icon: 'ceremony',
  },
  {
    side: 'r',
    row: 340,
    time: "2:30 pm",
    what: "Drinks and canapés",
    where: "In the marquee, with the live band",
    icon: 'drinks',
  },
  {
    side: 'l',
    row: 510,
    time: "4:00 pm",
    what: "Wedding breakfast",
    where: "Speeches at 5:30, then the cake",
    icon: 'wedding-breakfast',
  },
  {
    side: 'r',
    row: 680,
    time: "7:00 pm",
    what: "Boogie time",
    where: "With pizza by the slice",
    icon: 'boogie',
  },
  {
    side: 'l',
    row: 850,
    time: "11:00 pm",
    what: "Send-off",
    where: "Last dance at 10:30, then the late bus and taxis",
    icon: 'send-off',
  },
]
