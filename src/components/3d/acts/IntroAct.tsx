"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector3,
} from "three";
import type { Group, LineSegments, Points } from "three";
import { introState } from "@/lib/scroll";
import type { QualityTier } from "../quality";
import { useActTransition } from "./useActTransition";
import {
  CLOUD_FRAGMENT,
  CLOUD_VERTEX,
  FILAMENT_FRAGMENT,
  filamentVertex,
} from "./introShaders";

/**
 * The intro beat: a nebula sphere — a dense cloud of glowing particles (indigo
 * core, violet body, magenta flow bands, cyan-lit limb, dust halo) plus a layer
 * of hot-pink line filaments traced along the same swirl field, with bloom on
 * the high tier.
 *
 * Scale, position, scroll rotation, particle density and swirl amplitude are
 * pure functions of `introState.progress` (0→1 across #intro) times the
 * act-transition factor, so scrolling back reverses the growth exactly. Time
 * (`delta`) is used only to decay user input (drag inertia, cursor tilt) and,
 * once the sphere is formed, to drift the swirl phase (`IDLE_FLOW`) so the
 * streaks keep streaming while the user sits still.
 */

/** Sphere radius — ~56% of viewport height at the rig's intro pose (z=6, fov 45). */
const RADIUS = 1.4;
/** Progress span over which each particle fades in. */
const FADE_W = 0.08;
/** Weight of seed-distance rank vs randomness in the growth order. Rank makes
 * growth spread from the seed; randomness makes it read as density filling in
 * everywhere rather than a solid cap sweeping round. */
const RANK_WEIGHT = 0.65;
/** Fraction of cloud points scattered outside the shell as dust. */
const HALO_FRAC = 0.15;
/**
 * Progress at which the sphere is fully formed and centred; from here to 1 it
 * holds (still rotating) so the handoff into Projects starts from a finished
 * shape. Set to 1.0 to remove the hold.
 */
const GROW_END = 0.88;
/** Seed scale. Sprites keep their pixel size while the group shrinks, so too
 * small a seed stacks thousands of additive sprites into a clipped white dot. */
const SEED_SCALE = 0.08;
/** Upper-right and slightly deeper than the origin, in-frame at the intro pose. */
const START = new Vector3(2.4, 1.3, -1.5);
const END = new Vector3(0, 0, 0);
/** Direction of the seed on the sphere — density spreads out from here. */
const SEED_DIR = new Vector3(0.4, 0.5, 0.77).normalize();
/** World-ish sprite size (three's Points convention: size·(h·dpr/2)/−z). */
const POINT_SIZE = 0.028;
/** View-space light direction for the rim — top-right like the reference. */
const LIGHT_DIR = new Vector3(0.6, 0.7, 0.45).normalize();

/** Palette (sRGB hex; `Color` converts to linear, the shaders convert back). */
const COLOR_CORE = "#2b1a8f";
const COLOR_BODY = "#6d2fd6";
const COLOR_FLOW = "#e64fc8";
const COLOR_RIM = "#5ad3ff";
const COLOR_HOT = "#ffe3f7";

/** Filaments: count per tier, Euler steps per streak, step length (× radius). */
const FILAMENTS = { high: 3000, low: 800 } as const;
const FIL_STEPS = 6;
const FIL_STEP_LEN = 0.07;
/** Swirl-phase drift per second once the sphere is formed. */
const IDLE_FLOW = 0.12;

/** Interaction: a full-width drag ≈ 300°; pitch clamp; inertia/tilt damping. */
const PITCH_LIMIT = 0.6;
const TILT_RAD = 0.17; // ±~10°
const INERTIA_DAMP = 3.0;
const TILT_DAMP = 4.0;

const clamp = (x: number, a: number, b: number) => Math.min(Math.max(x, a), b);
const smooth01 = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Deterministic PRNG so the geometry is identical on every mount. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Tier = "high" | "low";

interface Cloud {
  n: number;
  pos: Float32Array;
  tau: Float32Array;
  seed: Float32Array;
}

interface Filaments {
  pos: Float32Array;
  tau: Float32Array;
  seed: Float32Array;
  step: Float32Array;
}

/** CPU arrays only, cached per tier so rapid act remounts don't rebuild.
 * GPU objects are still created and disposed per mount. */
const cloudCache = new Map<Tier, Cloud>();
const filamentCache = new Map<Tier, Filaments>();

function buildCloud(n: number): Cloud {
  const rand = mulberry32(0x1a7b0);
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const angle = new Float32Array(n);
  const halo = new Uint8Array(n);
  const dir = new Vector3();

  for (let i = 0; i < n; i++) {
    // Uniform direction on the sphere.
    const z = 2 * rand() - 1;
    const phi = 2 * Math.PI * rand();
    const rxy = Math.sqrt(1 - z * z);
    dir.set(rxy * Math.cos(phi), rxy * Math.sin(phi), z);
    // Surface band / core fill (∛ → uniform volume density) / dust halo
    // (dense at the shell, thinning outward). The radial spread is what the
    // colour pass keys on.
    const u = rand();
    const kind = rand();
    let r: number;
    if (kind < HALO_FRAC) {
      r = RADIUS * (1.02 + 0.55 * u * u);
      halo[i] = 1;
    } else if (kind < HALO_FRAC + 0.27) {
      r = RADIUS * (0.35 + 0.51 * Math.cbrt(u));
    } else {
      r = RADIUS * (0.86 + 0.14 * u);
    }
    pos[i * 3] = dir.x * r;
    pos[i * 3 + 1] = dir.y * r;
    pos[i * 3 + 2] = dir.z * r;
    // Rank on the direction, not the position, so a core point appears
    // together with the shell above it.
    angle[i] = Math.acos(clamp(dir.dot(SEED_DIR), -1, 1));
    // Halo sprites are finer.
    seed[i] = halo[i] ? rand() * 0.6 : rand();
  }

  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => angle[a] - angle[b]
  );
  const rank = new Float32Array(n);
  order.forEach((idx, k) => {
    rank[idx] = k / (n - 1);
  });

  // Threshold in [-FADE_W, 1-FADE_W]: the seed-most few percent are already
  // fading in at progress 0, the last particle completes exactly at 1. Dust is
  // mostly random so it speckles in rather than sweeping round.
  const tau = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const wr = halo[i] ? 0.3 : RANK_WEIGHT;
    const mixv = wr * rank[i] + (1 - wr) * rand();
    tau[i] = clamp(mixv, 0, 1) - FADE_W;
  }

  return { n, pos, tau, seed };
}

/** Non-indexed line segments: each filament is FIL_STEPS segments (2 vertices
 * each) sharing one base point; the vertex shader walks `aStep·FIL_STEPS`
 * flow steps from it. */
function buildFilaments(count: number): Filaments {
  const rand = mulberry32(0x2c9f1);
  const verts = count * FIL_STEPS * 2;
  const pos = new Float32Array(verts * 3);
  const tau = new Float32Array(verts);
  const seed = new Float32Array(verts);
  const step = new Float32Array(verts);
  const dir = new Vector3();

  let v = 0;
  for (let i = 0; i < count; i++) {
    const z = 2 * rand() - 1;
    const phi = 2 * Math.PI * rand();
    const rxy = Math.sqrt(1 - z * z);
    dir.set(rxy * Math.cos(phi), rxy * Math.sin(phi), z);
    const r = RADIUS * (0.97 + 0.05 * rand());
    // Born late, so streaks arrive on an already dense body.
    const t = 0.45 + 0.55 * rand() - FADE_W;
    const s = rand();
    for (let k = 0; k < FIL_STEPS; k++) {
      for (let end = 0; end < 2; end++) {
        pos[v * 3] = dir.x * r;
        pos[v * 3 + 1] = dir.y * r;
        pos[v * 3 + 2] = dir.z * r;
        tau[v] = t;
        seed[v] = s;
        step[v] = (k + end) / FIL_STEPS;
        v++;
      }
    }
  }
  return { pos, tau, seed, step };
}

function getCloud(tier: Tier): Cloud {
  let c = cloudCache.get(tier);
  if (!c) {
    c = buildCloud(tier === "low" ? 10_000 : 40_000);
    cloudCache.set(tier, c);
  }
  return c;
}

function getFilaments(tier: Tier): Filaments {
  let f = filamentCache.get(tier);
  if (!f) {
    f = buildFilaments(FILAMENTS[tier]);
    filamentCache.set(tier, f);
  }
  return f;
}

/**
 * Additive soft sprites. With the material's premultipliedAlpha left false,
 * three uses SRC_ALPHA/ONE for RGB and ONE/ONE for alpha — pure additive glow
 * over the opaque #07070b canvas (alpha:false since bloom was mounted).
 */
function makeCloudMaterial(low: boolean): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uFade: { value: FADE_W },
      uSwirl: { value: 0 },
      uFlow: { value: 0 },
      uSize: { value: POINT_SIZE },
      uSizeMul: { value: 1 },
      uScale: { value: 1 },
      uRadius: { value: RADIUS },
      uLightDir: { value: LIGHT_DIR.clone() },
      uColorCore: { value: new Color(COLOR_CORE) },
      uColorBody: { value: new Color(COLOR_BODY) },
      uColorFlow: { value: new Color(COLOR_FLOW) },
      uColorRim: { value: new Color(COLOR_RIM) },
      // Fewer points on the low tier → brighter each, so total light matches.
      uOpacity: { value: low ? 0.7 : 0.45 },
      uIntensity: { value: 1 },
    },
    vertexShader: CLOUD_VERTEX,
    fragmentShader: CLOUD_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

function makeFilamentMaterial(low: boolean): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uFade: { value: FADE_W },
      uSwirl: { value: 0 },
      uFlow: { value: 0 },
      uRadius: { value: RADIUS },
      uStepLen: { value: FIL_STEP_LEN },
      uLightDir: { value: LIGHT_DIR.clone() },
      uColorFlow: { value: new Color(COLOR_FLOW) },
      uColorHot: { value: new Color(COLOR_HOT) },
      uOpacity: { value: low ? 0.9 : 0.6 },
      uIntensity: { value: 1 },
    },
    vertexShader: filamentVertex(FIL_STEPS),
    fragmentShader: FILAMENT_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

export function IntroAct({ quality }: { quality: QualityTier }) {
  const low = quality === "low";
  const tier: Tier = low ? "low" : "high";
  const cloud = useMemo(() => getCloud(tier), [tier]);
  const filaments = useMemo(() => getFilaments(tier), [tier]);

  const cloudGeometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(cloud.pos, 3));
    g.setAttribute("aTau", new BufferAttribute(cloud.tau, 1));
    g.setAttribute("aSeed", new BufferAttribute(cloud.seed, 1));
    return g;
  }, [cloud]);
  const filamentGeometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(filaments.pos, 3));
    g.setAttribute("aTau", new BufferAttribute(filaments.tau, 1));
    g.setAttribute("aSeed", new BufferAttribute(filaments.seed, 1));
    g.setAttribute("aStep", new BufferAttribute(filaments.step, 1));
    return g;
  }, [filaments]);
  const cloudMaterial = useMemo(() => makeCloudMaterial(low), [low]);
  const filamentMaterial = useMemo(() => makeFilamentMaterial(low), [low]);
  useEffect(
    () => () => {
      cloudGeometry.dispose();
      filamentGeometry.dispose();
      cloudMaterial.dispose();
      filamentMaterial.dispose();
    },
    [cloudGeometry, filamentGeometry, cloudMaterial, filamentMaterial]
  );

  const group = useRef<Group>(null);
  const points = useRef<Points>(null);
  const lines = useRef<LineSegments>(null);
  const applyTransition = useActTransition();
  // Time-integrated state: mutated only inside useFrame.
  const ui = useRef({
    dragYaw: 0,
    dragPitch: 0,
    yawVel: 0,
    tiltX: 0,
    tiltY: 0,
    flowPhase: 0,
  });

  useFrame((state, delta) => {
    const g = group.current;
    const pts = points.current;
    const lns = lines.current;
    if (!g || !pts || !lns) return;
    const dt = Math.min(delta, 0.05); // survive tab switches

    const p = introState.progress;
    const t = applyTransition();
    const pg = Math.min(p / GROW_END, 1);
    const e = easeInOutCubic(pg);
    // Interaction and idle flow only apply to the formed sphere, and fade out
    // with it on scroll-back so the scroll-driven shape stays reversible.
    const w = smooth01((pg - 0.6) / 0.3) * t;
    const s = SEED_SCALE + (1 - SEED_SCALE) * e;

    // --- user input: drag with inertia, cursor tilt ---
    const u = ui.current;
    const dx = introState.dragDX;
    const dy = introState.dragDY;
    introState.dragDX = 0;
    introState.dragDY = 0;
    const k = (2 * Math.PI) / (1.2 * state.size.width);
    if (introState.dragging) {
      u.dragYaw += dx * k;
      u.dragPitch = clamp(u.dragPitch + dy * k, -PITCH_LIMIT, PITCH_LIMIT);
      u.yawVel += ((dx * k) / dt - u.yawVel) * 0.5; // filtered release velocity
    } else {
      u.dragYaw += u.yawVel * dt;
      u.yawVel *= Math.exp(-INERTIA_DAMP * dt);
    }
    const tx = introState.hover ? -introState.pointerY * TILT_RAD : 0;
    const ty = introState.hover ? introState.pointerX * TILT_RAD : 0;
    const damp = 1 - Math.exp(-TILT_DAMP * dt);
    u.tiltX += (tx - u.tiltX) * damp;
    u.tiltY += (ty - u.tiltY) * damp;
    // Idle stream: only the swirl phase is history-dependent.
    u.flowPhase += dt * IDLE_FLOW * w;

    // --- transform (scroll terms are pure functions of p) ---
    g.scale.setScalar(s * t);
    g.position.lerpVectors(START, END, e);
    g.rotation.y = p * 0.8 * Math.PI + (u.dragYaw + u.tiltY) * w;
    g.rotation.x = -0.2 + 0.35 * p + (u.dragPitch + u.tiltX) * w;

    // --- uniforms (via the object refs, never the memoised materials) ---
    const swirl = 0.15 + 0.85 * pg;
    const flow = p * 1.5 + u.flowPhase;
    // Sprites keep pixel size while the group shrinks, so stacking per pixel
    // grows ∝ visibleFraction / s². Halve that excess in log terms so the
    // seed stays coloured rather than clipping to white; exactly 1 when formed.
    const visFrac = Math.min(pg / (1 - FADE_W), 1);
    const intensity = clamp(s / Math.sqrt(Math.max(visFrac, 0.02)), 0.1, 1);

    const uc = (pts.material as ShaderMaterial).uniforms;
    uc.uProgress.value = pg;
    uc.uSwirl.value = swirl;
    uc.uFlow.value = flow;
    uc.uSizeMul.value = 0.6 + 0.4 * e;
    uc.uIntensity.value = intensity;
    uc.uScale.value = state.size.height * state.viewport.dpr * 0.5;

    const uf = (lns.material as ShaderMaterial).uniforms;
    uf.uProgress.value = pg;
    uf.uSwirl.value = swirl;
    uf.uFlow.value = flow;
    uf.uIntensity.value = intensity;
  });

  return (
    <group ref={group} position={START.toArray()} scale={SEED_SCALE}>
      {/* Vertex displacement + a moving group would mis-cull; the act is
          only mounted on-screen anyway. */}
      <points
        ref={points}
        geometry={cloudGeometry}
        material={cloudMaterial}
        frustumCulled={false}
      />
      <lineSegments
        ref={lines}
        geometry={filamentGeometry}
        material={filamentMaterial}
        frustumCulled={false}
      />
    </group>
  );
}
