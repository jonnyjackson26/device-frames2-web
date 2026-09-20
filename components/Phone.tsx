"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { InlineSvg } from "@/components/InlineSvg";
import { usePinchZoom } from "@/lib/use-pinch-zoom";
import type { FrameTemplate } from "@/lib/types";

const FRAME_CLASS_NAME = "block w-full h-full select-none pointer-events-none";
const FALLBACK_RATIO = 9 / 19.5; // used only before a template has loaded

interface PhoneProps {
  userImageUrl: string | null;
  template: FrameTemplate | null;
  onFileSelect: (file: File) => void;
  emptyFrameUrl: string | null;
  className?: string;
}

export function Phone({ userImageUrl, template, onFileSelect, emptyFrameUrl, className }: PhoneProps) {
  const inputId = useId();
  const outerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const pinchZoom = usePinchZoom();

  const frameSize = template?.frameSize;
  const ratio = frameSize ? frameSize.width / frameSize.height : FALLBACK_RATIO;

  // A plain inline <svg> (unlike <img>) doesn't reliably participate in the
  // browser's replaced-element "shrink to fit while keeping aspect ratio"
  // sizing algorithm — max-height:100% on it can't resolve while its own
  // auto-height ancestor's height is still being computed, so it can render
  // at its full intrinsic size and overflow its container instead of being
  // capped. Measuring the available space ourselves and setting an explicit
  // pixel size sidesteps that circularity entirely.
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const measure = () => {
      const availW = el.clientWidth;
      const availH = el.clientHeight;
      if (!availW || !availH) return;
      let width = availW;
      let height = width / ratio;
      if (height > availH) {
        height = availH;
        width = height * ratio;
      }
      setSize({ width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ratio]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const frameImageUrl = template?.frame ?? emptyFrameUrl;
  const screen = template?.screen;

  return (
    <div
      ref={outerRef}
      className={`relative w-full h-full flex items-center justify-center bg-transparent touch-none overflow-hidden ${className ?? ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      {...pinchZoom.handlers}
    >
      {size && (
        <div
          className="relative"
          style={{ width: size.width, height: size.height, ...pinchZoom.style }}
        >
          {frameImageUrl &&
            (frameImageUrl.endsWith(".svg") ? (
              // Inline, not <img src>: Safari decodes an <img>-sourced SVG to a
              // bitmap sized for its on-screen box and doesn't reliably re-render
              // that as vector data on pinch-zoom, so it blurs like a raster
              // image past that resolution. Inlining keeps it real vector DOM
              // content, redrawn crisply at any zoom.
              <InlineSvg src={frameImageUrl} svgClassName={FRAME_CLASS_NAME} />
            ) : (
              <img src={frameImageUrl} alt="Device frame" className={FRAME_CLASS_NAME} draggable={false} />
            ))}

          {/* User's screenshot, clipped to the frame's exact rounded screen cutout so
              its square corners never poke out past the frame's rounded edge. Pure
              CSS (positioned + clip-path), so it shows the instant a file is picked
              — no processing step, no spinner. */}
          {userImageUrl && screen && frameSize && (
            <img
              src={userImageUrl}
              alt="Your screenshot"
              className="absolute object-cover pointer-events-none"
              style={{
                left: `${(screen.x / frameSize.width) * 100}%`,
                top: `${(screen.y / frameSize.height) * 100}%`,
                width: `${(screen.width / frameSize.width) * 100}%`,
                height: `${(screen.height / frameSize.height) * 100}%`,
                clipPath: template?.screenClipPolygon
                  ? `polygon(${template.screenClipPolygon})`
                  : undefined,
              }}
            />
          )}
        </div>
      )}

      {!userImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-12 h-12 text-zinc-400 dark:text-zinc-600 opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center font-medium">
              Drag and drop or <span className="text-blue-600 dark:text-blue-400 underline">browse files</span>
            </p>
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        id={inputId}
      />
    </div>
  );
}
