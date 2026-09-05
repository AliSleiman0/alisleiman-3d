"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

/**
 * Post-processing — mounted on the "high" quality tier only (Scene.tsx).
 * Tuned for the intro nebula sphere: its violet body sits under the
 * luminance threshold, the >1-multiplied limb/streak/filament pixels bloom.
 * No MSAA target (points don't benefit; bloom hides the lines' aliasing) and
 * no Vignette — Hero3D's CSS vignette div already handles that, and doubling
 * it would crush the copy contrast.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.5}
        luminanceSmoothing={0.25}
        intensity={1.15}
        mipmapBlur
        radius={0.75}
      />
    </EffectComposer>
  );
}
