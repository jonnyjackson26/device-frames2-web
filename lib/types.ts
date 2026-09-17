export interface FrameOptions {
  file: File;
  device: string;
  variation: string;
  category?: string;
}

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
