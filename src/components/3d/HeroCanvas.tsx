"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import type { QualityTier } from "./quality";

export default function HeroCanvas({ quality }: { quality: QualityTier }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, quality === "low" ? 1.5 : 2]}
      // Opaque: bloom on a premultiplied alpha:true canvas is unspecified where
      // alpha is 0. Scene.tsx paints the page's --background colour instead.
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Scene quality={quality} />
      </Suspense>
    </Canvas>
  );
}
