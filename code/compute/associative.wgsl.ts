// WGSL kernels for the content-addressable associative MATCH, the GPU realization of Potter's parallel
// search. One compute invocation per cell compares the cell's stored word to a broadcast comparand and writes
// its match score and a responder flag. This is the maximally parallel form of the CPU engine in
// code/operator/associative-memory.ts, the same answer in one dispatch instead of a scan. The SAME WGSL runs
// headless in Node via the `webgpu` package (Dawn) and in the browser via navigator.gpu.
//
// Layout, the word of cell c occupies words[c * wordBits + k] for slot k, each slot a ternary value 0, 1, 2.
// The comparand is a wordBits array, the mask is a wordBits array where 1 means compare and 0 means ignore.

// the per-cell parallel match, dispatched with one invocation per cell (workgroup size 256)
export const ASSOCIATIVE_MATCH_WGSL = /* wgsl */ `
struct Params {
  cellCount: u32,
  wordBits: u32,
  minScore: u32,
  pad: u32,
};

@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> words: array<u32>;
@group(0) @binding(2) var<storage, read> comparand: array<u32>;
@group(0) @binding(3) var<storage, read> mask: array<u32>;
@group(0) @binding(4) var<storage, read_write> scores: array<u32>;
@group(0) @binding(5) var<storage, read_write> responders: array<u32>;

@compute @workgroup_size(256)
fn match_kernel(@builtin(global_invocation_id) gid: vec3<u32>) {
  let c = gid.x;
  if (c >= P.cellCount) { return; }
  var s: u32 = 0u;
  let base = c * P.wordBits;
  for (var k: u32 = 0u; k < P.wordBits; k = k + 1u) {
    if (mask[k] == 0u) { continue; }
    if (words[base + k] == comparand[k]) { s = s + 1u; }
  }
  scores[c] = s;
  responders[c] = select(0u, 1u, s >= P.minScore);
}
`
