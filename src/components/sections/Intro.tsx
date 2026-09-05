"use client";

import { useRef, type PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { introState } from "@/lib/scroll";
import { site } from "@/data/site";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

gsap.registerPlugin(ScrollTrigger);

// Last pointer position while dragging. Module-level scratch: one Intro per
// page, and this must not be React state (it changes on every pointer move).
let lastX = 0;
let lastY = 0;

function writePointer(e: PointerEvent<HTMLElement>) {
  // Viewport-normalised, not section-relative: the camera is parked on the
  // origin for the whole intro and the canvas is fixed, so the sphere lives
  // in viewport space. The 300svh section rect is meaningless here.
  introState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
  introState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
}

function endDrag(e: PointerEvent<HTMLElement>) {
  introState.dragging = false;
  e.currentTarget.style.cursor = "";
}

/**
 * Scroll runway, input surface AND caption for the 3D intro act (the particle
 * sphere). The canvas is already `fixed inset-0`, so the "pin" is inherent —
 * this section buys scroll distance and, being the topmost element over the
 * canvas during the act, is where pointer events land. It forwards them into
 * `introState` (lib/scroll) for the act to read. ScrollManager owns the
 * `#intro` trigger that scrubs `introState.progress`.
 *
 * The caption lives in a sticky stage that is `pointer-events-none`, so
 * drag/hover still reach the section. Two beats, never on screen together,
 * over the same top-center → bottom-center window the act uses: "gathering"
 * while the seed pulls together, "formed" once the sphere is whole
 * (`GROW_END` 0.88 in IntroAct); the second clears before the handoff into
 * Projects. DOM-only timeline, colocated per the ScrollManager convention.
 *
 * `touch-action: pan-y`: vertical-dominant touch gestures still scroll the
 * page (the browser then fires pointercancel — handled, or `dragging` would
 * stick); horizontal-dominant ones keep delivering pointermove for the drag.
 */
export function Intro() {
  const reduced = useReducedMotionPref();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced) {
        // The runway collapse re-maps every trigger below it (same reason as
        // HeroPinned's reduced branch).
        ScrollTrigger.refresh();
        return;
      }
      // Notional 0–1 maps onto the section's active window — identical bounds
      // to the act's own progress, so "0.6" here is p = 0.6 in IntroAct.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });
      // Two beats that never coexist: "gathering" while the seed is still
      // pulling together, cleared well before "formed" fades in as the sphere
      // completes (GROW_END 0.88 in IntroAct). The second clears ahead of
      // the Projects handoff.
      tl.fromTo(
        ".intro-gathering",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.1 },
        0.28
      )
        .to(".intro-gathering", { opacity: 0, y: -12, duration: 0.08 }, 0.6)
        .fromTo(
          ".intro-formed",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.1 },
          0.8
        )
        .to(".intro-formed", { opacity: 0, duration: 0.05 }, 0.95);
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true }
  );

  // Reduced motion has no scrub: show only the final beat, statically.
  const gatheringClass = reduced ? "hidden" : "opacity-0";
  const formedClass = reduced ? "" : "opacity-0";

  return (
    <section
      ref={sectionRef}
      id="intro"
      className={`relative ${reduced ? "h-svh" : "h-[200svh] md:h-[300svh]"} touch-pan-y select-none cursor-grab`}
      onPointerMove={(e) => {
        introState.hover = true;
        writePointer(e);
        if (introState.dragging) {
          introState.dragDX += e.clientX - lastX;
          introState.dragDY += e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
        }
      }}
      onPointerLeave={() => {
        introState.hover = false;
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault(); // no text-selection drag; scrolling is touch-action's job
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // pointer already gone — capture is a nicety, not a requirement
        }
        lastX = e.clientX;
        lastY = e.clientY;
        introState.dragging = true;
        introState.dragDX = 0;
        introState.dragDY = 0;
        e.currentTarget.style.cursor = "grabbing";
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Sticky caption stage. pointer-events-none so the section keeps the
          drag/hover. Below md the sphere fills the middle of the viewport, so
          the statement sits under it; from md it sits left, clear of the lit
          top-right limb. */}
      <div className="pointer-events-none sticky top-0 flex h-svh items-end pb-[10svh] md:items-center md:pb-0">
        <div className="section-shell">
          {/* Both beats share one slot (grid overlay) so the second lands
              exactly where the first left. */}
          <div className="grid max-w-md text-[clamp(1.5rem,3vw,2.6rem)] font-semibold leading-[1.15] tracking-tight">
            <p className={`intro-gathering col-start-1 row-start-1 ${gatheringClass}`}>
              {site.intro.gathering}
            </p>
            <p className={`intro-formed col-start-1 row-start-1 text-accent ${formedClass}`}>
              {site.intro.formed}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
