export type Shape = { d: string; tint?: boolean } | { cx: number; cy: number; r: number; tint?: boolean }

export type TimelineEvent = {
  side: 'l' | 'r'
  row: number
  time: string
  what: string
  where: string
  shapes: Shape[]
}

export const events: TimelineEvent[] = [
  {
    side: 'r',
    row: 0,
    time: "12:30 pm",
    what: "Guests arrive",
    where: "Ushers will show you to your seat",
    shapes: [
      { d: "M14 70V34l26-20 26 20v36z" },
      { d: "M33 70V50a7 7 0 0 1 14 0v20" },
      { d: "M40 14V5M36 8h8", tint: true }
    ],
  },
  {
    side: 'l',
    row: 170,
    time: "1:00 pm",
    what: "The ceremony",
    where: "St James' Church",
    shapes: [
      { cx: 30, cy: 46, r: 17 },
      { cx: 52, cy: 46, r: 17, tint: true },
      { d: "M24 22l6-8 6 8-6 6z" }
    ],
  },
  {
    side: 'r',
    row: 340,
    time: "2:30 pm",
    what: "Drinks and canapés",
    where: "In the marquee, with the live band",
    shapes: [
      { d: "M18 14h22l-3 20a8 8 0 0 1-16 0z" },
      { d: "M29 42v22M21 66h16" },
      { d: "M50 30l10 34M44 26l6 4", tint: true },
      { cx: 62, cy: 22, r: 3, tint: true }
    ],
  },
  {
    side: 'l',
    row: 510,
    time: "4:00 pm",
    what: "Wedding breakfast",
    where: "Speeches at 5:30, then the cake",
    shapes: [
      { d: "M16 66h48M20 66V50h40v16M26 50V38h28v12M33 38V28h14v10" },
      { d: "M40 28v-8", tint: true },
      { d: "M40 14c-3 3-1 5 0 6 1-1 3-3 0-6z", tint: true }
    ],
  },
  {
    side: 'r',
    row: 680,
    time: "7:00 pm",
    what: "Boogie time",
    where: "With pizza by the slice",
    shapes: [
      { d: "M40 6V20" },
      { cx: 40, cy: 38, r: 18 },
      { d: "M22 38H58M40 20V56M26 28Q40 34 54 28M26 48Q40 42 54 48" },
      { d: "M66 16l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5zM14 58l1 3 3 1-3 1-1 3-1-3-3-1 3-1z", tint: true }
    ],
  },
  {
    side: 'l',
    row: 850,
    time: "11:00 pm",
    what: "Send-off",
    where: "Last dance at 10:30, then the late bus and taxis",
    shapes: [
      { d: "M52 14a26 26 0 1 0 14 38A22 22 0 0 1 52 14z" },
      { d: "M62 18l1 5 5 1-5 1-1 5-1-5-5-1 5-1z", tint: true }
    ],
  },
]
