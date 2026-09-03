"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState, setActiveSection } from "@/lib/scroll";
import { site } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

/**
 * Owns every ScrollTrigger on the page. Writes scroll progress into
 * `scrollState` (read by the 3D layer's useFrame loops) and the active
 * section id (read by the Navbar). Renders nothing.
 */
export function ScrollManager() {
  useGSAP(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reduceMotion) {
      ScrollTrigger.create({
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        },
      });
    }

    for (const item of site.nav) {
      const id = item.href.replace("#", "");
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActiveSection(id);
        },
      });
    }
  });

  return null;
}
