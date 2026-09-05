"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { SceneManager } from "./SceneManager";
import { ParticleField } from "./ParticleField";
import { Effects } from "./Effects";
import type { QualityTier } from "./quality";

export function Scene({ quality }: { quality: QualityTier }) {
  return (
    <>
      {/* Opaque canvas (HeroCanvas alpha:false) — same colour as the page's
          --background, so bloom composites over a defined ground. */}
      <color attach="background" args={["#07070b"]} />
      <CameraRig />
      <Lights />
      <SceneManager quality={quality} />
      <ParticleField quality={quality} />
      {quality === "high" && (
        <>
          {/* Procedural env reflections — no HDR asset download. */}
          <Environment resolution={256}>
            <Lightformer
              position={[0, 4, 2]}
              scale={[8, 3, 1]}
              intensity={2}
              color="#6366f1"
            />
            <Lightformer
              position={[-4, 0, -3]}
              rotation-y={Math.PI / 2}
              scale={[6, 2, 1]}
              intensity={1.2}
              color="#38bdf8"
            />
            <Lightformer
              position={[3, -2, 1]}
              scale={[4, 1, 1]}
              intensity={0.8}
              color="#e0e7ff"
            />
          </Environment>
          <Effects />
        </>
      )}
    </>
  );
}
