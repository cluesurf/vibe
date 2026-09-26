// Pointer bases and records on the role grid (E-QTM-0154 to E-QTM-0156). MEASUREMENT code: it reads wholes the rule
// makes and never changes the rule.
//
// THE QUESTION. A pointer basis is a basis the environment copies redundantly and does not disturb (Zurek). On the
// role grid a basis is a CLASS of parallel lines (4 classes, 3 lines each), and a record of it is a net line count
// that another token holds. Which class, if any, does the model's own dynamics record?
//
// THE THEOREM, in three parts (proved in E-QTM-0154's header, each part checked there):
//  (A) Frame covariance plus a frame-invariant environment forces the depolarizing channel. The frame changes (the 648
//      of Sigma(648), the 216 grid moves up to phase) form a unitary 2-design: sum |Tr g|^4 = 2 |G|. So the adjoint
//      action on traceless 3 x 3 operators is irreducible, and a channel commuting with it is rho -> lambda rho +
//      (1 - lambda) 1/3 (Schur). Every class decays at one rate: NO pointer basis.
//  (B) A meeting of the model never premeasures. Each kernel is alpha 1 + beta P (P the exchange for like vibes, the
//      singlet projector for a love and a fear), dressed by local displacements in the comoving beat. For a basis b_k
//      and a ready state e, alpha b_k e + beta P(b_k e) is a product only where b_k is parallel to e (exchange) or
//      b_k^T e = 0 (singlet), which three orthonormal b_k never all satisfy unless beta = 0.
//  (C) The environment's own symmetry decides what can be selected. The grid moves fixing a point are transitive on
//      the 4 classes, so a point environment can prefer no class. Those fixing a line fix its class and are transitive
//      on the other 3, so a line environment can prefer its own class and no other.
//
// Conventions: a whole's weights are indexed by the PHASE point 3 a + b (code/rule/fear-weave); two tokens index
// 9 x + y, the first token most significant; a grid move acts on the phase index through phasePermOf.

import { gridMoves } from '@/code/rule/vibe-weave'
import { meetWhole, phasePermOf, translatedOf, type Whole } from '@/code/rule/fear-weave'
import { LINE_CLASSES, marginalOne, permuteTwo } from '@/code/measure/sum-record'
import { sigma648Elements } from '@/code/measure/frame-covariant-meeting'

export type GridLine = { readonly cls: number; readonly points: readonly number[] }

// the 12 lines, class by class (role, tilt, diagonal, antidiagonal), 3 per class
export const GRID_LINES: readonly GridLine[] = LINE_CLASSES.flatMap((c, cls) => c.lines.map(points => ({ cls, points })))

// the class of the line through two distinct phase points
export function classThrough(p: number, q: number): number {
  const i = GRID_LINES.findIndex(l => l.points.includes(p) && l.points.includes(q))

  if (p === q || i < 0) throw new Error('no single line through one point')

  return (GRID_LINES[i] as GridLine).cls
}

// one token opened on a set of points, weight 1 on each
export const onPoints = (points: readonly number[]): bigint[] => Array.from({ length: 9 }, (_, p) => (points.includes(p) ? 1n : 0n))

// the frame-invariant opening: weight 1 on every point (the maximally mixed role, the sum of the 9 point members)
export const UNIFORM: readonly bigint[] = new Array<bigint>(9).fill(1n)

export const unitsOf = (w: readonly bigint[]): bigint => w.reduce((s, x) => s + x, 0n)

// a two-token whole of two one-token weights
export function productOf(a: readonly bigint[], b: readonly bigint[], own: readonly [number, number] = [0, 0]): Whole {
  return { tokens: [0, 1], weight: a.flatMap(x => b.map(y => x * y)), own: [own[0], own[1]] }
}

// one meeting of a two-token whole under a kernel (divisor D), read about the own points (the comoving beat)
export function meetOnce(whole: Whole, kernel: readonly (readonly number[])[], divisor: number): Whole {
  const own = whole.own ?? [0, 0]

  return meetWhole({ whole, a: 0, b: 1, kernel4: translatedOf(kernel, own[0] ?? 0, own[1] ?? 0), divisor, fixed: false }) as Whole
}

// the weights on each line of a class
export const classWeights = (w: readonly bigint[], cls: number): bigint[] =>
  GRID_LINES.filter(l => l.cls === cls).map(l => l.points.reduce((s, p) => s + (w[p] ?? 0n), 0n))

// ---- (A) the 2-design ----

// |Tr g|^2 of every frame change of Sigma(648), rounded and checked integral (MEASUREMENT: the operators are floats),
// with the frame potential sum |Tr g|^4 and the element count
export function framePotential(): { elements: number; potential: number; squares: Map<number, number>; worstRounding: number } {
  const elements = sigma648Elements()
  const squares = new Map<number, number>()
  let potential = 0
  let worstRounding = 0

  for (const m of elements) {
    const re = (m.re[0] ?? 0) + (m.re[4] ?? 0) + (m.re[8] ?? 0)
    const im = (m.im[0] ?? 0) + (m.im[4] ?? 0) + (m.im[8] ?? 0)
    const t = re * re + im * im
    const n = Math.round(t)

    worstRounding = Math.max(worstRounding, Math.abs(t - n))
    squares.set(n, (squares.get(n) ?? 0) + 1)
    potential += n * n
  }

  return { elements: elements.length, potential, squares, worstRounding }
}

// The one-meeting map on the knot's 9 weights with an environment opening e: column x is the knot's marginal after
// the knot, opened as the point member x, meets e. Returned as integers over one common denominator.
export function meetingMap(input: { kernel: readonly (readonly number[])[]; divisor: number; env: readonly bigint[]; own: readonly [number, number]; knotFirst?: boolean }): { columns: bigint[][]; units: bigint } {
  const { kernel, divisor, env, own } = input
  const knotFirst = input.knotFirst !== false
  const columns: bigint[][] = []
  let units = 0n

  for (let x = 0; x < 9; x++) {
    const delta = onPoints([x])
    const w = knotFirst ? productOf(delta, env, own) : productOf(env, delta, [own[1], own[0]])
    const met: Whole = { ...w, weight: rawMeet(w.weight, translatedOf(kernel, w.own?.[0] ?? 0, w.own?.[1] ?? 0)) }
    const m = marginalOne(met, knotFirst ? 0 : 1)

    columns.push(m)
    units = unitsOf(m)
  }

  // every column carries the same units, U(env) times the divisor (a kernel keeps the weight)
  if (units !== unitsOf(env) * BigInt(divisor)) throw new Error('a kernel did not keep the weight')

  return { columns, units }
}

// a kernel applied to 81 two-token weights with no division and no reduction: the units are multiplied by the divisor
export function rawMeet(w: readonly bigint[], kernel: readonly (readonly number[])[]): bigint[] {
  return Array.from({ length: 81 }, (_, r) => {
    const row = kernel[r] ?? []
    let m = 0n

    for (let c = 0; c < 81; c++) {
      const k = row[c] ?? 0

      if (k !== 0 && (w[c] ?? 0n) !== 0n) m += BigInt(k) * (w[c] as bigint)
    }

    return m
  })
}

// whether a map is lambda id + (1 - lambda) flat, and lambda as num / den (exact)
export function depolarizingFactor(map: { columns: bigint[][]; units: bigint }): { depolarizing: boolean; num: bigint; den: bigint } {
  // column x = lambda U delta_x + (1 - lambda) U / 9 on every point: off-diagonal entries all equal c, diagonal d, so
  // lambda = (d - c) / U, and every column must repeat the same (d, c)
  const d = map.columns[0]?.[0] ?? 0n
  const c = map.columns[0]?.[1] ?? 0n
  let depolarizing = true

  map.columns.forEach((col, x) => col.forEach((v, y) => (depolarizing = depolarizing && v === (x === y ? d : c))))

  return { depolarizing, num: d - c, den: map.units }
}

// apply a map to a knot opening (weights w over its units)
export function applyMap(map: { columns: bigint[][] }, w: readonly bigint[]): bigint[] {
  const out = new Array<bigint>(9).fill(0n)

  w.forEach((wx, x) => (map.columns[x] as bigint[]).forEach((v, y) => (out[y] = (out[y] as bigint) + wx * v)))

  return out
}

// ---- (B) premeasurement ----

// Does a two-token step premeasure class `cls` from the ready line `ready`: for each of the class's 3 lines, the
// knot opened on it is left on it exactly, uncorrelated with the environment (the joint a product), and the three
// environment marginals are pairwise different. The step is given as a function of a two-token whole.
export function premeasures(step: (w: Whole) => Whole, cls: number, ready: readonly bigint[]): { record: boolean; undisturbed: number; product: number; distinctRecords: number } {
  const records: string[] = []
  let undisturbed = 0
  let product = 0

  for (const line of GRID_LINES.filter(l => l.cls === cls)) {
    const start = onPoints(line.points)
    const met = step(productOf(start, ready))
    const s = marginalOne(met, 0)
    const e = marginalOne(met, 1)
    const u = unitsOf(met.weight)
    const us = unitsOf(start)

    if (s.every((v, p) => v * us === (start[p] as bigint) * u)) undisturbed++
    if (met.weight.every((v, i) => v * u === (s[Math.floor(i / 9)] as bigint) * (e[i % 9] as bigint))) product++

    const g = e.reduce((acc, v) => gcdBig(acc, v), 0n) || 1n

    records.push(e.map(v => (v / g).toString()).join(','))
  }

  const distinctRecords = new Set(records).size

  return { record: undisturbed === 3 && product === 3 && distinctRecords === 3, undisturbed, product, distinctRecords }
}

function gcdBig(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) [x, y] = [y, x % y]

  return x
}

// a two-token step from an 81-point permutation (a Clifford, such as a SUM reader)
export const permutationStep = (perm: ArrayLike<number>) => (w: Whole): Whole => permuteTwo(w, 0, 1, perm)

// a two-token step from a kernel, read about the given own points
export const kernelStep = (kernel: readonly (readonly number[])[], divisor: number, own: readonly [number, number]) => (w: Whole): Whole =>
  meetOnce({ ...w, own: [own[0], own[1]] }, kernel, divisor)

// ---- (C) stabilizers ----

// the phase permutations of the 216 grid moves
export function phaseMoves(): number[][] {
  return gridMoves().act.map(a => phasePermOf(a))
}

// the class a phase permutation carries class k to
export function classImage(perm: readonly number[], k: number): number {
  const line = GRID_LINES.find(l => l.cls === k) as GridLine
  const image = line.points.map(p => perm[p] as number)

  return classThrough(image[0] as number, image[1] as number)
}

// the orbits of a set of phase permutations on the 4 classes
export function classOrbits(perms: readonly (readonly number[])[]): number[][] {
  const seen = new Set<number>()
  const out: number[][] = []

  for (let k = 0; k < 4; k++) {
    if (seen.has(k)) continue

    const orbit = [k]

    seen.add(k)

    for (let i = 0; i < orbit.length; i++) {
      for (const p of perms) {
        const j = classImage(p, orbit[i] as number)

        if (!seen.has(j)) {
          seen.add(j)
          orbit.push(j)
        }
      }
    }

    out.push(orbit.sort())
  }

  return out
}

// the moves fixing a set of points (as a set)
export const stabilizerOf = (perms: readonly (readonly number[])[], set: readonly number[]): number[][] =>
  perms.filter(p => set.every(x => set.includes(p[x] as number)))
