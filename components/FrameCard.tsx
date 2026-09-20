'use client';

import { useState } from 'react';

interface FrameTemplate {
  frame: string;
  svg: string | null;
  screen: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameSize: {
    width: number;
    height: number;
  };
}

interface DeviceFrame {
  category: string;
  device: string;
  variant: string;
  framePath: string;
  svgPath: string | null;
  thumbnail: string;
  template: FrameTemplate & { hexColor?: string };
}

interface FrameCardProps {
  category: string;
  device: string;
  variants: DeviceFrame[];
}

export default function FrameCard({ category, device, variants }: FrameCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant = variants[selectedVariantIndex];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow duration-200">
      {/* Frame Preview — tall/portrait, like the phones themselves. A plain
          <img>, not inline SVG: object-fit reliably shrinks a real <img> to
          fit both dimensions of its box, which a raw inline <svg> doesn't
          consistently do (it can overflow one axis instead of scaling down
          proportionally) — that's what was cropping these too tight on
          narrow screens. */}
      <div className="relative w-full aspect-[3/4] bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center p-6">
        {selectedVariant.thumbnail ? (
          <img
            src={selectedVariant.thumbnail}
            alt={`${device} - ${selectedVariant.variant}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-xs text-zinc-400">No preview</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-zinc-400 dark:text-zinc-500 text-[11px] uppercase tracking-wide font-medium">{category}</p>
        <h3 className="text-zinc-900 dark:text-zinc-50 font-semibold text-sm mb-3">{device}</h3>

        {/* Color swatches — click to switch variant */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {variants.map((variant, index) => {
            const hex = variant.template.hexColor;
            const isSelected = index === selectedVariantIndex;
            return (
              <button
                key={index}
                onClick={() => setSelectedVariantIndex(index)}
                title={variant.variant}
                aria-label={`${variant.variant}${hex ? ` (${hex})` : ''}`}
                aria-pressed={isSelected}
                className={`h-6 w-6 rounded-full cursor-pointer transition-transform ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900 scale-105'
                    : 'ring-1 ring-inset ring-black/10 dark:ring-white/15 hover:scale-105'
                }`}
                style={{ backgroundColor: hex || '#cccccc' }}
              />
            );
          })}
        </div>

        <div className="flex gap-2">
          <a
            href={selectedVariant.framePath}
            download
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Download PNG
          </a>
          {selectedVariant.svgPath && (
            <a
              href={selectedVariant.svgPath}
              download
              className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Download SVG
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
