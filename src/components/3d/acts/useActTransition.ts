import { transitionState } from "@/lib/scroll";

const EPSILON = 0.001;

/**
 * Returns a getter for the current act-transition scale/opacity factor
 * (0-1, tweened by GSAP in ScrollManager). Acts multiply their own
 * scroll-driven scale by this — the helper never owns `object.scale`
 * outright, since it must compose with each act's own animation, not
 * clobber it.
 */
export function useActTransition() {
  return () => Math.max(transitionState.t, EPSILON);
}
