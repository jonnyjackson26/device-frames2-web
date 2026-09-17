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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <BackButton href="/" label="Back to Home" />
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Device Frame Gallery
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Browse and download device frame PNGs, SVGs, and templates
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
              <p className="text-slate-600">Loading device frames...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-8">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {!loading && frames.length > 0 && (
          <FrameGallery frames={frames} />
        )}

        {!loading && frames.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg">No device frames found</p>
          </div>
        )}
      </div>
    </main>
  );
}
