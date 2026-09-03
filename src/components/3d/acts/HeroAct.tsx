"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { AsciiEffect } from "three-stdlib";
import { Color, type Mesh, type MeshStandardMaterial } from "three";
import { scrollState } from "@/lib/scroll";
import type { QualityTier } from "../quality";
import { useActTransition } from "./useActTransition";

/** Body color drifts through the scroll journey: indigo → steel blue → violet. */
const COLOR_STOPS = [
  new Color("#312e81"),
  new Color("#1e40af"),
  new Color("#4c1d95"),
];
const scratchColor = new Color();

const ASCII_CHARS = " .:-+*=%@#";
const ASCII_RESOLUTION = 0.15;

/**
 * Thin local take on drei's <AsciiRenderer>. Two differences, both required:
 * sizing happens in useLayoutEffect (drei sizes in a passive effect, so the
 * first frame can render with undefined dimensions — getImageData throws and
 * kills the R3F loop), and the effect's DOM element is exposed via ref so the
 * scroll color journey (and the mouse-reveal) can drive it directly.
 */
function AsciiLayer({ elRef }: { elRef: RefObject<HTMLElement | null> }) {
  const { size, gl, scene, camera } = useThree();

  const effect = useMemo(() => {
    // invert:true → brightness maps to character density. AsciiEffect treats
    // fully transparent pixels as brightness 1, so the canvas must clear to
    // opaque black (see the mount effect) or the background fills with '#'.
    const e = new AsciiEffect(gl, ASCII_CHARS, {
      invert: true,
      resolution: ASCII_RESOLUTION,
    });
    e.domElement.className = "ascii-hero";
    e.domElement.style.position = "absolute";
    e.domElement.style.top = "0px";
    e.domElement.style.left = "0px";
    e.domElement.style.pointerEvents = "none";
    e.domElement.style.backgroundColor = "transparent";
    e.domElement.style.color = "#a5b4fc";
    return e;
  }, [gl]);

  useLayoutEffect(() => {
    effect.setSize(size.width, size.height);
  }, [effect, size]);

  /* eslint-disable react-hooks/immutability --
     Intentional imperative takeover of the renderer's canvas and clear color
     (same mutations drei's <AsciiRenderer> performs); fully restored in the
     cleanup below. */
  useLayoutEffect(() => {
    const parent = gl.domElement.parentNode;
    gl.domElement.style.opacity = "0";
    parent?.appendChild(effect.domElement);
    elRef.current = effect.domElement;
    // Opaque black clear: the WebGL canvas is hidden, and transparent pixels
    // would otherwise read as full brightness in the ASCII mapping.
    const prevClear = new Color();
    gl.getClearColor(prevClear);
    const prevAlpha = gl.getClearAlpha();
    gl.setClearColor(0x000000, 1);
    return () => {
      gl.setClearColor(prevClear, prevAlpha);
      elRef.current = null;
      gl.domElement.style.opacity = "1";
      parent?.removeChild(effect.domElement);
    };
  }, [effect, gl, elRef]);
  /* eslint-enable react-hooks/immutability */

  // Take over the render loop (renderIndex 1 outranks R3F's default render).
  useFrame(() => {
    effect.render(scene, camera);
  }, 1);

  return null;
}

/** The establishing shot — unchanged from the standalone HeroModel, now
 * transition-aware via useActTransition(). */
export function HeroAct({ quality }: { quality: QualityTier }) {
  const mesh = useRef<Mesh>(null);
  const asciiEl = useRef<HTMLElement | null>(null);
  const ascii = quality === "high";
  const applyTransition = useActTransition();

  // Mouse-reveal: detail sharpens near the cursor, stays dim/sparse away from
  // it. Direct style writes (no React state) — same spirit as the scroll
  // bridge. R3F's state.pointer only updates from canvas events and the
  // canvas sits under scrolling content, so this reads window pointer
  // position directly instead.
  useEffect(() => {
    if (!ascii) return;
    const handleMove = (e: PointerEvent) => {
      const el = asciiEl.current;
      if (!el) return;
      el.style.setProperty("--reveal-x", `${e.clientX}px`);
      el.style.setProperty("--reveal-y", `${e.clientY}px`);
    };
    const handleLeave = () => {
      const el = asciiEl.current;
      if (!el) return;
      el.style.removeProperty("--reveal-x");
      el.style.removeProperty("--reveal-y");
    };
    window.addEventListener("pointermove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [ascii]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;
    const p = scrollState.progress;
    const transition = applyTransition();
    // Spin picks up mid-page; shrink slightly during the projects pull-back.
    mesh.current.rotation.y = t * 0.12 + p * 2.2;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.15 + p * 0.5;
    mesh.current.position.y = Math.sin(t * 0.5) * 0.15;
    const midPage = Math.sin(Math.min(p, 0.9) * Math.PI);
    const scale = 1 - midPage * 0.25;
    mesh.current.scale.setScalar(scale * transition);

    const seg = p < 0.5 ? 0 : 1;
    const k = (p - seg * 0.5) / 0.5;
    scratchColor.lerpColors(COLOR_STOPS[seg], COLOR_STOPS[seg + 1], k);

    if (ascii) {
      // The mesh stays bright for luminance range; the scroll color journey
      // lives on the ASCII text itself.
      if (asciiEl.current) {
        asciiEl.current.style.color = `#${scratchColor.getHexString()}`;
        asciiEl.current.style.opacity = String(transition);
      }
    } else {
      const material = mesh.current.material as MeshStandardMaterial;
      if (material?.color) material.color.copy(scratchColor);
      if (material) {
        material.transparent = true;
        material.opacity = transition;
      }
    }
  });

  return (
    <>
      <Icosahedron ref={mesh} args={[1.35, quality === "low" ? 12 : 24]}>
        {ascii ? (
          // Near-white, high-contrast surface: under the ASCII effect the
          // material only shapes luminance — hue comes from the text color.
          <MeshDistortMaterial
            color="#94a3b8"
            emissive="#334155"
            emissiveIntensity={0.3}
            roughness={0.35}
            metalness={0.6}
            distort={0.32}
            speed={1.2}
          />
        ) : (
          <MeshDistortMaterial
            color="#312e81"
            emissive="#1e1b4b"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
            distort={0.32}
            speed={1.2}
          />
        )}
      </Icosahedron>
      {ascii && <AsciiLayer elRef={asciiEl} />}
    </>
  );
}
