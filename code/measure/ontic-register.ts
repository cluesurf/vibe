// THE TWO TESTS THAT SEPARATE "ONE BASE CONFIGURATION IS REAL" FROM "THE SIGNED WHOLE IS REAL" (E-QTM-0189, decision
// 001 of the quantum-coverage project). Exact in Q(w), w = e^(2 pi i / 3), with the Eisenstein matrices of
// code/measure/reconstruction-axioms and the exact linear program of code/measure/exact-cone-lp. No floats reach a
// verdict.
//
// THE SIGNED WHOLE. A role is a qutrit. Its nine configurations are the points u = (a, b) of F3^2, each with the
// phase-point operator A_u = X^a Z^b P Z^-b X^-a, P |x> = |-x> the parity (Hermitian, trace 1, Tr(A_u A_v) = 3
// delta). The signed whole of a state is W(u) = Tr(rho A_u) / 3 (Gross 2006): it sums to 1, a line's sum is the chance
// of that line's reading (E-QTM-0130), and it is never negative on a stabilizer state. Two roles have the 81 points
// (u, v) with A_u (x) A_v and W = Tr(rho A_u (x) A_v) / 9.
//
// TEST A, A NON-NEGATIVE HIDDEN-CONFIGURATION MODEL. A fragment of states and readings has one when the identity of
// its real space is a non-negative sum of products b a^T, b on the extreme rays of the states' dual cone and a on
// those of the effects' (code/measure/exact-cone-lp noncontextualModel, Spekkens 2008, Schmid et al. 2021). The
// one-role fragment here is the twelve stabilizer states, the twelve line readings (the readings the model makes,
// E-QTM-0130, 0142), and one more state. Coordinates are the nine numbers Tr(rho A_u), so a state's coordinates are
// its signed whole times a positive number, and a reading's are 0 or 1 (the indicator of its line).
//
// TEST B, A PERMUTATION BASIS FOR A STEP. A unitary U acts as a permutation in some orthonormal basis, up to a global
// phase c, exactly when its eigenvalues with multiplicity are c times those of a permutation ('t Hooft's requirement:
// unitaries with equal spectra are unitarily equivalent). Two exact readings:
//   finite order mod phases   U^L is a scalar for L = lcm(1..n): necessary for any global phase, since a permutation
//                             of n points has order dividing L
//   the spectrum              p_m = tr(U^m) for m = 1..n fix the spectrum (Newton). U = c P needs p_m = c^m fix(P^m),
//                             fix(P^m) = sum over k | m of k N_k with N_k cycles of length k. When p_1 is nonzero,
//                             fix(P) = |p_1| and c = p_1 / |p_1| are forced, so the reading covers every global phase;
//                             when p_1 = 0 the phases tried are the six units of Q(w), and the reading says so
//   the phase-space reading   U permutes the configurations of the signed whole when U A_u U^dag is one A_v for every u
//                             (a Clifford step, Gross 2006). The signed transition T(v, u) = Tr(A_v U A_u U^dag) / D^2
//                             carries W to W after the step, and is a permutation matrix exactly then
//
// DETERMINISM: no random numbers. EXACT: every quantity is a bigint or a Q(w) number.

import {
  cycAdjoint,
  cycIdentity,
  cycKron,
  cycMul,
  type Cyc,
  type CycMatrix,
} from '@/code/algebra/cyclotomic'
import {
  extremeRays,
  feasibility,
  noncontextualModel,
  q,
  Q0,
  qadd,
  qcmp,
  qdiv,
  qmul,
  qsub,
  type NcResult,
  type Q,
} from '@/code/measure/exact-cone-lp'
import {
  ancillaReading,
  applyGate,
  conditionalSecond,
  EIS,
  ketKey,
  productKet,
  projector,
  splitBases,
  stabilizerKets,
  traceNumerator,
} from '@/code/measure/reconstruction-axioms'
import type { Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import type { Will } from '@/code/tone/will'

// ---- the configurations of the signed whole ----

// a permutation j -> perm[j] as a matrix
export const permutationMatrix = (perm: ArrayLike<number>): CycMatrix => {
  const n = perm.length
  const entries: Cyc[] = Array.from({ length: n * n }, () => EIS.zero())

  for (let j = 0; j < n; j++) {
    entries[perm[j]! * n + j] = EIS.one()
  }

  return { n, entries, den: 1n }
}

const SHIFT = permutationMatrix([1, 2, 0])
const CLOCK: CycMatrix = {
  n: 3,
  entries: Array.from({ length: 9 }, (_, i) =>
    Math.floor(i / 3) === i % 3 ? EIS.root(i % 3) : EIS.zero(),
  ),
  den: 1n,
}
const PARITY = permutationMatrix([0, 2, 1])

const power = (m: CycMatrix, k: number): CycMatrix => {
  let out = cycIdentity(EIS, m.n)

  for (let i = 0; i < k; i++) {
    out = cycMul(EIS, m, out)
  }

  return out
}

// conjugation G M G^dag
export const conjugate = (g: CycMatrix, m: CycMatrix): CycMatrix =>
  cycMul(EIS, cycMul(EIS, g, m), cycAdjoint(EIS, g))

// the nine phase-point operators of one role, index u = 3 a + b for the point (a, b)
export function phasePoints(): CycMatrix[] {
  const out: CycMatrix[] = []

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const d = cycMul(EIS, power(SHIFT, a), power(CLOCK, b))

      out.push(conjugate(d, PARITY))
    }
  }

  return out
}

// the 81 phase-point operators of two roles, index 9 u + v
export function twoRolePhasePoints(): CycMatrix[] {
  const one = phasePoints()

  return one.flatMap(a => one.map(b => cycKron(EIS, a, b)))
}

// Tr(rho A_u) over the points, as integers sharing one positive scale (rho's denominator times A's, which is 1): the
// signed whole of rho times a positive number
export const signedWhole = (
  rho: CycMatrix,
  points: readonly CycMatrix[],
): bigint[] => points.map(a => traceNumerator(rho, a))

// for every phase point u, the point v with G A_u G^dag = A_v, or -1 when there is none
export function phaseSpaceAction(
  g: CycMatrix,
  points: readonly CycMatrix[],
): number[] {
  const keyOf = (m: CycMatrix): string =>
    `${m.den}|${m.entries.map(e => e.join(',')).join(';')}`
  const index = new Map(points.map((p, i) => [keyOf(p), i]))

  return points.map(p => index.get(keyOf(conjugate(g, p))) ?? -1)
}

// the signed transition T(v, u) = Tr(A_v G A_u G^dag) / D^2 as integer numerators over one positive scale: the count
// of negative and of nonzero entries
export function signedTransition(
  g: CycMatrix,
  points: readonly CycMatrix[],
): { negative: number; nonzero: number; total: number } {
  let negative = 0
  let nonzero = 0

  for (const p of points) {
    const image = conjugate(g, p)

    for (const q of points) {
      const t = traceNumerator(q, image)

      if (t !== 0n) {
        nonzero++
      }

      if (t < 0n) {
        negative++
      }
    }
  }

  return { negative, nonzero, total: points.length * points.length }
}

// ---- test A: the one-role linear program ----

export type OneRoleFragment = {
  points: CycMatrix[]
  stabilizerStates: bigint[][]
  readings: bigint[][]
  perms: number[][]
}

// the twelve stabilizer states and line readings in signed-whole coordinates, and the one-role Clifford group's
// permutations of the nine points (each group element must permute them; a miss throws)
export function oneRoleFragment(group: readonly CycMatrix[]): OneRoleFragment {
  const points = phasePoints()
  const projectors = stabilizerKets().map(projector)
  const states = projectors.map(p => signedWhole(p, points))
  const perms = group.map(g => {
    const action = phaseSpaceAction(g, points)

    if (action.includes(-1)) {
      throw new Error('ontic-register: a Clifford element does not permute the phase points')
    }

    return action
  })

  // the readings: Tr(Pi A_u), the same operators as the stabilizer states
  return { points, stabilizerStates: states, readings: states, perms }
}

const gcdBig = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export const primitiveVector = (v: readonly bigint[]): bigint[] => {
  const g = v.reduce((s, x) => gcdBig(s, x), 0n) || 1n

  return v.map(x => x / g)
}

const vectorKey = (v: readonly bigint[]): string => primitiveVector(v).join(',')

// distinct nonzero vectors, each primitive
export function distinctVectors(vs: readonly (readonly bigint[])[]): bigint[][] {
  const seen = new Map<string, bigint[]>()

  for (const v of vs) {
    if (v.every(x => x === 0n)) {
      continue
    }

    const key = vectorKey(v)

    if (!seen.has(key)) {
      seen.set(key, primitiveVector(v))
    }
  }

  return [...seen.values()]
}

export type ColumnModel = {
  feasible: boolean
  // feasible: the chosen pairs reproduce the identity exactly; infeasible: the witness Y has b^T Y a >= 0 on EVERY
  // ray pair and trace < 0, checked exactly
  certified: boolean
  raysStates: number
  raysEffects: number
  rounds: number
  columns: number
}

// The same program as exact-cone-lp noncontextualModel (identity = sum sigma_ij b_i a_j^T, sigma >= 0), solved by
// column generation: the exact phase-I simplex on a growing set of pairs. When the restricted program has no
// solution, its Farkas certificate Y is priced on every pair; pairs with b^T Y a < 0 join (the most negative first),
// and when none is negative Y is a witness for the full program. A solution of a restricted program is one of the
// full program. Same answers, far fewer columns than the thousands of ray pairs a one-role fragment has.
export function columnModel(input: {
  states: readonly (readonly bigint[])[]
  effects: readonly (readonly bigint[])[]
  n: number
  batch?: number
  // starting pairs (index i |A| + j) in place of the default seed set, and a cap on rounds (past it: not certified)
  seeds?: readonly number[]
  maxRounds?: number
  onRound?: (round: number, columns: number, pivots: number) => void
}): ColumnModel {
  const { n } = input
  const batch = input.batch ?? 60
  const B = extremeRays(input.states, n)
  const A = extremeRays(input.effects, n)
  const column = (i: number, j: number): bigint[] => {
    const out = new Array<bigint>(n * n)

    for (let r = 0; r < n; r++) {
      for (let s = 0; s < n; s++) {
        out[r * n + s] = B[i]![r]! * A[j]![s]!
      }
    }

    return out
  }
  const rhs = Array.from({ length: n * n }, (_, k) =>
    Math.floor(k / n) === k % n ? 1n : 0n,
  )
  const chosen: [number, number][] = []
  const inChosen = new Set<number>()

  for (const k of input.seeds ?? []) {
    if (!inChosen.has(k)) {
      inChosen.add(k)
      chosen.push([Math.floor(k / A.length), k % A.length])
    }
  }

  // start: each state ray with the effect ray it overlaps least (a deterministic seed set)
  B.forEach((b, i) => {
    if (input.seeds) {
      return
    }

    let best = 0
    let bestDot: bigint | undefined

    A.forEach((a, j) => {
      const d = b.reduce((s, x, k) => s + x * a[k]!, 0n)

      if (bestDot === undefined || d < bestDot) {
        bestDot = d
        best = j
      }
    })

    chosen.push([i, best])
    inChosen.add(i * A.length + best)
  })

  let rounds = 0

  for (;;) {
    rounds++

    if (input.maxRounds !== undefined && rounds > input.maxRounds) {
      return {
        feasible: false,
        certified: false,
        raysStates: B.length,
        raysEffects: A.length,
        rounds,
        columns: chosen.length,
      }
    }

    const lp = feasibility(
      chosen.map(([i, j]) => column(i, j)),
      rhs,
      { rule: 'dantzig' },
    )

    input.onRound?.(rounds, chosen.length, lp.pivots)

    if (lp.feasible) {
      const sum: Q[] = new Array<Q>(n * n).fill(Q0)

      chosen.forEach(([i, j], c) => {
        const x = lp.x![c]!

        if (x.n === 0n) {
          return
        }

        const col = column(i, j)

        for (let k = 0; k < n * n; k++) {
          if (col[k] !== 0n) {
            sum[k] = qadd(sum[k]!, qmul(x, q(col[k]!)))
          }
        }
      })

      return {
        feasible: true,
        certified: sum.every((x, k) => qcmp(x, q(rhs[k]!)) === 0),
        raysStates: B.length,
        raysEffects: A.length,
        rounds,
        columns: chosen.length,
      }
    }

    // price every pair with Y (y by rows r n + s): b^T Y a
    const y = lp.y!
    const yb = B.map(b => {
      const out: Q[] = []

      for (let s = 0; s < n; s++) {
        let acc = Q0

        for (let r = 0; r < n; r++) {
          if (b[r] !== 0n && y[r * n + s]!.n !== 0n) {
            acc = qadd(acc, qmul(y[r * n + s]!, q(b[r]!)))
          }
        }

        out.push(acc)
      }

      return out
    })
    const negative: { k: number; v: Q }[] = []

    for (let i = 0; i < B.length; i++) {
      for (let j = 0; j < A.length; j++) {
        let v = Q0

        for (let s = 0; s < n; s++) {
          if (A[j]![s] !== 0n && yb[i]![s]!.n !== 0n) {
            v = qadd(v, qmul(yb[i]![s]!, q(A[j]![s]!)))
          }
        }

        if (v.n < 0n) {
          negative.push({ k: i * A.length + j, v })
        }
      }
    }

    if (negative.length === 0) {
      let trace = Q0

      for (let r = 0; r < n; r++) {
        trace = qadd(trace, y[r * n + r]!)
      }

      return {
        feasible: false,
        certified: trace.n < 0n,
        raysStates: B.length,
        raysEffects: A.length,
        rounds,
        columns: chosen.length,
      }
    }

    negative.sort((a, b) => qcmp(a.v, b.v) || a.k - b.k)

    let added = 0

    for (const { k } of negative) {
      if (added >= batch) {
        break
      }

      if (inChosen.has(k)) {
        throw new Error('ontic-register: a chosen column priced negative')
      }

      inChosen.add(k)
      chosen.push([Math.floor(k / A.length), k % A.length])
      added++
    }
  }
}

// Phase I of the simplex method in floating point, Dantzig's rule with Bland's after a long degenerate run: only to
// GUESS the final basis of the program sum x_j column_j = rhs, x >= 0 (rows sign-normalized, artificials last).
let floatPivots = 0

// the fixed perturbations tried in turn: a size and a pattern over the rows
const PERTURBATIONS: readonly ((i: number, m: number) => number)[] = [
  (i, m) => 1e-6 * (1 + i / m),
  (i, m) => 1e-5 * (1 + (m - i) / m),
  (i, m) => 1e-7 * (1 + ((7 * i) % m) / m),
  (i, m) => 1e-4 * (1 + ((13 * i) % m) / m),
]

function floatPhaseOne(
  columns: readonly (readonly bigint[])[],
  rhs: readonly bigint[],
  attempt = 0,
): number[] {
  const perturb = PERTURBATIONS[attempt % PERTURBATIONS.length]!
  const m = rhs.length
  const nCols = columns.length
  const total = nCols + m
  const sign = rhs.map(r => (r < 0n ? -1 : 1))
  const T: Float64Array[] = []
  // each column scaled to largest entry 1 (a positive column scale keeps the basis structure)
  const scale = columns.map(c => {
    let big = 0

    for (const x of c) {
      big = Math.max(big, Math.abs(Number(x)))
    }

    return big > 0 ? 1 / big : 1
  })

  for (let i = 0; i < m; i++) {
    const row = new Float64Array(total + 1)

    for (let j = 0; j < nCols; j++) {
      row[j] = Number(columns[j]![i]!) * sign[i]! * scale[j]!
    }

    row[nCols + i] = 1
    // a fixed small perturbation of the right side breaks the program's heavy degeneracy (the identity has 72 zero
    // entries in 81); the exact certificates are built for the unperturbed program
    row[total] = Number(rhs[i]!) * sign[i]! + perturb(i, m)
    T.push(row)
  }

  const basis = Array.from({ length: m }, (_, i) => nCols + i)
  const cost = new Float64Array(total + 1)

  for (let j = 0; j <= total; j++) {
    if (j >= nCols && j < total) {
      continue
    }

    let s = 0

    for (let i = 0; i < m; i++) {
      s += T[i]![j]!
    }

    cost[j] = -s
  }

  const EPS = 1e-9

  let bland = false
  let degenerate = 0

  for (let pivots = 0; pivots < 20000; pivots++) {
    floatPivots = pivots
    let enter = -1

    for (let j = 0; j < total; j++) {
      if (cost[j]! < -EPS) {
        if (bland) {
          enter = j
          break
        }

        if (enter < 0 || cost[j]! < cost[enter]!) {
          enter = j
        }
      }
    }

    if (enter < 0) {
      break
    }

    let leave = -1
    let best = Infinity

    for (let i = 0; i < m; i++) {
      const a = T[i]![enter]!

      if (a > EPS) {
        const ratio = T[i]![total]! / a

        if (
          ratio < best - EPS ||
          (Math.abs(ratio - best) <= EPS && basis[i]! < basis[leave]!)
        ) {
          best = ratio
          leave = i
        }
      }
    }

    if (leave < 0) {
      break
    }

    degenerate = best <= EPS ? degenerate + 1 : 0

    if (degenerate > 50) {
      bland = true
    }

    const pr = T[leave]!
    const inv = 1 / pr[enter]!

    const nz: number[] = []

    for (let j = 0; j <= total; j++) {
      if (pr[j] !== 0) {
        pr[j]! *= inv
        nz.push(j)
      }
    }

    for (let i = 0; i < m; i++) {
      if (i === leave) {
        continue
      }

      const f = T[i]![enter]!

      if (f !== 0) {
        const row = T[i]!

        for (const j of nz) {
          row[j]! -= f * pr[j]!
        }
      }
    }

    const f = cost[enter]!

    for (const j of nz) {
      cost[j]! -= f * pr[j]!
    }

    basis[leave] = enter
  }

  return basis
}

// solve M z = v exactly for a square rational M (rows), or null when M is singular
function solveSquare(M: readonly (readonly Q[])[], v: readonly Q[]): Q[] | null {
  const n = v.length
  const a = M.map((row, i) => [...row, v[i]!])

  for (let c = 0; c < n; c++) {
    let p = -1

    for (let i = c; i < n; i++) {
      if (a[i]![c]!.n !== 0n) {
        p = i
        break
      }
    }

    if (p < 0) {
      return null
    }

    ;[a[c], a[p]] = [a[p]!, a[c]!]

    const inv = qdiv(q(1), a[c]![c]!)

    a[c] = a[c]!.map(x => qmul(x, inv))

    for (let i = 0; i < n; i++) {
      if (i !== c && a[i]![c]!.n !== 0n) {
        const f = a[i]![c]!

        a[i] = a[i]!.map((x, j) => qsub(x, qmul(f, a[c]![j]!)))
      }
    }
  }

  return a.map(row => row[n]!)
}

// The double description checked by duality: every ray is in the dual cone, and the dual of the rays' cone has its
// extreme rays all among the given vectors (so no ray was missed: a missing ray would shrink the rays' cone and
// widen its dual past the given cone)
export function raysByDuality(set: readonly (readonly bigint[])[], n: number): boolean {
  const B = extremeRays(set, n)
  const dot = (a: readonly bigint[], b: readonly bigint[]): bigint =>
    a.reduce((t, x, i) => t + x * b[i]!, 0n)
  const keys = new Set(set.map(v => primitiveVector(v).join(',')))

  return (
    B.every(b => set.every(v => dot(v, b) >= 0n)) &&
    extremeRays(B, n).every(c => keys.has(primitiveVector(c).join(',')))
  )
}

export type CertifiedModel = ColumnModel & {
  // the answer came from the float-guessed basis checked exactly (true) or from the exact column program (false)
  guided: boolean
}

// The full program (every ray pair a column) with a floating-point phase I guessing the final basis, then EXACT
// certificates from that basis: x_B = B^-1 rhs checked non-negative with the identity rebuilt exactly, or the phase-I
// duals w = B^-T c_B checked exactly on every pair (y . column >= 0 for all, y . rhs < 0). The floats choose a basis
// and nothing else; when a certificate does not check, the exact column program decides.
export function certifiedModel(input: {
  states: readonly (readonly bigint[])[]
  effects: readonly (readonly bigint[])[]
  n: number
  log?: (stage: string) => void
}): CertifiedModel {
  const log = input.log ?? ((): void => undefined)
  const { n } = input
  const B = extremeRays(input.states, n)
  const A = extremeRays(input.effects, n)
  const columns: bigint[][] = []

  for (const b of B) {
    for (const a of A) {
      const c = new Array<bigint>(n * n)

      for (let r = 0; r < n; r++) {
        for (let s = 0; s < n; s++) {
          c[r * n + s] = b[r]! * a[s]!
        }
      }

      columns.push(c)
    }
  }

  const m = n * n
  const rhs = Array.from({ length: m }, (_, k) =>
    Math.floor(k / n) === k % n ? 1n : 0n,
  )
  log(`rays ${B.length} x ${A.length}`)

  const base = { raysStates: B.length, raysEffects: A.length, rounds: 0, columns: columns.length }
  const seeds: number[] = []

  for (let attempt = 0; attempt < PERTURBATIONS.length; attempt++) {
    const found = certifyBasis({ columns, rhs, m, attempt, log, seeds })

    if (found !== null) {
      return { ...base, rounds: attempt, feasible: found, certified: true, guided: true }
    }
  }

  log('certificate did not check, exact column program')

  const exact = columnModel({ ...input, seeds, maxRounds: 4 })

  return { ...exact, guided: false }
}

// one float-guessed basis and its exact certificates: true (a model), false (a witness) or null (neither checked)
function certifyBasis(input: {
  columns: readonly (readonly bigint[])[]
  rhs: readonly bigint[]
  m: number
  attempt: number
  log: (stage: string) => void
  seeds: number[]
}): boolean | null {
  const { columns, rhs, m, log } = input
  const basis = floatPhaseOne(columns, rhs, input.attempt)

  log(`float phase I done, attempt ${input.attempt}, ${floatPivots} pivots`)

  for (const j of basis) {
    if (j < columns.length && !input.seeds.includes(j)) {
      input.seeds.push(j)
    }
  }

  // sign-normalized rhs is rhs itself (all entries >= 0); the basis matrix, column by column
  const col = (j: number): Q[] =>
    j < columns.length
      ? columns[j]!.map(x => q(x))
      : Array.from({ length: m }, (_, i) => (i === j - columns.length ? q(1) : Q0))
  const basisCols = basis.map(col)
  const rows = Array.from({ length: m }, (_, i) => basisCols.map(c => c[i]!))
  const xB = solveSquare(rows, rhs.map(x => q(x)))

  log(`exact solve done, ${xB ? 'regular' : 'singular'}`)

  if (xB) {
    const nonNegative = xB.every(x => x.n >= 0n)
    const artificialZero = basis.every((j, i) => j < columns.length || xB[i]!.n === 0n)

    if (nonNegative && artificialZero) {
      const sum: Q[] = new Array<Q>(m).fill(Q0)

      basis.forEach((j, i) => {
        if (j < columns.length && xB[i]!.n !== 0n) {
          columns[j]!.forEach((v, k) => {
            if (v !== 0n) {
              sum[k] = qadd(sum[k]!, qmul(xB[i]!, q(v)))
            }
          })
        }
      })

      if (sum.every((x, k) => qcmp(x, q(rhs[k]!)) === 0)) {
        return true
      }
    }

    // the duals: B^T w = c_B, c = 1 on artificials
    const rowsT = basisCols.map(c => c)
    const cB = basis.map(j => (j >= columns.length ? q(1) : Q0))
    const w = solveSquare(rowsT, cB)

    if (w) {
      // y = -w (rhs >= 0, so no sign flips)
      const dot = (c: readonly bigint[]): Q =>
        c.reduce((s, v, k) => (v === 0n || w[k]!.n === 0n ? s : qadd(s, qmul(w[k]!, q(v)))), Q0)
      const allColumns = columns.every(c => dot(c).n <= 0n)
      const value = dot(rhs)

      if (allColumns && value.n > 0n) {
        return false
      }
    }
  }

  return null
}

// does the stabilizer fragment with `states` and `effects` added (signed-whole coordinates) admit a non-negative
// model?
export function oneRoleModel(
  fragment: OneRoleFragment,
  extra: { states: readonly (readonly bigint[])[]; effects: readonly (readonly bigint[])[] },
): CertifiedModel {
  return certifiedModel({
    states: distinctVectors([...fragment.stabilizerStates, ...extra.states]),
    effects: distinctVectors([...fragment.readings, ...extra.effects]),
    n: 9,
  })
}

// the same with exact-cone-lp's symmetric program, for cross-checks on small fragments
export function oneRoleModelSymmetric(
  fragment: OneRoleFragment,
  extra: { states: readonly (readonly bigint[])[]; effects: readonly (readonly bigint[])[] },
): NcResult {
  return noncontextualModel({
    states: distinctVectors([...fragment.stabilizerStates, ...extra.states]),
    effects: distinctVectors([...fragment.readings, ...extra.effects]),
    n: 9,
    perms: fragment.perms,
  })
}

// the one-role states a two-role step makes: the step on every product of stabilizer kets, one role read on a line,
// the other role's conditional state (the line projector on the first role), in signed-whole coordinates
export function conditionalStates(input: {
  gate: CycMatrix
  points: readonly CycMatrix[]
}): bigint[][] {
  const kets = stabilizerKets()
  const lines = kets.map(projector)
  const out: bigint[][] = []

  for (const a of kets) {
    for (const b of kets) {
      const knot = applyGate(input.gate, productKet(a, b))

      for (const pi of lines) {
        out.push(signedWhole(conditionalSecond(knot, pi), input.points))
      }
    }
  }

  return distinctVectors(out)
}

// the one-role readings a two-role step makes: the role meets a fresh role in a stabilizer state by the step, and
// the fresh role is read on a line (code/measure/reconstruction-axioms ancillaReading), in signed-whole coordinates
// Each reading is the three effects of one fresh state and one line basis, kept together; distinct readings only.
export function ancillaReadings(input: {
  gate: CycMatrix
  points: readonly CycMatrix[]
}): bigint[][][] {
  const kets = stabilizerKets()
  const bases = splitBases(kets)
  const seen = new Map<string, bigint[][]>()

  for (const fresh of kets) {
    for (const basis of bases) {
      const r = ancillaReading({ name: '', gate: input.gate, fresh, basis })
      const effects = distinctVectors(
        r.effects.map(e => signedWhole(e, input.points)),
      )
      const key = effects.map(v => v.join(',')).sort().join('|')

      if (!seen.has(key)) {
        seen.set(key, effects)
      }
    }
  }

  return [...seen.values()]
}

const permuteVector = (v: readonly bigint[], p: readonly number[]): bigint[] => {
  const out = new Array<bigint>(v.length)

  for (let i = 0; i < v.length; i++) {
    out[p[i]!] = v[i]!
  }

  return out
}

// one vector per orbit of the point permutations (the least key over the orbit picks it)
export function orbitRepresentatives(
  vs: readonly (readonly bigint[])[],
  perms: readonly (readonly number[])[],
): bigint[][] {
  const seen = new Set<string>()
  const out: bigint[][] = []

  for (const v of vs) {
    const p = primitiveVector(v)
    let least = ''

    for (const g of perms) {
      const k = permuteVector(p, g).join(',')

      if (least === '' || k < least) {
        least = k
      }
    }

    if (!seen.has(least)) {
      seen.add(least)
      out.push(p)
    }
  }

  return out
}

// the knots a two-role step makes from products of stabilizer kets, and the negative points of each one's two-role
// signed whole
export function knotNegativity(input: {
  gate: CycMatrix
  points: readonly CycMatrix[]
}): { knots: number; negativeKnots: number; worst: number } {
  const kets = stabilizerKets()
  const seen = new Set<string>()

  let negativeKnots = 0
  let worst = 0

  for (const a of kets) {
    for (const b of kets) {
      const knot = applyGate(input.gate, productKet(a, b))
      const key = ketKey(knot)

      if (seen.has(key)) {
        continue
      }

      seen.add(key)

      const rho = projector(knot)
      const w = signedWhole(rho, input.points)
      const least = w.reduce((m, x) => (x < m ? x : m), 0n)

      if (least < 0n) {
        negativeKnots++

        // W = Tr(rho A) / 9, Tr(rho A) = numerator / den(rho)
        const value = Number(least) / (9 * Number(rho.den))

        worst = Math.min(worst, value)
      }
    }
  }

  return { knots: seen.size, negativeKnots, worst }
}

// Two qubit fragments in a plane of the Bloch ball, coordinates (1, a) for states and multiples of (1, G a) for
// effects with a in the hexagonal lattice basis, so every chance is an exact integer ratio:
//   the square    4 states at quarter turns and the readings along them: a non-negative model exists (two bits, each
//                 state uniform on the bit it does not fix)
//   the hexagon   6 states at sixth turns and the 3 readings along them with their complements: the parity-oblivious
//                 scenario of Mazurek et al. 2016 and Pusey 2018, which the quantum chances violate, so none exists
export function qubitPlaneFragment(shape: 'square' | 'hexagon'): {
  states: bigint[][]
  effects: bigint[][]
} {
  if (shape === 'square') {
    const a: bigint[][] = [
      [1n, 0n],
      [-1n, 0n],
      [0n, 1n],
      [0n, -1n],
    ]

    return {
      states: a.map(v => [1n, ...v]),
      effects: a.map(v => [1n, ...v]),
    }
  }

  const a: bigint[][] = [
    [1n, 0n],
    [0n, 1n],
    [-1n, 1n],
    [-1n, 0n],
    [0n, -1n],
    [1n, -1n],
  ]

  // a . b = cos of the angle under the Gram matrix [[1, 1/2], [1/2, 1]]; the effect is (2, 2 G a), so s . e = 4 p
  return {
    states: a.map(v => [1n, ...v]),
    effects: a.map(([x, y]) => [2n, 2n * x! + y!, x! + 2n * y!]),
  }
}

// ---- test B: the permutation basis ----

// a Q(w) number num / den
export type EisFraction = { num: Cyc; den: bigint }

const eisZero = (x: EisFraction): boolean => EIS.isZero(x.num)

// tr(U^m) for m = 1..upTo
export function powerTraces(u: CycMatrix, upTo: number): EisFraction[] {
  const out: EisFraction[] = []

  let p = cycIdentity(EIS, u.n)

  for (let m = 1; m <= upTo; m++) {
    p = cycMul(EIS, u, p)

    let s = EIS.zero()

    for (let i = 0; i < u.n; i++) {
      s = EIS.add(s, p.entries[i * u.n + i]!)
    }

    out.push({ num: s, den: p.den })
  }

  return out
}

// tr(P^m) for m = 1..upTo of a permutation given as a table, by following the table (fixed points of P^m)
export function permutationTraces(
  perm: ArrayLike<number>,
  upTo: number,
): EisFraction[] {
  const n = perm.length
  const at = Int32Array.from({ length: n }, (_, i) => i)
  const out: EisFraction[] = []

  for (let m = 1; m <= upTo; m++) {
    let fixed = 0

    for (let j = 0; j < n; j++) {
      at[j] = perm[at[j]!]!

      if (at[j] === j) {
        fixed++
      }
    }

    out.push({ num: [BigInt(fixed), 0n], den: 1n })
  }

  return out
}

const lcmUpTo = (n: number): bigint => {
  let l = 1n

  for (let k = 2n; k <= BigInt(n); k++) {
    l = (l * k) / gcdBig(l, k)
  }

  return l
}

const cycPow = (m: CycMatrix, e: bigint): CycMatrix => {
  let result = cycIdentity(EIS, m.n)
  let base = m
  let k = e

  while (k > 0n) {
    if (k & 1n) {
      result = cycMul(EIS, base, result)
    }

    k >>= 1n

    if (k > 0n) {
      base = cycMul(EIS, base, base)
    }
  }

  return result
}

// U^L a scalar for L = lcm(1..n)
export function finiteOrderModPhases(u: CycMatrix): boolean {
  const p = cycPow(u, lcmUpTo(u.n))
  const n = u.n
  const d = p.entries[0]!

  return p.entries.every((x, i) =>
    Math.floor(i / n) === i % n ? EIS.equal(x, d) : EIS.isZero(x),
  )
}

const mobius = (n: number): number => {
  let m = n
  let sign = 1

  for (let p = 2; p * p <= m; p++) {
    if (m % p === 0) {
      m /= p

      if (m % p === 0) {
        return 0
      }

      sign = -sign
    }
  }

  return m > 1 ? -sign : sign
}

const isqrt = (n: bigint): bigint => {
  if (n < 2n) {
    return n
  }

  let x = n
  let y = (x + 1n) / 2n

  while (y < x) {
    x = y
    y = (x + n / x) / 2n
  }

  return x
}

const eisNorm = (c: Cyc): bigint => c[0]! * c[0]! - c[0]! * c[1]! + c[1]! * c[1]!

export type PermutationSpectrum = {
  // some global phase tried makes the spectrum a permutation's
  permutation: boolean
  // the reading covers every global phase (tr U nonzero), not only the six units of Q(w)
  allPhases: boolean
  // the cycle type found (N_k for k = 1..n), when permutation
  cycleType: number[]
  // why the forced phase failed, for the report
  reason: string
}

// fix(P^m) = tr(U^m) conj(c)^m for a unit c, each a non-negative rational integer, then N_k by Moebius inversion
function cycleTypeFor(
  traces: readonly EisFraction[],
  n: number,
  c: EisFraction,
): { ok: boolean; cycleType: number[]; reason: string } {
  const fix: bigint[] = []
  const cc = { num: EIS.conj(c.num), den: c.den }

  let cm: EisFraction = { num: EIS.one(), den: 1n }

  for (let m = 1; m <= n; m++) {
    cm = { num: EIS.mul(cm.num, cc.num), den: cm.den * cc.den }

    const t = traces[m - 1]!
    const prod = EIS.mul(t.num, cm.num)
    const den = t.den * cm.den

    if (prod[1] !== 0n) {
      return { ok: false, cycleType: [], reason: `fix(P^${m}) not real` }
    }

    if (prod[0]! % den !== 0n) {
      return { ok: false, cycleType: [], reason: `fix(P^${m}) not an integer` }
    }

    const f = prod[0]! / den

    if (f < 0n) {
      return { ok: false, cycleType: [], reason: `fix(P^${m}) negative` }
    }

    fix.push(f)
  }

  const cycleType: number[] = []

  let total = 0n

  for (let k = 1; k <= n; k++) {
    let s = 0n

    for (let d = 1; d <= k; d++) {
      if (k % d === 0) {
        s += BigInt(mobius(k / d)) * fix[d - 1]!
      }
    }

    if (s % BigInt(k) !== 0n || s < 0n) {
      return { ok: false, cycleType: [], reason: `N_${k} = ${s}/${k} is no count` }
    }

    cycleType.push(Number(s / BigInt(k)))
    total += (s / BigInt(k)) * BigInt(k)
  }

  if (total !== BigInt(n)) {
    return { ok: false, cycleType: [], reason: `cycles cover ${total} of ${n} points` }
  }

  return { ok: true, cycleType, reason: '' }
}

const SIX_UNITS: readonly EisFraction[] = [0, 1, 2].flatMap(j => [
  { num: EIS.root(j), den: 1n },
  { num: EIS.scale(EIS.root(j), -1n), den: 1n },
])

// is the spectrum given by its power traces (m = 1..n) c times a permutation's?
export function permutationSpectrum(
  traces: readonly EisFraction[],
  n: number,
): PermutationSpectrum {
  const t1 = traces[0]!

  if (!eisZero(t1)) {
    // fix(P) = |tr U| must be a positive integer, and c = tr U / fix(P)
    const normNum = eisNorm(t1.num)
    const root = isqrt(normNum)

    if (root * root !== normNum || root % t1.den !== 0n) {
      return {
        permutation: false,
        allPhases: true,
        cycleType: [],
        reason: '|tr U| is not an integer',
      }
    }

    const f1 = root / t1.den
    const c: EisFraction = { num: t1.num, den: t1.den * f1 }
    const r = cycleTypeFor(traces, n, c)

    return {
      permutation: r.ok,
      allPhases: true,
      cycleType: r.cycleType,
      reason: r.reason,
    }
  }

  for (const c of SIX_UNITS) {
    const r = cycleTypeFor(traces, n, c)

    if (r.ok) {
      return { permutation: true, allPhases: false, cycleType: r.cycleType, reason: '' }
    }
  }

  return {
    permutation: false,
    allPhases: false,
    cycleType: [],
    reason: 'no unit of Q(w) makes the spectrum a permutation spectrum',
  }
}

// The base step restricted to the orbits of some configurations: the rule is a bijection of configurations
// (E-FND-0082), so each orbit closes, and the union of the orbits is a set the step permutes. Returned as a table
// over that set, with the orbits that did not close within `cap` beats counted and left out.
export function orbitPermutation(input: {
  collision: Collision
  seeds: readonly Will[]
  cap: number
}): { perm: number[]; orbits: number; open: number; longest: number } {
  const index = new Map<string, number>()
  const next: number[] = []
  const key = (w: Will): string => Array.from(w.data).join('')

  let orbits = 0
  let open = 0
  let longest = 0

  for (const seed of input.seeds) {
    if (index.has(key(seed))) {
      continue
    }

    const cycle: Will[] = [seed]
    const startKey = key(seed)

    let w = beat(seed, input.collision)
    let closed = false

    for (let t = 1; t <= input.cap; t++) {
      if (key(w) === startKey) {
        closed = true
        break
      }

      cycle.push(w)
      w = beat(w, input.collision)
    }

    if (!closed) {
      open++
      continue
    }

    orbits++
    longest = Math.max(longest, cycle.length)

    const first = next.length

    cycle.forEach((c, i) => {
      index.set(key(c), first + i)
      next.push(first + ((i + 1) % cycle.length))
    })
  }

  return { perm: next, orbits, open, longest }
}

// the diagonal phase step diag(u, 1) of a norm-one u = num / den in Q(w), as a matrix
export function phaseStep(u: EisFraction): CycMatrix {
  return {
    n: 2,
    entries: [u.num, EIS.zero(), EIS.zero(), [u.den, 0n]],
    den: u.den,
  }
}
