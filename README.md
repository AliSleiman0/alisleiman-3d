# alisleiman-3d — Scroll-Based 3D Portfolio

Personal portfolio for Ali Sleiman (software engineer). The page opens on a pinned-photo hero — a sticky full-bleed photo with a depth-occluded headline (a foreground cutout of the subject genuinely hides the text behind him) and scroll-scrubbed beats that assemble word by word. Behind the sections below sits a fixed React Three Fiber canvas: GSAP ScrollTrigger drives the camera along a keyframed path and swaps between cinematic 3D "acts" (wireframe about beat → real `.glb` project models). Fully static Next.js output — the 3D layer is lazy-loaded client-side and never touches SSR/SEO.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **React Three Fiber** + drei (3D), **@react-three/postprocessing** (bloom/vignette, high tier only)
- **GSAP + ScrollTrigger** (scroll-driven camera), **Framer Motion** (2D transitions)
- Target: Vercel

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build (fully static)
npm run lint     # eslint
npx tsc --noEmit # type check
```

## How it's wired

- `src/components/sections/HeroPinned.tsx` — the pinned-photo hero: 700svh scroll runway, sticky stage, photo/occluded-line/cutout/front-UI layer sandwich, one scrubbed GSAP timeline for the beats; assets in `public/hero/` (photo + rembg cutout), copy in `site.hero`
- `src/components/3d/Hero3D.tsx` — the single entry to the 3D layer (`next/dynamic`, `ssr: false`, quality-gated with a CSS-glow fallback); covered by the photo during the hero pin
- `src/components/ScrollManager.tsx` + `src/lib/scroll.ts` — GSAP writes scroll progress into a plain mutable object; R3F `useFrame` reads it. No React state in the frame loop, with one exception: `activeAct` (which act is mounted) changes only at transition boundaries, same as the existing `activeSection`.
- `src/components/3d/SceneManager.tsx` + `src/components/3d/acts/` — the 3D layer is a sequence of scroll-triggered "acts" (cinematic scenes), not one persistent object. Exactly one act is mounted at a time; `ScrollManager` drives GSAP scale+fade transitions between them.
- `src/components/3d/CameraRig.tsx` — keyframed camera path (parked while the hero covers the canvas → about → projects → contact), `at` values hand-tuned to measured section offsets
- `src/data/` — all content (projects, site info) as typed data; nothing hardcoded in JSX
- Quality tiers (`src/components/3d/quality.ts`): no-WebGL/reduced-motion → static CSS glow · mobile/low-end → fewer particles, no post-processing, acts swap instantly with no transition tween · desktop → full effects

Full conventions, architecture map, and current status: see **AGENTS.md** (CLAUDE.md points there).

## Adding a new act with a real model

`src/components/3d/acts/AllwaytaxiAct.tsx` is the reference pattern: `useGLTF("/models/….glb")`, inspect the actual bounding box (logged on mount, dev-only) before hardcoding scale/position constants — never guess a community-uploaded model's transform — and tint via emissive/color lerp toward the existing scroll color journey rather than replacing materials wholesale. Register the new act in `SceneManager.tsx` and map a scroll section to it in `ScrollManager.tsx`'s `SECTION_TO_ACT`.

## Status

All 5 planned build stages complete, plus checkpoint 1 of the cinematic-acts restructure (About → AllwaytaxiAct, real `car.glb`) and the pinned-photo hero (stage 7, replacing the 3D hero act). Hero photo + copy are placeholders; remaining acts (Luminee, Lacpa, ConstructIQ, Avid, Contact), real project copy, and Vercel deploy are next. Details in AGENTS.md → "Current status".
