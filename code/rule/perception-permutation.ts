// The exact 9-state ternary perception permutation on an ordered pair of tones
// (values in -1, 0, +1). The reversible, charge-permuting local rule used by the
// {3,4,3,4} / {4,3,4} experiments (the cusp and bulk towers). Each of the nine
// ordered input pairs maps to a unique output pair, so the rule is a bijection on
// pairs (information-preserving). It conserves net charge except where a 0/0 mints
// a +1/-1 (the arrow) and a +1/-1 annihilates to 0/0.
export function perceptionPermutation(a: number, b: number): [number, number] {
  if (a === -1 && b === -1) return [-1, -1]
  if (a === 1 && b === 1) return [1, 1]
  if (a === -1 && b === 0) return [0, -1]
  if (a === 0 && b === -1) return [-1, 0]
  if (a === 1 && b === 0) return [0, 1]
  if (a === 0 && b === 1) return [1, 0]
  if (a === 0 && b === 0) return [1, -1]
  if (a === 1 && b === -1) return [-1, 1]
  if (a === -1 && b === 1) return [0, 0]
  return [a, b]
}

// The same permutation as a lookup table indexed by (a+1)*3 + (b+1), with values
// the output index (a'+1)*3 + (b'+1). PERCEPTION_FORWARD is perceptionPermutation;
// PERCEPTION_INVERSE undoes it (it is its own functional inverse up to the arrow /
// share 3-cycle being run backward), so a forward sweep followed by an inverse
// sweep recovers the start exactly.
export const PERCEPTION_FORWARD = [0, 3, 4, 1, 6, 7, 2, 5, 8]
export const PERCEPTION_INVERSE = [0, 3, 6, 1, 2, 7, 4, 5, 8]

// One beat of the perception permutation as an ASYNCHRONOUS MATCHING on a CSR graph. Cells are visited
// in a rotating order from `start`; the first not-yet-matched neighbour pairs with the cell and the pair
// is updated in place by perceptionPermutation, marking both matched. The `matched` buffer is cleared at
// the start. A deterministic matching of independent pairwise updates over a general adjacency. Used by
// the coherence-tower probes on the {5,3,4} reflection tree.
export function perceptionMatchingSweepCsr(input: {
  tone: Int8Array
  offsets: ArrayLike<number>
  adj: ArrayLike<number>
  matched: Uint8Array
  start: number
}): void {
  const { tone, offsets, adj, matched, start } = input
  const N = tone.length
  matched.fill(0)
  for (let s = 0; s < N; s++) {
    const v = (start + s) % N
    if (matched[v]) continue
    for (let p = offsets[v]!; p < offsets[v + 1]!; p++) {
      const w = adj[p]!
      if (matched[w]) continue
      const [a, b] = perceptionPermutation(tone[v]!, tone[w]!)
      tone[v] = a as -1 | 0 | 1
      tone[w] = b as -1 | 0 | 1
      matched[v] = 1
      matched[w] = 1
      break
    }
  }
}

// One beat of the perception permutation as an asynchronous matching on a periodic L^3 cubic grid (the 6
// face-neighbour directions). Cells are visited in a rotating order from a random offset; for each cell the
// 6 directions are tried in a RANDOM order and the first not-yet-matched neighbour pairs with it, updated in
// place by perceptionPermutation. The `matched` buffer is cleared at the start. The 3D-cusp counterpart of
// perceptionMatchingSweepCsr, used by the form-coherence tower on the {4,3,4} cusp.
export function perceptionMatchingSweep3d(input: {
  tone: Int8Array
  matched: Uint8Array
  length: number
  rng: { next: () => number }
}): void {
  const { tone, matched, length: L, rng } = input
  const N = L * L * L
  const at = (x: number, y: number, z: number): number =>
    (((z % L) + L) % L) * L * L + (((y % L) + L) % L) * L + (((x % L) + L) % L)
  matched.fill(0)
  const s0 = Math.floor(rng.next() * N)
  for (let s = 0; s < N; s++) {
    const v = (s0 + s) % N
    if (matched[v]) continue
    const vx = v % L
    const vy = ((v / L) | 0) % L
    const vz = (v / (L * L)) | 0
    const ord = [0, 1, 2, 3, 4, 5]
    for (let i = 5; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      const t = ord[i]!
      ord[i] = ord[j]!
      ord[j] = t
    }
    for (const k of ord) {
      const d = PERCEPTION_GRID_DIRECTIONS[k]!
      const w = at(vx + d[0]!, vy + d[1]!, vz + d[2]!)
      if (matched[w]) continue
      const [na, nb] = perceptionPermutation(tone[v]!, tone[w]!)
      tone[v] = na as -1 | 0 | 1
      tone[w] = nb as -1 | 0 | 1
      matched[v] = 1
      matched[w] = 1
      break
    }
  }
}

// The 6 face-neighbour directions of a cubic grid, the move set of perceptionMatchingSweep3d.
export const PERCEPTION_GRID_DIRECTIONS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

// One beat of the perception permutation applied across an EDGE-COLORED graph: a sequence
// of disjoint matchings (one per color) is swept, each edge's pair updated in place by
// `table` (PERCEPTION_FORWARD to advance, PERCEPTION_INVERSE to undo). Because each color
// is an independent matching the beat is reversible, run the colors backward with the
// inverse table by passing reverse = true. The crystal-wide reversible wave on {5,3,4}.
export function perceptionEdgeColoringSweep(input: {
  tone: Int8Array
  eu: ArrayLike<number>
  ev: ArrayLike<number>
  byColor: number[][]
  table: number[]
  reverse: boolean
}): void {
  const { tone, eu, ev, byColor, table, reverse } = input
  const order = reverse ? [...byColor.keys()].reverse() : [...byColor.keys()]
  for (const c of order) {
    for (const e of byColor[c]!) {
      const u = eu[e]!
      const v = ev[e]!
      const ni = table[3 * (tone[u]! + 1) + (tone[v]! + 1)]!
      tone[u] = (Math.floor(ni / 3) - 1) as -1 | 0 | 1
      tone[v] = ((ni % 3) - 1) as -1 | 0 | 1
    }
  }
}

// One beat of the deterministic reversible Margolus block CA driving the perception
// permutation on a ring of length L. The ring is tiled into adjacent pairs offset by
// `parity` (alternate 0/1 each beat to give both left- and right-movers); each pair
// is updated in place by `table` (PERCEPTION_FORWARD to advance, PERCEPTION_INVERSE
// to undo). Tones are in {-1, 0, +1}.
export function perceptionBlockBeat(input: {
  tone: Int8Array
  length: number
  parity: number
  table: number[]
}): void {
  const { tone, length, parity, table } = input
  for (let i = parity; i < length; i += 2) {
    const v = i
    const w = (i + 1) % length
    const idx = (tone[v]! + 1) * 3 + (tone[w]! + 1)
    const ni = table[idx]!
    tone[v] = (Math.floor(ni / 3) - 1) as -1 | 0 | 1
    tone[w] = ((ni % 3) - 1) as -1 | 0 | 1
  }
}
