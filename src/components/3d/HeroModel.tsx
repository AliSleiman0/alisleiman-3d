"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";
import { scrollState } from "@/lib/scroll";
import type { QualityTier } from "./quality";

/**
 * When a real model exists, drop it in /public/models and swap the primitive
 * for the GLTF version below — nothing else in the scene changes.
 */
export const MODEL_PATH = "/models/hero.glb";

export function HeroModel({ quality }: { quality: QualityTier }) {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;
    const p = scrollState.progress;
    // Spin picks up mid-page; shrink slightly during the projects pull-back.
    mesh.current.rotation.y = t * 0.12 + p * 2.2;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.15 + p * 0.5;
    mesh.current.position.y = Math.sin(t * 0.5) * 0.15;
    const midPage = Math.sin(Math.min(p, 0.9) * Math.PI);
    const scale = 1 - midPage * 0.25;
    mesh.current.scale.setScalar(scale);
  });

  return (
    <Icosahedron ref={mesh} args={[1.35, quality === "low" ? 12 : 24]}>
      <MeshDistortMaterial
        color="#312e81"
        emissive="#1e1b4b"
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        distort={0.32}
        speed={1.2}
      />
    </Icosahedron>
  );
}

/*
 * GLTF swap (stage "real model"):
 *
 * import { useGLTF } from "@react-three/drei";
 *
 * export function HeroModel({ quality }: { quality: QualityTier }) {
 *   const { scene } = useGLTF(MODEL_PATH);
 *   const group = useRef<Group>(null);
 *   useFrame((state) => { ...same rotation/float on group.current... });
 *   return <primitive ref={group} object={scene} scale={1.6} />;
 * }
 *
 * useGLTF.preload(MODEL_PATH);
 *
 * HeroCanvas already wraps the scene in <Suspense>, so the async load needs
 * no further handling. drei's useGLTF caches and disposes via its loader.
 */
