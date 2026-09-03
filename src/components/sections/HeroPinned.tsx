"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned-photo hero. The tall section is the scroll runway; the inner stage
 * stays put via `position: sticky` (not ScrollTrigger's `pin`, so no
 * pin-spacer reshuffles the document) while one scrubbed timeline plays the
 * beats. The depth trick: `lineBehind` renders between the full photo and a
 * foreground cutout of the subject (public/hero/cutout.webp, generated with
 * rembg from the same frame), so the subject genuinely occludes it. Both
 * images must keep identical geometry classes or the layers drift apart.
 *
 * This is the sanctioned exception to "all ScrollTriggers live in
 * ScrollManager": the timeline only tweens this section's own DOM. Act and
 * section orchestration stays in ScrollManager.
 */
export function HeroPinned() {
  const sectionRef = useRef<HTMLElement>(null);
  // SSR renders the animated (p=0) variant; if the client prefers reduced
  // motion this flips post-hydration to the static final-state variant.
  const reduced = useReducedMotionPref();

  useGSAP(
    () => {
      if (reduced) {
        // The runway just collapsed 700svh → 100svh; every ScrollTrigger in
        // ScrollManager measured against the tall document, so re-measure.
        ScrollTrigger.refresh();
        return;
      }
      // Notional seconds 0–10 map linearly onto the scrubbed pin range.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Beat 1 (0–3.6): display lines sweep the full width in opposite
      // directions; lineBehind starts occluded by the cutout, travels left
      // clean off-screen. Fade only at the very end of each sweep.
      tl.fromTo(".hero-line-behind", { x: "6vw" }, { x: "-82vw", duration: 3.6 }, 0)
        .to(".hero-line-behind", { autoAlpha: 0, duration: 0.6 }, 3.0)
        .fromTo(".hero-line-front", { x: "0vw" }, { x: "65vw", duration: 3.6 }, 0)
        .to(".hero-line-front", { autoAlpha: 0, duration: 0.6 }, 3.0);

      // Beat 2 (3.6–5.8): the statement slides through.
      tl.fromTo(
        ".hero-statement",
        { y: "7vh", autoAlpha: 0 },
        { y: "0vh", autoAlpha: 1, duration: 1.0 },
        3.6
      ).to(".hero-statement", { y: "-6vh", autoAlpha: 0, duration: 0.8 }, 5.0);

      // Beat 3 (6.0–9.6): eyebrow → headline → checklist one by one → CTA.
      const resolveIn = (target: string, at: number, dur = 0.6) =>
        tl.fromTo(
          target,
          { y: "2.5vh", autoAlpha: 0 },
          { y: "0vh", autoAlpha: 1, duration: dur },
          at
        );
      resolveIn(".hero-eyebrow", 6.0);
      resolveIn(".hero-headline", 6.3, 0.7);
      tl.fromTo(
        ".hero-check",
        { y: "2vh", autoAlpha: 0 },
        { y: "0vh", autoAlpha: 1, duration: 0.5, stagger: 0.4 },
        7.0
      );
      resolveIn(".hero-cta", 8.9, 0.7);

      // Pad to 10 so the resting state lands just before the pin releases.
      tl.to({}, { duration: 0.4 }, 9.6);
    },
    // revertOnUpdate: when `reduced` flips post-hydration, wipe the inline
    // tween styles so the static variant's classes fully take over.
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true }
  );

  const { hero } = site;
  // Under reduced motion the runway collapses to one viewport and the final
  // resting state renders statically (beats hidden via `reduced`, resolve
  // block forced visible) — the same degrade path the 3D layer follows.
  const lineClass =
    "pointer-events-none absolute whitespace-nowrap text-[clamp(2.4rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground";
  const hiddenUnlessReduced = reduced ? "hidden" : "";
  const resolveItemClass = reduced ? "" : "opacity-0";

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`relative ${reduced ? "h-svh" : "h-[700svh]"}`}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* z-1: full photo */}
        <img
          src="/hero/photo.jpg"
          alt={`${site.name} working at a desk under warm lamp light`}
          fetchPriority="high"
          className="absolute inset-0 z-[1] h-full w-full select-none object-cover object-[68%_40%]"
        />
        {/* z-2: the occluded line — behind the subject */}
        <div
          aria-hidden
          className={`hero-line-behind ${lineClass} ${hiddenUnlessReduced} left-0 top-[20vh] z-[2] pl-[36vw] md:top-[26vh]`}
        >
          {hero.lineBehind}
        </div>
        {/* z-3: foreground cutout of the subject — identical geometry to the photo */}
        <img
          src="/hero/cutout.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 z-[3] h-full w-full select-none object-cover object-[68%_40%]"
        />
        {/* z-4: legibility scrim */}
        <div
          aria-hidden
          className="absolute inset-0 z-[4] bg-[linear-gradient(to_right,rgba(7,7,11,0.78)_0%,rgba(7,7,11,0.42)_55%,rgba(7,7,11,0.25)_100%)] md:bg-[linear-gradient(to_right,rgba(7,7,11,0.72)_0%,rgba(7,7,11,0.25)_45%,rgba(7,7,11,0)_70%),linear-gradient(to_top,rgba(7,7,11,0.85)_0%,rgba(7,7,11,0)_30%)]"
        />
        {/* z-5: front line + beats */}
        <div
          aria-hidden
          className={`hero-line-front ${lineClass} ${hiddenUnlessReduced} left-0 top-[28vh] z-[5] pl-[6vw] md:top-[44vh]`}
        >
          {hero.lineFront}
          <span className="text-accent">.</span>
        </div>

        <p
          className={`hero-statement ${hiddenUnlessReduced} absolute bottom-[18vh] left-[6vw] z-[5] max-w-[15ch] text-[clamp(2rem,5.4vw,4.6rem)] font-bold leading-[1.06] tracking-tight opacity-0`}
        >
          {hero.statement}
        </p>

        <div className="absolute inset-0 z-[5] flex items-center">
          <div className="section-shell">
            <div className="max-w-xl">
              <p
                className={`hero-eyebrow ${resolveItemClass} mb-4 font-mono text-sm tracking-widest text-accent`}
              >
                {hero.eyebrow.toUpperCase()}
              </p>
              <h1
                className={`hero-headline ${resolveItemClass} text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl`}
              >
                {hero.headline}
              </h1>
              <ul className="mt-8">
                {hero.checklist.map((item) => (
                  <li
                    key={item}
                    className={`hero-check ${resolveItemClass} flex items-baseline gap-3 border-b border-border-soft py-2.5 text-base text-foreground`}
                  >
                    <span className="text-accent" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className={`hero-cta ${resolveItemClass} mt-8`}>
                <Button href={hero.cta.href}>{hero.cta.label}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
