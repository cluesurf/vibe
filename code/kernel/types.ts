// THE KERNEL INTERFACE: the float64 primitives the heavy engines spend their time in, and the backends that run them.
// code/kernel/
// The profile (note/research/vibe/kernel.md) put 78 to 95 percent of the pair engines' time in ONE loop, the gathered
// block convolution (code/measure/register-ball-reduced and register-reduced conv), and most of register-sea's in its
// per-dock sector piece and its Fourier sum. Each primitive here is that loop cut at a row boundary: it computes rows
// [0, rows) of an output, and every row is summed in the reference's exact order, so a backend that splits the rows over
// threads gives the bytes the TypeScript does, at any thread count.
//
//   js       code/kernel/js.ts, the loops restated from the engines, always available, the reference
//   native   the Rust crate kernel/ built as a Node-API addon, zero copy, std::thread over all cores
//   wasm     the same crate built for wasm32 with SIMD128, one instance, arrays copied in and out
//   wasm-threads   the crate built for wasm32 with atomics, one instance per worker_thread over one shared memory
//
// EXACT (integer and modular) primitives would be a second family behind the same shape, the one a GPU backend could
// run byte for byte (u32 arithmetic): see the phase-two section of the kernel note. Nothing here is integer yet.

export type Backend = 'js' | 'native' | 'wasm' | 'wasm-threads'

// the pair convolution's static tables, flattened (code/kernel/pair.ts builds them from an engine)
export type PairTables = {
  // per representative and root (count * 24): the neighbour's representative or -1, and the group element carrying it
  plusRep: Int32Array
  plusG: Int32Array
  minusRep: Int32Array
  minusG: Int32Array
  // per element and pair type (elements * 4 * 64): psi(g y)[k] = sgn[k] psi(y)[src[k]]
  src: Int16Array
  sgn: Int8Array
  // the sparse overlap C(r_d) per root (off[d] .. off[d + 1] into row, col, val), then C^dag
  off: Int32Array
  row: Int8Array
  col: Int8Array
  val: Float64Array
  offT: Int32Array
  rowT: Int8Array
  colT: Int8Array
  valT: Float64Array
  // the root phases (24 each)
  halfRe: Float64Array
  halfIm: Float64Array
}

// register-holes' torus Fourier transform (code/measure/register-holes torusFourier), flattened: the class of every
// grid momentum (G = L^4 entries), the grid index of every site and of every class's representative (N each), cos and
// sin of 2 pi m / L, and the two unitary scales [1 / (2 sqrt N) to sites, 1 / sqrt N to classes], computed in TypeScript
export type HoleFourierTables = {
  classOfGrid: Int32Array
  gridOfSite: Int32Array
  gridOfClass: Int32Array
  cos: Float64Array
  sin: Float64Array
  scales: Float64Array
}

// register-holes' pair piece, cut into ORBITS (the rows): an orbit is a set of fiber indices whose full-momentum column
// is one function, read through the gather and written back through the scatter. The dense engine's orbit is one fiber
// index and every map is the identity (nperm 1); the sorted store's is a fiber tuple and its member permutations.
//   gather   column[t] = psign[p] state[rowOf[t] * block + fbOf[orbit * nperm + p]], p = permOf[t], t over the N^(n-1)
//            momentum tuples of members 0 .. n - 2
//   phase    after the transform to sites, column[t] *= cos + i sin of the orbit's pattern at t, unless skip (the
//            reference multiplies only where the phase angle is not 0); [pattern * tuples + t]
//   scatter  for each (writeC[w], writeTau[w]), w in writeOff[orbit] .. writeOff[orbit + 1], and every stored row r:
//            state[r * block + c] = psign[tau] column[tOf[r * nperm + tau]]
export type HolePairTables = {
  rowOf: Int32Array
  permOf: Int32Array
  psign: Int32Array
  fbOf: Int32Array
  pattern: Int32Array
  writeOff: Int32Array
  writeC: Int32Array
  writeTau: Int32Array
  tOf: Int32Array
}

// the phase of every sector pattern at every relative site tuple, one beat's sign (cos, sin of sign phi, and skip where
// phi is exactly 0), computed in TypeScript exactly where register-holes pairPhases computes them
export type HolePhase = { cos: Float64Array; sin: Float64Array; skip: Int8Array }

// a backend's handle on a PairTables (the native backend copies the tables into the addon once)
export type PairOp = { readonly count: number; readonly tables: PairTables; readonly native?: unknown; readonly wasm?: number }

export type Kernel = {
  readonly backend: Backend
  readonly threads: number

  // a zeroed array this backend reads and writes with no copy (only where that differs from a plain Float64Array: the
  // threaded wasm module's shared memory); absent, any Float64Array is read in place or copied by the backend itself
  alloc?(n: number): Float64Array

  pairOp(tables: PairTables): PairOp

  // out = the convolution of source block t on member 1 or 2 (register-ball-reduced conv)
  conv(
    op: PairOp,
    srcRe: Float64Array,
    srcIm: Float64Array,
    srcOff: number,
    srcStride: number,
    t: number,
    outRe: Float64Array,
    outIm: Float64Array,
    member: 1 | 2,
    dagger: boolean,
  ): void

  // one beat's site-local update (mainOff 0 for beat 1, 192 for beat 2)
  pairBeat(
    re: Float64Array,
    im: Float64Array,
    t1r: Float64Array,
    t1i: Float64Array,
    t2r: Float64Array,
    t2i: Float64Array,
    fr: Float64Array,
    fi: Float64Array,
    qBr: Float64Array,
    qBi: Float64Array,
    qXr: Float64Array,
    qXi: Float64Array,
    beta: Float64Array,
    alr: number,
    ali: number,
    mainOff: 0 | 192,
  ): void

  // register-reduced's cross piece, projection and update fused per representative
  crossApply(
    re: Float64Array,
    im: Float64Array,
    t1r: Float64Array,
    t1i: Float64Array,
    t2r: Float64Array,
    t2i: Float64Array,
    t4r: Float64Array,
    t4i: Float64Array,
    cross: Float64Array,
    own: 64 | 128,
  ): void

  // out block `off` += f per representative (the Gram's add)
  blockAdd(outRe: Float64Array, outIm: Float64Array, fr: Float64Array, fi: Float64Array, off: 0 | 64 | 128 | 192): void

  // per representative: the local product sum over 256 entries of conj(a) b, in order
  blockInner(
    aRe: Float64Array,
    aIm: Float64Array,
    bRe: Float64Array,
    bIm: Float64Array,
    partRe: Float64Array,
    partIm: Float64Array,
  ): void

  axpy(yRe: Float64Array, yIm: Float64Array, xRe: Float64Array, xIm: Float64Array, fr: number, fi: number): void
  scale(re: Float64Array, im: Float64Array, f: number): void

  // register-sea's sector piece at every dock (alpha, beta and the optional phase per dock, 2 * docks each)
  seaPiece(
    re: Float64Array,
    im: Float64Array,
    E: Float64Array,
    alpha: Float64Array,
    beta: Float64Array,
    phase: Float64Array | null,
  ): void

  // register-sea's swap coin and stream, s into out
  seaStream(sRe: Float64Array, sIm: Float64Array, oRe: Float64Array, oIm: Float64Array, move: Int32Array, opposite: Int32Array): void

  // register-sea's pairAt: M = sum over docks of (c_i + i s_i) psi_i, zero entries skipped
  phaseSum(re: Float64Array, im: Float64Array, c: Float64Array, s: Float64Array, width: number, mRe: Float64Array, mIm: Float64Array): void

  // register-holes oneBody: every row (a momentum tuple's block of f^n amplitudes), member by member, times the transfer
  // of that member's momentum class (a[j * f * f + r * f + k]); mom[row * n + i] the classes
  holeOneBody(
    re: Float64Array,
    im: Float64Array,
    mom: Int32Array,
    n: number,
    f: number,
    aRe: Float64Array,
    aIm: Float64Array,
  ): void

  // register-holes bandWeights' local sums: part[row * n + i] = |P x|^2 of member i over the row, P that member's
  // class's band projector
  holeBand(
    re: Float64Array,
    im: Float64Array,
    mom: Int32Array,
    n: number,
    f: number,
    pRe: Float64Array,
    pIm: Float64Array,
    part: Float64Array,
  ): void

  // register-holes pairPhases, an orbit a row (the transform, the phase and the transform back, per orbit)
  holePair(re: Float64Array, im: Float64Array, fourier: HoleFourierTables, pair: HolePairTables, phase: HolePhase): void
}
