"use client";

import { useSyncExternalStore } from "react";
import { getActiveAct, subscribeActiveAct } from "@/lib/scroll";
import type { QualityTier } from "./quality";
import { HeroAct } from "./acts/HeroAct";
import { AboutAct } from "./acts/AboutAct";
import { AllwaytaxiAct } from "./acts/AllwaytaxiAct";

/** Mounts exactly one act at a time, keyed to the active scroll section.
 * Luminee/Lacpa/ConstructIQ/Avid/Contact acts aren't built yet. */
export function SceneManager({ quality }: { quality: QualityTier }) {
  const act = useSyncExternalStore(subscribeActiveAct, getActiveAct, getActiveAct);

  if (act === "hero") return <HeroAct quality={quality} />;
  if (act === "about") return <AboutAct quality={quality} />;
  return <AllwaytaxiAct quality={quality} />;
}
