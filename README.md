# Device Frames 2

A frame-your-screenshot site just like
[device-frames-web](https://github.com/jonnyjackson26/device-frames-web), but
built on top of
[creating-device-frames](https://github.com/jonnyjackson26/creating-device-frames)
instead of the older
[device-frames-media](https://github.com/jonnyjackson26/device-frames-media)
repo. The two media repos organize and generate their frames differently
(no `mask.png`/backend API in the new one — frames are self-contained
transparent PNGs/SVGs), so this app composites frames itself with `sharp`
instead of calling an external API.

```
npm i
npm run dev
```

## Frame data

Frame assets (PNG + SVG) and their manifest live in `public/frames/`,
vendored from `creating-device-frames`'s `output/` folder so the site is
fully self-contained (that repo is private, so it can't be fetched live at
runtime). To pull in new devices after adding them there:

```
npm run sync-frames -- --source /path/to/creating-device-frames
```

See `scripts/sync-frames.mjs` for details. Re-run it, review the diff, and
commit `public/frames/`.
