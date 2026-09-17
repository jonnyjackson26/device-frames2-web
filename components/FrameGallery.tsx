'use client';

import { useState } from 'react';
import FrameCard from './FrameCard';

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

interface DeviceGroup {
  category: string;
  device: string;
  variants: DeviceFrame[];
}

interface FrameGalleryProps {
  frames: DeviceFrame[];
}

export default function FrameGallery({ frames }: FrameGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique categories
  const categories = Array.from(new Set(frames.map((f) => f.category))).sort();

  // Group frames by device
  const groupedByDevice = frames.reduce((acc: Record<string, DeviceGroup>, frame) => {
    const key = `${frame.category}-${frame.device}`;
    if (!acc[key]) {
      acc[key] = {
        category: frame.category,
        device: frame.device,
        variants: [],
      };
    }
    acc[key].variants.push(frame);
    return acc;
  }, {});

  // Convert to array and filter
  const deviceGroups = Object.values(groupedByDevice)
    .filter((group) => {
      const matchesCategory =
        !selectedCategory || group.category === selectedCategory;
      const matchesSearch =
        group.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.variants.some((v) =>
          v.variant.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.device.localeCompare(b.device));

  const totalDevices = Object.values(groupedByDevice).length;

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search by device or variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-slate-600 text-sm">
          Showing {deviceGroups.length} of {totalDevices} devices
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deviceGroups.map((group) => (
          <FrameCard
            key={`${group.category}-${group.device}`}
            category={group.category}
            device={group.device}
            variants={group.variants}
          />
        ))}
      </div>

      {/* Empty state */}
      {deviceGroups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No devices found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
