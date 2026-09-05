<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Scroll-Based 3D Portfolio — Project Conventions

Personal portfolio for Ali Sleiman (software engineer). Scroll-based 3D site: the R3F canvas is a fixed hero/background layer, content sections scroll over it, and scroll position drives the camera/scene. **Not** a walk-around experience — no first-person controls, no physics engine.

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS · React Three Fiber + @react-three/drei · GSAP + ScrollTrigger (via `@gsap/react` `useGSAP` for React-safe cleanup) · Lenis for site-wide scroll damping (desktop wheel only) · Framer Motion for 2D UI transitions · Deployed on Vercel.

## Build stages (confirm each works before the next)

1. ✅ Scaffold + folder structure + typed placeholder data
2. ✅ Static 2D layout (hero, about, projects grid, contact) — deployable fallback on its own, no 3D
3. ✅ Single `<Canvas>` with a primitive-built hero shape, lazy-loaded via `next/dynamic` `ssr: false` (the shape itself was later relocated into `components/3d/acts/HeroAct.tsx` — see stage 6 below)
4. ✅ GSAP ScrollTrigger drives camera/scene state through sections
5. ✅ Polish: lighting, post-processing, section transitions (env reflections are high-tier only — the `<Environment>` block mounts solely when `quality === "high"`; `Effects.tsx`, the bloom composer, is mounted on the high tier for the intro sphere)
6. ✅ Cinematic acts restructure — the 3D layer is a sequence of scroll-triggered "acts" (`components/3d/acts/`) instead of one persistent object. Scope was later cut: the per-project acts are cancelled (stage 8) and the About torus knot was removed; `IntroAct` (the particle sphere) is the only 3D beat
7. ✅ Pinned-photo hero — the 3D `HeroAct` was retired in favor of a 2D scroll-scrubbed hero (`components/sections/HeroPinned.tsx`) modeled on juanmora.co: sticky full-bleed photo, a depth-occluded headline (a rembg foreground cutout sandwiches text between photo and subject), full-width opposite-direction line sweeps, a statement beat, then a resolve block that assembles word by word (dim ghost → bright, in reading order) with rules that grow from zero to full width line by line, ending in the CTA — all over a 700svh runway; 3D acts now start at About
8. ✅ Projects section reworked to 2D — the per-project 3D acts (taxi + four unbuilt) are cancelled and replaced by `components/sections/ProjectsGrid.tsx`: an AE.1-style asymmetric masonry grid of real project images that assembles itself over its own sticky scroll runway. DOM + GSAP only, no Canvas
9. ✅ Client-facing copy pass — About, Projects and Contact rewritten for the audience the hero already addressed (clients, not engineers); About prose and all section copy moved into `data/site.ts`; the technology tag cloud replaced by outcomes
10. ✅ Intro "nebula sphere" beat — a standalone scroll-scrubbed particle sphere between About and Projects (`IntroAct` + `introShaders.ts`), interactive (drag/tilt), coloured and bloomed, captioned by two client-facing beats; the About torus knot removed on the way
11. ✅ Scroll feel + chrome — site-wide Lenis damping (`SmoothScroll.tsx`) so a flick can't skip a beat; the fixed top nav removed (the page is one continuous scroll, the hero CTA is the only in-page link)

## Folder structure

```
src/
  app/                    App Router entry (layout, page, globals.css)
  components/ui/          2D primitives — buttons, headings, reveal (+ the unmounted Navbar/ScrollProgressBar)
  components/sections/    HeroPinned, About, Intro (3D runway + caption), ProjectsGrid, Contact scroll sections
  components/3d/          Scene, SceneManager, CameraRig, Lights, Effects — isolated 3D components
  components/3d/acts/     One file per cinematic "act" — IntroAct (the only one) + its GLSL (introShaders.ts) + useActTransition
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
- **Cinematic acts**: the 3D layer is a sequence of scroll-triggered "acts" (`components/3d/acts/`), not one persistent object. `SceneManager` mounts exactly one act at a time, keyed to `activeAct` (`lib/scroll.ts`). Only `IntroAct` exists (the standalone particle sphere over the `#intro` runway); `activeAct` is `"none"` over the photo hero, About and the 2D Projects grid.
- **Degrade gracefully**: provide a low-poly or 2D fallback for low-end/mobile devices (reduced DPR, fewer particles, or no canvas at all). The stage-2 static layout is the ultimate fallback. Acts still swap on `low`/reduced-motion, just without the GSAP tween (instant swap, static pose — see `ScrollManager`'s `skipTransitionTween`).
- ScrollTrigger registration/cleanup goes through `useGSAP()`; don't hand-roll `ScrollTrigger.create` without cleanup. All triggers — including act-transition orchestration — live in `components/ScrollManager.tsx`, with one documented exception: a section-local scrubbed timeline that only tweens that section's own DOM may colocate in the section component (`HeroPinned` and `ProjectsGrid` do this). Cross-section/act orchestration may not.
- **Reduced-motion detection**: use `lib/useReducedMotionPref.ts`, NOT framer-motion's `useReducedMotion`. Motion v13 disables `whileInView`/`animate` under reduced motion, and its own hook can lose the race against that — leaving `initial`-hidden content permanently invisible. The shared hook reads matchMedia directly, so the plain-render branch is deterministic.
- **Scroll bridge**: GSAP and R3F meet only through `src/lib/scroll.ts`. ScrollTrigger writes `scrollState.progress`, `introState.progress` (per-section scrub for the intro act), `transitionState` (act-transition tween), and `activeAct` (plain mutation / pub-sub); `useFrame` callbacks and `SceneManager` read them. Never route per-frame values through React state — `activeAct` is the one exception, since it changes only at transition boundaries, exactly like the existing `activeSection`. The 3D layer never imports gsap; ScrollManager never imports three.

## Content conventions

- Project case studies live in `src/data/projects.ts` as typed `Project` objects (`src/lib/types.ts`); sections render from data. **`title` is what the thing IS in plain language, not the client's name** — a visitor who has never heard of LACPA must still understand the tile. The client name lives in `client`, the small uppercase tile line in `sector`.
- Site-wide info and **all section copy** lives in `src/data/site.ts` — `hero`, `about` (title, paragraphs, stackNote), `intro` (the sphere's two caption beats), `outcomes`, `projectsIntro`, `contact`. Do not hardcode section prose in JSX; About used to and was moved.
- **The whole site talks to clients, not to engineers.** The voice is client-facing and neutral. Concretely: no résumé-shaped technology tag clouds ("React · Docker · CI/CD") — nobody shops for an API, and the tag *format* reads as a CV no matter what words go in it. `outcomes` names the problem the client arrived with; the real stack survives as one muted line (`about.stackNote`).

## Architecture map (who does what)

- `components/SmoothScroll.tsx` — site-wide scroll damping via **Lenis** (`lerp` 0.08, `wheelMultiplier` 0.7 — the multiplier is the "slow the user down" lever; below ~0.6 the page feels like it resists). Native scroll stays the source of truth, so sticky runways, the fixed canvas and all ScrollTriggers are untouched; Lenis is stepped from `gsap.ticker` (with `lagSmoothing(0)`) and calls `ScrollTrigger.update` on scroll. Desktop wheel only: not created on coarse pointers or under reduced motion. One document-level click handler routes every plain left-click on `a[href^="#"]` through `lenis.scrollTo` (offset 0 — there is no fixed header any more; restore `NAV_OFFSET`/`scroll-padding-top` if one returns) and `history.replaceState`, so the hero CTA needs no handler of its own. **Don't switch to Lenis's built-in `anchors` option** — it doesn't `preventDefault`, so the browser jumps natively before the glide starts (verified). `globals.css` carries Lenis's `html.lenis` rules — `scroll-behavior: auto` while it runs, or CSS smooth scrolling double-eases every anchor jump. Mounted once in `app/page.tsx`. **Gotcha for automation**: wheel events are virtualised, so a synthetic wheel scroll arrives damped; `window.scrollTo` / `scrollIntoView` still land instantly.
- `components/ScrollManager.tsx` — owns ALL ScrollTriggers: full-page scrub → `scrollState.progress`; per-section triggers → active section id, and (via `transitionTo()`) the act-to-act GSAP transition — tweens `transitionState.t` out/in and calls `setActiveAct()` at the swap point. Both `hero` and `projects` map to the `"none"` act (photo hero / 2D grid — nothing for the canvas to render). Renders null. The section list is nav ids ∪ `SECTION_TO_ACT` keys, so a section can drive an act without being in `site.nav` (`intro` does this); `setActiveSection` fires only for nav ids. **The top nav is unmounted** (`components/ui/Navbar.tsx` and its `ScrollProgressBar` are kept but not rendered — `app/page.tsx`), so `activeSection` currently has no consumer; `site.nav` still defines the content-section id list. `SECTION_PROGRESS` maps a section to a `lib/scroll` field its own trigger scrubs via `onUpdate` — the same trigger that owns the act window, so the bounds can't drift. **Section windows must stay contiguous and non-overlapping**: `onToggle` only acts on activation, so an overlap strands `activeAct` when scrolling back up. **Gotcha**: fast scroll can interrupt a transition before its `setActiveAct()` call fires — `interruptInFlight()`/`pendingTarget` exist specifically to land that pending act-swap before starting the next transition, so `activeAct` never gets stranded mid-flight. Don't simplify away `pendingTarget` without re-testing rapid back-and-forth scrolling.
- `lib/scroll.ts` — the GSAP↔R3F bridge: mutable `scrollState` + `introState` (scroll progress plus the intro section's pointer/drag fields) + `transitionState` (per-frame, no React) + subscribable `activeSection` and `activeAct` (`useSyncExternalStore`, changes only at boundaries). `ActName` is `"none" | "intro"`.
- `components/sections/HeroPinned.tsx` — the 2D pinned-photo hero. `id="hero"` section = 700svh scroll runway (100svh under reduced motion, static final state); inner `position: sticky` stage (sticky, NOT ScrollTrigger `pin` — no pin-spacer) holds the layer sandwich: photo → occluded line → rembg cutout of the subject (identical `object-fit/object-position` classes to the photo — keep them in sync or the occlusion drifts) → scrim → front line/beats. One colocated scrubbed GSAP timeline (notional 0–10s over the pin) plays the beats; copy comes from `site.hero` (`data/site.ts`). Beat 3 (6.0→10) is the juanmora.co-style assembly: `words()` wraps every word of the eyebrow/headline/checklist in `.hero-word` spans, `wordReveal()` runs two staggered opacity tweens per block (0→0.3 ghost wave, then 0.3→1 bright wave, `immediateRender: false` on the second), and `growLine()` scales `.hero-rule`/`.hero-check-line` divs 0→1 from the left — transform/opacity only. Checklist items are addressed as `.hero-check:nth-child(i)`, so the `<li>`s must stay the `<ul>`'s only children. When `reduced` flips post-hydration it calls `ScrollTrigger.refresh()` because the runway collapse re-maps every trigger position. Swap the photo by regenerating `public/hero/photo.jpg` + `cutout.webp` (rembg, py3.13) at 1920w.
- `components/3d/Hero3D.tsx` — the page-wide fixed background canvas (name is historical). `next/dynamic` `ssr:false`, quality gate, CSS-glow fallback, vignette overlay (the only vignette — `Effects.tsx` has none). Fully covered by the photo during the hero pin. `HeroCanvas.tsx` creates the canvas **opaque (`alpha:false`)** and `Scene.tsx` paints `#07070b` (the page's `--background`) as the scene background: bloom on a premultiplied transparent canvas is unspecified where alpha is 0. Keep the two colours in sync.
- `components/3d/quality.ts` — `useQualityTier()`: `off` (no WebGL / reduced motion → CSS glow only) · `low` (coarse pointer / ≤4 cores → 400 background particles, 10k-point / 800-filament intro sphere, DPR ≤1.5, no post-processing) · `high` (1200 background particles, 40k / 3000 intro sphere, DPR 2, Effects bloom + Environment).
- `components/3d/SceneManager.tsx` — subscribes to `activeAct`, renders exactly one act component. `"none"` → null (photo hero, About, and the 2D Projects grid); `"intro"` → `IntroAct`. `activeAct` initializes to `"none"`.
- `components/3d/acts/useActTransition.ts` — returns the current act-transition scale/opacity factor (reads `transitionState.t`); each act multiplies its own scroll-driven scale by it.
- `components/sections/Intro.tsx` — `id="intro"`: a transparent 300svh runway (200svh below `md`, `h-svh` under reduced motion + `ScrollTrigger.refresh()`) — the canvas is already `fixed inset-0`, so the pin is inherent. It carries a two-beat caption from `site.intro` (`gathering` "Rough idea in." / `formed` "Working product out." — client-facing, rides the sphere's story, never describes the 3D; **the two are never on screen together**) in a `sticky` stage that is **`pointer-events-none`** so the section still gets the drag; both share one grid cell so the second lands where the first was. A colocated DOM-only scrubbed timeline (allowed by the ScrollManager rule) uses the SAME `top center → bottom center` bounds as the act's progress, so its notional 0–1 is `introState.progress`: `gathering` 0.28→0.38 in, 0.6→0.68 out; `formed` 0.8→0.9 in (sphere completes at `GROW_END` 0.88), 0.95→1 out ahead of the Projects handoff. Reduced motion shows only `formed`, static. Below `md` the caption sits under the sphere, from `md` to the left of it. It is also the act's **input surface**: the canvas sits at `-z-10` behind `<main>` and never receives pointer events, so this section's handlers write pointer position (viewport-normalised, not section-relative) and drag deltas into `introState`. `touch-pan-y` keeps vertical touch scrolling; **`onPointerCancel` must reset `dragging`** (the browser fires it when it claims a vertical swipe). `aria-hidden`, no `role`/`tabIndex` — decorative, and the repo's jsx-a11y set doesn't flag it. Not in `site.nav`.
- `components/3d/acts/IntroAct.tsx` (+ `introShaders.ts`) — the standalone "nebula sphere" beat between About and Projects (an identity/motion piece, not a project act; the earlier node/edge graph was dropped for a dense point cloud). Two GPU layers in one group, both deterministic (mulberry32), CPU arrays cached per tier at module level, GPU geometry/materials disposed per mount: (1) a `<points>` cloud of 40k (high) / 10k (low) sprites — 58 % surface band, 27 % core fill, 15 % dust halo out to ~1.57R — coloured per particle in the fragment shader (indigo core → violet body by `vRadial`, magenta bands where the tangential swirl noise `vFlowN` is strong, cyan on the view-dependent limb `vRim` weighted by a top-right `uLightDir`, halo alpha ×0.22); (2) a `<lineSegments>` layer of 3000 / 800 hot-pink **filaments**, each 6 non-indexed segments whose vertex shader walks `aStep·6` Euler steps along the SAME flow field (`flowVec` in `introShaders.ts`) so streaks lie along the swirl that displaces the dots; they're born late (`aTau ≥ 0.45`) so they appear on an already dense body. **Scale, position, scroll rotation, density and swirl amplitude are pure functions of `introState.progress`** (× the transition factor): per-particle birth threshold `aTau` = 65 % seed-distance rank + 35 % random (30/70 for dust) gated by `smoothstep` in the vertex shader with unborn points clip-culled; group scale/position share one eased curve (`SEED_SCALE` 0.08 → 1, upper-right → centred); `GROW_END` 0.88 holds the finished sphere before the handoff. `delta` is used for three things only, all **gated by `w = smoothstep(0.6, 0.9, pg)`** so they fade out with the sphere on scroll-back: drag-to-rotate inertia, cursor tilt ±10°, and `IDLE_FLOW` — a slow drift of the swirl phase (`flowPhase`, added to `uFlow`) so the streaks keep streaming while the user sits still. That phase is the one history-dependent term; growth itself still reverses exactly. **Gotchas**: additive sprites keep pixel size while the group shrinks, so the seed would stack to clipped white — `uSizeMul` and a density-compensated `uIntensity` (`s/√visFrac`, shared by both layers) prevent that; both `ShaderMaterial`s need `#include <colorspace_fragment>` (no tonemapping) or the hexes render dull; the fragment shaders multiply colour above 1 on the limb/streaks/filaments on purpose — that's what crosses `Effects.tsx`'s bloom threshold while the violet body stays matte; line width is 1 device px (WebGL), bloom is what makes filaments read as glowing wisps, so the low tier (no composer) compensates with fewer, brighter filaments; uniforms are written through the `<points>`/`<lineSegments>` refs, never the memoised materials (React Compiler `immutability` rule). Palette hexes and all tunables (`HALO_FRAC`, `FIL_STEPS`, `FIL_STEP_LEN`, `IDLE_FLOW`, `LIGHT_DIR`) are constants at the top of `IntroAct.tsx`.
- `components/sections/ProjectsGrid.tsx` — the 2D Projects section: an asymmetric masonry grid of project images that assembles on scroll. Modelled on an AE.1-style reference: three equal columns each starting at a different vertical offset (the staircase is the whole character), two landscape tiles left with the second inset, one tall portrait anchor centre, two landscape right. Implemented as `grid-cols-3` over **50 fine row tracks with `row-gap: 0`** — the fine tracks buy the per-column offsets, and vertical gutters are *spans* (one empty row between stacked tiles) because a row gap over 50 tracks would add 49 gutters of dead height. The wrapper's `aspect-[1072/630]` makes the `1fr` rows width-derived so tiles hold their proportions at any width.
  - **Tile geometry** lives in the component's `TILES` const (presentation), never in `/data` (content); index order in `TILES` must match `projects`. **Slot ratios are tuned to the source images** — the four flanks are 1.25 and sit in a 1.28–1.46 band; index 2 has a portrait source (0.80) and a 0.77 slot so it can be the tall anchor while cropping only ~4% of its width. Re-tune if source aspect ratios change; a portrait slot fed a landscape source loses ~40% of the frame.
  - **The assembly is two phases, not one stagger.** The anchor flies in alone and lands fully (`at: 0` → 0.45, ~36% of the scroll to itself); the first flank only starts at 0.48. Keep that boundary when retiming. Flanks then go centre-out: left, right, bottom-left, bottom-right. Each tile enters from the page edge nearest its own slot, travelling only within its column/row band, so no two paths cross. Only `overflow-x` is clipped, so the `opacity: 0 → 1` ramp is what stops vertical travel bleeding over the About/Contact copy — don't flatten it.
  - **Desktop scrubs against its own runway**: a `md:h-[175svh]` block (`runwayRef`) holding a `position: sticky` stage — sticky, NOT ScrollTrigger `pin`, same reason as `HeroPinned` (no pin-spacer reshuffling the document). Runway length is set to preserve **per-tile** pacing, not total duration: the two-phase split stretched the timeline 1.06 → 1.26 notional units, so the runway grew ~19% to match (~534px of scroll per tile).
  - **Gotcha — the trigger straddles two elements.** `trigger` is the *grid*, `endTrigger` is the *runway*. Anchoring both to the runway leaves a dead lead-in: the grid is centred in a viewport-tall sticky stage, so it becomes visible `(viewport + grid)/2` px *before* the runway tops out and you scroll past an empty block. That offset scales with viewport height, so no fixed start percentage fixes it — key the start to the grid's own top.
  - **Gotcha — `ScrollTrigger.refresh()` is mandatory after building.** These triggers are created during hydration while the 700svh hero runway above is still settling; without it they keep the unmeasured `start:0/end:null` they were born with and silently never advance. The reduced-motion branch refreshes too, because the runway collapses and changes document height.
  - **Every tile is tinted.** Three of the five source images are screenshots on light backgrounds; untreated they read as bright panels floating on the `#07070b` page. `Tile` darkens all five uniformly — a `bg-[#07070b]/60 mix-blend-multiply` overlay between the `<Image>` and the caption scrim, plus `saturate-[.85] brightness-95` on the image — and hover/focus clears both. Uniform rather than per-image so it can't drift when an image is swapped. **The wrapper's `isolate` is load-bearing**: `mix-blend-multiply` blends against the nearest stacking context, and without it the tint reaches past the tile into the page and the fixed canvas. Tailwind gates `group-hover:` behind `@media (hover: hover)`, so the tint correctly stays put on touch — where the caption is always visible anyway. 45% was too weak to settle the light images; 60% with the dark images still holding detail is the balance.
  - **Images are `loading="eager"`, never lazy.** `next/image` gates lazy loading on IntersectionObserver, which tests the tile's *transformed* position — and the assembly parks tiles up to 60vw off-screen, so they never register as in-view and don't start loading until they fly in, popping in mid-animation. Not `priority` either: that injects a preload competing with the hero photo's LCP.
  - Tiles are deliberately **not** pre-hidden with CSS classes (unlike `HeroPinned`): `useGSAP` runs on `useLayoutEffect` so `fromTo` sets the start state before paint anyway, and class-hiding would risk the section's entire content staying invisible if GSAP never boots.
  - Mobile is a separate single-column timeline via `gsap.matchMedia()`, single-phase and sequential top-to-bottom, with **no runway** — the stack is several screens tall, so pinning would trap the user.
- `lib/motionTier.ts` — `detectLowMotion()`: reduced-motion ‖ coarse pointer ‖ ≤4 cores. Shared by `ScrollManager` and `ProjectsGrid` so the heuristic isn't copied a third time; deliberately mirrors `3d/quality.ts` rather than importing it, since that file is 3D-layer-only.
- `components/3d/CameraRig.tsx` — keyframed camera path over `scrollState.progress`, smoothstep segments, exp damping, pointer parallax on top. **`at` values are hand-tuned to measured section offsets** (full-page progress is normalized over total document height, and the 700svh hero dominates it — camera parks on the About pose until ~0.54 where the canvas first becomes visible; measured at 800×1180 with all three runways: about 0.544, intro 0.618, projects 0.851). The rig pans to a centred `[0,0,6]`→origin pose over About's tail and **holds it for the whole intro** so the sphere's move-to-centre reads as the sphere moving, not the camera. **Re-measure and re-tune whenever any section height changes** — the Projects runway alone moved About from 0.83 to 0.70, and the intro runway moved it again to 0.54. **Known limitation**: because the hero and intro runways are viewport-proportional while every other section is content-height, these fractions shift with viewport HEIGHT, not just section heights — driving the rig from per-section progress instead of document-normalised progress would fix that properly.
- `components/3d/Effects.tsx` — Bloom-only `EffectComposer` (`multisampling={0}`, `luminanceThreshold` 0.5, `mipmapBlur`), mounted by `Scene.tsx` on the `high` tier only. Tuned for the intro sphere: only the >1-multiplied limb/streak/filament pixels bloom. No `Vignette` (Hero3D's CSS overlay already is one — doubling it crushed copy contrast). The background `ParticleField` (`#8b8cf5` at 0.7 opacity) composites just under the threshold; if it ever halos, dim its opacity rather than raising the threshold.
- `components/ui/Navbar.tsx` + `components/ui/ScrollProgressBar.tsx` — the fixed top nav (scrollspy via `activeSection`) and its rAF-driven progress bar. **Unmounted** since the nav was removed; kept in case it comes back.
- `components/ui/WhatsAppFab.tsx` — the floating WhatsApp button, mounted page-wide in `app/page.tsx` as a sibling of `<main>`. A plain `<a>` with no `"use client"` (hover styling only, so it ships no JS) and a net-new inline SVG — the repo has no icon primitive. Deliberately not built on `ui/Button`, whose `h-12 px-6` pill base would be almost entirely overridden. `z-40`: above everything mounted (nothing else exceeds `z-[5]`) but below the unmounted Navbar's `z-50`, so nothing collides if the nav returns. Reads `site.whatsapp` — **the `wa.me` URL must be digits only**, no `+`, spaces or dashes, or the link silently fails.

## Current status (2026-09-06) & next-session handoff

Stages 1–11 ✅. This session checkpointed the stage 10–11 work that was sitting
uncommitted, then closed most of the content queue. Commits, in order:

- `34eca8a` — stage 10–11 checkpoint: `IntroAct` + `introShaders` (the nebula
  sphere), `Effects.tsx` bloom mounted on `high`, Lenis `SmoothScroll`, the top
  nav removed, `AboutAct` deleted, `CameraRig` re-measured. This was all found
  uncommitted in the working tree at session start.
- `bbe5eb7` — uniform dark tint on all five project tiles, real GitHub/LinkedIn
  URLs, WhatsApp (floating button + Contact row), and the four placeholder
  case-study `description`s rewritten.

**The Projects grid is the thing to understand before touching this page** — its
architecture-map entry above lists five separate gotchas that each cost real
debugging time (the trigger straddling two elements, the mandatory
`ScrollTrigger.refresh()`, eager images, the ratio↔source coupling, the two-phase
boundary). Read them before retiming or restyling it.

Closed since: the hero photo is real (Ali confirmed — the old "stock stand-in"
note was wrong); the project-image tint is decided and shipped (uniform, all
five — see the ProjectsGrid entry); GitHub/LinkedIn URLs are real; WhatsApp is
added; the four placeholder case-study `description`s are rewritten.

**Next session, in rough priority order:**

1. **Finish the visual pass** — the checks below could not be completed this
   session because the Chrome window was never actually on screen. See "Driving
   the page over CDP lies to you" — with the window hidden, `document.hidden`
   stays `true` and **rAF does not fire at all** (measured: 0 ticks in 500 ms),
   so GSAP and R3F never run and Lenis eventually freezes scroll writes
   entirely. Screenshots still force a paint, so static CSS *can* be checked
   that way; anything scroll- or animation-driven cannot. Outstanding: the
   intro-sphere sign-off (item 2), a live hover-restore on a tile (the CSS
   rules were verified in the compiled stylesheet instead), and the WhatsApp
   FAB at mobile widths — confirm it doesn't cover the Contact buttons when
   they wrap.
2. **Intro sphere visual sign-off** — stage 2b (palette, filaments, dust halo,
   idle flow, bloom on `high`) is built and lint/tsc/build/shader-compile clean
   but has NOT been eyeballed in a foregrounded browser (automation tabs stayed
   hidden, so no frames rendered). Check the checklist in the session recap:
   colours, seed not clipping white, filaments only after ~p 0.45, no bloom
   halo on the background stars, About/Projects copy contrast, frame time at
   DPR 2 (levers: `dpr [1,1.5]` on high, then `FIL_STEPS` 4).
3. **Connect Vercel to the GitHub repo** (`vercel git connect`) so every push
   deploys and branches get preview URLs. The remote now exists; the two are
   just not wired together, so deploys are still manual CLI uploads.

## Deployment

**Live: https://alisleiman-3d.vercel.app** (project
`alisleiman0s-projects/alisleiman-3d`, account `alisleiman0`). Publicly
reachable — no Deployment Protection in the way.

**Source: https://github.com/AliSleiman0/alisleiman-3d** (public, `origin`,
branch `main`).

Deploys are currently **CLI direct upload**, not a Git integration:
`vercel --prod --yes` from the repo root. Pushing to GitHub does *not* deploy —
run `vercel git connect` if you want that (every push builds, plus preview URLs
per branch). `vercel login` is interactive and can't be driven by an agent — a
human runs it.

Two gotchas, both hit on the first attempt:

- **`vercel link` fails on the default project name.** It derives the name from
  the directory `AliSleiman-3d`, and Vercel names must be lowercase — the same
  capital letters that stopped `create-next-app` scaffolding in place. Pass it
  explicitly: `vercel link --yes --project alisleiman-3d`.
- **`.vercelignore` is mandatory here.** Vercel did *not* fall back to
  `.gitignore` for the upload, so a stray ~65 MB `dev.log` at the repo root was
  the entire 63.6 MB deploy payload and the upload failed. With `.vercelignore`
  the payload is ~1 MB. Keep `next dev` logs out of the repo root, or at least
  matched by `*.log` there.

The upload also failed once with a bare `fetch failed` at ~75 % on a 1 MB
payload and succeeded on an immediate retry — transient, just retry.

**Loose ends left deliberately:**

- Five orphaned `.webp` files sit untracked in `public/images/projects/` under the
  old slug names (`avid`, `lacpa`, `mag`, `ta-scan-agent`, `beastfit-wear`). Not
  created by the agent and not referenced — left for Ali to delete.
- `public/models/*.glb` (car, documents, construction, robot) are dead assets now
  that the per-project acts are cancelled. `car.glb`'s missing-texture issue is
  moot, and the ConstructIQ CC-BY attribution obligation no longer applies.
- `components/ui/Tag.tsx` is now unused (its last consumers were `ProjectCard` and
  the About tag cloud). Kept as a generic primitive.

**Per-project 3D acts are CANCELLED — do not resurrect.** The About torus knot
(`AboutAct`) was removed too; `IntroAct` is the only 3D beat. A `ContactAct` remains conceivable but unscoped.

**Verification habits that caught real bugs this session:**

- **Driving the page over CDP lies to you.** GSAP's rAF ticker is throttled in an
  unfocused/background tab, so every ScrollTrigger reports `progress: 0` and tiles
  sit frozen at their from-state — this looks exactly like a broken animation and
  cost a long detour. Force `ScrollTrigger.update()`, drive with real input
  events, or foreground the tab before trusting a reading. Also set
  `document.documentElement.style.scrollBehavior = 'auto'` first, since
  `globals.css` sets `scroll-behavior: smooth` and scripted scrolls land late.
  **Worse than throttled — with the Chrome *window* not actually visible on
  screen (minimised or fully covered), `document.hidden` stays `true` and rAF
  fires ZERO times.** Measure it (`requestAnimationFrame` ticks over 500 ms)
  before trusting anything animated; activating the tab is not enough, the
  window must be on screen. Consequences, all hit in one session: nothing
  animates or renders in the canvas; `await new Promise(r =>
  requestAnimationFrame(r))` never resolves and **hangs the CDP eval until it
  times out**; and Lenis — stepped from `gsap.ticker` — stops integrating, so
  `scrollTop` writes first get reverted and later stop taking effect entirely.
  What still works: screenshots force a paint, so **static CSS can be verified
  by parking elements manually** (set `transform: none; opacity: 1` on the
  tiles and screenshot). Beware that an HMR reload re-runs `useGSAP`'s
  `fromTo`, which re-parks the tiles *after* your inline write — a tile
  vanishing mid-check is usually that, not a bug. And `document.styleSheets`
  came back inaccessible; `fetch`ing the stylesheet href and grepping the text
  is the reliable way to confirm a Tailwind variant was generated.
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
