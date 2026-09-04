"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import { detectLowMotion } from "@/lib/motionTier";

gsap.registerPlugin(ScrollTrigger);

/**
 * Tile geometry for the desktop composition, indexed by position in `projects`.
 * Lives here rather than in /data on purpose: /data is content, spans are
 * presentation.
 *
 * The grid is 3 equal columns over 50 fine row tracks. The fine tracks are what
 * buy the per-column vertical offsets (the staircase that gives the layout its
 * character) and the tight gutters between stacked tiles. Row gap is 0 — with 50
 * tracks a row gap would add 49 gutters of dead height — so vertical gutters are
 * spans instead: stacked tiles leave one empty row between them.
 *
 * `from` is the off-screen origin the tile flies in from, and `at` its position
 * on the assembly timeline. Each tile approaches from the page edge nearest its
 * own slot and travels only within its own column/row band, so no two flight
 * paths cross: the left column never enters column 2, the centre tile only
 * descends within column 2, the right column never enters column 2.
 *
 * Order is centre-out, not left-to-right — the portrait anchor seats first and
 * the flanks alternate around it, so the composition builds from its focal point.
 */
const TILES = [
  // grid-area: row-start / col-start / row-end / col-end
  { area: "1 / 1 / 18 / 2", inset: "", from: { x: "-60vw", y: "0vh" }, at: 0.08 },
  { area: "19 / 1 / 36 / 2", inset: "ml-[26%]", from: { x: "-40vw", y: "25vh" }, at: 0.24 },
  { area: "8 / 2 / 49 / 3", inset: "", from: { x: "0vw", y: "-70vh" }, at: 0 },
  { area: "13 / 3 / 30 / 4", inset: "", from: { x: "60vw", y: "0vh" }, at: 0.16 },
  { area: "31 / 3 / 50 / 4", inset: "", from: { x: "40vw", y: "30vh" }, at: 0.32 },
] as const;

/** Mobile fallback keeps the asymmetry as alternating insets, and preserves the
 * portrait beat at index 2 so the rhythm survives the collapse to one column.
 * Vectors are horizontal only here — vertical travel on a narrow viewport would
 * fling tiles past the fold. */
const MOBILE_TILES = [
  { inset: "mr-[15%]", aspect: "aspect-[16/10]", from: { x: "-70vw", y: "0vh" }, at: 0 },
  { inset: "ml-[15%]", aspect: "aspect-[16/10]", from: { x: "70vw", y: "0vh" }, at: 0.1 },
  { inset: "mr-[8%]", aspect: "aspect-[3/4]", from: { x: "-70vw", y: "0vh" }, at: 0.2 },
  { inset: "ml-[15%]", aspect: "aspect-[16/10]", from: { x: "70vw", y: "0vh" }, at: 0.3 },
  { inset: "mr-[15%]", aspect: "aspect-[16/10]", from: { x: "-70vw", y: "0vh" }, at: 0.4 },
] as const;

/** Builds the scrubbed assembly for one breakpoint's tile container. */
function buildAssembly(
  container: HTMLElement,
  specs: readonly { from: { x: string; y: string }; at: number }[]
) {
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      // Triggered on the tile container, not the <section>: the section opens
      // with the heading and a mb-24/32 divider, so a section-anchored trigger
      // would be most of the way through before a tile is anywhere near view.
      trigger: container,
      start: "top 90%",
      end: "top 35%",
      scrub: 0.6,
    },
  });

  const tiles = Array.from(container.children) as HTMLElement[];
  tiles.forEach((el, i) => {
    const spec = specs[i];
    if (!spec) return;
    tl.fromTo(
      el,
      { x: spec.from.x, y: spec.from.y, opacity: 0, scale: 0.94 },
      { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.55 },
      spec.at
    );
  });

  return tl;
}

function Tile({
  index,
  className,
  style,
  sizes,
  priority,
}: {
  index: number;
  className?: string;
  style?: React.CSSProperties;
  sizes: string;
  priority?: boolean;
}) {
  const project = projects[index];

  return (
    <div
      tabIndex={0}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border-soft bg-surface",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />

      {/* Caption: hover/focus on pointer devices, always visible on touch —
          there is no hover state to reveal it there. */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5",
          "bg-gradient-to-t from-black/75 via-black/40 to-transparent",
          "opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
          "[@media(hover:none)]:opacity-100"
        )}
      >
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/60">
          {project.role}
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight text-white">
          {project.title}
        </p>
      </div>
    </div>
  );
}

/**
 * The Projects section: an asymmetric masonry grid of project images that
 * assembles itself as the section scrolls into view.
 *
 * This is the second sanctioned exception to "all ScrollTriggers live in
 * ScrollManager" (HeroPinned is the first): the timeline only tweens this
 * section's own DOM. Act and cross-section orchestration stays in ScrollManager.
 */
export function ProjectsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  // SSR and the first client render report false; this flips post-hydration,
  // which is what `dependencies` + `revertOnUpdate` below are for.
  const reduced = useReducedMotionPref();

  useGSAP(
    () => {
      // Low tier / reduced motion: no transform-heavy fly-in. Returning early
      // leaves the tiles exactly as rendered — at rest, in final position.
      if (reduced || detectLowMotion()) return;

      // Both containers are always in the DOM (`hidden md:grid` / `md:hidden`),
      // so only animate whichever one is actually visible. matchMedia reverts
      // its own tweens when the breakpoint changes.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        if (gridRef.current) buildAssembly(gridRef.current, TILES);
      });
      mm.add("(max-width: 767.98px)", () => {
        if (stackRef.current) buildAssembly(stackRef.current, MOBILE_TILES);
      });
      // These triggers are created during hydration, while the 700svh hero
      // runway above is still settling — without a refresh they keep the
      // unmeasured start:0/end:null they were born with and never advance.
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    // Deliberately NOT pre-hiding tiles with CSS classes the way HeroPinned
    // does: useGSAP runs on useLayoutEffect, so fromTo's immediateRender sets
    // the start state before paint anyway, and if GSAP never boots the images
    // still render. Class-hiding the section's entire content would risk it
    // staying permanently invisible.
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} id="projects" className="py-24 sm:py-32">
      <div className="section-shell">
        <div className="section-divider mb-24 sm:mb-32" />
        <Reveal>
          <SectionHeading
            overline="02 · Projects"
            title="Selected work"
            description="Products I've built or contributed to — from legal AI to construction SaaS."
          />
        </Reveal>

        {/* Tiles park off-screen before assembling; clip (not hidden, which
            would make this a scroll container) keeps that off the x-axis. */}
        <div className="[overflow-x:clip]">
          {/* Desktop: the staircase composition. The wrapper's aspect ratio is
              what makes the 1fr rows width-derived, so every tile keeps its
              proportion at any container width. */}
          <div
            ref={gridRef}
            className="hidden aspect-[1152/620] grid-cols-3 gap-x-3 gap-y-0 [grid-template-rows:repeat(50,1fr)] md:grid"
          >
            {TILES.map((tile, i) => (
              <Tile
                key={projects[i].slug}
                index={i}
                sizes="33vw"
                priority={i === 2}
                style={{ gridArea: tile.area }}
                className={tile.inset}
              />
            ))}
          </div>

          {/* Mobile: single column, asymmetry carried by alternating insets. */}
          <div ref={stackRef} className="flex flex-col gap-6 md:hidden">
            {MOBILE_TILES.map((tile, i) => (
              <Tile
                key={projects[i].slug}
                index={i}
                sizes="100vw"
                className={cn(tile.inset, tile.aspect)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
