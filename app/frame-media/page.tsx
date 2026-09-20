'use client';

import { useEffect, useState } from 'react';
import FrameGallery from '@/components/FrameGallery';
import { BackButton } from '@/components/ui/BackButton';

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

export default function FrameMediaPage() {
  const [frames, setFrames] = useState<DeviceFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await fetch('/api/frames');
        if (!response.ok) throw new Error('Failed to fetch frames');
        const data = await response.json();
        setFrames(data.frames);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFrames();
  }, []);

  return (
    <main className="min-h-screen bg-dot-grid bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <BackButton href="/" label="Back to Home" />
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Frame Media
          </p>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Device Frame Gallery
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
            Browse and download device frame PNGs, SVGs, and templates
          </p>
          <a
            href="https://github.com/jonnyjackson26/creating-device-frames"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            View Source Data on GitHub
          </a>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-200 dark:border-zinc-800 border-t-blue-600 mb-4 mx-auto"></div>
              <p className="text-zinc-500 dark:text-zinc-400">Loading device frames...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        )}

        {!loading && frames.length > 0 && (
          <FrameGallery frames={frames} />
        )}

        {!loading && frames.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">No device frames found</p>
          </div>
        )}
      </div>
    </main>
  );
}
