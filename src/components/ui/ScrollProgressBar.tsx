"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/scroll";

/**
 * Accent hairline under the navbar showing page scroll progress. Reads the
 * GSAP-written scrollState in a rAF loop — never touches React state.
 */
export function ScrollProgressBar() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame: number;
    const tick = () => {
      if (bar.current) {
        bar.current.style.transform = `scaleX(${scrollState.progress})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent/80"
    />
  );
}
