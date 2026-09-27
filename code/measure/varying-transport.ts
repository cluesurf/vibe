// Husk transport readings for the store patterns of E-RLT-0080 to E-RLT-0082 (MEASUREMENT: floats throughout).
//
// The instrument is E-RLT-0079's: the exact 72-index singlet linearization of the living-pair knit's two
// collisions ('PK' on even beats, 'KP' on odd ones) at a product background with a store law PER LINE
// (code/measure/sparse-living-vacuum orientedLinearization), read for its husk exponents over the k-ladder
// (code/measure/store-transport). Two uses:
//  - a TRANSLATION-INVARIANT pattern (the same oriented lines on every dock): the dock's own laws, exactly as
//    E-RLT-0079 read the one-line vacuum;
//  - a DOCK-VARYING pattern: the long-wave transport of a periodic medium, to FIRST ORDER in the contrast between its
//    docks, is the transport of the cell-averaged collision. Every dock's matrix is the one of line 0 stored +1,
//    carried by the coin map that sends that root to the dock's own stored root (C_{g rho} = P_g C_rho P_g^T, exact
//    for a covariant rule), or the empty dock's matrix. The exact periodic transport is not computed; what forces it
//    is the pattern's point group (code/measure/varying-vacuum). This reading says whether the average medium is
//    isotropic, not whether the second-order corrections are.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, type MomentumTable } from '@/code/rule/isometric-knit'
import { pairIndexPermutation } from '@/code/measure/pair-knit-linearization'
import { orientedLinearization, type Law } from '@/code/measure/sparse-living-vacuum'
import { STORE_N, type Background } from '@/code/measure/token-store-linearization'
import { invariantsOf, readStoreTransport, storeExponents, storeSpectrum, type Named, type Space } from '@/code/measure/store-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'

const ROOTS = rootsD4()
const N = STORE_N

export const LADDER = [4, 8, 16, 32, 64, 128, 256]
export const SPACE: Space = { n: N, roots: Array.from({ length: N }, (_, i) => (i < 48 ? ROOTS[i >> 1] : undefined)) }
export const NAMED: Named = {
  charge: Float64Array.from({ length: N }, (_, i) => (i < 48 ? (i % 2 === 0 ? 1 : -1) : 0)),
  momentumAlong: u => Float64Array.from({ length: N }, (_, i) => (i < 48 ? (ROOTS[i >> 1] as number[]).reduce((s, x, k) => s + x * (u[k] ?? 0), 0) : 0)),
}

// E-RLT-0079's oriented background: rho 2/3, equal points 1/9; a stored line's law half the vacuum's (+1) and half
// uniform, an unstored line's half the vacuum's (0) and half uniform
export const ORIENTED: Background = { rho: 2 / 3, store: [1 / 3, 1 / 3, 1 / 3], equal: 1 / 9 }
export const STORED_LAW: Law = [2 / 3, 1 / 6, 1 / 6]
export const REVERSED_LAW: Law = [1 / 6, 2 / 3, 1 / 6]
export const EMPTY_LAW: Law = [1 / 6, 1 / 6, 2 / 3]
// a stored line whose sign is +1 and -1 equally often (the sign-symmetric law, what an orientation that averages to
// zero gives at first order)
export const EITHER_LAW: Law = [5 / 12, 5 / 12, 1 / 6]

export type TransportRead = { three: Record<string, number>; five: Record<string, number>; invariants: number; kc: number; anisotropy: Record<string, number[]>; means: Record<string, number> }

export function readTransport(matrices: Float64Array[]): TransportRead {
  const invariants = invariantsOf(SPACE, matrices)
  const s = storeSpectrum(SPACE, NAMED, matrices, invariants)
  const kc = Math.sqrt(s.gap / s.dMax)
  const reading = readStoreTransport({ space: SPACE, named: NAMED, matrices, invariants, ks: LADDER.map(r => kc / r), directions: huskDirections(24) })
  const fit = storeExponents(reading, 5)
  const three: Record<string, number> = {}
  const five: Record<string, number> = {}
  const anisotropy: Record<string, number[]> = {}
  const means: Record<string, number> = {}

  for (const q of ['charge', 'trace', 'sound', 'shear']) {
    const c = reading.series[q] ?? []

    three[q] = Math.log((c[0] ?? 1) / (c[2] ?? 1)) / Math.log(4)
    five[q] = fit[q]?.slope ?? Number.NaN
    anisotropy[q] = [...c]
    means[q] = reading.means[q] ?? Number.NaN
  }

  return { three, five, invariants: invariants.length, kc, anisotropy, means }
}

// the two collision matrices at the given per-line laws
export function lawMatrices(table: MomentumTable, laws: readonly Law[]): [Float64Array, Float64Array] {
  return [orientedLinearization({ table, background: ORIENTED, mode: 'PK', laws }), orientedLinearization({ table, background: ORIENTED, mode: 'KP', laws })]
}

// the per-line laws of a dock storing the given signs on its twelve lines (0 for none)
export function lawsOf(signs: readonly number[]): Law[] {
  return signs.map(s => (s === 1 ? STORED_LAW : s === -1 ? REVERSED_LAW : EMPTY_LAW))
}

// conjugate a 72 x 72 matrix by a coin map: out[p r][p c] = m[r][c]
export function conjugated(matrix: Float64Array, g: readonly number[]): Float64Array {
  const p = pairIndexPermutation(g)
  const out = new Float64Array(N * N)

  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) out[(p[r] as number) * N + (p[c] as number)] = matrix[r * N + c] as number

  return out
}

// The cell average of a dock-varying store (each dock storing at most one line): per dock the line-0 matrices
// carried to its oriented root, or the empty-dock matrices. `permutations` is W(F4) as slot permutations.
export function averagedMatrices(input: { table: MomentumTable; store: Int8Array; cells: number; permutations: readonly (readonly number[])[] }): { even: Float64Array; odd: Float64Array; stored: number; empty: number; carriers: number } {
  const { table, store, cells, permutations } = input
  const f0 = LINE_FIRSTS[0] as number
  const base = lawMatrices(table, lawsOf(LINE_FIRSTS.map((_, l) => (l === 0 ? 1 : 0))))
  const empty = lawMatrices(table, lawsOf(LINE_FIRSTS.map(() => 0)))
  // one coin map per oriented root: the first (in table order) that sends slot f0 to it
  const carrier = new Map<number, readonly number[]>()

  for (const g of permutations) if (!carrier.has(g[f0] as number)) carrier.set(g[f0] as number, g)

  const carried = new Map<number, [Float64Array, Float64Array]>()
  const even = new Float64Array(N * N)
  const odd = new Float64Array(N * N)
  let stored = 0
  let emptyDocks = 0

  for (let x = 0; x < cells; x++) {
    let slot = -1
    let count = 0

    for (let l = 0; l < 12; l++) {
      const s = store[x * 12 + l] as number

      if (s === 0) continue

      count++
      slot = s === 1 ? (LINE_FIRSTS[l] as number) : (ROOTS.findIndex(r => r.every((v, k) => v === -((ROOTS[LINE_FIRSTS[l] as number] as number[])[k] as number))) as number)
    }

    if (count > 1) throw new Error('averagedMatrices takes at most one stored line per dock')

    let pair: [Float64Array, Float64Array]

    if (count === 0) {
      pair = empty
      emptyDocks++
    } else {
      const known = carried.get(slot)

      if (known) pair = known
      else {
        const g = carrier.get(slot) as readonly number[]

        pair = [conjugated(base[0], g), conjugated(base[1], g)]
        carried.set(slot, pair)
      }

      stored++
    }

    for (let i = 0; i < N * N; i++) {
      even[i] = (even[i] as number) + (pair[0][i] as number) / cells
      odd[i] = (odd[i] as number) + (pair[1][i] as number) / cells
    }
  }

  return { even, odd, stored, empty: emptyDocks, carriers: carried.size }
}

// the index permutation of charge conjugation: every love index to its fear index and every store sign to the other
export const CHARGE_CONJUGATION_INDEX: Int32Array = Int32Array.from({ length: N }, (_, i) => (i % 2 === 0 ? i + 1 : i - 1))

// the largest change of a 72 x 72 matrix under conjugation by the given coin maps, each followed by charge
// conjugation when `withC` is true
export function equivarianceDefect(matrix: Float64Array, permutations: readonly (readonly number[])[], withC = false): number {
  let worst = 0

  for (const g of permutations) {
    const q = pairIndexPermutation(g)
    const p = withC ? Int32Array.from(q, i => CHARGE_CONJUGATION_INDEX[i] as number) : q

    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) worst = Math.max(worst, Math.abs((matrix[(p[r] as number) * N + (p[c] as number)] as number) - (matrix[r * N + c] as number)))
  }

  return worst
}
