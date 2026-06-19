// One fully-specified discrete directional rule on a periodic L x L grid. Each cell
// holds four ternary directional charges (qE, qW, qN, qS in {-1, 0, +1}). A beat is
// COLLIDE then STREAM. COLLIDE is a reversible involution that rotates a zero-momentum
// head-on pair between the x and y axes ((s,s,0,0) <-> (0,0,s,s)); it conserves charge
// and momentum and is its own inverse. STREAM moves each charge one cell in its
// direction. The whole step is exactly reversible (un-stream then collide recovers the
// start) and conserves total charge and momentum exactly. A reversible conserving
// lattice gas that coarse-grains to hydrodynamics.

export interface LatticeGasState {
  E: Int8Array
  W: Int8Array
  N: Int8Array
  S: Int8Array
}

export function makeLatticeGas(length: number): LatticeGasState {
  const n = length * length
  return {
    E: new Int8Array(n),
    W: new Int8Array(n),
    N: new Int8Array(n),
    S: new Int8Array(n),
  }
}

export function cloneLatticeGas(s: LatticeGasState): LatticeGasState {
  return {
    E: s.E.slice(),
    W: s.W.slice(),
    N: s.N.slice(),
    S: s.S.slice(),
  }
}

// Periodic flat index for an L x L grid.
export const latticeIndex = (
  length: number,
  x: number,
  y: number,
): number =>
  (((y % length) + length) % length) * length +
  (((x % length) + length) % length)

// COLLIDE: reversible involution. (qE,qW,qN,qS)=(s,s,0,0) <-> (0,0,s,s) for s=+-1.
export function collide(s: LatticeGasState): void {
  const n = s.E.length
  for (let i = 0; i < n; i++) {
    const e = s.E[i]!,
      w = s.W[i]!,
      north = s.N[i]!,
      south = s.S[i]!
    if (north === 0 && south === 0 && e === w && e !== 0) {
      s.E[i] = 0
      s.W[i] = 0
      s.N[i] = e as -1 | 1
      s.S[i] = e as -1 | 1
    } else if (e === 0 && w === 0 && north === south && north !== 0) {
      s.N[i] = 0
      s.S[i] = 0
      s.E[i] = north as -1 | 1
      s.W[i] = north as -1 | 1
    }
  }
}

// STREAM: each charge moves one cell in its direction.
export function stream(
  length: number,
  s: LatticeGasState,
): LatticeGasState {
  const n = length * length
  const o: LatticeGasState = {
    E: new Int8Array(n),
    W: new Int8Array(n),
    N: new Int8Array(n),
    S: new Int8Array(n),
  }
  for (let x = 0; x < length; x++)
    for (let y = 0; y < length; y++) {
      o.E[latticeIndex(length, x, y)] =
        s.E[latticeIndex(length, x - 1, y)]!
      o.W[latticeIndex(length, x, y)] =
        s.W[latticeIndex(length, x + 1, y)]!
      o.N[latticeIndex(length, x, y)] =
        s.N[latticeIndex(length, x, y - 1)]!
      o.S[latticeIndex(length, x, y)] =
        s.S[latticeIndex(length, x, y + 1)]!
    }
  return o
}

// The inverse of STREAM, each charge moves one cell against its direction.
export function streamInverse(
  length: number,
  s: LatticeGasState,
): LatticeGasState {
  const n = length * length
  const o: LatticeGasState = {
    E: new Int8Array(n),
    W: new Int8Array(n),
    N: new Int8Array(n),
    S: new Int8Array(n),
  }
  for (let x = 0; x < length; x++)
    for (let y = 0; y < length; y++) {
      o.E[latticeIndex(length, x, y)] =
        s.E[latticeIndex(length, x + 1, y)]!
      o.W[latticeIndex(length, x, y)] =
        s.W[latticeIndex(length, x - 1, y)]!
      o.N[latticeIndex(length, x, y)] =
        s.N[latticeIndex(length, x, y + 1)]!
      o.S[latticeIndex(length, x, y)] =
        s.S[latticeIndex(length, x, y - 1)]!
    }
  return o
}

// Total signed charge (a conserved scalar).
export const latticeCharge = (s: LatticeGasState): number => {
  let c = 0
  for (let i = 0; i < s.E.length; i++)
    c += s.E[i]! + s.W[i]! + s.N[i]! + s.S[i]!
  return c
}

// Total momentum (qE - qW, qN - qS), conserved.
export const latticeMomentum = (
  s: LatticeGasState,
): [number, number] => {
  let px = 0,
    py = 0
  for (let i = 0; i < s.E.length; i++) {
    px += s.E[i]! - s.W[i]!
    py += s.N[i]! - s.S[i]!
  }
  return [px, py]
}

// Per-cell total charge density.
export function latticeDensity(s: LatticeGasState): Float64Array {
  const d = new Float64Array(s.E.length)
  for (let i = 0; i < s.E.length; i++)
    d[i] = s.E[i]! + s.W[i]! + s.N[i]! + s.S[i]!
  return d
}
