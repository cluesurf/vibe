// WGSL kernels for a DENSE (modern) Hopfield associative memory on the GPU, the EMERGENT-layer attractor
// flavor. A noisy cue relaxes to the nearest stored pattern by energy descent, which the bare reversible
// vibe rule cannot do (it conserves charge and has no attractor). The dense memory uses a sharp overlap
// nonlinearity (overlap raised to a power), so it stores far more patterns than the classical 0.14 N. Two
// kernels per relaxation step, OVERLAP (one invocation per stored pattern, the projection of the state onto
// each pattern) and UPDATE (one invocation per neuron, the new sign from the pattern-weighted field). State
// and patterns are stored as i32 values in {-1, +1}.

// pass 1, overlap[mu] = sum_i pattern[mu][i] * state[i], dispatched one invocation per pattern
export const HOPFIELD_OVERLAP_WGSL = /* wgsl */ `
struct Params { neurons: u32, patterns: u32, power: u32, pad: u32 };
@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> patterns: array<i32>;
@group(0) @binding(2) var<storage, read> state: array<i32>;
@group(0) @binding(3) var<storage, read_write> overlap: array<i32>;

@compute @workgroup_size(256)
fn overlap_kernel(@builtin(global_invocation_id) gid: vec3<u32>) {
  let mu = gid.x;
  if (mu >= P.patterns) { return; }
  let base = mu * P.neurons;
  var s: i32 = 0;
  for (var i: u32 = 0u; i < P.neurons; i = i + 1u) {
    s = s + patterns[base + i] * state[i];
  }
  overlap[mu] = s;
}
`

// pass 2, field_i = sum_mu pattern[mu][i] * overlap[mu]^(power-1), new state[i] = sign(field). Dispatched one
// invocation per neuron. The power weighting is the dense-memory separation, a sharper power stores more
// patterns. overlap is read as f32 so overlap^(power-1) summed over patterns does not overflow.
export const HOPFIELD_UPDATE_WGSL = /* wgsl */ `
struct Params { neurons: u32, patterns: u32, power: u32, pad: u32 };
@group(0) @binding(0) var<uniform> P: Params;
@group(0) @binding(1) var<storage, read> patterns: array<i32>;
@group(0) @binding(2) var<storage, read> overlap: array<i32>;
@group(0) @binding(3) var<storage, read_write> stateOut: array<i32>;

@compute @workgroup_size(256)
fn update_kernel(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= P.neurons) { return; }
  var field: f32 = 0.0;
  for (var mu: u32 = 0u; mu < P.patterns; mu = mu + 1u) {
    let o = f32(overlap[mu]);
    var w: f32 = 1.0;
    for (var e: u32 = 1u; e < P.power; e = e + 1u) { w = w * o; }
    field = field + f32(patterns[mu * P.neurons + i]) * w;
  }
  stateOut[i] = select(-1, 1, field >= 0.0);
}
`
