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

/** Which 3D "act" is currently mounted — subscribable, same shape as activeSection. */
export type ActName = "hero" | "about" | "taxi";

let activeAct: ActName = "hero";
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
