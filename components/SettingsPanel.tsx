"use client";

import { useMemo } from "react";
import { DeviceListResponse, CATEGORY_LABELS } from "@/lib/types";

interface SettingsPanelProps {
  deviceList: DeviceListResponse | null;
  selectedCategory: string;
  selectedDevice: string;
  selectedVariation: string;
  onCategoryChange: (category: string) => void;
  onDeviceChange: (device: string) => void;
  onVariationChange: (variation: string) => void;
  onDownload: () => void;
  onNewImage: () => void;
  isProcessing: boolean;
  error: string | null;
  hasFramedImage: boolean;
  hasFile: boolean;
}

export function SettingsPanel({
  deviceList,
  selectedCategory,
  selectedDevice,
  selectedVariation,
  onCategoryChange,
  onDeviceChange,
  onVariationChange,
  onDownload,
  onNewImage,
  isProcessing,
  error,
  hasFramedImage,
}: SettingsPanelProps) {
  const isLoading = !deviceList;
  const devices = deviceList?.devices ?? [];

  const categories = useMemo(
    () =>
      devices.length
        ? Array.from(new Set(devices.map((d) => d.category)))
        : selectedCategory
          ? [selectedCategory]
          : [],
    [devices, selectedCategory]
  );

  const devicesInCategory = useMemo(
    () =>
      devices.length && selectedCategory
        ? Array.from(
            new Set(
              devices.filter((d) => d.category === selectedCategory).map((d) => d.device)
            )
          )
        : selectedDevice
          ? [selectedDevice]
          : [],
    [devices, selectedCategory, selectedDevice]
  );

  const variations = useMemo(
    () =>
      devices.length && selectedCategory && selectedDevice
        ? devices
            .filter(
              (d) => d.category === selectedCategory && d.device === selectedDevice
            )
            .map((d) => d.variation)
        : selectedVariation
          ? [selectedVariation]
          : [],
    [devices, selectedCategory, selectedDevice, selectedVariation]
  );

  const firstDeviceForCategory = (category: string) => {
    const found = devices.find((d) => d.category === category);
    return found?.device ?? selectedDevice;
  };

  const firstVariationForDevice = (category: string, device: string) => {
    const found = devices.find((d) => d.category === category && d.device === device);
    return found?.variation ?? selectedVariation;
  };

  const categoryId = "settings-category";
  const deviceId = "settings-type";
  const variationId = "settings-variation";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Device Frames
      </h2>

      {/* Device Selector */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor={categoryId}
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Device Category
            </label>
            <select
              id={categoryId}
              value={selectedCategory}
              onChange={(e) => {
                const nextCategory = e.target.value;
                onCategoryChange(nextCategory);
                const nextDevice = firstDeviceForCategory(nextCategory);
                onDeviceChange(nextDevice);
                onVariationChange(firstVariationForDevice(nextCategory, nextDevice));
              }}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100"
              required
              disabled={isLoading}
            >
              {categories.length ? (
                categories.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category] || category}
                  </option>
                ))
              ) : (
                <option value="">Loading...</option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor={deviceId}
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Device Model
            </label>
            <select
              id={deviceId}
              value={selectedDevice}
              onChange={(e) => {
                const nextDevice = e.target.value;
                onDeviceChange(nextDevice);
                onVariationChange(firstVariationForDevice(selectedCategory, nextDevice));
              }}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
              disabled={isLoading || !selectedCategory}
            >
              {devicesInCategory.length ? (
                devicesInCategory.map((device) => (
                  <option key={device} value={device}>
                    {device}
                  </option>
                ))
              ) : (
                <option value="">Loading...</option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor={variationId}
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Device Variation
            </label>
            <select
              id={variationId}
              value={selectedVariation}
              onChange={(e) => onVariationChange(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
              disabled={isLoading || !selectedDevice}
            >
              {variations.length ? (
                variations.map((variation) => (
                  <option key={variation} value={variation}>
                    {variation}
                  </option>
                ))
              ) : (
                <option value="">Loading...</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        {hasFramedImage && (
          <button
            onClick={onNewImage}
            className="flex-1 py-3 px-4 bg-zinc-600 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm cursor-pointer"
          >
            Clear
          </button>
        )}
        <button
          onClick={onDownload}
          disabled={!hasFramedImage}
          className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Download"}
        </button>
      </div>

      <div className="flex gap-3 justify-center text-xs text-zinc-500 dark:text-zinc-400 mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <a href="/about" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          About
        </a>
        <span>·</span>
        <a href="/frame-media" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          View/Download PNGs
        </a>
      </div>
    </div>
  );
}
