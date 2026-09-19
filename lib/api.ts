import { DeviceListResponse, FindTemplateResponse } from "./types";

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
