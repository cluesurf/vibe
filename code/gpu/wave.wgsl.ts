// Shared WGSL kernels for the vibe field on a flat lattice, the GPU port of the deterministic reversible
// second-order wave (CPU reference in mesh .../tool/vibe/wave.ts and experiments P148 to P154). The SAME
// WGSL runs headless in Node via the `webgpu` package (Dawn) and in the browser via the built-in
// navigator.gpu, so the engine is written once. See note/plan/vibe-webgpu-billion-cell-sim.md.
//
// Rule, next = ((sum of the 4 toroidal neighbours of current) - previous) mod 3, tones in {0,1,2} where 0 is
// peace, 1 is pleasure (+1), 2 is pain (-1). Each cell packs its two needed beats into one u32, the low 2
// bits are the CURRENT tone and bits 2..3 are the PREVIOUS tone. One compute invocation per cell writes the
// next state, with new-current = next and new-previous = old-current, so a single ping-pong buffer suffices.

// the per-cell wave step, dispatched with one invocation per cell (workgroup size 256)
export const WAVE_STEP_WGSL = /* wgsl */ `
struct Params {
  width: u32,
  height: u32,
  count: u32,
  strideX: u32, // x-extent of the dispatch grid (gx * 256), so a 2D dispatch indexes past the 65535 limit
};

@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> inState: array<u32>;
@group(0) @binding(2) var<storage, read_write> outState: array<u32>;

fn at(x: u32, y: u32) -> u32 {
  return inState[y * P.width + x] & 3u;
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  // a 1D dispatch keeps gid.y = 0 (strideX unused), a 2D dispatch flattens (x, y) into a linear cell index
  let i = gid.y * P.strideX + gid.x;
  if (i >= P.count) {
    return;
  }
  let x = i % P.width;
  let y = i / P.width;

  // toroidal neighbour coordinates (wrap at the edges)
  let xl = select(x - 1u, P.width - 1u, x == 0u);
  let xr = select(x + 1u, 0u, x == P.width - 1u);
  let yu = select(y - 1u, P.height - 1u, y == 0u);
  let yd = select(y + 1u, 0u, y == P.height - 1u);

  let cur = inState[i] & 3u;
  let prev = (inState[i] >> 2u) & 3u;
  let s = at(xl, y) + at(xr, y) + at(x, yu) + at(x, yd); // 0..8

  // next = (s - prev) mod 3, kept non-negative by adding 9 (a multiple of 3 above the max of s)
  let nx = (s + 9u - prev) % 3u;

  // pack new-current = nx in the low bits, new-previous = old-current in bits 2..3
  outState[i] = (cur << 2u) | nx;
}
`

// the wave step on the IRREGULAR {5,3,4} bulk graph (12 neighbours per cell, not fixed offsets). Neighbours
// come from a CSR adjacency, offsets[i]..offsets[i+1] index into adj. Same second-order mod-3 rule, but the
// neighbour sum runs over the variable-degree adjacency. This is the stored-neighbour bulk path (plan Stage
// 3), the formula-addressing path (Stage 4) replaces the adj buffer with arithmetic.
export const BULK_STEP_WGSL = /* wgsl */ `
struct Params {
  count: u32,
  pad0: u32,
  pad1: u32,
  pad2: u32,
};

@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> inState: array<u32>;
@group(0) @binding(2) var<storage, read_write> outState: array<u32>;
@group(0) @binding(3) var<storage, read> offsets: array<u32>;
@group(0) @binding(4) var<storage, read> adj: array<u32>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= P.count) {
    return;
  }
  let cur = inState[i] & 3u;
  let prev = (inState[i] >> 2u) & 3u;

  var s = 0u;
  let start = offsets[i];
  let end = offsets[i + 1u];
  for (var p = start; p < end; p = p + 1u) {
    s = s + (inState[adj[p]] & 3u);
  }

  // next = (s - prev) mod 3, kept non-negative by adding 27 (a multiple of 3 above the max degree-12 sum)
  let nx = (s + 27u - prev) % 3u;
  outState[i] = (cur << 2u) | nx;
}
`

// a render kernel for the browser (a full-screen pass colouring each cell by its current tone). Headless
// Node runs compute only and does not use this, it is here so the browser viz shares one source of truth.
export const WAVE_RENDER_WGSL = /* wgsl */ `
struct VertexOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VertexOut {
  // a single full-screen triangle
  var out: VertexOut;
  let p = vec2<f32>(f32((vi << 1u) & 2u), f32(vi & 2u));
  out.uv = p;
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}

struct Params {
  width: u32,
  height: u32,
  count: u32,
  pad: u32,
};

@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> state: array<u32>;

@fragment
fn fs(in: VertexOut) -> @location(0) vec4<f32> {
  let x = u32(in.uv.x * f32(P.width));
  let y = u32(in.uv.y * f32(P.height));
  let xc = min(x, P.width - 1u);
  let yc = min(y, P.height - 1u);
  let t = state[yc * P.width + xc] & 3u;
  var col = vec3<f32>(0.039, 0.039, 0.043); // peace, near-black
  if (t == 1u) {
    col = vec3<f32>(0.231, 0.510, 0.965); // pleasure, blue
  } else if (t == 2u) {
    col = vec3<f32>(0.973, 0.353, 0.447); // pain, red
  }
  return vec4<f32>(col, 1.0);
}
`
