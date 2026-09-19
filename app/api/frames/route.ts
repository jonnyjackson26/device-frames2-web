import { NextResponse } from "next/server";
import { loadManifest } from "@/lib/manifest";

const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function GET() {
  try {
    const manifest = await loadManifest();

    const frames = manifest.devices.map((entry) => ({
      category: entry.category.replace(/-/g, " "),
      device: entry.device,
      variant: entry.variation,
      name: entry.name,
      framePath: entry.png,
      svgPath: entry.svg,
      thumbnail: entry.png,
      template: {
        frame: entry.png,
        svg: entry.svg,
        screen: entry.screen,
        frameSize: entry.frame_size,
        hexColor: entry.hex_color ?? "",
        name: entry.name,
        screenClipPolygon: entry.screen_clip_polygon,
      },
    }));

    return NextResponse.json(
      { frames },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching frames:", error);
    return NextResponse.json(
      { error: "Failed to fetch frames" },
      { status: 500 }
    );
  }
}
