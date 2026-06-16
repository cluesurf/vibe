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
  cam: vec4<f32>, // xy = Mobius pan (the disk point under the screen center), z = zoom, w = view rotation (rad)
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

// Mobius (gyrovector) addition in the Poincare disk, the isometry that PANS the view
fn mobiusAdd2(a: vec2<f32>, x: vec2<f32>) -> vec2<f32> {
  let ax = dot(a, x);
  let aa = dot(a, a);
  let xx = dot(x, x);
  let d = 1.0 + 2.0 * ax + aa * xx;
  return ((1.0 + 2.0 * ax + xx) * a + (1.0 - aa) * x) / max(d, 1e-6);
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
  // map the pixel into the Poincare disk (centered square), scaled by zoom and panned by a Mobius shift
  let zoom = max(0.05, P.cam.z);
  var d0 = (in.uv - vec2<f32>(0.5, 0.5)) * 2.1 / zoom;

  // view rotation (cam.w, radians), so the walker can turn and the heading stays up. Rotating the sample
  // direction before the Mobius pan turns the whole disk about the camera point.
  let ca = cos(P.cam.w);
  let sa = sin(P.cam.w);
  d0 = vec2<f32>(ca * d0.x - sa * d0.y, sa * d0.x + ca * d0.y);

  // outside the unit disk is the ideal boundary and beyond, draw it dark
  if (dot(d0, d0) >= 1.0) {
    return vec4<f32>(0.04, 0.04, 0.05, 1.0);
  }
  let d = mobiusAdd2(P.cam.xy, d0);
  let r2 = dot(d, d);

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
  cam: vec4<f32>, // a Mobius world-shift (the negated camera ball point), .xyz used. zero = static view.
  iterations: u32,
  edgeWidth: f32,
  detail: f32,
  maxSteps: f32,
};

@group(0) @binding(0) var<uniform> P: Params;

fn hdot4(a: vec4<f32>, b: vec4<f32>) -> f32 {
  return a.x * b.x + a.y * b.y + a.z * b.z - a.w * b.w;
}

// Mobius (gyrovector) addition in the Poincare ball, the hyperbolic isometry that flies the camera through the
// honeycomb. Translating the world by the negated camera point puts the camera at the origin.
fn mobiusAdd(a: vec3<f32>, x: vec3<f32>) -> vec3<f32> {
  let ax = dot(a, x);
  let aa = dot(a, a);
  let xx = dot(x, x);
  let d = 1.0 + 2.0 * ax + aa * xx;
  return ((1.0 + 2.0 * ax + xx) * a + (1.0 - aa) * x) / max(d, 1e-6);
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

// the distance estimate as seen from the flying camera. Outside the ball (the approach region) the ray is left
// alone, since the Mobius shift is only an isometry inside the ball. Once inside, the sample is translated by
// the Mobius world-shift, so the honeycomb flies past as the camera dives through it along a geodesic.
fn deCam(p: vec3<f32>) -> f32 {
  if (dot(p, p) >= 1.0) { return de(p); }
  return de(mobiusAdd(P.cam.xyz, p));
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
    let dist = deCam(pos);
    if (dist < P.detail) { hit = true; break; }
    t = t + dist;
    if (t > 6.0) { break; }
  }

  if (!hit) {
    return vec4<f32>(0.04, 0.04, 0.05, 1.0);
  }

  // a finite-difference normal for simple Lambert shading
  let h = 0.0005;
  let nx = deCam(pos + vec3<f32>(h, 0.0, 0.0)) - deCam(pos - vec3<f32>(h, 0.0, 0.0));
  let ny = deCam(pos + vec3<f32>(0.0, h, 0.0)) - deCam(pos - vec3<f32>(0.0, h, 0.0));
  let nz = deCam(pos + vec3<f32>(0.0, 0.0, h)) - deCam(pos - vec3<f32>(0.0, 0.0, h));
  let normal = normalize(vec3<f32>(nx, ny, nz));

  let lightDir = normalize(vec3<f32>(0.6, 0.8, 0.4));
  let lambert = max(0.12, dot(normal, lightDir));
  let depth = 1.0 - 0.12 * t;
  let base = vec3<f32>(0.62, 0.55, 0.95);
  let col = base * lambert * depth;

  return vec4<f32>(col, 1.0);
}
`

// ---------------------------------------------------------------------------------------------
// 3D INTERIOR renderer. The camera sits INSIDE the honeycomb and the cells are drawn as a lattice
// of SOLID BEAMS along the honeycomb edges (where two mirror walls meet), so you fly through the
// dodecahedral corridors of {5,3,4} (the HyperRogue interior look) instead of seeing nested shells
// from outside. Same fold + Mobius camera as FOLD_3D_WGSL, but the distance estimate is a tube
// around the SECOND-nearest mirror (an edge), not a slab around the nearest mirror (a face).
// ---------------------------------------------------------------------------------------------

export const FOLD_3D_INTERIOR_WGSL = /* wgsl */ `
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

struct Params {
  n0: vec4<f32>,
  n1: vec4<f32>,
  n2: vec4<f32>,
  n3: vec4<f32>,
  eye: vec4<f32>,
  cam: vec4<f32>,
  iterations: u32,
  edgeWidth: f32,
  detail: f32,
  maxSteps: f32,
};

@group(0) @binding(0) var<uniform> P: Params;

fn hdot4(a: vec4<f32>, b: vec4<f32>) -> f32 {
  return a.x * b.x + a.y * b.y + a.z * b.z - a.w * b.w;
}

fn mobiusAdd(a: vec3<f32>, x: vec3<f32>) -> vec3<f32> {
  let ax = dot(a, x);
  let aa = dot(a, a);
  let xx = dot(x, x);
  let d = 1.0 + 2.0 * ax + aa * xx;
  return ((1.0 + 2.0 * ax + xx) * a + (1.0 - aa) * x) / max(d, 1e-6);
}

fn tryReflect4(p: ptr<function, vec4<f32>>, n: vec4<f32>) -> f32 {
  let k = max(0.0, hdot4(*p, n));
  *p = *p - 2.0 * k * n;
  return k;
}

// fold by the CELL STABILIZER only (the first three mirrors, a finite group), mapping a point into one simplex
// of the dodecahedral cell. The outer mirror n3 is then the cell's FACE (the wall to the next cell).
fn foldCell(p: ptr<function, vec4<f32>>) {
  for (var i: u32 = 0u; i < P.iterations; i = i + 1u) {
    var k = 0.0;
    k = k + tryReflect4(p, P.n0);
    k = k + tryReflect4(p, P.n1);
    k = k + tryReflect4(p, P.n2);
    if (k == 0.0) { return; }
  }
}

// distance estimate to the SOLID cell wall (the dodecahedron face, the n3 mirror plane). Inside the cell you
// always face a wall, so you stand inside a closed dodecahedral room and see all twelve faces.
fn de(p: vec3<f32>) -> f32 {
  let r2 = dot(p, p);
  if (r2 >= 1.0) { return sqrt(r2) - 1.0 + 0.0005; }
  let denom = 1.0 - r2;
  var q = vec4<f32>(2.0 * p / denom, (1.0 + r2) / denom);
  foldCell(&q);
  // hyperbolic distance from the point to the cell-face plane n3, the wall surface
  let wall = asinh(abs(hdot4(q, P.n3)));
  let euclid = wall * denom * 0.5 * 0.5;
  return max(r2 - 1.0 + 0.001, euclid);
}

fn deCam(p: vec3<f32>) -> f32 {
  if (dot(p, p) >= 1.0) { return de(p); }
  return de(mobiusAdd(P.cam.xyz, p));
}

@fragment
fn fs(in: VertexOut) -> @location(0) vec4<f32> {
  let eye = P.eye.xyz;
  let forward = normalize(-eye);
  let right = normalize(cross(vec3<f32>(0.0, 1.0, 0.0), forward));
  let up = cross(forward, right);
  let ndc = (in.uv - vec2<f32>(0.5, 0.5)) * 2.0;
  let dir = normalize(forward + 0.9 * (ndc.x * right + ndc.y * up));

  var t = 0.0;
  var hit = false;
  var pos = eye;
  let steps = u32(P.maxSteps);
  for (var i: u32 = 0u; i < steps; i = i + 1u) {
    pos = eye + dir * t;
    let dist = deCam(pos);
    if (dist < P.detail) { hit = true; break; }
    t = t + dist;
    if (t > 6.0) { break; }
  }

  if (!hit) {
    return vec4<f32>(0.03, 0.03, 0.05, 1.0);
  }

  let h = 0.0004;
  let nx = deCam(pos + vec3<f32>(h, 0.0, 0.0)) - deCam(pos - vec3<f32>(h, 0.0, 0.0));
  let ny = deCam(pos + vec3<f32>(0.0, h, 0.0)) - deCam(pos - vec3<f32>(0.0, h, 0.0));
  let nz = deCam(pos + vec3<f32>(0.0, 0.0, h)) - deCam(pos - vec3<f32>(0.0, 0.0, h));
  let normal = normalize(vec3<f32>(nx, ny, nz));

  // edge glow: fold the hit point by the cell stabilizer and measure how close it is to a dodecahedron EDGE
  // (where the face mirror n3 meets one of the stabilizer mirrors), so the cell's wireframe lights up
  let wpt = mobiusAdd(P.cam.xyz, pos);
  let wr2 = dot(wpt, wpt);
  let wdenom = 1.0 - wr2;
  var qh = vec4<f32>(2.0 * wpt / wdenom, (1.0 + wr2) / wdenom);
  foldCell(&qh);
  let eg = min(asinh(abs(hdot4(qh, P.n0))), min(asinh(abs(hdot4(qh, P.n1))), asinh(abs(hdot4(qh, P.n2)))));
  let glow = smoothstep(0.055, 0.0, eg); // crisp wireframe lines along the dodecahedron edges

  // TEXTURE the wall. Tint each dodecahedral face by which stabilizer mirror is nearest after folding (so the
  // twelve faces read as distinct surfaces), and lay a checker tile over the face from the folded coordinate
  // (the orbit trap qh.xyz), so the room has a tiled, solid look rather than a flat fill.
  let dA = asinh(abs(hdot4(qh, P.n0)));
  let dB = asinh(abs(hdot4(qh, P.n1)));
  let dC = asinh(abs(hdot4(qh, P.n2)));
  var faceTint = vec3<f32>(0.46, 0.40, 0.80); // nearest n0
  if (dB <= dA && dB <= dC) { faceTint = vec3<f32>(0.40, 0.52, 0.82); } // nearest n1
  if (dC <= dA && dC <= dB) { faceTint = vec3<f32>(0.56, 0.42, 0.74); } // nearest n2
  // checker from the folded coordinate, the tile grid carried across the face
  let tile = qh.xyz * 5.0;
  let checker = step(0.5, fract(tile.x) ) * step(0.5, fract(tile.y)) + step(fract(tile.x), 0.5) * step(fract(tile.y), 0.5);
  let grout = smoothstep(0.0, 0.06, abs(fract(tile.x) - 0.5)) * smoothstep(0.0, 0.06, abs(fract(tile.y) - 0.5));
  let tex = mix(0.78, 1.0, checker) * mix(0.6, 1.0, grout);

  let lightDir = normalize(vec3<f32>(0.4, 0.8, 0.5));
  let lambert = max(0.22, dot(normal, lightDir));
  let fog = exp(-0.4 * t);
  let wall = faceTint * tex * lambert * fog;
  let edge = vec3<f32>(0.95, 0.92, 1.0) * glow * fog;
  let col = wall + edge + vec3<f32>(0.025, 0.025, 0.05);

  return vec4<f32>(col, 1.0);
}
`
