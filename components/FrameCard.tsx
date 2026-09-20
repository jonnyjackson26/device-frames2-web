'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { InlineSvg } from '@/components/InlineSvg';

const THUMBNAIL_CLASS_NAME = 'object-contain max-w-full max-h-full drop-shadow-sm';

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
  const [isLoading, setIsLoading] = useState(false);

  const selectedVariant = variants[selectedVariantIndex];

  const downloadAllFiles = async () => {
    try {
      setIsLoading(true);

      const zip = new JSZip();
      const folderName = `${device.replace(/\s+/g, '-')}-${selectedVariant.variant.replace(/\s+/g, '-')}`;

      // Download and add frame.png
      const frameResponse = await fetch(selectedVariant.framePath);
      if (!frameResponse.ok) throw new Error('Failed to fetch frame');
      const frameBlob = await frameResponse.blob();
      zip.file('frame.png', frameBlob);

      // Download and add frame.svg, if available
      if (selectedVariant.svgPath) {
        const svgResponse = await fetch(selectedVariant.svgPath);
        if (svgResponse.ok) {
          const svgBlob = await svgResponse.blob();
          zip.file('frame.svg', svgBlob);
        }
      }

      // Create and add template.json from template data
      const templateJson = JSON.stringify(selectedVariant.template, null, 2);
      zip.file('template.json', templateJson);

      // Generate zip and download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
      {/* Frame Preview — tall/portrait, like the phones themselves */}
      <div className="relative w-full aspect-[3/4] bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center overflow-hidden p-6">
        {selectedVariant.thumbnail ? (
          // Inline, not <img src> or next/image: Safari doesn't reliably
          // re-render an <img>-sourced SVG as vector data on pinch-zoom (see
          // Phone.tsx), and next/image blocks SVG sources by default anyway
          // — there's nothing for its optimizer to do on a 15KB local file.
          selectedVariant.thumbnail.endsWith('.svg') ? (
            <InlineSvg src={selectedVariant.thumbnail} svgClassName={THUMBNAIL_CLASS_NAME} />
          ) : (
            <img
              src={selectedVariant.thumbnail}
              alt={`${device} - ${selectedVariant.variant}`}
              className={THUMBNAIL_CLASS_NAME}
            />
          )
        ) : (
          <div className="text-xs text-zinc-400">No preview</div>
        )}

        {/* Download Icon Overlay - Always visible on mobile, hover on desktop */}
        <button
          onClick={downloadAllFiles}
          disabled={isLoading}
          className="absolute inset-0 transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label="Download all files"
        >
          <div className="opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 absolute inset-0" />
          <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 relative">
            {isLoading ? (
              <div className="bg-white dark:bg-zinc-900 rounded-full p-3.5 shadow-lg">
                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-full p-3.5 shadow-lg hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-zinc-400 dark:text-zinc-500 text-[11px] uppercase tracking-wide font-medium">{category}</p>
        <h3 className="text-zinc-900 dark:text-zinc-50 font-semibold text-sm mb-3">{device}</h3>

        {/* Color swatches — click to switch variant */}
        <div className="flex items-center gap-2 flex-wrap">
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
        {selectedVariant.template.hexColor && (
          <p className="mt-2 text-[11px] font-mono uppercase text-zinc-400 dark:text-zinc-500">
            {selectedVariant.template.hexColor}
          </p>
        )}
      </div>
    </div>
  );
}
