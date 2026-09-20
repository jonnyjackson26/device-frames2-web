"use client";

import { useCallback, useId } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { InlineSvg } from "@/components/InlineSvg";
import type { FrameTemplate } from "@/lib/types";

const FRAME_CLASS_NAME = "block max-w-full max-h-full w-auto h-auto select-none pointer-events-none";

interface PhoneProps {
  userImageUrl: string | null;
  template: FrameTemplate | null;
  onFileSelect: (file: File) => void;
  emptyFrameUrl: string | null;
  className?: string;
}

export function Phone({ userImageUrl, template, onFileSelect, emptyFrameUrl, className }: PhoneProps) {
  const inputId = useId();

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
  const frameSize = template?.frameSize;

  return (
    // Shrink-wraps to the frame <img>'s own rendered box (native `<img>`
    // sizing, not a manually-computed aspect-ratio) so the percentage-
    // positioned screenshot overlay below is always measured against the
    // frame's *actual* box — never a taller/wider container that would
    // scale it wrong and let it spill past the frame's edges.
    <div
      className={`relative inline-block max-w-full max-h-full min-h-0 min-w-0 bg-transparent ${className ?? ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {frameImageUrl && (
        frameImageUrl.endsWith(".svg") ? (
          // Inline, not <img src>: Safari decodes an <img>-sourced SVG to a
          // bitmap sized for its on-screen box and doesn't reliably re-render
          // that as vector data on pinch-zoom, so it blurs like a raster
          // image past that resolution. Inlining keeps it real vector DOM
          // content, redrawn crisply at any zoom.
          <InlineSvg src={frameImageUrl} svgClassName={FRAME_CLASS_NAME} />
        ) : (
          <img src={frameImageUrl} alt="Device frame" className={FRAME_CLASS_NAME} draggable={false} />
        )
      )}

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
