"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  scrollState,
  introState,
  setActiveSection,
  setActiveAct,
  getActiveAct,
  transitionState,
  type ActName,
} from "@/lib/scroll";
import { site } from "@/data/site";
import { detectLowMotion } from "@/lib/motionTier";

gsap.registerPlugin(ScrollTrigger);

const SECTION_TO_ACT: Record<string, ActName | undefined> = {
  hero: "none", // pinned-photo hero covers the canvas — park it empty
  about: "none", // copy over the particle background — no 3D beat
  intro: "intro", // not in the nav — a pure motion beat between About and Projects
  projects: "none", // 2D image grid, no 3D beat — park it empty too
};

/** Sections whose own 0→1 progress is scrubbed into a lib/scroll field for
 * the act mounted over them. Same trigger as the section window, so the
 * bounds can never drift apart. */
const SECTION_PROGRESS: Record<string, { progress: number } | undefined> = {
  intro: introState,
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
    const skipTransitionTween = detectLowMotion();

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

    // Section windows are contiguous and non-overlapping (hero → about →
    // intro → projects → contact). That matters: onToggle only acts on
    // activation, so an overlap would strand activeAct when scrolling back up.
    const navIds = site.nav.map((item) => item.href.replace("#", ""));
    const sectionIds = Array.from(
      new Set([...navIds, ...Object.keys(SECTION_TO_ACT)])
    );

    for (const id of sectionIds) {
      const sink = SECTION_PROGRESS[id];
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (!self.isActive) return;
          // Only nav sections drive the navbar: a non-nav beat keeps the last
          // content section highlighted (scrollspy semantics).
          if (navIds.includes(id)) setActiveSection(id);
          const act = SECTION_TO_ACT[id];
          if (act) transitionTo(act);
        },
        onUpdate:
          sink && !reduceMotion
            ? (self) => {
                sink.progress = self.progress;
              }
            : undefined,
      });
    }
  });

  return null;
}
