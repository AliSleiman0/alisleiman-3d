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
 * Measured live at 1178×1110 (hero runway = 700svh): hero 0→0.834,
 * about 0.834→0.936, projects 0.936→1.038, contact past the end. The hero's
 * photo covers the canvas for its whole runway, so the camera parks on the
 * About pose until ~0.83 and only travels once the canvas is actually visible.
 *
 * CAVEAT: these fractions move with viewport HEIGHT, not just section heights.
 * The hero runway is viewport-proportional (700svh) while every other section
 * is content-height, so a shorter window gives the hero a smaller share of
 * total progress. The values below suit a typical desktop window; treat them
 * as approximate. Making this viewport-independent means driving the rig from
 * per-section progress rather than document-normalised progress — see AGENTS.md.
 * Re-measure with section offsetTop ÷ (scrollHeight − innerHeight). */
const KEYFRAMES: Keyframe[] = [
  { at: 0.0, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // parked (hero covers canvas)
  { at: 0.83, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // about — canvas revealed
  // Projects is a 2D image grid with no act behind it (SceneManager renders
  // null there), so this keyframe only steers the particle background.
  { at: 0.94, position: [2.4, 1.1, 7], target: [0, 0.2, 0] }, // projects
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
