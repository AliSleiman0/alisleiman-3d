<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Scroll-Based 3D Portfolio — Project Conventions

Personal portfolio for Ali Sleiman (software engineer). Scroll-based 3D site: the R3F canvas is a fixed hero/background layer, content sections scroll over it, and scroll position drives the camera/scene. **Not** a walk-around experience — no first-person controls, no physics engine.

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS · React Three Fiber + @react-three/drei · GSAP + ScrollTrigger (via `@gsap/react` `useGSAP` for React-safe cleanup) · Framer Motion for 2D UI transitions · Deployed on Vercel.

## Build stages (confirm each works before the next)

1. ✅ Scaffold + folder structure + typed placeholder data
2. ✅ Static 2D layout (hero, about, projects grid, contact) — deployable fallback on its own, no 3D
3. ✅ Single `<Canvas>` with a primitive-built hero shape, lazy-loaded via `next/dynamic` `ssr: false` (the shape itself was later relocated into `components/3d/acts/HeroAct.tsx` — see stage 6 below)
4. ✅ GSAP ScrollTrigger drives camera/scene state through sections
5. ✅ Polish: lighting, post-processing, section transitions (env reflections are high-tier only — the `<Environment>` block mounts solely when `quality === "high"`; `Effects.tsx`, the bloom/vignette composer, is defined but not currently mounted — see stage 6)
6. ✅ Cinematic acts restructure — the 3D layer is a sequence of scroll-triggered "acts" (`components/3d/acts/`) instead of one persistent object. Scope was later cut: the per-project acts are cancelled (stage 8), leaving `AboutAct` as the only 3D beat
7. ✅ Pinned-photo hero — the 3D `HeroAct` was retired in favor of a 2D scroll-scrubbed hero (`components/sections/HeroPinned.tsx`) modeled on juanmora.co: sticky full-bleed photo, a depth-occluded headline (a rembg foreground cutout sandwiches text between photo and subject), full-width opposite-direction line sweeps, a statement beat, then a resolve block that assembles word by word (dim ghost → bright, in reading order) with rules that grow from zero to full width line by line, ending in the CTA — all over a 700svh runway; 3D acts now start at About
8. ✅ Projects section reworked to 2D — the per-project 3D acts (taxi + four unbuilt) are cancelled and replaced by `components/sections/ProjectsGrid.tsx`: an AE.1-style asymmetric masonry grid of real project images that assembles itself over its own sticky scroll runway. DOM + GSAP only, no Canvas
9. ✅ Client-facing copy pass — About, Projects and Contact rewritten for the audience the hero already addressed (clients, not engineers); About prose and all section copy moved into `data/site.ts`; the technology tag cloud replaced by outcomes

## Folder structure

```
src/
  app/                    App Router entry (layout, page, globals.css)
  components/ui/          2D primitives — buttons, nav, headings, reveal
  components/sections/    HeroPinned, About, ProjectsGrid, Contact scroll sections
  components/3d/          Scene, SceneManager, CameraRig, Lights — isolated 3D components
  components/3d/acts/     One file per cinematic "act" — AboutAct (the only one)
  data/                   Structured content (projects.ts, site.ts) — never hardcode case-study content in JSX
  lib/                    types.ts, utils.ts, scroll.ts, useReducedMotionPref.ts, motionTier.ts
public/models/            Unused .glb assets — orphaned when the per-project acts were cut
public/images/projects/    One image per project, filename = project slug (.jpg)
public/hero/              Hero photo (photo.jpg) + rembg foreground cutout (cutout.webp)
```

## 3D conventions

- **Keep 3D components isolated** — Scene, CameraRig, Lights, and each model/shape are separate files under `components/3d/`. Never one giant canvas file.
- **Lazy-load the Canvas**: import the whole 3D layer with `next/dynamic` and `ssr: false` so it never blocks initial render or SEO.
- **Dispose on unmount**: geometries, materials, and textures created imperatively (`new THREE.*` or `useMemo`) must be disposed in a cleanup effect. Declarative JSX primitives are handled by R3F, but anything manually created is your responsibility.
- **Cinematic acts**: the 3D layer is a sequence of scroll-triggered "acts" (`components/3d/acts/`), not one persistent object. `SceneManager` mounts exactly one act at a time, keyed to `activeAct` (`lib/scroll.ts`). Only `AboutAct` exists — `activeAct` is `"none"` over both the photo hero and the 2D Projects grid.
- **Degrade gracefully**: provide a low-poly or 2D fallback for low-end/mobile devices (reduced DPR, fewer particles, or no canvas at all). The stage-2 static layout is the ultimate fallback. Acts still swap on `low`/reduced-motion, just without the GSAP tween (instant swap, static pose — see `ScrollManager`'s `skipTransitionTween`).
- ScrollTrigger registration/cleanup goes through `useGSAP()`; don't hand-roll `ScrollTrigger.create` without cleanup. All triggers — including act-transition orchestration — live in `components/ScrollManager.tsx`, with one documented exception: a section-local scrubbed timeline that only tweens that section's own DOM may colocate in the section component (`HeroPinned` and `ProjectsGrid` do this). Cross-section/act orchestration may not.
- **Reduced-motion detection**: use `lib/useReducedMotionPref.ts`, NOT framer-motion's `useReducedMotion`. Motion v13 disables `whileInView`/`animate` under reduced motion, and its own hook can lose the race against that — leaving `initial`-hidden content permanently invisible. The shared hook reads matchMedia directly, so the plain-render branch is deterministic.
- **Scroll bridge**: GSAP and R3F meet only through `src/lib/scroll.ts`. ScrollTrigger writes `scrollState.progress`, `transitionState` (act-transition tween), and `activeAct` (plain mutation / pub-sub); `useFrame` callbacks and `SceneManager` read them. Never route per-frame values through React state — `activeAct` is the one exception, since it changes only at transition boundaries, exactly like the existing `activeSection`. The 3D layer never imports gsap; ScrollManager never imports three.

## Content conventions

- Project case studies live in `src/data/projects.ts` as typed `Project` objects (`src/lib/types.ts`); sections render from data. **`title` is what the thing IS in plain language, not the client's name** — a visitor who has never heard of LACPA must still understand the tile. The client name lives in `client`, the small uppercase tile line in `sector`.
- Site-wide info and **all section copy** lives in `src/data/site.ts` — `hero`, `about` (title, paragraphs, stackNote), `outcomes`, `projectsIntro`, `contact`. Do not hardcode section prose in JSX; About used to and was moved.
- **The whole site talks to clients, not to engineers.** The voice is client-facing and neutral. Concretely: no résumé-shaped technology tag clouds ("React · Docker · CI/CD") — nobody shops for an API, and the tag *format* reads as a CV no matter what words go in it. `outcomes` names the problem the client arrived with; the real stack survives as one muted line (`about.stackNote`).

## Architecture map (who does what)

- `components/ScrollManager.tsx` — owns ALL ScrollTriggers: full-page scrub → `scrollState.progress`; per-section triggers → active section id, and (via `transitionTo()`) the act-to-act GSAP transition — tweens `transitionState.t` out/in and calls `setActiveAct()` at the swap point. Both `hero` and `projects` map to the `"none"` act (photo hero / 2D grid — nothing for the canvas to render). Renders null. **Gotcha**: fast scroll can interrupt a transition before its `setActiveAct()` call fires — `interruptInFlight()`/`pendingTarget` exist specifically to land that pending act-swap before starting the next transition, so `activeAct` never gets stranded mid-flight. Don't simplify away `pendingTarget` without re-testing rapid back-and-forth scrolling.
- `lib/scroll.ts` — the GSAP↔R3F bridge: mutable `scrollState` + `transitionState` (per-frame, no React) + subscribable `activeSection` and `activeAct` (`useSyncExternalStore`, changes only at boundaries).
- `components/sections/HeroPinned.tsx` — the 2D pinned-photo hero. `id="hero"` section = 700svh scroll runway (100svh under reduced motion, static final state); inner `position: sticky` stage (sticky, NOT ScrollTrigger `pin` — no pin-spacer) holds the layer sandwich: photo → occluded line → rembg cutout of the subject (identical `object-fit/object-position` classes to the photo — keep them in sync or the occlusion drifts) → scrim → front line/beats. One colocated scrubbed GSAP timeline (notional 0–10s over the pin) plays the beats; copy comes from `site.hero` (`data/site.ts`). Beat 3 (6.0→10) is the juanmora.co-style assembly: `words()` wraps every word of the eyebrow/headline/checklist in `.hero-word` spans, `wordReveal()` runs two staggered opacity tweens per block (0→0.3 ghost wave, then 0.3→1 bright wave, `immediateRender: false` on the second), and `growLine()` scales `.hero-rule`/`.hero-check-line` divs 0→1 from the left — transform/opacity only. Checklist items are addressed as `.hero-check:nth-child(i)`, so the `<li>`s must stay the `<ul>`'s only children. When `reduced` flips post-hydration it calls `ScrollTrigger.refresh()` because the runway collapse re-maps every trigger position. Swap the photo by regenerating `public/hero/photo.jpg` + `cutout.webp` (rembg, py3.13) at 1920w.
- `components/3d/Hero3D.tsx` — the page-wide fixed background canvas (name is historical). `next/dynamic` `ssr:false`, quality gate, CSS-glow fallback, vignette overlay. Fully covered by the photo during the hero pin.
- `components/3d/quality.ts` — `useQualityTier()`: `off` (no WebGL / reduced motion → CSS glow only) · `low` (coarse pointer / ≤4 cores → 400 particles, DPR ≤1.5, no post-processing) · `high` (1200 particles, DPR 2, Effects + Environment).
- `components/3d/SceneManager.tsx` — subscribes to `activeAct`, renders exactly one act component. `"none"` → null (photo hero, and the 2D Projects grid); `"about"` → `AboutAct`. `activeAct` initializes to `"none"`.
- `components/3d/acts/useActTransition.ts` — returns the current act-transition scale/opacity factor (reads `transitionState.t`); each act multiplies its own scroll-driven scale by it.
- `components/3d/acts/AboutAct.tsx` — the first 3D beat: a wireframe torus knot, open/linear silhouette, continues the indigo→steel→violet color journey.
- `components/sections/ProjectsGrid.tsx` — the 2D Projects section: an asymmetric masonry grid of project images that assembles on scroll. Modelled on an AE.1-style reference: three equal columns each starting at a different vertical offset (the staircase is the whole character), two landscape tiles left with the second inset, one tall portrait anchor centre, two landscape right. Implemented as `grid-cols-3` over **50 fine row tracks with `row-gap: 0`** — the fine tracks buy the per-column offsets, and vertical gutters are *spans* (one empty row between stacked tiles) because a row gap over 50 tracks would add 49 gutters of dead height. The wrapper's `aspect-[1072/630]` makes the `1fr` rows width-derived so tiles hold their proportions at any width.
  - **Tile geometry** lives in the component's `TILES` const (presentation), never in `/data` (content); index order in `TILES` must match `projects`. **Slot ratios are tuned to the source images** — the four flanks are 1.25 and sit in a 1.28–1.46 band; index 2 has a portrait source (0.80) and a 0.77 slot so it can be the tall anchor while cropping only ~4% of its width. Re-tune if source aspect ratios change; a portrait slot fed a landscape source loses ~40% of the frame.
  - **The assembly is two phases, not one stagger.** The anchor flies in alone and lands fully (`at: 0` → 0.45, ~36% of the scroll to itself); the first flank only starts at 0.48. Keep that boundary when retiming. Flanks then go centre-out: left, right, bottom-left, bottom-right. Each tile enters from the page edge nearest its own slot, travelling only within its column/row band, so no two paths cross. Only `overflow-x` is clipped, so the `opacity: 0 → 1` ramp is what stops vertical travel bleeding over the About/Contact copy — don't flatten it.
  - **Desktop scrubs against its own runway**: a `md:h-[175svh]` block (`runwayRef`) holding a `position: sticky` stage — sticky, NOT ScrollTrigger `pin`, same reason as `HeroPinned` (no pin-spacer reshuffling the document). Runway length is set to preserve **per-tile** pacing, not total duration: the two-phase split stretched the timeline 1.06 → 1.26 notional units, so the runway grew ~19% to match (~534px of scroll per tile).
  - **Gotcha — the trigger straddles two elements.** `trigger` is the *grid*, `endTrigger` is the *runway*. Anchoring both to the runway leaves a dead lead-in: the grid is centred in a viewport-tall sticky stage, so it becomes visible `(viewport + grid)/2` px *before* the runway tops out and you scroll past an empty block. That offset scales with viewport height, so no fixed start percentage fixes it — key the start to the grid's own top.
  - **Gotcha — `ScrollTrigger.refresh()` is mandatory after building.** These triggers are created during hydration while the 700svh hero runway above is still settling; without it they keep the unmeasured `start:0/end:null` they were born with and silently never advance. The reduced-motion branch refreshes too, because the runway collapses and changes document height.
  - **Images are `loading="eager"`, never lazy.** `next/image` gates lazy loading on IntersectionObserver, which tests the tile's *transformed* position — and the assembly parks tiles up to 60vw off-screen, so they never register as in-view and don't start loading until they fly in, popping in mid-animation. Not `priority` either: that injects a preload competing with the hero photo's LCP.
  - Tiles are deliberately **not** pre-hidden with CSS classes (unlike `HeroPinned`): `useGSAP` runs on `useLayoutEffect` so `fromTo` sets the start state before paint anyway, and class-hiding would risk the section's entire content staying invisible if GSAP never boots.
  - Mobile is a separate single-column timeline via `gsap.matchMedia()`, single-phase and sequential top-to-bottom, with **no runway** — the stack is several screens tall, so pinning would trap the user.
- `lib/motionTier.ts` — `detectLowMotion()`: reduced-motion ‖ coarse pointer ‖ ≤4 cores. Shared by `ScrollManager` and `ProjectsGrid` so the heuristic isn't copied a third time; deliberately mirrors `3d/quality.ts` rather than importing it, since that file is 3D-layer-only.
- `components/3d/CameraRig.tsx` — keyframed camera path over `scrollState.progress`, smoothstep segments, exp damping, pointer parallax on top. **`at` values are hand-tuned to measured section offsets** (full-page progress is normalized over total document height, and the 700svh hero dominates it — camera parks on the About pose until ~0.70 where the canvas first becomes visible). **Re-measure and re-tune whenever any section height changes** — the Projects runway alone moved About from 0.83 to 0.70. **Known limitation**: because the hero runway is viewport-proportional (700svh) while every other section is content-height, these fractions shift with viewport HEIGHT, not just section heights — driving the rig from per-section progress instead of document-normalised progress would fix that properly.
- `components/3d/Effects.tsx` — Bloom + Vignette composer. Not currently mounted. Its original blocker (HeroAct's `AsciiEffect` render-loop takeover) is gone with HeroAct — mounting it is now a viable follow-up.
- `components/ui/ScrollProgressBar.tsx` — rAF loop reading `scrollState.progress`; no scroll listeners, no React state.

## Current status (2026-09-05) & next-session handoff

Stages 1–9 ✅. This session replaced the Projects section wholesale and gave the
lower page a client-facing copy pass. Commits, in order:

- `5a75171` — 2D masonry grid replaces the ProjectCard list; `AllwaytaxiAct`,
  `Projects.tsx` and `ProjectCard.tsx` deleted; `ActName` narrowed to
  `"none" | "about"`; `projects.ts` rewritten to the real five.
- `eabcd0b` — scroll-scrubbed tile assembly; `lib/motionTier.ts` extracted so the
  reduced-motion/coarse-pointer/few-cores heuristic isn't copied a third time.
- `866a0ea` — client-facing copy for About/Projects/Contact, real project images,
  descriptive slugs, portrait centre anchor.
- `14afbce` — assembly slowed onto its own 175svh sticky runway, dead lead-in
  removed, anchor split into its own phase.

**The Projects grid is the thing to understand before touching this page** — its
architecture-map entry above lists five separate gotchas that each cost real
debugging time (the trigger straddling two elements, the mandatory
`ScrollTrigger.refresh()`, eager images, the ratio↔source coupling, the two-phase
boundary). Read them before retiming or restyling it.

**Next session, in rough priority order:**

1. **Real hero photo** — `public/hero/photo.jpg` is still a stock stand-in (not
   Ali). Regenerate `photo.jpg` + `cutout.webp` (rembg, Python 3.13 venv — 3.14
   lacks onnxruntime wheels; use the Python API `remove()`, the CLI extra isn't
   installed) at 1920w, then re-check: (a) the occluded line still crosses the
   subject at `p≈0` on desktop AND mobile (tune `.hero-line-behind`'s
   `pl-[36vw]`/`top`), (b) `object-[68%_22%]` still frames the subject with hair
   clear of the navbar on short viewports, (c) the scrim still carries text
   legibility. Full-bleed `object-fit: cover`, so real "zoom out" needs a
   wider-framed source.
2. **Three of five project images have light backgrounds** (`member-portal`,
   `research-agent`, `academic-advisor`) against a `#07070b` page, while
   `desk-companion-robot` and `fitness-storefront` are dark. They read as bright
   panels rather than part of the page. Either regenerate those three on dark
   grounds, or add a treatment (tint/overlay) — flagged to Ali, not yet decided.
3. **Real case-study copy** — `research-agent` and `fitness-storefront`
   `description`/`highlights` are still placeholder; the others are thin. Titles,
   sectors and summaries are done and client-facing.
4. **Real GitHub/LinkedIn URLs** in `data/site.ts` (still `https://github.com/`).
5. **Vercel deploy** — CLI not installed (`npm i -g vercel`).
6. **`Effects.tsx` bloom/vignette** — its old blocker (HeroAct's AsciiEffect
   render-loop takeover) is long gone; mounting it for `high` tier is viable.

**Loose ends left deliberately:**

- Five orphaned `.webp` files sit untracked in `public/images/projects/` under the
  old slug names (`avid`, `lacpa`, `mag`, `ta-scan-agent`, `beastfit-wear`). Not
  created by the agent and not referenced — left for Ali to delete.
- `public/models/*.glb` (car, documents, construction, robot) are dead assets now
  that the per-project acts are cancelled. `car.glb`'s missing-texture issue is
  moot, and the ConstructIQ CC-BY attribution obligation no longer applies.
- `components/ui/Tag.tsx` is now unused (its last consumers were `ProjectCard` and
  the About tag cloud). Kept as a generic primitive.

**Per-project 3D acts are CANCELLED — do not resurrect.** `AboutAct` is the only
3D beat. A `ContactAct` remains conceivable but unscoped.

**Verification habits that caught real bugs this session:**

- **Driving the page over CDP lies to you.** GSAP's rAF ticker is throttled in an
  unfocused/background tab, so every ScrollTrigger reports `progress: 0` and tiles
  sit frozen at their from-state — this looks exactly like a broken animation and
  cost a long detour. Force `ScrollTrigger.update()`, drive with real input
  events, or foreground the tab before trusting a reading. Also set
  `document.documentElement.style.scrollBehavior = 'auto'` first, since
  `globals.css` sets `scroll-behavior: smooth` and scripted scrolls land late.
- **Measure layout, not transforms.** Use `offsetWidth/offsetHeight/offsetTop` for
  geometry checks — `getBoundingClientRect()` includes the assembly's transforms
  and will report nonsense mid-animation.
- Test reduced motion by reproducing the post-hydration `false → true` flip (a
  temporary timer beats fighting the OS setting), and assert that tiles end with
  `transform: none` rather than merely looking right.
- After anything that changes section heights, re-measure `CameraRig`'s `at`
  values AND confirm nav active-state still updates.

**Known quirks:** `html { scroll-behavior: smooth }` fights programmatic scrolls
and can make scrub feel laggy on nav anchor jumps. Browser Grammarly extension
causes a harmless hydration warning on `<body>`. `create-next-app` couldn't
scaffold in place (capital letters in the dir name) so the package name is
`alisleiman-3d`.
