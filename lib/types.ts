export interface DeviceScreen {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DeviceSize {
  width: number;
  height: number;
}

export interface Device {
  category: string;
  device: string;
  variation: string;
  name: string;
  frame_size: DeviceSize;
  screen: DeviceScreen;
  hex_color: string;
}

export interface DeviceListResponse {
  count: number;
  devices: Device[];
}

export interface FrameTemplate {
  frame: string;
  svg: string | null;
  screen: DeviceScreen;
  frameSize: DeviceSize;
  hexColor: string;
  name: string;
  /**
   * CSS polygon() points (percentages of the screen box's own
   * width/height) tracing the device's rounded-corner screen cutout.
   * Used to clip an uploaded screenshot so its square corners don't
   * poke out past the frame's rounded edge. Null if the source frame
   * didn't publish one (falls back to a plain rectangular crop).
   */
  screenClipPolygon: string | null;
}

export interface FindTemplateResponse {
  template_path: FrameTemplate;
}

export const CATEGORY_LABELS: Record<string, string> = {
  phones: "Phones",
  watches: "Watches",
  tablets: "Tablets",
  laptops: "Laptops",
};
