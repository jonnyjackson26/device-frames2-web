"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

/**
 * Pinch-to-zoom and drag-to-pan for a single element, independent of the
 * page's own zoom. At rest (scale 1) it gets out of the way entirely — a
 * plain tap/click/drag still reaches whatever's underneath (the file
 * input, drag-and-drop) untouched. Only once a second finger comes down,
 * or the element is already zoomed in, does it capture the gesture.
 */
export function usePinchZoom(maxScale = 4) {
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  // Mirrors pointers.current.size > 0, but as state: reading a ref during
  // render (to decide whether to transition) isn't safe, so this is kept
  // in sync at the same call sites that mutate the ref.
  const [isGesturing, setIsGesturing] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2) {
        // Capture is best-effort (keeps tracking a finger that slides outside
        // the element) — it can throw in edge cases where the browser
        // doesn't consider the pointer "active" yet, which must not stop the
        // pinch itself from being tracked below.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        const [a, b] = Array.from(pointers.current.values());
        pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: transform.scale };
        panStart.current = null;
        setIsGesturing(true);
      } else if (pointers.current.size === 1 && transform.scale > 1) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        panStart.current = { x: e.clientX, y: e.clientY, originX: transform.x, originY: transform.y };
        setIsGesturing(true);
      }
    },
    [transform.scale, transform.x, transform.y]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2 && pinchStart.current) {
        e.preventDefault();
        const [a, b] = Array.from(pointers.current.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const nextScale = Math.min(
          maxScale,
          Math.max(1, pinchStart.current.scale * (dist / pinchStart.current.dist))
        );
        setTransform((t) => (nextScale <= 1 ? IDENTITY : { ...t, scale: nextScale }));
      } else if (pointers.current.size === 1 && panStart.current) {
        e.preventDefault();
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setTransform((t) => ({ ...t, x: panStart.current!.originX + dx, y: panStart.current!.originY + dy }));
      }
    },
    [maxScale]
  );

  const endPointer = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    pointers.current.delete(e.pointerId);
    pinchStart.current = null;
    panStart.current = null;
    if (pointers.current.size === 1) {
      const [p] = Array.from(pointers.current.values());
      setTransform((t) => {
        if (t.scale <= 1) return IDENTITY;
        panStart.current = { x: p.x, y: p.y, originX: t.x, originY: t.y };
        return t;
      });
    } else {
      setIsGesturing(false);
      setTransform((t) => (t.scale <= 1.001 ? IDENTITY : t));
    }
  }, []);

  const onDoubleClick = useCallback(() => {
    setTransform((t) => (t.scale > 1 ? IDENTITY : { scale: 2, x: 0, y: 0 }));
  }, []);

  return {
    isZoomed: transform.scale > 1,
    style: {
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      transition: isGesturing ? "none" : "transform 0.15s ease-out",
    },
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onDoubleClick,
    },
  };
}
