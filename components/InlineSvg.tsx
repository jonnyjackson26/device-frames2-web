"use client";

import { useEffect, useId, useState } from "react";
import { loadInlineSvg } from "@/lib/inline-svg";

interface InlineSvgProps {
  src: string;
  svgClassName?: string;
}

/**
 * Renders a frame SVG as real inline DOM content rather than an <img src>.
 * Safari decodes an <img>-sourced SVG to a bitmap sized for its on-screen
 * box and doesn't reliably re-render that as vector data on pinch-zoom, so
 * it blurs like a raster image past that resolution. Inline SVG is always
 * redrawn from vector data, so it stays crisp at any zoom level.
 */
export function InlineSvg({ src, svgClassName }: InlineSvgProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadInlineSvg(src, uid, svgClassName ?? "")
      .then((m) => {
        if (!cancelled) setMarkup(m);
      })
      .catch(() => {
        if (!cancelled) setMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [src, uid, svgClassName]);

  if (!markup) return null;

  // display:contents so this mount div contributes no box of its own —
  // the injected <svg> (already carrying svgClassName) sizes itself
  // exactly as if it were a direct child of our parent.
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markup }} />;
}
