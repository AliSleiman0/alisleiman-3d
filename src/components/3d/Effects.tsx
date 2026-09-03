"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/** Post-processing stack — mounted on the "high" quality tier only. */
export function Effects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.55} intensity={0.9} mipmapBlur />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  );
}
