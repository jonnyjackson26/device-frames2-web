"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Phone } from "@/components/Phone";
import { SettingsPanel } from "@/components/SettingsPanel";
import { findTemplate, listDevices } from "@/lib/api";
import { composeFrame } from "@/lib/compose-frame";
import { DeviceListResponse, FrameTemplate } from "@/lib/types";

const FALLBACK_CATEGORY = "phones";
const FALLBACK_DEVICE = "iphone-16-pro-max";
const FALLBACK_VARIATION = "desert-titanium";

const DEFAULT_CATEGORY = process.env.NEXT_PUBLIC_DEFAULT_CATEGORY?.trim() || FALLBACK_CATEGORY;
const DEFAULT_DEVICE = process.env.NEXT_PUBLIC_DEFAULT_DEVICE?.trim() || FALLBACK_DEVICE;
const DEFAULT_VARIATION = process.env.NEXT_PUBLIC_DEFAULT_VARIATION?.trim() || FALLBACK_VARIATION;

export default function Home() {
  const [deviceList, setDeviceList] = useState<DeviceListResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [device, setDevice] = useState(DEFAULT_DEVICE);
  const [variation, setVariation] = useState(DEFAULT_VARIATION);
  const [template, setTemplate] = useState<FrameTemplate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultsAppliedRef = useRef(false);

  // Fetch device list on mount
  useEffect(() => {
    let isMounted = true;

    listDevices()
      .then((data) => {
        if (!isMounted) return;
        setDeviceList(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load device list:", err);
        setError("Failed to load device list. Please refresh the page.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure a selection is always present once the device list is loaded
  useEffect(() => {
    if (!deviceList) return;

    const devices = deviceList.devices;
    if (!devices.length) return;

    const categories = Array.from(new Set(devices.map((d) => d.category)));
    const shouldUseDefaults = !defaultsAppliedRef.current;

    const preferredCategory =
      shouldUseDefaults && DEFAULT_CATEGORY && categories.includes(DEFAULT_CATEGORY)
        ? DEFAULT_CATEGORY
        : category;
    const nextCategory =
      preferredCategory && categories.includes(preferredCategory)
        ? preferredCategory
        : categories[0];

    const devicesInCategory = Array.from(
      new Set(devices.filter((d) => d.category === nextCategory).map((d) => d.device))
    );
    const preferredDevice =
      shouldUseDefaults && DEFAULT_DEVICE && devicesInCategory.includes(DEFAULT_DEVICE) &&
      (!DEFAULT_CATEGORY || nextCategory === DEFAULT_CATEGORY)
        ? DEFAULT_DEVICE
        : device;
    const nextDevice =
      preferredDevice && devicesInCategory.includes(preferredDevice)
        ? preferredDevice
        : devicesInCategory[0] || "";

    const variationsForDevice = devices
      .filter((d) => d.category === nextCategory && d.device === nextDevice)
      .map((d) => d.variation);
    const preferredVariation =
      shouldUseDefaults && DEFAULT_VARIATION && variationsForDevice.includes(DEFAULT_VARIATION) &&
      (!DEFAULT_DEVICE || nextDevice === DEFAULT_DEVICE)
        ? DEFAULT_VARIATION
        : variation;
    const nextVariation =
      preferredVariation && variationsForDevice.includes(preferredVariation)
        ? preferredVariation
        : variationsForDevice[0] || "";

    if (nextCategory !== category) setCategory(nextCategory);
    if (nextDevice !== device) setDevice(nextDevice);
    if (nextVariation !== variation) setVariation(nextVariation);

    defaultsAppliedRef.current = true;
  }, [deviceList, category, device, variation]);

  // Resolve the frame template (image URL + sizing) for the active selection
  useEffect(() => {
    if (!category || !device || !variation) return;
    let isMounted = true;

    findTemplate(device, variation, category)
      .then((data) => {
        if (!isMounted) return;
        setTemplate(data.template_path);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load template:", err);
        setTemplate(null);
      });

    return () => {
      isMounted = false;
    };
  }, [category, device, variation]);

  // Instant, local preview: an object URL for the picked file, positioned and
  // clipped to the frame's screen cutout entirely with CSS (see Phone.tsx) —
  // no processing step, so it shows the moment a file is chosen.
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleDownload = async () => {
    if (!previewUrl || !template) return;

    setIsDownloading(true);
    setError(null);
    try {
      const blob = await composeFrame(previewUrl, template);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      a.download = `${device}-${variation}-${timestamp}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare download");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
  };

  const frameImageUrl = template?.frame ?? "/placeholder_frame.png";

  return (
    <div className="h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black font-sans overflow-auto md:overflow-hidden p-4">
      <main className="flex flex-col md:flex-row md:h-full gap-8">
        {/* Phone Panel */}
        <div className="h-screen md:h-full md:flex-1 min-w-0 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 flex items-center justify-center md:overflow-auto">
          <Phone
            userImageUrl={previewUrl}
            template={template}
            onFileSelect={handleFileSelect}
            emptyFrameUrl={frameImageUrl}
            className="max-h-full"
          />
        </div>

        {/* Settings Panel */}
        <div className="w-full md:w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 md:overflow-auto">
          <SettingsPanel
            deviceList={deviceList}
            selectedCategory={category}
            selectedDevice={device}
            selectedVariation={variation}
            onCategoryChange={setCategory}
            onDeviceChange={setDevice}
            onVariationChange={setVariation}
            onDownload={handleDownload}
            onNewImage={handleReset}
            isProcessing={isDownloading}
            error={error}
            hasFramedImage={selectedFile !== null}
            hasFile={selectedFile !== null}
          />
        </div>
      </main>
    </div>
  );
}
