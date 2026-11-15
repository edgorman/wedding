// Every drawn asset on the site is a file under src/artwork/ (see artwork/README.md).
// art('timeline/ceremony') returns the URL of timeline/ceremony.svg, .png, .webp or .jpg,
// so a new drawing can be dropped in under the same name in any of those formats.
const files = import.meta.glob<string>('./artwork/**/*.{png,webp,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// If a name exists in several formats the first one listed here wins.
const formats = ['png', 'webp', 'jpg', 'jpeg', 'svg']

export function art(name: string): string {
  for (const ext of formats) {
    const url = files[`./artwork/${name}.${ext}`]
    if (url) return url
  }
  throw new Error(`Missing artwork file: src/artwork/${name}.(${formats.join('|')})`)
}
