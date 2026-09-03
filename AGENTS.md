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
3. ✅ Single `<Canvas>` with primitive-built `<HeroModel />`, lazy-loaded via `next/dynamic` `ssr: false`
4. ✅ GSAP ScrollTrigger drives camera/scene state through sections
5. ✅ Polish: lighting, post-processing, section transitions (post-processing + env reflections are high-tier only — `Effects.tsx` and the `<Environment>` block mount solely when `quality === "high"`)

## Folder structure

```
src/
  app/                    App Router entry (layout, page, globals.css)
  components/ui/          2D primitives — buttons, nav, cards
  components/sections/    Hero, About, Projects, Contact scroll sections
  components/3d/          Scene, SceneManager, CameraRig, Lights — isolated 3D components
  components/3d/acts/     One file per cinematic "act" — HeroAct, AboutAct, AllwaytaxiAct, ...
  data/                   Structured content (projects.ts, site.ts) — never hardcode case-study content in JSX
  lib/                    types.ts, utils.ts, scroll.ts
public/models/            Real .glb assets (car.glb, robot.glb, documents.glb, construction.glb)
```

## 3D conventions

- **Keep 3D components isolated** — Scene, CameraRig, Lights, and each model/shape are separate files under `components/3d/`. Never one giant canvas file.
- **Lazy-load the Canvas**: import the whole 3D layer with `next/dynamic` and `ssr: false` so it never blocks initial render or SEO.
- **Dispose on unmount**: geometries, materials, and textures created imperatively (`new THREE.*` or `useMemo`) must be disposed in a cleanup effect. Declarative JSX primitives are handled by R3F, but anything manually created is your responsibility.
- **Cinematic acts**: the 3D layer is a sequence of scroll-triggered "acts" (`components/3d/acts/`), not one persistent object. `SceneManager` mounts exactly one act at a time, keyed to `activeAct` (`lib/scroll.ts`). `AllwaytaxiAct` demonstrates the real-`.glb` pattern (`useGLTF`, bbox-inspection-then-hardcode transform constants, emissive tint toward the scroll color journey rather than replacing materials) — copy it for the next model-based act.
- **Degrade gracefully**: provide a low-poly or 2D fallback for low-end/mobile devices (reduced DPR, fewer particles, or no canvas at all). The stage-2 static layout is the ultimate fallback. Acts still swap on `low`/reduced-motion, just without the GSAP tween (instant swap, static pose — see `ScrollManager`'s `skipTransitionTween`).
- ScrollTrigger registration/cleanup goes through `useGSAP()`; don't hand-roll `ScrollTrigger.create` without cleanup. All triggers — including act-transition orchestration — live in `components/ScrollManager.tsx`.
- **Scroll bridge**: GSAP and R3F meet only through `src/lib/scroll.ts`. ScrollTrigger writes `scrollState.progress`, `transitionState` (act-transition tween), and `activeAct` (plain mutation / pub-sub); `useFrame` callbacks and `SceneManager` read them. Never route per-frame values through React state — `activeAct` is the one exception, since it changes only at transition boundaries, exactly like the existing `activeSection`. The 3D layer never imports gsap; ScrollManager never imports three.

## Content conventions

- Project case studies live in `src/data/projects.ts` as typed `Project` objects (`src/lib/types.ts`); sections render from data.
- Site-wide info (name, nav, socials, skills) lives in `src/data/site.ts`.

## Architecture map (who does what)

- `components/ScrollManager.tsx` — owns ALL ScrollTriggers: full-page scrub → `scrollState.progress`; per-section triggers → active section id, and (via `transitionTo()`) the act-to-act GSAP transition — tweens `transitionState.t` out/in and calls `setActiveAct()` at the swap point. Interim: the `projects` section triggers the `taxi` act 1:1 until the other four project acts exist and this section splits into per-project sub-triggers. Renders null.
- `lib/scroll.ts` — the GSAP↔R3F bridge: mutable `scrollState` + `transitionState` (per-frame, no React) + subscribable `activeSection` and `activeAct` (`useSyncExternalStore`, changes only at boundaries).
- `components/3d/Hero3D.tsx` — the only 3D component the page imports. `next/dynamic` `ssr:false`, quality gate, CSS-glow fallback, vignette overlay.
- `components/3d/quality.ts` — `useQualityTier()`: `off` (no WebGL / reduced motion → CSS glow only) · `low` (coarse pointer / ≤4 cores → 400 particles, DPR ≤1.5, no post-processing) · `high` (1200 particles, DPR 2, Effects + Environment).
- `components/3d/SceneManager.tsx` — subscribes to `activeAct`, renders exactly one act component (`HeroAct` / `AboutAct` / `AllwaytaxiAct` so far — `LumineeAct`/`LacpaAct`/`ConstructiqAct`/`AvidAct`/`ContactAct` not yet built).
- `components/3d/acts/useActTransition.ts` — returns the current act-transition scale/opacity factor (reads `transitionState.t`); each act multiplies its own scroll-driven scale by it.
- `components/3d/acts/HeroAct.tsx` — the establishing shot: ASCII-rendered (three-stdlib `AsciiEffect`) distorted icosahedron with mouse-reveal; scroll-linked color lerp (indigo→steel→violet), spin-up + mid-page scale-down.
- `components/3d/acts/AboutAct.tsx` — the transitional beat: a wireframe torus knot, open/linear silhouette against Hero's solid sphere.
- `components/3d/acts/AllwaytaxiAct.tsx` — real `.glb` pattern reference: `useGLTF("/models/car.glb")`, bbox-inspection-then-hardcode transform constants (`CAR_SCALE`/`CAR_POSITION`), emissive tint toward the same color journey rather than replacing materials.
- `components/3d/CameraRig.tsx` — keyframed camera path over `scrollState.progress` (hero → about drift-right → projects 3/4-angle pull-back for the taxi → contact push-in), smoothstep segments, exp damping, pointer parallax on top.
- `components/3d/Effects.tsx` — Bloom + Vignette composer. Not currently mounted: conflicts with `AsciiEffect`'s render-loop takeover in `HeroAct`.
- `components/ui/ScrollProgressBar.tsx` — rAF loop reading `scrollState.progress`; no scroll listeners, no React state.

## Current status (2026-09-03) & next session

All 5 build stages ✅. Hero centerpiece has since gone through two more rounds: ASCII render + mouse-reveal (still judged "boring" — a sphere with no identity beyond its render style), then a full 3D-layer restructure into cinematic scroll-triggered "acts" (`components/3d/acts/`), checkpoint 1 shipped: `HeroAct` (relocated, unchanged) → `AboutAct` (new, wireframe torus knot) → `AllwaytaxiAct` (new, real `car.glb`), with GSAP-choreographed transitions (sequential scale+fade out/in, ~0.9s) wired through `ScrollManager`/`lib/scroll.ts`.

**Known issue, not yet resolved:** `car.glb` references an external texture (`Textures/colormap.png`) that wasn't included alongside the model in `/public/models/` — the car currently renders untextured (flat color from the fallback material). Needs the companion texture file, or the model re-exported with embedded textures.

**Remaining acts (deferred, scoped in order):** `LumineeAct` (instanced node/graph cluster, generated — no model), `LacpaAct` (`documents.glb`), `ConstructiqAct` (`construction.glb`, CC-BY — needs a footer attribution credit: "Crane by J-Toastie, licensed CC-BY, via Poly Pizza"), `AvidAct` (`robot.glb`), `ContactAct` (generated, echoes Hero to bookend). Also deferred: splitting the Projects scroll section into 5 per-project sub-acts (interim 1:1 `projects → taxi` mapping today), instancing work, and the full Chrome DevTools TBT/performance audit (meaningful only once all acts are wired).

**Also pending (content/shipping):** real project copy in `src/data/projects.ts`, real GitHub/LinkedIn URLs in `src/data/site.ts`, Vercel deploy (CLI not installed yet — `npm i -g vercel`).

**Known quirks:** browser Grammarly extension causes a harmless hydration warning on `<body>`; `create-next-app` couldn't scaffold in place (capital letters in dir name) so package name is `alisleiman-3d`.
