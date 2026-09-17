import { BackButton } from "@/components/ui/BackButton";

const linkClass = "text-blue-600 dark:text-blue-400 hover:underline";

export default function About() {
  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <BackButton />

      <h1 className="text-2xl font-bold mb-6">About Device Frames</h1>

      <div className="space-y-4 leading-relaxed">
        <p>
          Device Frames is a free tool for putting screenshots and images into realistic
          device mockups — starting with iPhones, with more devices on the way. It was
          built by{" "}
          <a href="https://jonny-jackson.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Jonny Jackson
          </a>.
        </p>

        <p>
          This site composites frames itself, on the server, using{" "}
          <a href="https://sharp.pixelplumbing.com/" target="_blank" rel="noopener noreferrer" className={linkClass}>
            sharp
          </a>{" "}
          — there&apos;s no separate API to call. The frames themselves (transparent PNGs
          and SVGs) are generated from a data-driven device-frame library.
        </p>

        <p>
          Want the raw frame PNGs and SVGs instead? Browse and download them on the{" "}
          <a href="/frame-media" className={linkClass}>
            frame media
          </a>{" "}
          page.
        </p>

        <p>
          Need more device frames or have a feature request? Email{" "}
          <a href="mailto:jrsjackson26@gmail.com" className={linkClass}>
            jrsjackson26@gmail.com
          </a>.
        </p>
      </div>
    </main>
  );
}
