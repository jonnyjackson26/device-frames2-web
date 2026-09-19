'use client';

import { useState } from 'react';
import JSZip from 'jszip';

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
  template: FrameTemplate;
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
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg hover:scale-105">
      {/* Frame Preview */}
      <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden group">
        {selectedVariant.thumbnail ? (
          // Plain <img>, not next/image: these are small, self-hosted SVGs we
          // vendor ourselves, so there's nothing for Next's image optimizer
          // to usefully do (and it blocks SVG sources by default anyway).
          <img
            src={selectedVariant.thumbnail}
            alt={`${device} - ${selectedVariant.variant}`}
            className="object-contain max-w-full max-h-full"
          />
        ) : (
          <div className="text-xs text-slate-400">No preview</div>
        )}

        {/* Download Icon Overlay - Always visible on mobile, hover on desktop */}
        <button
          onClick={downloadAllFiles}
          disabled={isLoading}
          className="absolute inset-0 transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label="Download all files"
        >
          <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            {isLoading ? (
              <div className="bg-white rounded-full p-4 shadow-lg">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-slate-500 text-xs uppercase tracking-wide">{category}</p>
          <h3 className="text-slate-900 font-semibold text-sm mb-3">
            {device}
          </h3>

          {/* Variant Dropdown */}
          <div>
            <select
              value={selectedVariantIndex}
              onChange={(e) => setSelectedVariantIndex(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors appearance-none cursor-pointer"
            >
              {variants.map((variant, index) => (
                <option key={index} value={index}>
                  {variant.variant}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
