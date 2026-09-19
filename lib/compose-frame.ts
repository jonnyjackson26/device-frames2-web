import type { FrameTemplate } from "./types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Parses a CSS `clip-path: polygon(...)` argument list ("18.187% 0.000%,
 * 81.813% 0.000%, ...") into fractional [x, y] pairs (0-1), relative to
 * whatever box the polygon is applied to.
 */
function parsePolygonPoints(polygon: string): [number, number][] {
  return polygon
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [xStr, yStr] = pair.split(/\s+/);
      return [parseFloat(xStr) / 100, parseFloat(yStr) / 100];
    });
}

/**
 * Composites a user-selected image into a device frame, matching the
 * frame's rounded-corner screen cutout exactly (via the same clip-path
 * polygon the frame's own HTML/SVG uses) so a screenshot's square corners
 * never poke out past the frame's rounded edge. Runs entirely client-side
 * (canvas), so it's fast enough to call on every selection with no
 * server round-trip.
 */
export async function composeFrame(
  userImageSrc: string,
  template: FrameTemplate
): Promise<Blob> {
  const [userImg, frameImg] = await Promise.all([
    loadImage(userImageSrc),
    loadImage(template.frame),
  ]);

  const canvasWidth = frameImg.naturalWidth || template.frameSize.width;
  const canvasHeight = frameImg.naturalHeight || template.frameSize.height;
  // The recorded frame_size/screen rect is in the data source's own
  // coordinate space; scale it onto the frame image's actual pixels in
  // case they differ slightly (rounding during rasterization).
  const scaleX = canvasWidth / template.frameSize.width;
  const scaleY = canvasHeight / template.frameSize.height;
  const screenLeft = template.screen.x * scaleX;
  const screenTop = template.screen.y * scaleY;
  const screenWidth = template.screen.width * scaleX;
  const screenHeight = template.screen.height * scaleY;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.save();
  if (template.screenClipPolygon) {
    const points = parsePolygonPoints(template.screenClipPolygon);
    ctx.beginPath();
    points.forEach(([fx, fy], i) => {
      const x = screenLeft + fx * screenWidth;
      const y = screenTop + fy * screenHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(screenLeft, screenTop, screenWidth, screenHeight);
    ctx.clip();
  }

  // object-fit: cover — crop the source image to the screen rect's aspect ratio.
  const screenAspect = screenWidth / screenHeight;
  const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
  let sx = 0, sy = 0, sw = userImg.naturalWidth, sh = userImg.naturalHeight;
  if (imgAspect > screenAspect) {
    sw = userImg.naturalHeight * screenAspect;
    sx = (userImg.naturalWidth - sw) / 2;
  } else {
    sh = userImg.naturalWidth / screenAspect;
    sy = (userImg.naturalHeight - sh) / 2;
  }
  ctx.drawImage(userImg, sx, sy, sw, sh, screenLeft, screenTop, screenWidth, screenHeight);
  ctx.restore();

  ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to render composited image"));
    }, "image/png");
  });
}
