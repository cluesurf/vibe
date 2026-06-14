// WGSL kernel for the associative query WAVE, the broadcast that reveals the geometric latency on hardware.
// A comparand spreads outward from a seed cell one ring per beat (the bucket brigade) along the CSR
// adjacency, and each cell records the beat it is first reached. After O(diameter) dispatches the whole
// region is covered, and on a hyperbolic graph that is O(log N) beats where a flat lattice needs O(N^(1/d)).
// A cell is reached at the current beat if a neighbour was reached at a STRICTLY earlier beat, so each beat
// advances exactly one ring with no same-beat chaining and no double buffer.

export const ASSOCIATIVE_WAVE_WGSL = /* wgsl */ `
struct Params {
  cellCount: u32,
  beat: u32,
  pad0: u32,
  pad1: u32,
};

@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> offsets: array<u32>;
@group(0) @binding(2) var<storage, read> adj: array<u32>;
@group(0) @binding(3) var<storage, read_write> arrival: array<i32>;
@group(0) @binding(4) var<storage, read_write> changed: array<atomic<u32>>;

@compute @workgroup_size(256)
fn wave_kernel(@builtin(global_invocation_id) gid: vec3<u32>) {
  let c = gid.x;
  if (c >= P.cellCount) { return; }
  if (arrival[c] >= 0) { return; }
  let start = offsets[c];
  let end = offsets[c + 1u];
  for (var p: u32 = start; p < end; p = p + 1u) {
    let a = arrival[adj[p]];
    if (a >= 0 && u32(a) < P.beat) {
      arrival[c] = i32(P.beat);
      atomicAdd(&changed[0], 1u);
      return;
    }
  }
}
`
