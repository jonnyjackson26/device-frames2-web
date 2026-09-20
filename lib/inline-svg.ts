const svgTextCache = new Map<string, Promise<string>>();

function fetchSvgText(src: string): Promise<string> {
  let cached = svgTextCache.get(src);
  if (!cached) {
    cached = fetch(src).then((r) => r.text());
    svgTextCache.set(src, cached);
  }
  return cached;
}

/**
 * Namespaces every `id="x"` in an SVG document, and every reference to it
 * (`url(#x)`, `href="#x"`), with a unique suffix. Needed so multiple copies
 * of the same frame SVG can be inlined into one page (the frame gallery
 * shows several) without their <defs> — gradients, clip-paths, filters —
 * colliding by id.
 */
function namespaceIds(svg: string, uid: string): string {
  const ids = new Set(Array.from(svg.matchAll(/\sid="([^"]+)"/g), (m) => m[1]));
  let out = svg;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`id="${escaped}"`, "g"), `id="${id}-${uid}"`)
      .replace(new RegExp(`(#)${escaped}(["')])`, "g"), `$1${id}-${uid}$2`);
  }
  return out;
}

/**
 * Fetches a frame SVG and returns it ready to inline into the DOM (as real
 * vector content, not an <img> resource — see components/InlineSvg.tsx for
 * why that distinction matters), with the given class applied to its root
 * <svg> element and its ids namespaced for safe multi-instance use.
 */
export async function loadInlineSvg(src: string, uid: string, svgClassName: string): Promise<string> {
  const raw = await fetchSvgText(src);
  const namespaced = namespaceIds(raw, uid);
  return namespaced.replace("<svg ", `<svg class="${svgClassName}" `);
}
