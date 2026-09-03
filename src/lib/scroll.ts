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
