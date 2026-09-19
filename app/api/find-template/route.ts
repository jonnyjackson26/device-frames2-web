import { NextRequest, NextResponse } from "next/server";
import { findManifestEntry } from "@/lib/manifest";

const FIND_TEMPLATE_REVALIDATE_SECONDS = 60 * 60 * 24;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const device = searchParams.get("device");
  const variation = searchParams.get("variation");
  const category = searchParams.get("category");

  if (!device || !variation) {
    return NextResponse.json(
      { error: "Missing device or variation parameter" },
      { status: 400 }
    );
  }

  const entry = await findManifestEntry(device, variation, category ?? undefined);

  if (!entry) {
    return NextResponse.json(
      { error: `No template found for ${device}/${variation}` },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      template_path: {
        frame: entry.png,
        svg: entry.svg,
        screen: entry.screen,
        frameSize: entry.frame_size,
        hexColor: entry.hex_color ?? "",
        name: entry.name,
        screenClipPolygon: entry.screen_clip_polygon,
      },
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${FIND_TEMPLATE_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    }
  );
}
