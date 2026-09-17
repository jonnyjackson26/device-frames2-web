#!/usr/bin/env node
// Vendors frame assets from a local checkout of `creating-device-frames`
// into public/frames/, so the site can serve them without ever reaching
// out to that (private) repo at runtime.
//
// Usage:
//   node scripts/sync-frames.mjs --source /path/to/creating-device-frames
//   SOURCE_DIR=/path/to/creating-device-frames node scripts/sync-frames.mjs
//
// Re-run whenever creating-device-frames gets new devices, then commit the
// resulting changes under public/frames/.

import { readFile, writeFile, mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--source") args.source = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const sourceDir = path.resolve(
  args.source || process.env.SOURCE_DIR || "../creating-device-frames"
);

if (!existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  console.error(
    "Pass --source /path/to/creating-device-frames (a local checkout of the media repo)."
  );
  process.exit(1);
}

const sourceIndexPath = path.join(sourceDir, "output", "index.json");
if (!existsSync(sourceIndexPath)) {
  console.error(`Missing ${sourceIndexPath} — run creating-device-frames's build first.`);
  process.exit(1);
}

const sourceIndex = JSON.parse(await readFile(sourceIndexPath, "utf8"));

const outDir = path.join(repoRoot, "public", "frames");
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const devices = [];

for (const [category, models] of Object.entries(sourceIndex)) {
  for (const [device, variations] of Object.entries(models)) {
    for (const [variation, entry] of Object.entries(variations)) {
      const relDir = path.join(category, device, variation);
      const destDir = path.join(outDir, relDir);
      await mkdir(destDir, { recursive: true });

      const pngSrc = path.join(sourceDir, entry.png);
      const svgSrc = path.join(sourceDir, entry.svg);
      const pngDestName = path.basename(entry.png);
      const svgDestName = path.basename(entry.svg);

      if (existsSync(pngSrc)) {
        await copyFile(pngSrc, path.join(destDir, pngDestName));
      } else {
        console.warn(`Missing PNG for ${category}/${device}/${variation}, skipping copy.`);
      }
      if (existsSync(svgSrc)) {
        await copyFile(svgSrc, path.join(destDir, svgDestName));
      }

      devices.push({
        category,
        device,
        variation,
        name: entry.name,
        frame_size: entry.frameSize,
        screen: entry.screen,
        hex_color: entry.hexColor ?? "",
        png: `/frames/${relDir}/${pngDestName}`.replace(/\\/g, "/"),
        svg: existsSync(svgSrc) ? `/frames/${relDir}/${svgDestName}`.replace(/\\/g, "/") : null,
      });
    }
  }
}

devices.sort((a, b) =>
  `${a.category}/${a.device}/${a.variation}`.localeCompare(
    `${b.category}/${b.device}/${b.variation}`
  )
);

const manifest = { count: devices.length, devices };
await writeFile(path.join(outDir, "index.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Synced ${devices.length} device variation(s) into public/frames/.`);
