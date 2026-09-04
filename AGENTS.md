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
8. ✅ Projects section reworked to 2D — the per-project 3D acts (taxi + four unbuilt) are cancelled and replaced by `components/sections/ProjectsGrid.tsx`: an AE.1-style asymmetric masonry grid of project images that assembles itself on scroll. DOM + GSAP only, no Canvas

## Folder structure

```
src/
  app/                    App Router entry (layout, page, globals.css)
  components/ui/          2D primitives — buttons, nav, cards
  components/sections/    HeroPinned, About, Projects, Contact scroll sections
  components/3d/          Scene, SceneManager, CameraRig, Lights — isolated 3D components
  components/3d/acts/     One file per cinematic "act" — AboutAct (the only one)
  data/                   Structured content (projects.ts, site.ts) — never hardcode case-study content in JSX
  lib/                    types.ts, utils.ts, scroll.ts, useReducedMotionPref.ts
public/models/            Unused .glb assets — orphaned when the per-project acts were cut
public/images/projects/    One image per project, filename = project slug
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

- Project case studies live in `src/data/projects.ts` as typed `Project` objects (`src/lib/types.ts`); sections render from data.
- Site-wide info (name, nav, socials, skills) lives in `src/data/site.ts`.

## Architecture map (who does what)

- `components/ScrollManager.tsx` — owns ALL ScrollTriggers: full-page scrub → `scrollState.progress`; per-section triggers → active section id, and (via `transitionTo()`) the act-to-act GSAP transition — tweens `transitionState.t` out/in and calls `setActiveAct()` at the swap point. Both `hero` and `projects` map to the `"none"` act (photo hero / 2D grid — nothing for the canvas to render). Renders null. **Gotcha**: fast scroll can interrupt a transition before its `setActiveAct()` call fires — `interruptInFlight()`/`pendingTarget` exist specifically to land that pending act-swap before starting the next transition, so `activeAct` never gets stranded mid-flight. Don't simplify away `pendingTarget` without re-testing rapid back-and-forth scrolling.
- `lib/scroll.ts` — the GSAP↔R3F bridge: mutable `scrollState` + `transitionState` (per-frame, no React) + subscribable `activeSection` and `activeAct` (`useSyncExternalStore`, changes only at boundaries).
- `components/sections/HeroPinned.tsx` — the 2D pinned-photo hero. `id="hero"` section = 700svh scroll runway (100svh under reduced motion, static final state); inner `position: sticky` stage (sticky, NOT ScrollTrigger `pin` — no pin-spacer) holds the layer sandwich: photo → occluded line → rembg cutout of the subject (identical `object-fit/object-position` classes to the photo — keep them in sync or the occlusion drifts) → scrim → front line/beats. One colocated scrubbed GSAP timeline (notional 0–10s over the pin) plays the beats; copy comes from `site.hero` (`data/site.ts`). Beat 3 (6.0→10) is the juanmora.co-style assembly: `words()` wraps every word of the eyebrow/headline/checklist in `.hero-word` spans, `wordReveal()` runs two staggered opacity tweens per block (0→0.3 ghost wave, then 0.3→1 bright wave, `immediateRender: false` on the second), and `growLine()` scales `.hero-rule`/`.hero-check-line` divs 0→1 from the left — transform/opacity only. Checklist items are addressed as `.hero-check:nth-child(i)`, so the `<li>`s must stay the `<ul>`'s only children. When `reduced` flips post-hydration it calls `ScrollTrigger.refresh()` because the runway collapse re-maps every trigger position. Swap the photo by regenerating `public/hero/photo.jpg` + `cutout.webp` (rembg, py3.13) at 1920w.
- `components/3d/Hero3D.tsx` — the page-wide fixed background canvas (name is historical). `next/dynamic` `ssr:false`, quality gate, CSS-glow fallback, vignette overlay. Fully covered by the photo during the hero pin.
- `components/3d/quality.ts` — `useQualityTier()`: `off` (no WebGL / reduced motion → CSS glow only) · `low` (coarse pointer / ≤4 cores → 400 particles, DPR ≤1.5, no post-processing) · `high` (1200 particles, DPR 2, Effects + Environment).
- `components/3d/SceneManager.tsx` — subscribes to `activeAct`, renders exactly one act component. `"none"` → null (photo hero, and the 2D Projects grid); `"about"` → `AboutAct`. `activeAct` initializes to `"none"`.
- `components/3d/acts/useActTransition.ts` — returns the current act-transition scale/opacity factor (reads `transitionState.t`); each act multiplies its own scroll-driven scale by it.
- `components/3d/acts/AboutAct.tsx` — the first 3D beat: a wireframe torus knot, open/linear silhouette, continues the indigo→steel→violet color journey.
- `components/sections/ProjectsGrid.tsx` — the 2D Projects section: an asymmetric masonry grid of project images that assembles on scroll. Modelled on an AE.1-style reference: three equal columns each starting at a different vertical offset (the staircase is the whole character), two landscape tiles left with the second inset, one tall portrait anchor centre, two landscape right. Implemented as `grid-cols-3` over **50 fine row tracks with `row-gap: 0`** — the fine tracks buy the per-column offsets, and vertical gutters are *spans* (one empty row between stacked tiles) because a row gap over 50 tracks would add 49 gutters of dead height. The wrapper's `aspect-[1152/620]` makes the `1fr` rows width-derived so tiles hold their proportions at any width. Tile geometry lives in the component's `TILES` const (presentation), never in `/data` (content); index order in `TILES` must match `projects`. One colocated scrubbed timeline flies each tile in from the page edge nearest its own slot — vectors are chosen so no two paths cross (left column never enters col 2, centre only descends within col 2, right never enters col 2), and the arrival order is centre-out so the composition builds around its focal point. **Gotcha**: the trigger must `ScrollTrigger.refresh()` after building — created during hydration while the 700svh hero above is still settling, it otherwise keeps an unmeasured `start:0/end:null` and never advances. Tiles are deliberately *not* pre-hidden with CSS classes (unlike `HeroPinned`): `useGSAP` runs on `useLayoutEffect` so `fromTo` sets the start state before paint anyway, and class-hiding would risk the section's entire content staying invisible if GSAP never boots.
- `lib/motionTier.ts` — `detectLowMotion()`: reduced-motion ‖ coarse pointer ‖ ≤4 cores. Shared by `ScrollManager` and `ProjectsGrid` so the heuristic isn't copied a third time; deliberately mirrors `3d/quality.ts` rather than importing it, since that file is 3D-layer-only.
- `components/3d/CameraRig.tsx` — keyframed camera path over `scrollState.progress`, smoothstep segments, exp damping, pointer parallax on top. **`at` values are hand-tuned to measured section offsets** (full-page progress is normalized over total document height, and the 700svh hero dominates it — camera parks on the About pose until ~0.83 where the canvas first becomes visible). Re-measure and re-tune if section heights change. **Known limitation**: because the hero runway is viewport-proportional (700svh) while every other section is content-height, these fractions shift with viewport HEIGHT, not just section heights — driving the rig from per-section progress instead of document-normalised progress would fix that properly.
- `components/3d/Effects.tsx` — Bloom + Vignette composer. Not currently mounted. Its original blocker (HeroAct's `AsciiEffect` render-loop takeover) is gone with HeroAct — mounting it is now a viable follow-up.
- `components/ui/ScrollProgressBar.tsx` — rAF loop reading `scrollState.progress`; no scroll listeners, no React state.

## Current status (2026-09-04) & next-session handoff

All 5 build stages ✅, acts checkpoint 1 ✅, pinned-photo hero (stage 7) ✅ and then iterated through several PO rounds, ending at `fe7aa09`: `2c349f3` (port from the standalone prototype, HeroAct deleted, acts start at About, `activeAct` "none" during the hero) → `dbfe044` (resolve beat rebuilt to match juanmora.co reference screenshots: word-by-word ghost→bright reveals, rules growing to full width line by line, bigger checklist) → `3ed9b61`/`29aa8ba` (client-facing copy; the statement became a letter-by-letter kicker, then gained a rolling ~two-word window — letters fade back out in appearance order, gap between the in/out waves at 3.2/3.65 sets the window width) → `31a91b8` (display lines now "Big Ideas"/"Real Value" — client-facing, same char counts as the originals so occlusion geometry held; photo+cutout `object-position` y 40%→22% so hair clears the navbar on short viewports; display type de-zoomed to clamp 6.5vw/6rem) → `fe7aa09`/`2294520` (kicker finally lands in the resolve-headline's own position — same items-center + section-shell wrapper, clamp(1.4rem,2.8vw,2.4rem) semibold, in/out letter waves at 3.2/3.85 with 0.03 stagger so it clears at ~5.93 before beat 3; the wave-gap number is the lingering knob). Verified throughout with Playwright screenshot sweeps (desktop 1440×900 + short-wide 1536×700 + mobile 390, reduced-motion, rapid-scroll act-thrash); `npm run build` clean. QA scripts (`qa-site.mjs`, `measure.mjs`) lived in session scratchpad only — recreate from the pattern: scroll the `#hero` runway in ~10 steps, screenshot each, read them visually.

**Next session, in rough priority order:**

1. **Real hero photo** — the desk photo in `public/hero/` is a stock stand-in (not Ali); the `site.hero` copy is now client-facing ("Big Ideas"/"Real Value", "Why clients work with me", benefits checklist, "Start a project" → #contact) but still placeholder-quality. Swapping the photo = regenerate `photo.jpg` + `cutout.webp` (rembg, Python 3.13 venv — 3.14 lacks onnxruntime wheels; use the Python API `remove()`, the CLI extra isn't installed) at 1920w, then re-check: (a) the occluded line still crosses the subject at `p≈0` on desktop AND mobile (tune `.hero-line-behind`'s `pl-[36vw]`/`top`), (b) `object-[68%_22%]` still frames the new subject with hair clear of the navbar on short viewports, (c) scrim still carries text legibility (incl. the bottom-left kicker). The photo is full-bleed `object-fit: cover`, so real "zoom out" beyond type-scale tweaks needs a wider-framed source photo.
2. **Hero motion tuning against the real reference** — the user is matching juanmora.co closely; expect requests like beat-timing tweaks. All knobs are in `HeroPinned.tsx`'s timeline (notional 0–10 positions) and `--pin-vh`-equivalent `h-[700svh]` class.
3. **`Effects.tsx` bloom/vignette** — its old blocker (HeroAct's AsciiEffect render-loop takeover) is gone; mounting it for `high` tier is now viable.

**Verification habits that caught real bugs this round:** test reduced-motion via Playwright `reducedMotion: 'reduce'` AND check that `Reveal`-wrapped content below the hero actually renders (see the `useReducedMotionPref` note in 3D conventions — framer's own hook is banned); after anything that changes section heights post-hydration, confirm nav active-state still updates (stale ScrollTrigger positions need a `refresh()`).

**Per-project 3D acts are CANCELLED (stage 8).** `LumineeAct`/`LacpaAct`/`ConstructiqAct`/`AvidAct` were never built and are not coming; `AllwaytaxiAct` was deleted along with `Projects.tsx` and `ProjectCard.tsx`. The Projects section is now the 2D `ProjectsGrid`. Consequences: the `car.glb` missing-texture issue is moot, the ConstructIQ CC-BY attribution obligation ("Crane by J-Toastie, via Poly Pizza") no longer applies since `construction.glb` is unused, and **all four `public/models/*.glb` are now dead assets** — left on disk deliberately, delete when you're sure nothing else wants them. A `ContactAct` remains conceivable but unscoped.

**BLOCKING for Projects:** `public/images/projects/` is empty — all five files (`avid.jpg`, `lacpa.jpg`, `ta-scan-agent.jpg`, `mag.jpg`, `beastfit-wear.jpg`, filenames = slugs, path spelled out in each project's `image` field) are missing, so the grid renders empty frames. Also note **slot 3 (index 2 in `projects`) is the tall portrait tile** (ratio 0.76) — whichever project has a genuinely vertical image should hold that index.

**Also pending (content/shipping):** real project copy in `src/data/projects.ts` (TA Scan Agent and Beastfit Wear are pure placeholder; Avid/LACPA/MAG carry copy inherited from the old entries and needs a rewrite), real GitHub/LinkedIn URLs in `src/data/site.ts`, Vercel deploy (CLI not installed yet — `npm i -g vercel`).

**Known quirks:** `html { scroll-behavior: smooth }` (globals.css) fights programmatic scrolls — set `scrollBehavior='auto'` before scripted scroll sweeps or measurements will read stale positions. GSAP's rAF ticker is throttled in unfocused/background tabs, so ScrollTrigger progress reads 0 everywhere when driving the page over CDP — force `ScrollTrigger.update()` or foreground the tab before trusting a measurement. Browser Grammarly extension causes a harmless hydration warning on `<body>`; `create-next-app` couldn't scaffold in place (capital letters in dir name) so package name is `alisleiman-3d`.
