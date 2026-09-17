import { NextRequest, NextResponse } from "next/server";
import { loadManifest } from "@/lib/manifest";

const LIST_DEVICES_REVALIDATE_SECONDS = 60 * 60 * 6;

export async function GET(_request: NextRequest) {
  try {
    const manifest = await loadManifest();

    return NextResponse.json(
      {
        count: manifest.count,
        devices: manifest.devices.map((d) => ({
          category: d.category,
          device: d.device,
          variation: d.variation,
          name: d.name,
          frame_size: d.frame_size,
          screen: d.screen,
          hex_color: d.hex_color ?? "",
        })),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${LIST_DEVICES_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching device list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
