// CAN A SIGMA(648) COLOUR FIELD CARRY A WALL INDEX (E-FRC-0291, moving-matter item 0029, decision 003)? The pieces of
// the instrument: the colour group's conjugacy classes with their eigenphases, the bulk-window check at a uniform U(1)
// flux, and the per-component wall flow of a field built from one element's powers. The flow itself is E-SPN-0168's
// wallFlow and levelsNearPi (code/measure/wall-face), reused unchanged.
//
//   sigma648            the group, by closure from Grimus and Ludl's generators (code/algebra/group/su3-subgroups)
//   eigenTurns          the three eigenphases of an element, in turns reduced to (-1/2, 1/2], as exact fractions: each
//                       multiplicity is the character projection (1 / n) sum_j Tr(g^j) e^(-2 pi i j k / n), an integer
//                       read to 1e-9 (the traces are floats of the group table; the fractions are exact)
//   sigmaClasses        every conjugacy class: size, order, eigenphases, level round(6 (1 - Re Tr g / 3))
//   registerSets        the two piece sets of E-SPN-0168's slab, the E-SPN-0160 register rule (index 0) and the Wilson
//                       schedule (index 1), half 0, member unit ringUnit(-2, 5)
//   bulkWindow          the two-class bulk slabs (all Wilson, all E-SPN-0160) in a uniform field of flux p / qa per (0, 1)
//                       cell: every level within `window` of pi at `nK2` values of k2, and whether every search completed
//   linkPattern         the field on the walk's own links. A D4 hop r from x0 = a carries the Landau line integral B r1 (a
//                       + r0 / 2), half a cell's flux on a diagonal hop, so the link is h^(r1 (2 a + r0)) with h the
//                       element whose square is the cell holonomy: the field lives in the cyclic group of h, and each
//                       colour component c carries a cell flux 2 theta_c, theta_c an eigenphase of h. The check reads,
//                       for every hop and every class a, the group element h^m from the product table and compares its
//                       complex trace with the sum of the component phases the U(1) slabs use
//
// DETERMINISM: no random numbers. EXACT: group membership is a product-table index and the eigenphases are fractions;
// the spectra are floats, as measurement.

import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import {
  generateGroup,
  type FiniteGroup,
} from '@/code/dynamics/finite-gauge'
import { actionLevels } from '@/code/dynamics/finite-kinetic'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import {
  partnerProjector48,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  sectorBasis,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPieces } from '@/code/measure/chiral-flow'
import {
  wilsonSchedule,
  type HalfSet,
  type Slab,
  type Unit,
} from '@/code/measure/wilson-register'
import {
  levelsNearPi,
  wallFlow,
  type WallFlow,
} from '@/code/measure/wall-face'

// ---- fractions ----

export type Frac = { num: number; den: number }

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a)
  let y = Math.abs(b)

  while (y) {
    const t = x % y

    x = y
    y = t
  }

  return x
}

export const frac = (num: number, den: number): Frac => {
  if (num === 0) {
    return { num: 0, den: 1 }
  }

  const g = gcd(num, den) * Math.sign(den)

  return { num: num / g, den: den / g }
}

// a fraction of a turn reduced to (-1/2, 1/2]
export const reduceTurn = (f: Frac): Frac => {
  let n = ((f.num % f.den) + f.den) % f.den

  if (2 * n > f.den) {
    n -= f.den
  }

  return frac(n, f.den)
}

export const fracText = (f: Frac): string =>
  f.num === 0 ? '0' : f.den === 1 ? `${f.num}` : `${f.num}/${f.den}`

export const fracValue = (f: Frac): number => f.num / f.den

export const fracKey = (f: Frac): string => `${f.num}/${f.den}`

// ---- the group ----

export const sigma648 = (): FiniteGroup =>
  generateGroup({ generators: [...SU3_SUBGROUPS.sigma648.generators] })

export const traceIm = (group: FiniteGroup, g: number): number => {
  const m = group.matrices[g]!

  return m[1]! + m[9]! + m[17]!
}

export const times = (group: FiniteGroup, g: number, h: number): number =>
  group.product[g * group.order + h]!

// g^m for any integer m (a negative power through the order), read from the product table
export function power(group: FiniteGroup, g: number, m: number): number {
  const n = elementOrder(group, g)
  const e = ((m % n) + n) % n

  let out = group.identity

  for (let j = 0; j < e; j++) {
    out = times(group, out, g)
  }

  return out
}

export function elementOrder(group: FiniteGroup, g: number): number {
  let x = g
  let n = 1

  while (x !== group.identity) {
    x = times(group, x, g)
    n++
  }

  return n
}

export type EigenRead = { phases: Frac[]; worst: number }

// the three eigenphases of g in turns, reduced to (-1/2, 1/2] and sorted, with the worst distance of a projected
// multiplicity from its integer
export function eigenTurns(group: FiniteGroup, g: number): EigenRead {
  const n = elementOrder(group, g)
  const tr: [number, number][] = []

  let x = group.identity

  for (let j = 0; j < n; j++) {
    tr.push([group.trace[x]!, traceIm(group, x)])
    x = times(group, x, g)
  }

  const phases: Frac[] = []

  let worst = 0

  for (let k = 0; k < n; k++) {
    let re = 0
    let im = 0

    for (let j = 0; j < n; j++) {
      const a = (-2 * Math.PI * j * k) / n
      const [tr0, tr1] = tr[j]!

      re += tr0 * Math.cos(a) - tr1 * Math.sin(a)
      im += tr0 * Math.sin(a) + tr1 * Math.cos(a)
    }

    re /= n
    im /= n

    const mult = Math.round(re)

    worst = Math.max(worst, Math.abs(re - mult), Math.abs(im))

    for (let c = 0; c < mult; c++) {
      phases.push(reduceTurn(frac(k, n)))
    }
  }

  if (phases.length !== 3) {
    throw new Error(`element ${g}: ${phases.length} eigenphases`)
  }

  phases.sort((a, b) => fracValue(a) - fracValue(b))

  return { phases, worst }
}

export type SigmaClass = {
  rep: number
  size: number
  order: number
  phases: Frac[]
  level: number
  // the largest |phase|, and the cell fluxes 2 theta of a field whose links are powers of the class's elements
  maxAbs: Frac
  cell: Frac[]
  maxCell: Frac
  // the class of rep^2, the field's cell holonomy
  square: number
}

const absFrac = (f: Frac): Frac => frac(Math.abs(f.num), f.den)

export function sigmaClasses(group: FiniteGroup): {
  classes: SigmaClass[]
  classOf: Int32Array
  worst: number
} {
  const classOf = new Int32Array(group.order).fill(-1)
  const levels = actionLevels({ group, scale: 6 })
  const reps: number[] = []
  const sizes: number[] = []

  for (let g = 0; g < group.order; g++) {
    if (classOf[g]! >= 0) {
      continue
    }

    const id = reps.length

    reps.push(g)

    let size = 0

    for (let x = 0; x < group.order; x++) {
      const c = times(group, times(group, x, g), group.inverse[x]!)

      if (classOf[c]! < 0) {
        classOf[c] = id
        size++
      }
    }

    sizes.push(size)
  }

  let worst = 0

  const classes = reps.map((rep, i) => {
    const e = eigenTurns(group, rep)

    worst = Math.max(worst, e.worst)

    const cell = e.phases.map(t => frac(2 * t.num, t.den))
    const maxOf = (fs: Frac[]): Frac =>
      fs
        .map(absFrac)
        .reduce((a, b) => (fracValue(b) > fracValue(a) ? b : a))

    return {
      rep,
      size: sizes[i]!,
      order: elementOrder(group, rep),
      phases: e.phases,
      level: levels[rep]!,
      maxAbs: maxOf(e.phases),
      cell,
      maxCell: maxOf(cell),
      square: classOf[times(group, rep, rep)]!,
    }
  })

  return { classes, classOf, worst }
}

// ---- the register slab's piece sets ----

const HEAVY: Unit = [-2, 5]

const unitValue = (kj: Unit): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

// [E-SPN-0160 register rule, Wilson schedule], half 0, member unit ringUnit(-2, 5), E-SPN-0168's default Wilson unit
export function registerSets(): HalfSet[] {
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const basis = sectorBasis(volumeRight())
  const u = unitValue(HEAVY)

  return [
    {
      pieces: halfPieces(
        wilsonSchedule(qS, qD, u, { wilson: false }),
        basis,
        0,
      ).pieces,
    },
    {
      pieces: halfPieces(
        wilsonSchedule(qS, qD, u, { wilson: true }),
        basis,
        0,
      ).pieces,
    },
  ]
}

// ---- the bulk window ----

export type Momentum = { k0: number; k1: number; k2Start: number }

export type BulkRead = {
  count: number
  complete: boolean
  nearest: number
  worstEigen: number
}

// the two-class bulk slabs at flux p / qa per cell: the levels within `window` of pi at the given k2 values
export function bulkWindow(
  sets: readonly HalfSet[],
  flux: Frac,
  at: Momentum,
  k2s: readonly number[],
  window: number,
  lanczosSteps: number,
): BulkRead {
  let count = 0
  let complete = true
  let nearest = Infinity
  let worstEigen = 0

  for (const profile of [
    [1, 1],
    [0, 0],
  ]) {
    for (const k2 of k2s) {
      const r = levelsNearPi(
        { L: 2, qa: flux.den, p: flux.num, profile },
        sets,
        [at.k0, at.k1, k2, 0],
        DOCK_ROOTS,
        window,
        lanczosSteps,
      )

      count += r.levels.length
      complete = complete && r.complete
      worstEigen = Math.max(worstEigen, r.eigenResidual)

      for (const l of r.levels) {
        nearest = Math.min(nearest, Math.abs(l.offset))
      }
    }
  }

  return { count, complete, nearest, worstEigen }
}

// the loop's k2 values, k2Start + 2 pi j / n
export const loopK2 = (k2Start: number, n: number): number[] =>
  Array.from({ length: n }, (_, j) => k2Start + (2 * Math.PI * j) / n)

// ---- the field on the walk's links ----

export type LinkCheck = {
  links: number
  worstTrace: number
  inGroup: boolean
}

// for every hop root r and class a in 0 .. Q - 1: the link h^(r1 (2 a + r0)) read from the group table, its complex
// trace against sum_c exp(i pi cell_c r1 (2 a + r0)), the phases the U(1) component slabs carry
export function linkPattern(
  group: FiniteGroup,
  h: number,
  cell: readonly Frac[],
  Q: number,
): LinkCheck {
  let links = 0
  let worstTrace = 0
  let inGroup = true

  for (const r of DOCK_ROOTS) {
    for (let a = 0; a < Q; a++) {
      const m = r[1]! * (2 * a + r[0]!)
      const g = power(group, h, m)

      inGroup = inGroup && g >= 0 && g < group.order

      let re = 0
      let im = 0

      for (const f of cell) {
        const ph = (Math.PI * f.num * m) / f.den

        re += Math.cos(ph)
        im += Math.sin(ph)
      }

      worstTrace = Math.max(
        worstTrace,
        Math.hypot(group.trace[g]! - re, traceIm(group, g) - im),
      )
      links++
    }
  }

  return { links, worstTrace, inGroup }
}

// ---- one component's flow ----

export type ComponentFlow = {
  cell: Frac
  Q: number
  p: number
  L: number
  flow: WallFlow
}

// the wall flow of one colour component, a uniform U(1) field of cell flux `cell` on a slab with magnetic period Q
// (a multiple of cell's denominator), depth L, the Wilson schedule on the first L / 2 classes; wall A's labeling
// classes are E-SPN-0168's L / 2 classes about the wall between class L / 2 - 1 and L / 2
export function componentFlow(
  sets: readonly HalfSet[],
  cell: Frac,
  Q: number,
  L: number,
  at: Momentum,
  loopSteps: number,
  window: number,
  lanczosSteps: number,
): ComponentFlow {
  const p = (cell.num * Q) / cell.den

  if (!Number.isInteger(p)) {
    throw new Error(`Q ${Q} is not a multiple of ${fracText(cell)}`)
  }

  const wil = L / 2
  const slab: Slab = {
    L,
    qa: Q,
    p,
    profile: Array.from({ length: L }, (_, i) => (i < wil ? 1 : 0)),
  }
  const aDepths = new Set(
    Array.from(
      { length: L / 2 },
      (_, i) => (Math.round(wil / 2) + i) % L,
    ),
  )
  const flow = wallFlow(
    slab,
    sets,
    at.k0,
    at.k1,
    at.k2Start,
    loopSteps,
    DOCK_ROOTS,
    aDepths,
    window,
    lanczosSteps,
    window,
  )

  return { cell, Q, p, L, flow }
}
