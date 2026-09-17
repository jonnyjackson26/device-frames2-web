import { FrameOptions, DeviceListResponse, FindTemplateResponse } from "./types";

export async function listDevices(): Promise<DeviceListResponse> {
  const response = await fetch("/api/list-devices", { cache: "force-cache" });

  if (!response.ok) {
    throw new Error("Failed to fetch device list");
  }

  return await response.json();
}

export async function findTemplate(
  device: string,
  variation: string,
  category?: string
): Promise<FindTemplateResponse> {
  const params = new URLSearchParams({ device, variation });
  if (category) params.set("category", category);
  const response = await fetch(`/api/find-template?${params.toString()}`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to find template");
  }

  return await response.json();
}

export async function applyDeviceFrame(
  options: FrameOptions
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", options.file);
  formData.append("device", options.device);
  formData.append("variation", options.variation);
  if (options.category) {
    formData.append("category", options.category);
  }

  const response = await fetch("/api/apply-frame", {
    method: "POST",
    cache: "no-store",
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Failed to apply device frame");
    }
    throw new Error("Failed to apply device frame");
  }

  return await response.blob();
}
