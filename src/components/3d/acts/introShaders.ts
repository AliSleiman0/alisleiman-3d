/**
 * GLSL for the intro act: the particle cloud and the filament streak layer.
 * Both layers sample the SAME flow field (`flowVec` / `noiseRadial`, driven by
 * `uFlow` + `uSwirl`) so the streaks lie along the swirl that displaces the
 * dots. Every program ends with `colorspace_fragment` (a ShaderMaterial gets
 * none by default and `Color` stores linear); tonemapping is deliberately
 * omitted so ACES doesn't compress the glow.
 */

/** 3D simplex noise — Ian McEwan / Ashima Arts (MIT). */
export const SNOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/**
 * Shared flow field. `noiseRadial` bumps the surface along the normal;
 * `flowVec` is the tangential swirl (xyz, unnormalised) plus its first noise
 * term in w, which the cloud uses as the streak-colour mask. Requires
 * `uFlow` in scope (declared by each program).
 */
export const FLOW_GLSL = /* glsl */ `
float noiseRadial(vec3 n) {
  return snoise(n * 2.2 + vec3(uFlow, 0.0, -0.7 * uFlow));
}
vec4 flowVec(vec3 n) {
  float d2 = snoise(n * 3.7 + vec3(-0.5 * uFlow, uFlow, 3.1));
  float d3 = snoise(n * 2.9 + vec3(7.0 + uFlow));
  vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-4, 0.0, 0.0));
  vec3 b = cross(n, t);
  return vec4(t * d2 + b * d3, d2);
}
`;

/** Uniforms + varyings both vertex programs share for the view-dependent rim. */
const RIM_GLSL = /* glsl */ `
uniform vec3 uLightDir;
varying float vRim;
varying float vLight;
void writeRim(vec3 n) {
  vec3 nv = normalize(normalMatrix * n);
  vRim = pow(1.0 - abs(nv.z), 2.5);
  vLight = max(dot(nv, uLightDir), 0.0);
}
`;

export const CLOUD_VERTEX = /* glsl */ `
attribute float aTau;
attribute float aSeed;
uniform float uProgress;
uniform float uFade;
uniform float uSwirl;
uniform float uFlow;
uniform float uSize;
uniform float uSizeMul;
uniform float uScale;
uniform float uRadius;
varying float vAlpha;
varying float vRadial;
varying float vFlowN;
${SNOISE}
${FLOW_GLSL}
${RIM_GLSL}
void main() {
  float vis = smoothstep(aTau, aTau + uFade, uProgress);
  if (vis <= 0.0) {
    // Not born yet: push outside clip space so no fragment work happens.
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 1.0;
    vAlpha = 0.0; vRadial = 0.0; vFlowN = 0.0; vRim = 0.0; vLight = 0.0;
    return;
  }
  vec3 n = normalize(position);
  float r = length(position);
  vRadial = r / uRadius;
  // Noise on the unit direction so core, shell and halo displace coherently.
  float d1 = noiseRadial(n);
  vec4 fv = flowVec(n);
  vec3 p = position
    + n * d1 * (0.10 * uRadius) * uSwirl
    + fv.xyz * (0.18 * r) * uSwirl;
  vFlowN = fv.w;
  writeRim(n);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = uSize * uSizeMul * mix(0.6, 1.4, aSeed) * mix(0.35, 1.0, vis);
  gl_PointSize = max(sz * uScale / -mv.z, 1.0);
  vAlpha = vis;
}
`;

export const CLOUD_FRAGMENT = /* glsl */ `
uniform vec3 uColorCore;
uniform vec3 uColorBody;
uniform vec3 uColorFlow;
uniform vec3 uColorRim;
uniform float uOpacity;
uniform float uIntensity;
varying float vAlpha;
varying float vRadial;
varying float vFlowN;
varying float vRim;
varying float vLight;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  if (d2 > 0.25) discard;
  float soft = smoothstep(0.25, 0.0, d2);
  // Indigo core → violet body by radius; magenta bands along the flow;
  // cyan on the lit limb; dust outside the shell fades.
  vec3 col = mix(uColorCore, uColorBody, smoothstep(0.5, 0.95, vRadial));
  float streak = smoothstep(0.25, 0.75, abs(vFlowN));
  col = mix(col, uColorFlow, streak * 0.85);
  float rim = vRim * (0.35 + 0.65 * vLight);
  col = mix(col, uColorRim, rim);
  float halo = smoothstep(1.0, 1.2, vRadial);
  float a = soft * soft * vAlpha * uOpacity * uIntensity
    * (1.0 + 1.6 * rim + 0.6 * streak) * mix(1.0, 0.22, halo);
  // >1 multipliers push the limb and streaks over the bloom threshold while
  // the body stays below it.
  gl_FragColor = vec4(col * (1.0 + 0.8 * rim + 0.4 * streak), a);
  #include <colorspace_fragment>
}
`;

/** Line filaments traced along the flow field with `STEPS` Euler steps.
 * Adjacent segments recompute the same walk, so shared endpoints match exactly. */
export function filamentVertex(steps: number): string {
  return /* glsl */ `
#define STEPS ${steps}
attribute float aTau;
attribute float aSeed;
attribute float aStep;
uniform float uProgress;
uniform float uFade;
uniform float uSwirl;
uniform float uFlow;
uniform float uRadius;
uniform float uStepLen;
varying float vAlpha;
varying float vT;
${SNOISE}
${FLOW_GLSL}
${RIM_GLSL}
void main() {
  float vis = smoothstep(aTau, aTau + uFade, uProgress);
  if (vis <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vAlpha = 0.0; vT = 0.0; vRim = 0.0; vLight = 0.0;
    return;
  }
  float r = length(position);
  vec3 q = position;
  float h = uStepLen * uRadius * uSwirl * mix(0.7, 1.3, aSeed);
  float count = aStep * float(STEPS);
  for (int k = 0; k < STEPS; k++) {
    if (float(k) >= count - 0.5) break;
    vec3 n = normalize(q);
    vec3 f = normalize(flowVec(n).xyz + vec3(1e-4, 0.0, 0.0));
    q = normalize(q + f * h) * r;
  }
  vec3 n = normalize(q);
  // Same radial bump as the cloud so the streaks hug the displaced surface.
  vec3 p = q + n * noiseRadial(n) * (0.10 * uRadius) * uSwirl;
  writeRim(n);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  vAlpha = vis;
  vT = aStep;
}
`;
}

export const FILAMENT_FRAGMENT = /* glsl */ `
uniform vec3 uColorFlow;
uniform vec3 uColorHot;
uniform float uOpacity;
uniform float uIntensity;
varying float vAlpha;
varying float vT;
varying float vRim;
varying float vLight;
void main() {
  float rim = vRim * (0.35 + 0.65 * vLight);
  float tail = 1.0 - vT;
  vec3 col = mix(uColorFlow, uColorHot, clamp(tail * 0.7 + 0.5 * vRim, 0.0, 1.0));
  float a = vAlpha * uOpacity * tail * tail * uIntensity * (1.0 + 1.2 * rim);
  gl_FragColor = vec4(col * 1.6, a);
  #include <colorspace_fragment>
}
`;
