"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

function touchDist(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Pinch-to-zoom and drag-to-pan for a single element, independent of the
 * page's own zoom. At rest (scale 1, one finger) it does nothing — a plain
 * tap/click/drag still reaches whatever's underneath (the file input,
 * drag-and-drop) untouched.
 *
 * Attaches real (non-React-synthetic) event listeners with
 * { passive: false } via a ref, rather than JSX on* props. React's
 * synthetic onTouchMove/onWheel handlers are attached passively by
 * default, so calling preventDefault() inside a JSX handler silently
 * fails to stop the browser's own gesture — that's the likely reason an
 * earlier version of this didn't reliably suppress native pinch/scroll.
 * Uses TouchEvent (not PointerEvent), so there's no setPointerCapture at
 * all — touch events already keep going to the element a touch started
 * on, and every handler is wrapped defensively so a gesture edge case
 * (a division by zero, an unexpected event ordering) can never throw an
 * uncaught error that crashes the page.
 */
export function usePinchZoom<T extends HTMLElement>(ref: RefObject<T | null>, maxScale = 4) {
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const [isGesturing, setIsGesturing] = useState(false);
  const gestureStart = useRef<
    | { kind: "pinch"; dist: number; scale: number }
    | { kind: "pan"; x: number; y: number; originX: number; originY: number }
    | null
  >(null);
  // Read inside the effect via a ref so the listeners don't need to be torn
  // down and re-attached on every transform change. Synced in its own
  // effect rather than written during render, which React's stricter rules
  // (correctly) treat as unsafe.
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      try {
        if (e.touches.length === 2) {
          const dist = touchDist(e.touches[0], e.touches[1]);
          if (dist > 0) {
            gestureStart.current = { kind: "pinch", dist, scale: transformRef.current.scale };
            setIsGesturing(true);
          }
        } else if (e.touches.length === 1 && transformRef.current.scale > 1) {
          const t = e.touches[0];
          gestureStart.current = {
            kind: "pan",
            x: t.clientX,
            y: t.clientY,
            originX: transformRef.current.x,
            originY: transformRef.current.y,
          };
          setIsGesturing(true);
        }
      } catch {
        // never let a gesture glitch crash the page
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      try {
        const g = gestureStart.current;
        if (!g) return;

        if (g.kind === "pinch" && e.touches.length === 2) {
          e.preventDefault();
          const dist = touchDist(e.touches[0], e.touches[1]);
          const nextScale = Math.min(maxScale, Math.max(1, g.scale * (dist / g.dist)));
          setTransform((t) => (nextScale <= 1 ? IDENTITY : { ...t, scale: nextScale }));
        } else if (g.kind === "pan" && e.touches.length === 1) {
          e.preventDefault();
          const t = e.touches[0];
          const dx = t.clientX - g.x;
          const dy = t.clientY - g.y;
          setTransform((cur) => ({ ...cur, x: g.originX + dx, y: g.originY + dy }));
        }
      } catch {
        // ignore
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      try {
        gestureStart.current = null;
        if (e.touches.length === 1 && transformRef.current.scale > 1) {
          const t = e.touches[0];
          gestureStart.current = {
            kind: "pan",
            x: t.clientX,
            y: t.clientY,
            originX: transformRef.current.x,
            originY: transformRef.current.y,
          };
        } else if (e.touches.length === 0) {
          setIsGesturing(false);
          setTransform((cur) => (cur.scale <= 1.001 ? IDENTITY : cur));
        }
      } catch {
        // ignore
      }
    };

    // Trackpad pinch on desktop arrives as a wheel event with ctrlKey set —
    // there's no multi-touch to read, just a delta to apply directly.
    const onWheel = (e: WheelEvent) => {
      try {
        if (!e.ctrlKey) return;
        e.preventDefault();
        setTransform((t) => {
          const nextScale = Math.min(maxScale, Math.max(1, t.scale - e.deltaY * 0.01));
          return nextScale <= 1 ? IDENTITY : { ...t, scale: nextScale };
        });
      } catch {
        // ignore
      }
    };

    const onDoubleClick = () => {
      try {
        setTransform((t) => (t.scale > 1 ? IDENTITY : { scale: 2, x: 0, y: 0 }));
      } catch {
        // ignore
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("dblclick", onDoubleClick);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("dblclick", onDoubleClick);
    };
  }, [ref, maxScale]);

  return {
    isZoomed: transform.scale > 1,
    style: {
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      transition: isGesturing ? "none" : "transform 0.15s ease-out",
    },
  };
}
