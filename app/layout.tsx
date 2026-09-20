import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Device Frames 2",
  description: "Put any image or screenshot in a device frame. iPhones, and more devices coming soon!",
};

// Page-level pinch-zoom is off so the only thing that zooms is the phone
// itself (see components/Phone.tsx's own pinch handling). Safari ignores
// this specific restriction for accessibility, but combined with the
// phone's touch-action:none it still keeps a pinch that starts on the
// phone from also zooming the page underneath it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Device Frames 2" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
