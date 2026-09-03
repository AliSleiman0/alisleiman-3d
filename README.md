# alisleiman-3d — Scroll-Based 3D Portfolio

Personal portfolio for Ali Sleiman (software engineer). A fixed React Three Fiber canvas sits behind the page; content sections scroll over it while GSAP ScrollTrigger drives the camera along a keyframed path. Fully static Next.js output — the 3D layer is lazy-loaded client-side and never touches SSR/SEO.

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

- `src/components/3d/Hero3D.tsx` — the single entry to the 3D layer (`next/dynamic`, `ssr: false`, quality-gated with a CSS-glow fallback)
- `src/components/ScrollManager.tsx` + `src/lib/scroll.ts` — GSAP writes scroll progress into a plain mutable object; R3F `useFrame` reads it. No React state in the frame loop.
- `src/components/3d/CameraRig.tsx` — keyframed camera path (hero → about → projects → contact)
- `src/data/` — all content (projects, site info) as typed data; nothing hardcoded in JSX
- Quality tiers (`src/components/3d/quality.ts`): no-WebGL/reduced-motion → static CSS glow · mobile/low-end → fewer particles, no post-processing · desktop → full effects

Full conventions, architecture map, and current status: see **AGENTS.md** (CLAUDE.md points there).

## Swapping in a real model

Drop a `.glb` at `public/models/hero.glb` and follow the commented `useGLTF` swap inside `src/components/3d/HeroModel.tsx` — one component body changes, nothing else.

## Status

All 5 planned build stages complete (scaffold → static 2D fallback → lazy 3D canvas → scroll-driven camera → post-processing polish). Next up: redesigning the hero centerpiece (current distorted-sphere placeholder lacks identity), real project copy, and Vercel deploy. Details in AGENTS.md → "Current status".
