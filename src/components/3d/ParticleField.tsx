"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";
import type { Points } from "three";
import { scrollState } from "@/lib/scroll";
import type { QualityTier } from "./quality";

/** Random points in a spherical shell around the hero model. */
function makePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 4 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
}

export function ParticleField({ quality }: { quality: QualityTier }) {
  const points = useRef<Points>(null);
  const count = quality === "low" ? 400 : 1200;
  const positions = useMemo(() => makePositions(count), [count]);

  useFrame((state) => {
    if (!points.current) return;
    // Base drift plus a scroll-linked sweep so the field responds to scrubbing.
    points.current.rotation.y =
      state.clock.elapsedTime * 0.015 + scrollState.progress * 0.6;
    points.current.rotation.x = scrollState.progress * 0.25;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#8b8cf5"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </points>
  );
}
