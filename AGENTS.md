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
  components/3d/          Scene, CameraRig, Lights, HeroModel — isolated 3D components
  data/                   Structured content (projects.ts, site.ts) — never hardcode case-study content in JSX
  lib/                    types.ts, utils.ts
public/models/            Real .glb assets go here when available
```

## 3D conventions

- **Keep 3D components isolated** — Scene, CameraRig, Lights, and each model/shape are separate files under `components/3d/`. Never one giant canvas file.
- **Lazy-load the Canvas**: import the whole 3D layer with `next/dynamic` and `ssr: false` so it never blocks initial render or SEO.
- **Dispose on unmount**: geometries, materials, and textures created imperatively (`new THREE.*` or `useMemo`) must be disposed in a cleanup effect. Declarative JSX primitives are handled by R3F, but anything manually created is your responsibility.
- **Model swap path**: `<HeroModel />` currently renders a primitive shape but is structured so a `useGLTF("/models/….glb")` version drops in as a replacement without touching the rest of the scene.
- **Degrade gracefully**: provide a low-poly or 2D fallback for low-end/mobile devices (reduced DPR, fewer particles, or no canvas at all). The stage-2 static layout is the ultimate fallback.
- ScrollTrigger registration/cleanup goes through `useGSAP()`; don't hand-roll `ScrollTrigger.create` without cleanup. All triggers live in `components/ScrollManager.tsx`.
- **Scroll bridge**: GSAP and R3F meet only through `src/lib/scroll.ts`. ScrollTrigger writes `scrollState.progress` (plain mutation); `useFrame` callbacks read it. Never route per-frame scroll values through React state. The 3D layer never imports gsap; ScrollManager never imports three.

## Content conventions

- Project case studies live in `src/data/projects.ts` as typed `Project` objects (`src/lib/types.ts`); sections render from data.
- Site-wide info (name, nav, socials, skills) lives in `src/data/site.ts`.

## Architecture map (who does what)

- `components/ScrollManager.tsx` — owns ALL ScrollTriggers: full-page scrub → `scrollState.progress`; per-section triggers → active section id. Renders null.
- `lib/scroll.ts` — the GSAP↔R3F bridge: mutable `scrollState` (per-frame, no React) + subscribable active section (`useSyncExternalStore` in Navbar).
- `components/3d/Hero3D.tsx` — the only 3D component the page imports. `next/dynamic` `ssr:false`, quality gate, CSS-glow fallback, vignette overlay.
- `components/3d/quality.ts` — `useQualityTier()`: `off` (no WebGL / reduced motion → CSS glow only) · `low` (coarse pointer / ≤4 cores → 400 particles, DPR ≤1.5, no post-processing) · `high` (1200 particles, DPR 2, Effects + Environment).
- `components/3d/CameraRig.tsx` — keyframed camera path over `scrollState.progress` (hero → about drift-right → projects pull-back → contact push-in), smoothstep segments, exp damping, pointer parallax on top.
- `components/3d/HeroModel.tsx` — distorted icosahedron; scroll-linked color lerp (indigo→steel→violet), spin-up + mid-page scale-down. Contains the documented `useGLTF` swap (`MODEL_PATH = "/models/hero.glb"`).
- `components/3d/Effects.tsx` — Bloom + Vignette composer (high tier only).
- `components/ui/ScrollProgressBar.tsx` — rAF loop reading `scrollState.progress`; no scroll listeners, no React state.

## Current status (2026-09-03) & next session

All 5 build stages are ✅ and committed; tsc/lint/build clean; page fully static (SSR has no canvas). Dev-verified in Chrome at desktop + 390px.

**PO verdict: the 3D centerpiece is boring** — a well-lit distorted sphere with no identity. Agreed direction to explore next session (recommendation: options 1+3 combined, asset-free, must respect quality tiers):
1. **Custom shader core** — replace `MeshDistortMaterial` with fresnel-edged holographic/wireframe-hybrid shader material.
2. Structured particle morphs per section (sphere → network graph → dissolve → converge).
3. **Accent satellites** — small octahedra/torus knots orbiting on tilted rings, one per project accent color; Projects section aligns them.
4. Real `.glb` via the documented swap (endgame when a model exists).

**Also pending (content/shipping):** real project copy in `src/data/projects.ts`, real GitHub/LinkedIn URLs in `src/data/site.ts`, Vercel deploy (CLI not installed yet — `npm i -g vercel`).

**Known quirks:** browser Grammarly extension causes a harmless hydration warning on `<body>`; `create-next-app` couldn't scaffold in place (capital letters in dir name) so package name is `alisleiman-3d`.
