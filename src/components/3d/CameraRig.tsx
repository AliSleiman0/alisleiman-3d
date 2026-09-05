"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { scrollState } from "@/lib/scroll";

interface Keyframe {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
}

/** Camera path through the page. `at` = full-page scroll progress.
 *
 * Estimated at 1178×1110 with all THREE runways in place (hero 700svh, intro
 * 300svh, Projects 175svh): hero 0→0.54, about 0.54→0.62, intro 0.62→0.85,
 * projects 0.85→1.0, contact past the end. The hero's photo covers the canvas
 * for its whole runway, so the camera parks on the About pose until the canvas
 * is actually visible. The pan to the intro pose completes over About's tail,
 * BEFORE the intro starts: in the About pose (looking at x=-2) the sphere's
 * seed start position is off-screen, and the camera must hold still during the
 * sphere so its "move to centre" reads as the sphere moving, not the rig.
 * Re-measure whenever any runway length changes.
 *
 * CAVEAT: these fractions move with viewport HEIGHT, not just section heights.
 * The hero and intro runways are viewport-proportional while every other
 * section is content-height, so a shorter window shifts every fraction. The
 * values below suit a typical desktop window; treat them as approximate.
 * Making this viewport-independent means driving the rig from per-section
 * progress rather than document-normalised progress — see AGENTS.md.
 * Re-measure with section offsetTop ÷ (scrollHeight − innerHeight). */
const KEYFRAMES: Keyframe[] = [
  { at: 0.0, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // parked (hero covers canvas)
  { at: 0.54, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // about — canvas revealed
  { at: 0.58, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // hold through most of About
  { at: 0.62, position: [0, 0, 6], target: [0, 0, 0] }, // intro pose reached as the intro starts
  { at: 0.85, position: [0, 0, 6], target: [0, 0, 0] }, // held for the whole sphere
  // Projects is a 2D image grid with no act behind it (SceneManager renders
  // null there), so this keyframe only steers the particle background.
  { at: 0.90, position: [2.4, 1.1, 7], target: [0, 0.2, 0] }, // projects
  { at: 1.0, position: [0, -0.6, 4.2], target: [0, 0.4, 0] }, // contact
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const scratch = new Vector3();

function samplePath(progress: number, outPos: Vector3, outTarget: Vector3) {
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (progress >= KEYFRAMES[i].at && progress <= KEYFRAMES[i + 1].at) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = b.at - a.at || 1;
  const t = smoothstep(Math.min(Math.max((progress - a.at) / span, 0), 1));
  outPos.fromArray(a.position).lerp(scratch.fromArray(b.position), t);
  outTarget.fromArray(a.target).lerp(scratch.fromArray(b.target), t);
}

/**
 * Drives the camera from scroll progress (written by ScrollManager) along the
 * keyframe path, with pointer parallax layered on top. All motion is damped so
 * scrubbing feels weighted rather than 1:1.
 */
export function CameraRig() {
  const desiredPos = useRef(new Vector3(1.2, 0.6, 5));
  const desiredTarget = useRef(new Vector3(-2.0, 0.2, 0));
  const currentTarget = useRef(new Vector3(-2.0, 0.2, 0));

  useFrame((state, delta) => {
    const { camera, pointer } = state;

    samplePath(scrollState.progress, desiredPos.current, desiredTarget.current);

    desiredPos.current.x += pointer.x * 0.4;
    desiredPos.current.y += pointer.y * 0.25;

    const damp = 1 - Math.exp(-3 * delta);
    camera.position.lerp(desiredPos.current, damp);
    currentTarget.current.lerp(desiredTarget.current, damp);
    camera.lookAt(currentTarget.current);
  });

  return null;
}
