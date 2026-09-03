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

      // Beat 2 (3.4–5.9): the kicker at the top writes itself letter by
      // letter, and a second wave fades the same letters back out in order,
      // 0.75s behind — a rolling ~two-word window sweeps through the line
      // (leading edge writing in, trailing edge dissolving) and the last
      // letters are gone just before the resolve block builds. Per letter the
      // in/out intervals never overlap (0.75 gap > 0.25 duration).
      tl.fromTo(
        ".hero-letter",
        { opacity: 0 },
        { opacity: 1, duration: 0.25, stagger: 0.032 },
        3.2
      ).fromTo(
        ".hero-letter",
        { opacity: 1 },
        { opacity: 0, duration: 0.25, stagger: 0.032, immediateRender: false },
        3.65
      );

      // Beat 3 (6.0–10): the resolve block assembles like the reference —
      // each text block reveals word by word (a dim ghost of the word lands
      // first, then it brightens to full, in reading order) and every rule
      // grows from zero to full width, all scrubbed by the scroll.
      const wordReveal = (sel: string, at: number, stagger = 0.07) => {
        tl.fromTo(
          sel,
          { opacity: 0 },
          { opacity: 0.3, duration: 0.18, stagger },
          at
        ).fromTo(
          sel,
          { opacity: 0.3 },
          { opacity: 1, duration: 0.2, stagger, immediateRender: false },
          at + 0.16
        );
      };
      const growLine = (sel: string, at: number) =>
        tl.fromTo(sel, { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, at);

      wordReveal(".hero-eyebrow .hero-word", 6.0);
      wordReveal(".hero-headline .hero-word", 6.4);
      growLine(".hero-rule", 7.05);
      site.hero.checklist.forEach((_, i) => {
        const at = 7.5 + i * 0.5;
        wordReveal(`.hero-check:nth-child(${i + 1}) .hero-word`, at, 0.05);
        growLine(`.hero-check:nth-child(${i + 1}) .hero-check-line`, at + 0.1);
      });
      tl.fromTo(
        ".hero-cta",
        { y: "2.5vh", autoAlpha: 0 },
        { y: "0vh", autoAlpha: 1, duration: 0.4 },
        9.55
      );

      // Pad to 10 so the resting state lands just before the pin releases.
      tl.to({}, { duration: 0.05 }, 9.95);
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
    "pointer-events-none absolute whitespace-nowrap text-[clamp(2rem,6.5vw,6rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground";
  const hiddenUnlessReduced = reduced ? "hidden" : "";
  const resolveItemClass = reduced ? "" : "opacity-0";
  const lineInitial = reduced ? "" : "scale-x-0";
  // Per-word spans for the scrubbed ghost→bright reveal (plain spaces between
  // spans keep normal wrapping).
  const words = (text: string) =>
    text.split(" ").map((w, i) => (
      <span key={i}>
        {i > 0 ? " " : ""}
        <span className={`hero-word ${resolveItemClass}`}>{w}</span>
      </span>
    ));
  // Per-letter spans for the kicker's scrubbed fade (spaces stay plain text).
  const letters = (text: string) =>
    text.split("").map((ch, i) =>
      ch === " " ? (
        " "
      ) : (
        <span key={i} className={`hero-letter ${resolveItemClass}`}>
          {ch}
        </span>
      )
    );

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
          className="absolute inset-0 z-[1] h-full w-full select-none object-cover object-[68%_22%]"
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
          className="absolute inset-0 z-[3] h-full w-full select-none object-cover object-[68%_22%]"
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

        <div className="absolute inset-0 z-[5] flex items-center">
          <div className="section-shell">
            <div className="max-w-2xl">
              <p
                className={`hero-statement ${hiddenUnlessReduced} mb-6 text-[clamp(0.9rem,1.5vw,1.3rem)] font-medium tracking-wide sm:mb-8 md:whitespace-nowrap`}
              >
                {letters(hero.statement)}
              </p>
              <p className="hero-eyebrow mb-4 font-mono text-sm tracking-widest text-accent">
                {words(hero.eyebrow.toUpperCase())}
              </p>
              <h1 className="hero-headline text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                {words(hero.headline)}
              </h1>
              <div
                aria-hidden
                className={`hero-rule ${lineInitial} mt-6 h-px w-full origin-left bg-foreground/30`}
              />
              <ul className="mt-2">
                {hero.checklist.map((item) => (
                  <li key={item} className="hero-check">
                    <div className="flex items-baseline gap-4 py-4 text-lg text-foreground sm:py-6 sm:text-xl">
                      <span
                        className={`hero-word ${resolveItemClass} text-accent`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span>{words(item)}</span>
                    </div>
                    <div
                      aria-hidden
                      className={`hero-check-line ${lineInitial} h-px w-full origin-left bg-foreground/25`}
                    />
                  </li>
                ))}
              </ul>
              <div className={`hero-cta ${resolveItemClass} mt-10`}>
                <Button href={hero.cta.href}>{hero.cta.label}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
