// Why the coset-union vacuum's husk shear is isotropic (E-RLT-0096). MEASUREMENT (floats) on the exact linear medium
// of code/measure/bounce-transport and code/measure/dense-hub; no rule code is changed.
//
// THE THEOREM (charge-blind occupation). Write each of the 72 linear variables of a dock in pairs, a slot's love and
// fear and a line's store + and store -, and split every pair into its C-even sum and C-odd difference (C, charge
// conjugation, swaps the two members of every pair). In the exact linearization of the knit's two collisions (B P and
// P B, code/measure/bounce-linearization) at a product background whose slots hold love and fear equally:
//  (i) the C-even outputs do not depend on the C-odd inputs. B and K read occupation only and carry signs along; the
//      pair move reads a sign only through "the line's two vibes are opposite", which a love and a fear on the line
//      satisfy with the same chance against a love-fear symmetric partner; a store's sign fixes only WHICH slot of a
//      made pair holds the love, never whether a slot is held. So every occupation output is blind to a C-odd input.
//  (ii) the C-even block reads a store only through whether the line holds one: the stored law (2/3, 1/6, 1/6) and
//      the reversed law (1/6, 2/3, 1/6) give the same chance 5/6 of a unit, and nothing else of the law reaches an
//      occupation.
// The stream copies love and fear alike, so the whole period map is block triangular: its C-even part is a closed
// linear medium that depends only on the UNORIENTED stored pattern. Energy, momentum, the shear, the sound, the depth
// mode and the twelve staggered invariants are C-even; the charge is C-odd. So every C-even slow mode is kept by the
// symmetry of the unoriented pattern. For the coset union that is every W(F4) element about a hub composed with every
// translation of L' (73,728 affine elements on the side-4 cell): W(F4) forces the husk shear at leading order. The
// oriented store's 72 elements act on the C-odd part, the charge, which they force as a scalar.
//
// And a corollary about the staggered modes: every translation t of L' multiplies the staggered invariant of dual line w
// by e^(i pi w . t) and the physical ones by 1, and each of the 12 lines w has a t in L' with w . t odd (t = (1, 1, 1,
// 1) for the axes, (2, 0, 0, 0) for the half vectors), so the C-even medium can couple no physical mode to a staggered
// one at any k: E-RLT-0094's 3e-12.

import {
  type CellOps,
  type CellSymmetry,
  actOn,
} from '@/code/measure/symmetry-transport'
import { pairIndexPermutation } from '@/code/measure/pair-knit-linearization'
import {
  translate,
  type BoxMaps,
  type CoinData,
} from '@/code/measure/varying-vacuum'

const N = 72

export type EvenOddSplit = {
  // the largest entry of the (C-even output, C-odd input) block: 0 when the C-even part is closed
  readonly evenOutOddIn: number
  // the C-even block, 36 x 36 (row: output pair, column: input pair), in the even basis (a + b) / 2 per input pair
  readonly evenBlock: Float64Array
}

// a 72 x 72 dock matrix (row = output, column = input) split by charge conjugation
export function evenOddSplit(m: Float64Array): EvenOddSplit {
  let evenOutOddIn = 0

  const evenBlock = new Float64Array(36 * 36)

  for (let p = 0; p < 36; p++) {
    for (let q = 0; q < 36; q++) {
      const rowSum = (c: number): number =>
        m[2 * p * N + c]! + m[(2 * p + 1) * N + c]!
      const odd = (rowSum(2 * q) - rowSum(2 * q + 1)) / 2
      const even = (rowSum(2 * q) + rowSum(2 * q + 1)) / 2

      evenOutOddIn = Math.max(evenOutOddIn, Math.abs(odd))
      evenBlock[p * 36 + q] = even
    }
  }

  return { evenOutOddIn, evenBlock }
}

// the C-even part of a cell vector: each pair replaced by its mean
export function evenPart(v: Float64Array): Float64Array {
  const out = new Float64Array(v.length)

  for (let i = 0; i < v.length; i += 2) {
    const m = (v[i]! + v[i + 1]!) / 2

    out[i] = m
    out[i + 1] = m
  }

  return out
}

// the largest |D E M0 v - E M0 D v| / |v| over C-even vectors v (the C-even quotient's commutation defect)
export function evenCommutationDefect(
  ops: CellOps,
  g: CellSymmetry,
  vectors: readonly Float64Array[],
): number {
  let worst = 0

  for (const raw of vectors) {
    const v = evenPart(raw)
    const a = actOn(g, evenPart(ops.period(v)))
    const b = evenPart(ops.period(actOn(g, v)))

    let r = 0
    let n = 0

    for (let i = 0; i < a.length; i++) {
      r = Math.max(r, Math.abs(a[i]! - b[i]!))
      n = Math.max(n, Math.abs(v[i]!))
    }

    worst = Math.max(worst, r / n)
  }

  return worst
}

// the full medium's commutation defect (as symmetry-transport commutationDefect)
export function fullCommutationDefect(
  ops: CellOps,
  g: CellSymmetry,
  vectors: readonly Float64Array[],
): number {
  let worst = 0

  for (const v of vectors) {
    const a = actOn(g, ops.period(v))
    const b = ops.period(actOn(g, v))

    let r = 0
    let n = 0

    for (let i = 0; i < a.length; i++) {
      r = Math.max(r, Math.abs(a[i]! - b[i]!))
      n = Math.max(n, Math.abs(v[i]!))
    }

    worst = Math.max(worst, r / n)
  }

  return worst
}

// the affine element x -> g x + t (t a cell of the box, as a translation), with charge conjugation when c = -1
export function affineSymmetry(
  coins: CoinData,
  box: BoxMaps,
  g: number,
  t: number,
  c: number,
): CellSymmetry {
  const lin = box.linear[g]!
  const tv = box.coords[t] as number[]
  const map = Int32Array.from({ length: box.cells }, (_, x) =>
    translate(box, lin[x]!, tv),
  )
  const base = pairIndexPermutation(
    coins.table.permutations[g] as number[],
  )

  return {
    map,
    index: c === 1 ? base : Int32Array.from(base, v => v ^ 1),
    matrix: [],
  }
}

// right cosets g K of a subgroup K of W(F4) (K given as members): the representative of each, and each element's coset
export function rightCosets(
  coins: CoinData,
  K: readonly number[],
): { reps: number[]; coset: Int32Array } {
  const n = coins.table.permutations.length
  const coset = new Int32Array(n).fill(-1)
  const reps: number[] = []

  for (let g = 0; g < n; g++) {
    if (coset[g] !== -1) {
      continue
    }

    reps.push(g)

    for (const k of K) {
      coset[coins.table.multiply[g * n + k]!] = reps.length - 1
    }
  }

  return { reps, coset }
}

export type AffineGroupReading = {
  // the (coset representative, translation cell, c) triples that commute, and the tests run
  readonly passing: { g: number; t: number; c: number }[]
  readonly tested: number
  readonly worstPassing: number
  readonly leastFailing: number
  // the W(F4) elements occurring as linear parts, and the distinct translations
  readonly linear: number[]
  readonly translations: number[]
}

// Every affine element (g, t, c) of the side-4 cell tested against a medium (full or its C-even quotient), on right-
// coset representatives of K, a group of point elements (t = 0, c = +1) already known to commute: membership is
// constant on g K because (g, t, c) (k, 0, +1) = (g k, t, c).
export function affineGroup(input: {
  coins: CoinData
  box: BoxMaps
  K: readonly number[]
  defect: (g: CellSymmetry) => number
  charges: readonly number[]
  tolerance: number
  log?: (s: string) => void
}): AffineGroupReading {
  const { coins, box, K, defect, charges, tolerance } = input
  const { reps, coset } = rightCosets(coins, K)
  const passing: { g: number; t: number; c: number }[] = []

  let tested = 0
  let worstPassing = 0
  let leastFailing = Number.POSITIVE_INFINITY

  for (const g of reps) {
    for (let t = 0; t < box.cells; t++) {
      for (const c of charges) {
        const d = defect(affineSymmetry(coins, box, g, t, c))

        tested++

        if (d < tolerance) {
          passing.push({ g, t, c })
          worstPassing = Math.max(worstPassing, d)
        } else {
          leastFailing = Math.min(leastFailing, d)
        }
      }
    }

    input.log?.(`coset rep ${g}: ${passing.length} passing`)
  }

  const linear = new Set<number>()
  const translations = new Set<number>()

  for (const p of passing) {
    translations.add(p.t)

    for (let g = 0; g < coset.length; g++) {
      if (coset[g] === coset[p.g]) {
        linear.add(g)
      }
    }
  }

  return {
    passing,
    tested,
    worstPassing,
    leastFailing,
    linear: [...linear].sort((a, b) => a - b),
    translations: [...translations].sort((a, b) => a - b),
  }
}
