"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TorusKnot } from "@react-three/drei";
import type { Mesh } from "three";
import type { QualityTier } from "../quality";
import { useActTransition } from "./useActTransition";

/** The transitional beat between Hero and the project acts — a wireframe
 * torus knot: an open, linear silhouette against Hero's solid ASCII sphere,
 * cheap, no model. Mid-journey steel blue continues the same color story
 * HeroAct uses rather than introducing a new palette. */
export function AboutAct({ quality }: { quality: QualityTier }) {
  const mesh = useRef<Mesh>(null);
  const applyTransition = useActTransition();
  const low = quality === "low";

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * (low ? 0.06 : 0.15);
    mesh.current.rotation.x = t * 0.05;
    mesh.current.scale.setScalar(applyTransition());
  });

  return (
    <TorusKnot ref={mesh} args={[1.1, 0.32, low ? 32 : 96, 12]}>
      <meshStandardMaterial
        color="#1e40af"
        emissive="#1e3a8a"
        emissiveIntensity={0.4}
        wireframe
      />
    </TorusKnot>
  );
}
