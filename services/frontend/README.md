# frontend

The wedding website: a static Vite/React page deployed to Cloudflare Pages. There is no backend.

```sh
moon run services/frontend:dev    # dev server
moon run services/frontend:test   # unit tests
moon run services/frontend:build  # production build into dist/
```

## Artwork

All the drawn pictures (timeline icons, map icons, the church drawing, the frame and so on) are files in `src/artwork/`, so they can be swapped for hand-drawn versions by dropping in a file with the same name. See [`src/artwork/README.md`](src/artwork/README.md) for the list of names and sizes.
