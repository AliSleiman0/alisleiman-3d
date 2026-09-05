"use client";

import { useSyncExternalStore } from "react";
import { getActiveAct, subscribeActiveAct } from "@/lib/scroll";
import type { QualityTier } from "./quality";
import { IntroAct } from "./acts/IntroAct";

/** Mounts exactly one act at a time, keyed to the active scroll section.
 * "none" over the pinned-photo hero, About (copy over the particle
 * background) and the 2D Projects grid. "intro" is the scroll-scrubbed
 * particle sphere between About and Projects — the only 3D beat. */
export function SceneManager({ quality }: { quality: QualityTier }) {
  const act = useSyncExternalStore(subscribeActiveAct, getActiveAct, getActiveAct);

  if (act === "intro") return <IntroAct quality={quality} />;
  return null;
}
