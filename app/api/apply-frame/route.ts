import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { findManifestEntry } from "@/lib/manifest";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const device = formData.get("device");
    const variation = formData.get("variation");
    const category = formData.get("category");

    if (!(file instanceof File) || typeof device !== "string" || typeof variation !== "string") {
      return NextResponse.json(
        { error: "Missing file, device, or variation" },
        { status: 400 }
      );
    }

    const entry = await findManifestEntry(
      device,
      variation,
      typeof category === "string" ? category : undefined
    );

    if (!entry) {
      return NextResponse.json(
        { error: `No template found for ${device}/${variation}` },
        { status: 404 }
      );
    }

    const framePath = path.join(process.cwd(), "public", entry.png);
    const frameImage = sharp(framePath);
    const frameMeta = await frameImage.metadata();
    const frameWidth = frameMeta.width ?? entry.frame_size.width;
    const frameHeight = frameMeta.height ?? entry.frame_size.height;

    // The recorded frame_size/screen rect is in the data source's own
    // coordinate space; scale it onto the actual exported PNG's pixels in
    // case they differ slightly (rounding during rasterization).
    const scaleX = frameWidth / entry.frame_size.width;
    const scaleY = frameHeight / entry.frame_size.height;
    const screenLeft = Math.round(entry.screen.x * scaleX);
    const screenTop = Math.round(entry.screen.y * scaleY);
    const screenWidth = Math.round(entry.screen.width * scaleX);
    const screenHeight = Math.round(entry.screen.height * scaleY);

    const userImageBuffer = Buffer.from(await file.arrayBuffer());
    const fittedUserImage = await sharp(userImageBuffer)
      .rotate()
      .resize(screenWidth, screenHeight, { fit: "cover" })
      .png()
      .toBuffer();

    const frameBuffer = await frameImage.png().toBuffer();

    const output = await sharp({
      create: {
        width: frameWidth,
        height: frameHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: fittedUserImage, left: screenLeft, top: screenTop },
        { input: frameBuffer, left: 0, top: 0 },
      ])
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Error applying frame:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
