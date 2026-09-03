"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  scrollState,
  setActiveSection,
  setActiveAct,
  getActiveAct,
  transitionState,
  type ActName,
} from "@/lib/scroll";
import { site } from "@/data/site";

gsap.registerPlugin(ScrollTrigger);

/** Interim: Projects maps 1:1 to the taxi act until the other four project
 * acts exist and this section gets split into per-project sub-triggers. */
const SECTION_TO_ACT: Record<string, ActName | undefined> = {
  hero: "none", // pinned-photo hero covers the canvas — park it empty
  about: "about",
  projects: "taxi",
};

const TRANSITION_DURATION = 0.45;

/**
 * Owns every ScrollTrigger on the page. Writes scroll progress into
 * `scrollState` (read by the 3D layer's useFrame loops), the active section
 * id (read by the Navbar), and now also the active 3D "act" + its
 * GSAP-driven transition tween (read by SceneManager / the act components).
 * Renders nothing.
 */
export function ScrollManager() {
  const timelineRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  // The act an in-flight "out" tween is heading toward, if it hasn't reached
  // its setActiveAct() call yet. Killing a timeline mid-"out" (fast scroll
  // crossing a section before the previous transition finishes) must not
  // strand activeAct — land the pending swap first, then start the next one.
  const pendingTarget = useRef<ActName | null>(null);

  useGSAP(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Duplicated (not imported) from quality.ts's detectTier heuristic on
    // purpose: quality.ts is documented 3D-layer-only, and this file must
    // not import from it to keep that boundary legible.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    const skipTransitionTween = reduceMotion || coarsePointer || fewCores;

    function interruptInFlight() {
      if (!timelineRef.current) return;
      timelineRef.current.kill();
      timelineRef.current = null;
      if (pendingTarget.current && pendingTarget.current !== getActiveAct()) {
        setActiveAct(pendingTarget.current);
      }
      pendingTarget.current = null;
    }

    function transitionTo(next: ActName) {
      interruptInFlight();

      if (next === getActiveAct()) {
        if (transitionState.phase === "idle") return;
        if (skipTransitionTween) {
          transitionState.phase = "idle";
          transitionState.t = 1;
          return;
        }
        timelineRef.current = gsap.to(transitionState, {
          t: 1,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
          onStart: () => {
            transitionState.phase = "in";
          },
          onComplete: () => {
            transitionState.phase = "idle";
            timelineRef.current = null;
          },
        });
        return;
      }

      if (skipTransitionTween) {
        transitionState.phase = "idle";
        transitionState.t = 1;
        setActiveAct(next);
        return;
      }

      pendingTarget.current = next;
      const tl = gsap.timeline({
        onComplete: () => {
          timelineRef.current = null;
          pendingTarget.current = null;
        },
      });
      timelineRef.current = tl;
      tl.set(transitionState, { phase: "out" })
        .to(transitionState, {
          t: 0,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        })
        .call(() => {
          setActiveAct(next);
          pendingTarget.current = null;
        })
        .set(transitionState, { phase: "in", t: 0.001 })
        .to(transitionState, {
          t: 1,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        })
        .set(transitionState, { phase: "idle" });
    }

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
          if (!self.isActive) return;
          setActiveSection(id);
          const act = SECTION_TO_ACT[id];
          if (act) transitionTo(act);
        },
      });
    }
  });

  return null;
}
