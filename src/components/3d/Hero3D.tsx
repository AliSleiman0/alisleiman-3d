"use client";

import dynamic from "next/dynamic";
import { useQualityTier } from "./quality";

/** CSS-only stand-in: shown while detecting/loading, and permanently on "off" tier. */
function GlowFallback() {
  return (
    <div
      aria-hidden
      className="glow absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2"
    />
  );
}

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,
  loading: () => <GlowFallback />,
});

/**
 * The fixed background 3D layer. The only 3D component the rest of the app
 * imports — everything WebGL stays behind this boundary.
 */
export function Hero3D() {
  const tier = useQualityTier();

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {tier === null || tier === "off" ? (
        <GlowFallback />
      ) : (
        <HeroCanvas quality={tier} />
      )}
      {/* Vignette keeps text readable over the brightest parts of the scene. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,var(--background)_100%)]" />
    </div>
  );
}
