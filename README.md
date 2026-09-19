# Device Frames 2

A frame-your-screenshot site just like
[device-frames-web](https://github.com/jonnyjackson26/device-frames-web), but
built on top of
[creating-device-frames](https://github.com/jonnyjackson26/creating-device-frames)
instead of the older
[device-frames-media](https://github.com/jonnyjackson26/device-frames-media)
repo. The two media repos organize and generate their frames differently
(no `mask.png`/backend API in the new one — frames are self-contained
transparent PNGs/SVGs), so this app composites frames itself, entirely
client-side (`<canvas>`), instead of calling an external API.

```
npm i
npm run dev
```

## Frame data

Frame assets (PNG + SVG) and their manifest live in `public/frames/`,
vendored from `creating-device-frames`'s `output/` folder so the site is
fully self-contained. To pull in new devices after adding them there:

```
npm run sync-frames -- --source /path/to/creating-device-frames
```

See `scripts/sync-frames.mjs` for details. Re-run it, review the diff, and
commit `public/frames/`.

## Fitting a screenshot to the frame

There's no `mask.png` in this data source, only a frame PNG with a
transparent screen cutout. Compositing a screenshot as a plain rectangle
into that cutout's *bounding box* isn't enough — the screen rect's own
corners sit outside the device's rounded silhouette, so a rectangular
image's square corners poke out past the frame's rounded edge (both the
screen cutout's rounding *and*, right at the very corner, the frame's own
outer edge).

Instead, `scripts/sync-frames.mjs` extracts the exact `clip-path:
polygon(...)` that `creating-device-frames` already computes for the
`.screen` slot in each device's generated `<id>.html` (a polygon
approximation of its rounded superellipse corners) and stores it in
`public/frames/index.json` as `screen_clip_polygon`. `lib/compose-frame.ts`
reuses that same polygon to clip the screenshot — in CSS (`clipPath`) for
the instant on-screen preview in `components/Phone.tsx`, and via
`Canvas2D`'s `ctx.clip()` for the downloaded PNG — so both match the frame
pixel-for-pixel with no separate mask image needed.
