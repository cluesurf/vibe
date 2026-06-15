// WGSL for the fundamental-domain "folding" renderer of a hyperbolic Coxeter tiling.
// The whole tiling is the orbit of one chamber under the reflection group. So instead of
// enumerating cells, the fragment shader takes each pixel, maps it into the Poincare disk
// (2D) or ball (3D), lifts it to the hyperboloid (Minkowski model), and FOLDS it back into
// the single fundamental chamber by repeatedly reflecting across whichever mirror half-space
// the point violates. Then it colors by distance to the nearest mirror, so cell boundaries
// draw as lines and the interior is a clean fill. Cost is constant per pixel, no cell list.
//
// The math core matches code/render/geometry/minkowski.ts and code/substrate/coxeter/schlafli.ts:
// the mirror normals come from mirrorFrame(symbol) (reordered so the metric is diag(+..,-1),
// time last) and are uploaded as a uniform. The reflection is the Householder reflection with
// the Minkowski inner product hdot. See the technique notes in
// note/research/vibe/notes/theory-v0.8.0/notes/hyperbolic-honeycombs.

// ---------------------------------------------------------------------------------------------
// 2D renderer (rank 3, three mirrors). Flat fragment shader, no raymarch. The cheapest variant
// and the first target from the port notes. A full-screen triangle plus a per-pixel fold.
// ---------------------------------------------------------------------------------------------

export const FOLD_2D_WGSL = /* wgsl */ `
struct VertexOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VertexOut {
  // one full-screen triangle covering the viewport, uv in [0,1]
  var out: VertexOut;
  let p = vec2<f32>(f32((vi << 1u) & 2u), f32(vi & 2u));
  out.uv = p;
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}

// rank 3: three mirror normals in 3D Minkowski space, metric diag(1, 1, -1), time last.
// edgeWidth is the half-width of the drawn mirror lines in hyperboloid-distance units.
struct Params {
  n0: vec4<f32>,
  n1: vec4<f32>,
  n2: vec4<f32>,
  iterations: u32,
  edgeWidth: f32,
  pad0: f32,
  pad1: f32,
};

@group(0) @binding(0) var<uniform> P: Params;

// Minkowski inner product, signature (+, +, -)
fn hdot(a: vec3<f32>, b: vec3<f32>) -> f32 {
  return a.x * b.x + a.y * b.y - a.z * b.z;
}

// reflect p across the mirror with unit normal n only if p is on the wrong side. The chamber is
// the cone where every hdot(p, n_i) <= 0, so a point with hdot > 0 has crossed this wall and is
// reflected back. returns the correction, 0 means the point was already inside this half-space.
fn tryReflect(p: ptr<function, vec3<f32>>, n: vec3<f32>) -> f32 {
  let k = max(0.0, hdot(*p, n));
  *p = *p - 2.0 * k * n;
  return k;
}

// fold a hyperboloid point back into the fundamental chamber by repeated conditional reflection.
// returns true if it converged (a full sweep left the point untouched).
fn fold(p: ptr<function, vec3<f32>>) -> bool {
  for (var i: u32 = 0u; i < P.iterations; i = i + 1u) {
    var k = 0.0;
    k = k + tryReflect(p, P.n0.xyz);
    k = k + tryReflect(p, P.n1.xyz);
    k = k + tryReflect(p, P.n2.xyz);
    if (k == 0.0) { return true; }
  }
  return false;
}

// hyperbolic distance from a hyperboloid point q to the mirror plane with normal n.
// for a unit-spacelike normal, sinh(distance) = hdot(q, n), so distance = asinh(hdot).
fn distToMirror(q: vec3<f32>, n: vec3<f32>) -> f32 {
  return asinh(abs(hdot(q, n)));
}

@fragment
fn fs(in: VertexOut) -> @location(0) vec4<f32> {
  // map the pixel into the Poincare disk: a centered square mapped to [-1.05, 1.05]
  let d = (in.uv - vec2<f32>(0.5, 0.5)) * 2.1;
  let r2 = dot(d, d);

  // outside the unit disk is the ideal boundary and beyond, draw it dark
  if (r2 >= 1.0) {
    return vec4<f32>(0.04, 0.04, 0.05, 1.0);
  }

  // inverse stereographic lift to the hyperboloid: (2x, 2y, 1 + r^2) / (1 - r^2)
  let denom = 1.0 - r2;
  var q = vec3<f32>(2.0 * d.x / denom, 2.0 * d.y / denom, (1.0 + r2) / denom);

  let converged = fold(&q);

  // distance to the nearest of the three mirrors (the chamber walls = tiling edges)
  let e0 = distToMirror(q, P.n0.xyz);
  let e1 = distToMirror(q, P.n1.xyz);
  let e2 = distToMirror(q, P.n2.xyz);
  let edge = min(e0, min(e1, e2));

  // a clean fill, near-white, with the mirror lines drawn as a violet ink that fades over edgeWidth
  let fill = vec3<f32>(0.93, 0.93, 0.97);
  let ink = vec3<f32>(0.18, 0.12, 0.45);
  let line = 1.0 - smoothstep(P.edgeWidth, P.edgeWidth * 2.0, edge);
  var col = mix(fill, ink, line);

  // a faint radial vignette toward the ideal boundary so the disk reads as a disk
  col = col * (1.0 - 0.25 * r2 * r2);

  // if the fold never converged (rare, deep orbits), flag with a slightly different tint
  if (!converged) {
    col = mix(col, vec3<f32>(0.5, 0.5, 0.55), 0.15);
  }

  return vec4<f32>(col, 1.0);
}
`

// ---------------------------------------------------------------------------------------------
// 3D renderer (rank 4, four mirrors). Raymarch the Poincare ball, fold in 4D Minkowski space,
// render an {p,q,r} honeycomb. The DE lifts each ray sample to the hyperboloid, folds, and
// measures distance to the chamber edges (the mirror planes), converted to a conservative
// Euclidean ball step. Camera is a fixed look-at the ball center.
// ---------------------------------------------------------------------------------------------

export const FOLD_3D_WGSL = /* wgsl */ `
struct VertexOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VertexOut {
  var out: VertexOut;
  let p = vec2<f32>(f32((vi << 1u) & 2u), f32(vi & 2u));
  out.uv = p;
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}

// rank 4: four mirror normals in 4D Minkowski space, metric diag(1, 1, 1, -1), time last.
struct Params {
  n0: vec4<f32>,
  n1: vec4<f32>,
  n2: vec4<f32>,
  n3: vec4<f32>,
  eye: vec4<f32>,
  iterations: u32,
  edgeWidth: f32,
  detail: f32,
  maxSteps: f32,
};

@group(0) @binding(0) var<uniform> P: Params;

fn hdot4(a: vec4<f32>, b: vec4<f32>) -> f32 {
  return a.x * b.x + a.y * b.y + a.z * b.z - a.w * b.w;
}

// the chamber is the cone where every hdot4(p, n_i) <= 0, so reflect any wall the point crossed.
fn tryReflect4(p: ptr<function, vec4<f32>>, n: vec4<f32>) -> f32 {
  let k = max(0.0, hdot4(*p, n));
  *p = *p - 2.0 * k * n;
  return k;
}

fn fold4(p: ptr<function, vec4<f32>>) -> bool {
  for (var i: u32 = 0u; i < P.iterations; i = i + 1u) {
    var k = 0.0;
    k = k + tryReflect4(p, P.n0);
    k = k + tryReflect4(p, P.n1);
    k = k + tryReflect4(p, P.n2);
    k = k + tryReflect4(p, P.n3);
    if (k == 0.0) { return true; }
  }
  return false;
}

// distance estimate at ball point p: lift to hyperboloid, fold, measure distance to the nearest
// mirror plane (the honeycomb edges), then convert the hyperbolic distance to a conservative
// Euclidean ball step. Clipped to the unit ball boundary.
fn de(p: vec3<f32>) -> f32 {
  let r2 = dot(p, p);
  // outside the unit ball, the conservative step is the Euclidean distance to the ball surface.
  if (r2 >= 1.0) { return sqrt(r2) - 1.0 + 0.0005; }

  let denom = 1.0 - r2;
  var q = vec4<f32>(2.0 * p / denom, (1.0 + r2) / denom);
  let conv = fold4(&q);

  let e0 = asinh(abs(hdot4(q, P.n0)));
  let e1 = asinh(abs(hdot4(q, P.n1)));
  let e2 = asinh(abs(hdot4(q, P.n2)));
  let e3 = asinh(abs(hdot4(q, P.n3)));
  let edgeHyp = max(0.0, min(min(e0, e1), min(e2, e3)) - P.edgeWidth);

  // convert hyperbolic distance to a conservative Euclidean ball step (Poincare metric factor
  // is 2 / (1 - r^2), so a flat step is the hyperbolic distance times (1 - r^2) / 2). The extra
  // 0.4 fudge keeps the sphere tracer from overshooting the thin honeycomb walls.
  let euclid = edgeHyp * denom * 0.5 * 0.4;
  return max(r2 - 1.0 + 0.001, euclid);
}

@fragment
fn fs(in: VertexOut) -> @location(0) vec4<f32> {
  // a primary ray from the eye toward the ball center, with a small field of view
  let eye = P.eye.xyz;
  let forward = normalize(-eye);
  let right = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), forward));
  let up = cross(forward, right);
  let ndc = (in.uv - vec2<f32>(0.5, 0.5)) * 2.0;
  let dir = normalize(forward + 0.7 * (ndc.x * right + ndc.y * up));

  var t = 0.0;
  var hit = false;
  var pos = eye;
  let steps = u32(P.maxSteps);
  for (var i: u32 = 0u; i < steps; i = i + 1u) {
    pos = eye + dir * t;
    let dist = de(pos);
    if (dist < P.detail) { hit = true; break; }
    t = t + dist;
    if (t > 6.0) { break; }
  }

  if (!hit) {
    return vec4<f32>(0.04, 0.04, 0.05, 1.0);
  }

  // a finite-difference normal for simple Lambert shading
  let h = 0.0005;
  let nx = de(pos + vec3<f32>(h, 0.0, 0.0)) - de(pos - vec3<f32>(h, 0.0, 0.0));
  let ny = de(pos + vec3<f32>(0.0, h, 0.0)) - de(pos - vec3<f32>(0.0, h, 0.0));
  let nz = de(pos + vec3<f32>(0.0, 0.0, h)) - de(pos - vec3<f32>(0.0, 0.0, h));
  let normal = normalize(vec3<f32>(nx, ny, nz));

  let lightDir = normalize(vec3<f32>(0.6, 0.8, 0.4));
  let lambert = max(0.12, dot(normal, lightDir));
  let depth = 1.0 - 0.12 * t;
  let base = vec3<f32>(0.62, 0.55, 0.95);
  let col = base * lambert * depth;

  return vec4<f32>(col, 1.0);
}
`
