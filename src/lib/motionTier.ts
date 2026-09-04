/**
 * Shared "should we skip transform-heavy motion?" heuristic for the 2D layer.
 *
 * This deliberately mirrors `components/3d/quality.ts`'s `detectTier()` rather
 * than importing it: quality.ts is documented 3D-layer-only, and ScrollManager /
 * ProjectsGrid must not reach across that boundary. Keeping one copy here stops
 * a third from appearing — quality.ts stays untouched and 3D-only.
 *
 * Client-only: call it from inside an effect / useGSAP callback, never during
 * render, or SSR and the first client render will disagree.
 */
export function detectLowMotion(): boolean {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  return reduceMotion || coarsePointer || fewCores;
}
