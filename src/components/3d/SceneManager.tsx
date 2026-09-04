"use client";

import { useSyncExternalStore } from "react";
import { getActiveAct, subscribeActiveAct } from "@/lib/scroll";
import type { QualityTier } from "./quality";
import { AboutAct } from "./acts/AboutAct";

/** Mounts exactly one act at a time, keyed to the active scroll section.
 * "none" while the pinned-photo hero covers the viewport, and again over the
 * Projects section — that section is a 2D image grid, not a 3D beat. */
export function SceneManager({ quality }: { quality: QualityTier }) {
  const act = useSyncExternalStore(subscribeActiveAct, getActiveAct, getActiveAct);

  if (act === "about") return <AboutAct quality={quality} />;
  return null;
}
