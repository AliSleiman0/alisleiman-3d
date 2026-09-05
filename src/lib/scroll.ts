/**
 * Bridge between GSAP (DOM world) and R3F (canvas world).
 *
 * `scrollState.progress` is mutated directly by ScrollTrigger and read directly
 * inside useFrame callbacks — it must never flow through React state, or every
 * scroll frame would re-render the tree.
 */
export const scrollState = { progress: 0 };

/** Active section id ("hero" | "about" | ...) — subscribable for the Navbar. */
let activeSection = "hero";
const listeners = new Set<() => void>();

export function setActiveSection(id: string) {
  if (id === activeSection) return;
  activeSection = id;
  listeners.forEach((l) => l());
}

export function subscribeActiveSection(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActiveSection(): string {
  return activeSection;
}

/** Which 3D "act" is currently mounted — subscribable, same shape as activeSection.
 * "none" = canvas idle: the pinned-photo hero covers the viewport, About is
 * copy over the particle background only, and the Projects section is a 2D
 * image grid rather than a 3D beat.
 * "intro" = the standalone particle-sphere beat between About and Projects. */
export type ActName = "none" | "intro";

/**
 * Intro-act bridge. `progress` is the per-section scrub: 0→1 across
 * `#intro`'s active window (top center → bottom center — the same trigger
 * that mounts the act, so 0 ⇔ act requested and 1 ⇔ handoff into Projects),
 * written by ScrollManager. The pointer/drag fields are written by the
 * `#intro` section's own DOM handlers (the canvas sits at -z-10 behind
 * `<main>` and never receives pointer events itself): pointer is
 * viewport-normalised −1..1 (y up); `dragDX/dragDY` are css-pixel deltas the
 * section accumulates and the act reads-and-zeroes each frame. Same rules as
 * scrollState: plain mutation, never React state.
 */
export const introState = {
  progress: 0,
  hover: false,
  pointerX: 0,
  pointerY: 0,
  dragging: false,
  dragDX: 0,
  dragDY: 0,
};

let activeAct: ActName = "none";
const actListeners = new Set<() => void>();

export function setActiveAct(name: ActName) {
  if (name === activeAct) return;
  activeAct = name;
  actListeners.forEach((l) => l());
}

export function subscribeActiveAct(listener: () => void): () => void {
  actListeners.add(listener);
  return () => actListeners.delete(listener);
}

export function getActiveAct(): ActName {
  return activeAct;
}

/**
 * Act-to-act transition progress, tweened directly by GSAP (never React
 * state) and read inside the mounted act's own useFrame — same convention as
 * scrollState.progress. `t` idles at 1 (full scale/opacity).
 */
export type TransitionPhase = "idle" | "out" | "in";
export const transitionState: { phase: TransitionPhase; t: number } = {
  phase: "idle",
  t: 1,
};
