import Image from "next/image";
import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

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
 * `from` is the off-screen origin each tile flies in from; unused until the
 * scroll-triggered entrance is wired.
 */
const TILES = [
  // grid-area: row-start / col-start / row-end / col-end
  { area: "1 / 1 / 18 / 2", inset: "", from: { x: "-60vw", y: "0vh" } },
  { area: "19 / 1 / 36 / 2", inset: "ml-[26%]", from: { x: "-40vw", y: "25vh" } },
  { area: "8 / 2 / 49 / 3", inset: "", from: { x: "0vw", y: "-70vh" } },
  { area: "13 / 3 / 30 / 4", inset: "", from: { x: "60vw", y: "0vh" } },
  { area: "31 / 3 / 50 / 4", inset: "", from: { x: "40vw", y: "30vh" } },
] as const;

/** Mobile fallback keeps the asymmetry as alternating insets, and preserves the
 * portrait beat at index 2 so the rhythm survives the collapse to one column. */
const MOBILE_TILES = [
  { inset: "mr-[15%]", aspect: "aspect-[16/10]" },
  { inset: "ml-[15%]", aspect: "aspect-[16/10]" },
  { inset: "mr-[8%]", aspect: "aspect-[3/4]" },
  { inset: "ml-[15%]", aspect: "aspect-[16/10]" },
  { inset: "mr-[15%]", aspect: "aspect-[16/10]" },
] as const;

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

export function ProjectsGrid() {
  return (
    <section id="projects" className="py-24 sm:py-32">
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
          <div className="flex flex-col gap-6 md:hidden">
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
