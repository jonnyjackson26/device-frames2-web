import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DeviceScreen, DeviceSize } from "./types";

export interface ManifestEntry {
  category: string;
  device: string;
  variation: string;
  name: string;
  frame_size: DeviceSize;
  screen: DeviceScreen;
  screen_clip_polygon: string | null;
  hex_color: string;
  png: string;
  svg: string | null;
}

interface Manifest {
  count: number;
  devices: ManifestEntry[];
}

let cached: Manifest | null = null;

export async function loadManifest(): Promise<Manifest> {
  if (cached) return cached;
  const manifestPath = path.join(process.cwd(), "public", "frames", "index.json");
  const raw = await readFile(manifestPath, "utf8");
  cached = JSON.parse(raw) as Manifest;
  return cached;
}

export async function findManifestEntry(
  device: string,
  variation: string,
  category?: string
): Promise<ManifestEntry | null> {
  const manifest = await loadManifest();
  const matches = manifest.devices.filter(
    (d) => d.device === device && d.variation === variation && (!category || d.category === category)
  );
  return matches[0] ?? null;
}
