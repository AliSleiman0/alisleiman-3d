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
 * Measured offsets (1440×900, hero pin = 700svh): hero spans 0→0.74 and the
 * photo covers the canvas until ~0.63, so the camera parks on the About pose
 * through the covered range and only travels once the canvas is visible.
 * Re-measure (scratch measure script / section offsetTop ÷ scrollable height)
 * if section heights change. */
const KEYFRAMES: Keyframe[] = [
  { at: 0.0, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // parked (hero covers canvas)
  { at: 0.63, position: [1.2, 0.6, 5], target: [-2.0, 0.2, 0] }, // about — canvas revealed
  { at: 0.8, position: [2.4, 1.1, 7], target: [0, 0.2, 0] }, // projects (taxi)
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
