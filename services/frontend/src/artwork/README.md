# Artwork

Every drawn picture on the site is a file in this folder. To use a hand-drawn version, **save your drawing with exactly the same file name** and replace the old file (or add it next to it). Nothing else needs to change: the site looks files up by name, and the sizes and positions below stay the same.

- **Formats:** `.svg`, `.png`, `.webp` or `.jpg`. The extension can differ from the original, so `ceremony.png` replaces `ceremony.svg`. If both exist the order is png, webp, jpg, svg.
- **PNGs:** use a transparent background, and draw at about 3x the pixel size shown below so it stays sharp on phones.
- **Keep the proportions** in the table. A different shape gets stretched to fit its frame.
- The default drawings have a slight hand-drawn wobble baked in. Your own artwork is shown exactly as drawn.

## Timeline icons (`timeline/`)

Shown beside each time on "The day". Square, 80 x 80 units (shown at 76px on desktop, 52px on phones). The default line colours are ink `#3b3a36` and brown `#8a6a4f`.

| File | Event |
| --- | --- |
| `timeline/guests-arrive.svg` | 12:30 pm, church |
| `timeline/ceremony.svg` | 1:00 pm, rings |
| `timeline/drinks.svg` | 2:30 pm, glass |
| `timeline/wedding-breakfast.svg` | 4:00 pm, cake |
| `timeline/boogie.svg` | 7:00 pm, disco ball |
| `timeline/send-off.svg` | 11:00 pm, moon |

## Map (`map/`)

The map is a stack of transparent layers that all line up on a 600 x 900 canvas, from back to front: `map`, every `house`, every `tree`, `route`, then `church`, `venue`, `bus`.

| File | What | Proportions (width x height) |
| --- | --- | --- |
| `map/map.svg` | Land, fields, roads and rivers. | 600 x 900 |
| `map/route.svg` | The red bus route. Must line up with `map`, so draw it on the same 600 x 900 canvas. | 600 x 900 |
| `map/church.svg` | St James' Church (tap for info). | 94 x 106 |
| `map/bus.svg` | The guest bus (tap for info). | 95 x 77 |
| `map/venue.svg` | Burrows Lea Country House (tap for info). | 134 x 80 |
| `map/house.svg` | One small house, repeated about 190 times at different sizes. | 18 x 20 |
| `map/tree.svg` | One tree, repeated about 250 times at different sizes. | 20 x 23 |

Where each icon sits is listed in [`../mapLayout.ts`](../mapLayout.ts). Move or resize one there if a new drawing needs a different frame. The tap targets for the church, bus and venue are in [`../mapInfo.ts`](../mapInfo.ts).

## Everything else

| File | What | Proportions |
| --- | --- | --- |
| `hero/church.webp` | The watercolour church at the top of the page. | 706 x 798 px now (shown up to 22rem wide) |
| `background/paper.jpg` | The paper texture behind the page. It tiles, so it should join up at its edges. | any size |
| `couple/photo.webp` | The photo of Katie and Ed in the oval. | 17 x 20 (760 x 896 px now) |
| `couple/frame.svg` | The picture frame around that photo. | 124 x 142 |
