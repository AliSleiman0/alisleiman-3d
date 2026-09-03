"use client";

import { useEffect, useState } from "react";

/**
 * Deterministic prefers-reduced-motion hook. framer-motion's own
 * `useReducedMotion` initializes lazily and can lose the race against its
 * animation-disabling behavior (Motion v13 skips `whileInView`/`animate`
 * under reduced motion), leaving `initial`-hidden content stuck invisible.
 * Reading matchMedia directly makes the branch reliable: SSR and first
 * client render return false, then this flips post-hydration.
 */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return reduced;
}
