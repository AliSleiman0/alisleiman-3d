"use client";

import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { HeroModel } from "./HeroModel";
import { ParticleField } from "./ParticleField";
import type { QualityTier } from "./quality";

export function Scene({ quality }: { quality: QualityTier }) {
  return (
    <>
      <CameraRig />
      <Lights />
      <HeroModel quality={quality} />
      <ParticleField quality={quality} />
    </>
  );
}
