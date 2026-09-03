"use client";

import { useSyncExternalStore } from "react";

export type QualityTier = "high" | "low" | "off";

function detectTier(): QualityTier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "off";
  }

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "off";
  } catch {
    return "off";
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  if (coarsePointer || fewCores) return "low";

  return "high";
}

let cachedTier: QualityTier | null = null;

function getSnapshot(): QualityTier {
  cachedTier ??= detectTier();
  return cachedTier;
}

const subscribe = () => () => {};

/**
 * Device capability tier for the 3D layer. Detected once per page load on the
 * client; the server snapshot is null so SSR/hydration renders the fallback.
 */
export function useQualityTier(): QualityTier | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
