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
6. 🚧 Cinematic acts restructure — the 3D layer is now a sequence of scroll-triggered "acts" (`components/3d/acts/`) instead of one persistent object; checkpoint 1 (Hero → About → AllwaytaxiAct) shipped, five acts remain — see "Current status" below
7. ✅ Pinned-photo hero — the 3D `HeroAct` was retired in favor of a 2D scroll-scrubbed hero (`components/sections/HeroPinned.tsx`) modeled on juanmora.co: sticky full-bleed photo, a depth-occluded headline (a rembg foreground cutout sandwiches text between photo and subject), full-width opposite-direction line sweeps, a statement beat, then a resolve block that assembles word by word (dim ghost → bright, in reading order) with rules that grow from zero to full width line by line, ending in the CTA — all over a 700svh runway; 3D acts now start at About

## Folder structure

```
src/
  app/                    App Router entry (layout, page, globals.css)
  components/ui/          2D primitives — buttons, nav, cards
  components/sections/    HeroPinned, About, Projects, Contact scroll sections
  components/3d/          Scene, SceneManager, CameraRig, Lights — isolated 3D components
  components/3d/acts/     One file per cinematic "act" — AboutAct, AllwaytaxiAct, ...
  data/                   Structured content (projects.ts, site.ts) — never hardcode case-study content in JSX
  lib/                    types.ts, utils.ts, scroll.ts, useReducedMotionPref.ts
public/models/            Real .glb assets (car.glb, robot.glb, documents.glb, construction.glb)
public/hero/              Hero photo (photo.jpg) + rembg foreground cutout (cutout.webp)
```

## 3D conventions

- **Keep 3D components isolated** — Scene, CameraRig, Lights, and each model/shape are separate files under `components/3d/`. Never one giant canvas file.
- **Lazy-load the Canvas**: import the whole 3D layer with `next/dynamic` and `ssr: false` so it never blocks initial render or SEO.
- **Dispose on unmount**: geometries, materials, and textures created imperatively (`new THREE.*` or `useMemo`) must be disposed in a cleanup effect. Declarative JSX primitives are handled by R3F, but anything manually created is your responsibility.
- **Cinematic acts**: the 3D layer is a sequence of scroll-triggered "acts" (`components/3d/acts/`), not one persistent object. `SceneManager` mounts exactly one act at a time, keyed to `activeAct` (`lib/scroll.ts`). `AllwaytaxiAct` demonstrates the real-`.glb` pattern (`useGLTF`, bbox-inspection-then-hardcode transform constants, emissive tint toward the scroll color journey rather than replacing materials) — copy it for the next model-based act.
- **Degrade gracefully**: provide a low-poly or 2D fallback for low-end/mobile devices (reduced DPR, fewer particles, or no canvas at all). The stage-2 static layout is the ultimate fallback. Acts still swap on `low`/reduced-motion, just without the GSAP tween (instant swap, static pose — see `ScrollManager`'s `skipTransitionTween`).
- ScrollTrigger registration/cleanup goes through `useGSAP()`; don't hand-roll `ScrollTrigger.create` without cleanup. All triggers — including act-transition orchestration — live in `components/ScrollManager.tsx`, with one documented exception: a section-local scrubbed timeline that only tweens that section's own DOM may colocate in the section component (`HeroPinned` does this). Cross-section/act orchestration may not.
- **Reduced-motion detection**: use `lib/useReducedMotionPref.ts`, NOT framer-motion's `useReducedMotion`. Motion v13 disables `whileInView`/`animate` under reduced motion, and its own hook can lose the race against that — leaving `initial`-hidden content permanently invisible. The shared hook reads matchMedia directly, so the plain-render branch is deterministic.
- **Scroll bridge**: GSAP and R3F meet only through `src/lib/scroll.ts`. ScrollTrigger writes `scrollState.progress`, `transitionState` (act-transition tween), and `activeAct` (plain mutation / pub-sub); `useFrame` callbacks and `SceneManager` read them. Never route per-frame values through React state — `activeAct` is the one exception, since it changes only at transition boundaries, exactly like the existing `activeSection`. The 3D layer never imports gsap; ScrollManager never imports three.

## Content conventions

- Project case studies live in `src/data/projects.ts` as typed `Project` objects (`src/lib/types.ts`); sections render from data.
- Site-wide info (name, nav, socials, skills) lives in `src/data/site.ts`.

## Architecture map (who does what)

- `components/ScrollManager.tsx` — owns ALL ScrollTriggers: full-page scrub → `scrollState.progress`; per-section triggers → active section id, and (via `transitionTo()`) the act-to-act GSAP transition — tweens `transitionState.t` out/in and calls `setActiveAct()` at the swap point. Interim: the `projects` section triggers the `taxi` act 1:1 until the other four project acts exist and this section splits into per-project sub-triggers. Renders null. **Gotcha**: fast scroll can interrupt a transition before its `setActiveAct()` call fires — `interruptInFlight()`/`pendingTarget` exist specifically to land that pending act-swap before starting the next transition, so `activeAct` never gets stranded mid-flight. Don't simplify away `pendingTarget` without re-testing rapid back-and-forth scrolling.
- `lib/scroll.ts` — the GSAP↔R3F bridge: mutable `scrollState` + `transitionState` (per-frame, no React) + subscribable `activeSection` and `activeAct` (`useSyncExternalStore`, changes only at boundaries).
- `components/sections/HeroPinned.tsx` — the 2D pinned-photo hero. `id="hero"` section = 700svh scroll runway (100svh under reduced motion, static final state); inner `position: sticky` stage (sticky, NOT ScrollTrigger `pin` — no pin-spacer) holds the layer sandwich: photo → occluded line → rembg cutout of the subject (identical `object-fit/object-position` classes to the photo — keep them in sync or the occlusion drifts) → scrim → front line/beats. One colocated scrubbed GSAP timeline (notional 0–10s over the pin) plays the beats; copy comes from `site.hero` (`data/site.ts`). Beat 3 (6.0→10) is the juanmora.co-style assembly: `words()` wraps every word of the eyebrow/headline/checklist in `.hero-word` spans, `wordReveal()` runs two staggered opacity tweens per block (0→0.3 ghost wave, then 0.3→1 bright wave, `immediateRender: false` on the second), and `growLine()` scales `.hero-rule`/`.hero-check-line` divs 0→1 from the left — transform/opacity only. Checklist items are addressed as `.hero-check:nth-child(i)`, so the `<li>`s must stay the `<ul>`'s only children. When `reduced` flips post-hydration it calls `ScrollTrigger.refresh()` because the runway collapse re-maps every trigger position. Swap the photo by regenerating `public/hero/photo.jpg` + `cutout.webp` (rembg, py3.13) at 1920w.
- `components/3d/Hero3D.tsx` — the page-wide fixed background canvas (name is historical). `next/dynamic` `ssr:false`, quality gate, CSS-glow fallback, vignette overlay. Fully covered by the photo during the hero pin.
- `components/3d/quality.ts` — `useQualityTier()`: `off` (no WebGL / reduced motion → CSS glow only) · `low` (coarse pointer / ≤4 cores → 400 particles, DPR ≤1.5, no post-processing) · `high` (1200 particles, DPR 2, Effects + Environment).
- `components/3d/SceneManager.tsx` — subscribes to `activeAct`, renders exactly one act component (`"none"` → null while the photo hero covers the canvas; `AboutAct` / `AllwaytaxiAct` so far — `LumineeAct`/`LacpaAct`/`ConstructiqAct`/`AvidAct`/`ContactAct` not yet built). `activeAct` initializes to `"none"`.
- `components/3d/acts/useActTransition.ts` — returns the current act-transition scale/opacity factor (reads `transitionState.t`); each act multiplies its own scroll-driven scale by it.
- `components/3d/acts/AboutAct.tsx` — the first 3D beat: a wireframe torus knot, open/linear silhouette, continues the indigo→steel→violet color journey.
- `components/3d/acts/AllwaytaxiAct.tsx` — real `.glb` pattern reference: `useGLTF("/models/car.glb")`, bbox-inspection-then-hardcode transform constants (`CAR_SCALE`/`CAR_POSITION`), emissive tint toward the same color journey rather than replacing materials.
- `components/3d/CameraRig.tsx` — keyframed camera path over `scrollState.progress`, smoothstep segments, exp damping, pointer parallax on top. **`at` values are hand-tuned to measured section offsets** (full-page progress is normalized over total document height, and the 700svh hero dominates it — camera parks on the About pose until ~0.63 where the canvas first becomes visible). Re-measure and re-tune if section heights change.
- `components/3d/Effects.tsx` — Bloom + Vignette composer. Not currently mounted. Its original blocker (HeroAct's `AsciiEffect` render-loop takeover) is gone with HeroAct — mounting it is now a viable follow-up.
- `components/ui/ScrollProgressBar.tsx` — rAF loop reading `scrollState.progress`; no scroll listeners, no React state.

## Current status (2026-09-03) & next-session handoff

All 5 build stages ✅, acts checkpoint 1 ✅, pinned-photo hero (stage 7) ✅ and then iterated through several PO rounds, ending at `fe7aa09`: `2c349f3` (port from the standalone prototype, HeroAct deleted, acts start at About, `activeAct` "none" during the hero) → `dbfe044` (resolve beat rebuilt to match juanmora.co reference screenshots: word-by-word ghost→bright reveals, rules growing to full width line by line, bigger checklist) → `3ed9b61`/`29aa8ba` (client-facing copy; the statement became a letter-by-letter kicker, then gained a rolling ~two-word window — letters fade back out in appearance order, gap between the in/out waves at 3.2/3.65 sets the window width) → `31a91b8` (display lines now "Big Ideas"/"Real Value" — client-facing, same char counts as the originals so occlusion geometry held; photo+cutout `object-position` y 40%→22% so hair clears the navbar on short viewports; display type de-zoomed to clamp 6.5vw/6rem) → `fe7aa09` (kicker repositioned to `bottom-[14vh] left-[4vw]`). Verified throughout with Playwright screenshot sweeps (desktop 1440×900 + short-wide 1536×700 + mobile 390, reduced-motion, rapid-scroll act-thrash); `npm run build` clean. QA scripts (`qa-site.mjs`, `measure.mjs`) lived in session scratchpad only — recreate from the pattern: scroll the `#hero` runway in ~10 steps, screenshot each, read them visually.

**Next session, in rough priority order:**

1. **Real hero photo** — the desk photo in `public/hero/` is a stock stand-in (not Ali); the `site.hero` copy is now client-facing ("Big Ideas"/"Real Value", "Why clients work with me", benefits checklist, "Start a project" → #contact) but still placeholder-quality. Swapping the photo = regenerate `photo.jpg` + `cutout.webp` (rembg, Python 3.13 venv — 3.14 lacks onnxruntime wheels; use the Python API `remove()`, the CLI extra isn't installed) at 1920w, then re-check: (a) the occluded line still crosses the subject at `p≈0` on desktop AND mobile (tune `.hero-line-behind`'s `pl-[36vw]`/`top`), (b) `object-[68%_22%]` still frames the new subject with hair clear of the navbar on short viewports, (c) scrim still carries text legibility (incl. the bottom-left kicker). The photo is full-bleed `object-fit: cover`, so real "zoom out" beyond type-scale tweaks needs a wider-framed source photo.
2. **Hero motion tuning against the real reference** — the user is matching juanmora.co closely; expect requests like beat-timing tweaks. All knobs are in `HeroPinned.tsx`'s timeline (notional 0–10 positions) and `--pin-vh`-equivalent `h-[700svh]` class.
3. **Remaining acts** (unchanged scope, see below) and the Projects-section split into per-project sub-triggers.
4. **`Effects.tsx` bloom/vignette** — its old blocker (HeroAct's AsciiEffect render-loop takeover) is gone; mounting it for `high` tier is now viable.

**Verification habits that caught real bugs this round:** test reduced-motion via Playwright `reducedMotion: 'reduce'` AND check that `Reveal`-wrapped content below the hero actually renders (see the `useReducedMotionPref` note in 3D conventions — framer's own hook is banned); after anything that changes section heights post-hydration, confirm nav active-state still updates (stale ScrollTrigger positions need a `refresh()`).

**Known issue, not yet resolved:** `car.glb` references an external texture (`Textures/colormap.png`) that wasn't included alongside the model in `/public/models/` — the car currently renders untextured (flat color from the fallback material). Needs the companion texture file, or the model re-exported with embedded textures.

**Remaining acts (deferred, scoped in order):** `LumineeAct` (instanced node/graph cluster, generated — no model), `LacpaAct` (`documents.glb`), `ConstructiqAct` (`construction.glb`, CC-BY — needs a footer attribution credit: "Crane by J-Toastie, licensed CC-BY, via Poly Pizza"), `AvidAct` (`robot.glb`), `ContactAct` (generated — originally scoped to echo the 3D hero as a bookend; re-scope now that the hero is the photo sequence). Also deferred: splitting the Projects scroll section into 5 per-project sub-acts (interim 1:1 `projects → taxi` mapping today), instancing work, and the full Chrome DevTools TBT/performance audit (meaningful only once all acts are wired).

**Also pending (content/shipping):** real project copy in `src/data/projects.ts`, real GitHub/LinkedIn URLs in `src/data/site.ts`, Vercel deploy (CLI not installed yet — `npm i -g vercel`).

**Known quirks:** browser Grammarly extension causes a harmless hydration warning on `<body>`; `create-next-app` couldn't scaffold in place (capital letters in dir name) so package name is `alisleiman-3d`.
