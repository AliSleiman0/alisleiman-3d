"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Color,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { scrollState } from "@/lib/scroll";
import type { QualityTier } from "../quality";
import { useActTransition } from "./useActTransition";

const MODEL_PATH = "/models/car.glb";
// Module-scope preload: with only 3 acts sharing one bundle (no per-act
// next/dynamic split yet), "preload shortly before trigger" has no real
// bundle-splitting benefit to capture — revisit once acts are code-split.
useGLTF.preload(MODEL_PATH);

// The site's indigo→steel→violet color journey — duplicated (not shared)
// since there are only two call sites so far.
const COLOR_STOPS = [
  new Color("#312e81"),
  new Color("#1e40af"),
  new Color("#4c1d95"),
];
const scratchColor = new Color();

// From the logged bbox: size [1.5, 1.5, 2.75], min.y ≈ 0 — the model already
// sits on its own ground plane at the origin, no vertical offset needed.
// Length (2.75) is close to the torus knot's footprint, so scale 1 keeps
// consistent visual weight across acts; nudged down slightly since the car
// reads bulkier at the same footprint.
const CAR_SCALE = 0.85;
const CAR_POSITION: [number, number, number] = [0, 0, 0];
const CAR_ROTATION: [number, number, number] = [0, 0, 0];

export function AllwaytaxiAct({ quality }: { quality: QualityTier }) {
  const { scene } = useGLTF(MODEL_PATH);
  const group = useRef<Group>(null);
  const applyTransition = useActTransition();
  const logged = useRef(false);
  const low = quality === "low";

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[AllwaytaxiAct] car.glb bbox size: [${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)}] center: [${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)}] min: [${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)}]`
      );
    }
  }, [scene]);

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as MeshStandardMaterial;
      if (mat && "transparent" in mat) mat.transparent = true;
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    const transition = applyTransition();
    const p = scrollState.progress;
    const seg = p < 0.5 ? 0 : 1;
    const k = (p - seg * 0.5) / 0.5;
    scratchColor.lerpColors(COLOR_STOPS[seg], COLOR_STOPS[seg + 1], k);

    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as MeshStandardMaterial;
      if (!mat) return;
      if (mat.emissive) {
        mat.emissive.copy(scratchColor);
        mat.emissiveIntensity = 0.15;
      } else if (mat.color) {
        mat.color.lerp(scratchColor, 0.05);
      }
      if ("transparent" in mat) mat.opacity = transition;
    });

    group.current.rotation.y =
      CAR_ROTATION[1] + state.clock.elapsedTime * (low ? 0.05 : 0.12);
    group.current.scale.setScalar(CAR_SCALE * transition);
  });

  return (
    <group ref={group} position={CAR_POSITION} rotation={CAR_ROTATION}>
      <primitive object={scene} />
    </group>
  );
}
