"use client";

import { useFrame } from "@react-three/fiber";

/**
 * Camera control point. Stage 4 attaches GSAP ScrollTrigger here to move the
 * camera through the sections; for now it adds a subtle pointer parallax.
 */
export function CameraRig() {
  useFrame((state, delta) => {
    const { camera, pointer } = state;
    const damp = 1 - Math.exp(-2.5 * delta);
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * damp;
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * damp;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
