"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide scroll damping (Lenis) on top of native scrolling. Two effects:
 * the page glides instead of jumping (`lerp`), and one wheel notch / trackpad
 * swipe travels less (`wheelMultiplier`) — the actual "slow the user down"
 * lever. Native scroll position is still the source of truth, so sticky
 * runways, the fixed canvas and every ScrollTrigger work unchanged; Lenis is
 * driven from GSAP's ticker so the scroll and the tweens share one clock.
 *
 * Desktop only: touch stays native (smoothing touch fights the OS inertia
 * and reads as broken). Off under reduced motion, like the rest of the site.
 * In-page anchors (`a[href^="#"]` — currently just the hero CTA) are
 * intercepted by one document-level click handler and scrolled through
 * Lenis so they glide instead of jumping.
 * Renders nothing.
 */
// No fixed top nav any more, so anchors land flush. If a fixed header comes
// back, set this to minus its height and restore `scroll-padding-top`.
const NAV_OFFSET = 0;

export function SmoothScroll() {
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.7,
      smoothWheel: true,
      syncTouch: false,
      // Lenis's own `anchors` option doesn't preventDefault, so the browser
      // still jumps natively before the glide starts — handled below instead.
      anchors: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // GSAP's lag smoothing would desync the ticker time Lenis integrates on.
    gsap.ticker.lagSmoothing(0);

    // In-page anchors glide through Lenis. Plain left-clicks only — modified
    // clicks keep their browser meaning (new tab etc.).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href") ?? "";
      if (hash.length < 2) return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: NAV_OFFSET });
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
