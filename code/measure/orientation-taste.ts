// THE DOCK ORIENTATION SIGN AND THE TWO CLASSES IT MAKES, on a labelled region of the true mesh (or the flat box, as the
// control). The one labelling {3,4,3,4} admits reverses orientation at every step (E-FRC-0272), so each dock carries a
// sign e(x) = det f_x, and a rule written in labels holds its register half J = +1 left-handed where e = +1 and
// right-handed where e = -1. This module reads that sign and what it does to the register rule of
// code/measure/cusp-register:
//
//   graphParity          breadth-first distances from dock 0 and the neighbour pairs of EQUAL distance parity (0 exactly
//                        when the graph is bipartite; a triangle, as on the flat D4 mesh, makes some)
//   orientationSigns     e(x) = sign det f_x for every dock of a labelled region
//   physicalHalves       the weight on the physical halves e(x) J = +1 and -1: the register read in an oriented frame.
//                        The frame change is dock-local (one reflection's minors on the docks with e = -1), and a
//                        reflection's minors anticommute with J, so the oriented frame's J is e(x) J (g J = det(g) J g)
//   labelHalves          the weight on the label halves J = +1 and -1
//   classWeights         the weight on the docks with e = +1 and with e = -1
//   restrictToClass      a state kept only on the docks of one sign
//   localGaugeMove       every slot of dock x turned by Gamma(h_x) of code/measure/register-link-field (the SU(2)+ move)
//   loopHolonomies       every closed walk of four steps through dock 0, with the parallel transport carried round it and
//                        read back in the base cell's labels: the Levi-Civita holonomy the labelling hides
//   halfBandEigenvalues  the eigenvalues of a dense 192 x 192 cycle on one label half that are not flat (not 1)
//   jordanRoots          the two roots of l^2 - (a + b + (a - 1)(b - 1) mu) l + a b: the cycle (1 + (b - 1) P)(1 + (a - 1) Q)
//                        on one Jordan block whose projectors overlap by mu (E-SPN-0180's law, with the two beats' phases
//                        a and b free rather than conjugate)
//   chiralSchedules      the schedules of E-FRC-0272 (achiral, label chiral, orientation-reading) and the label rules that
//                        the orientation-reading and orientation-weighted rules become on one class
//
// DETERMINISM: no random numbers. EXACT where it can be: signs, parities and permutations are integers; amplitudes and
// frames are floats, as measurement. NOTHING MOVES: every read here is of values a rule has already placed.

import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import type { CMatrix } from '@/code/measure/dock-mixer'
import type { PieceSpec, State, Unit } from '@/code/measure/cusp-register'
import { slotPermutation } from '@/code/measure/hyperbolic-lines'
import {
  frameInverse,
  labelTransports,
  type LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import type { LabelledRegion } from '@/code/substrate/coxeter/labelled-region'
import {
  determinant,
  identity,
  matMul,
  type Mat,
} from '@/code/substrate/coxeter/minkowski'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG

// ---- the sign and the graph ----

export function graphParity(
  cells: number,
  neighbour: Int32Array,
): { distance: Int32Array; equalParityPairs: number; reached: number } {
  const distance = new Int32Array(cells).fill(-1)
  const queue = [0]

  distance[0] = 0

  for (let head = 0; head < queue.length; head++) {
    const x = queue[head]!

    for (let d = 0; d < SLOTS; d++) {
      const n = neighbour[x * SLOTS + d]!

      if (n >= 0 && distance[n] === -1) {
        distance[n] = distance[x]! + 1
        queue.push(n)
      }
    }
  }

  let equalParityPairs = 0

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const n = neighbour[x * SLOTS + d]!

      if (n >= 0 && distance[x]! >= 0 && distance[n]! >= 0) {
        if ((distance[x]! - distance[n]!) % 2 === 0) {
          equalParityPairs++
        }
      }
    }
  }

  return { distance, equalParityPairs, reached: queue.length }
}

export const orientationSigns = (frames: readonly Mat[]): Int8Array =>
  Int8Array.from(frames, f => (determinant(f) > 0 ? 1 : -1))

// ---- reads of a state ----

// the weight of (1 + s J) / 2 on one slot's 8 register values at offset o
function halfWeight(
  s: State,
  o: number,
  sign: number,
  J: readonly (readonly number[])[],
): number {
  let t = 0

  for (let a = 0; a < REG; a++) {
    let re = s.re[o + a]!
    let im = s.im[o + a]!
    const row = J[a]!

    for (let b = 0; b < REG; b++) {
      const x = row[b]!

      if (x !== 0) {
        re += sign * x * s.re[o + b]!
        im += sign * x * s.im[o + b]!
      }
    }

    t += (re / 2) ** 2 + (im / 2) ** 2
  }

  return t
}

// weight on the halves e(x) J = +1 and -1 (the oriented frame), or J = +1 and -1 when every sign is +1
export function physicalHalves(
  s: State,
  signs: Int8Array,
  J: readonly (readonly number[])[],
): { plus: number; minus: number } {
  let plus = 0
  let minus = 0

  for (let x = 0; x < signs.length; x++) {
    const e = signs[x]!

    for (let d = 0; d < SLOTS; d++) {
      const o = (x * SLOTS + d) * REG

      plus += halfWeight(s, o, e, J)
      minus += halfWeight(s, o, -e, J)
    }
  }

  return { plus, minus }
}

export const labelHalves = (
  s: State,
  cells: number,
  J: readonly (readonly number[])[],
): { plus: number; minus: number } =>
  physicalHalves(s, new Int8Array(cells).fill(1), J)

export function classWeights(
  s: State,
  signs: Int8Array,
): { plus: number; minus: number } {
  let plus = 0
  let minus = 0

  for (let x = 0; x < signs.length; x++) {
    let t = 0

    for (let k = x * MODES; k < (x + 1) * MODES; k++) {
      t += s.re[k]! ** 2 + s.im[k]! ** 2
    }

    if (signs[x]! > 0) {
      plus += t
    } else {
      minus += t
    }
  }

  return { plus, minus }
}

export function restrictToClass(s: State, signs: Int8Array, keep: 1 | -1): State {
  const out: State = { re: Float64Array.from(s.re), im: Float64Array.from(s.im) }

  for (let x = 0; x < signs.length; x++) {
    if (signs[x] !== keep) {
      out.re.fill(0, x * MODES, (x + 1) * MODES)
      out.im.fill(0, x * MODES, (x + 1) * MODES)
    }
  }

  return out
}

// every slot of dock x turned by Gamma(h_x) = gamma4[h_x] / 4 (integer matrices, so the move is exact up to the / 4)
export function localGaugeMove(
  s: State,
  cells: number,
  gamma4: readonly (readonly (readonly number[])[])[],
  choose: (x: number) => number,
): State {
  const out: State = {
    re: new Float64Array(s.re.length),
    im: new Float64Array(s.im.length),
  }

  for (let x = 0; x < cells; x++) {
    const g = gamma4[choose(x)]!

    for (let d = 0; d < SLOTS; d++) {
      const o = (x * SLOTS + d) * REG

      for (let a = 0; a < REG; a++) {
        let re = 0
        let im = 0

        for (let b = 0; b < REG; b++) {
          const w = g[a]![b]!

          if (w !== 0) {
            re += w * s.re[o + b]!
            im += w * s.im[o + b]!
          }
        }

        out.re[o + a] = re / 4
        out.im[o + a] = im / 4
      }
    }
  }

  return out
}

// ---- the holonomy the labels hide ----

export type LoopHolonomy = {
  labels: number[]
  // the parallel-transported frame after the loop (it fixes the base center)
  holonomy: Mat
  // the label frame after the loop (the identity on a consistent labelling)
  closes: boolean
  // the holonomy's label action, a permutation of the 24 slots (undefined if it is not one)
  slots: Int32Array | undefined
}

// every closed walk dock 0 -> a -> b -> c -> dock 0 over four distinct docks; the frame f steps by the antipodal
// transports, the parallel frame e by the translation along each step, f tau_T f^-1
export function loopHolonomies(input: {
  coin: LabelledCoin
  region: LabelledRegion
}): LoopHolonomy[] {
  const { coin, region } = input
  const tA = labelTransports({ coin, kind: 'antipodal' })
  const tT = labelTransports({ coin, kind: 'translation' })
  const nb = region.neighbour
  const out: LoopHolonomy[] = []
  const n = coin.frame.center.length
  const I = identity(n)
  const inverse = (g: Mat): Mat => frameInverse(coin, g)

  for (let d1 = 0; d1 < SLOTS; d1++) {
    const a = nb[d1]!

    if (a < 0) {
      continue
    }

    for (let d2 = 0; d2 < SLOTS; d2++) {
      const b = nb[a * SLOTS + d2]!

      if (b < 0 || b === 0) {
        continue
      }

      for (let d3 = 0; d3 < SLOTS; d3++) {
        const c = nb[b * SLOTS + d3]!

        if (c < 0 || c === 0 || c === a) {
          continue
        }

        for (let d4 = 0; d4 < SLOTS; d4++) {
          if (nb[c * SLOTS + d4] !== 0) {
            continue
          }

          const labels = [d1, d2, d3, d4]

          let f = I
          let e = I

          for (const d of labels) {
            e = matMul(matMul(matMul(f, tT[d]!), inverse(f)), e)
            f = matMul(f, tA[d]!)
          }

          const closes = f.every((r, i) =>
            r.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < 1e-6),
          )

          out.push({
            labels,
            holonomy: e,
            closes,
            slots: slotPermutation(coin, e),
          })
        }
      }
    }
  }

  return out
}

// ---- the band on one half ----

// the eigenvalues of U restricted to the label half s J = +1 (U commutes with J on every slot) that are farther than
// `flat` from 1
export function halfBandEigenvalues(
  U: CMatrix,
  J: readonly (readonly number[])[],
  sign: 1 | -1,
  flat = 1e-6,
): [number, number][] {
  // U P, P = (1 + s J) / 2 on every slot's 8 values
  const re = new Float64Array(MODES * MODES)
  const im = new Float64Array(MODES * MODES)

  for (let i = 0; i < MODES; i++) {
    for (let d = 0; d < SLOTS; d++) {
      for (let b = 0; b < REG; b++) {
        let sr = 0
        let si = 0

        for (let a = 0; a < REG; a++) {
          const p = ((a === b ? 1 : 0) + sign * J[a]![b]!) / 2

          if (p !== 0) {
            sr += U.re[i * MODES + d * REG + a]! * p
            si += U.im[i * MODES + d * REG + a]! * p
          }
        }

        re[i * MODES + d * REG + b] = sr
        im[i * MODES + d * REG + b] = si
      }
    }
  }

  const ev = complexEigenvalues({ re, im, n: MODES })

  return ev.re
    .map((x, i): [number, number] => [x, ev.im[i]!])
    .filter(
      ([x, y]) => Math.hypot(x, y) > 0.5 && Math.hypot(x - 1, y) > flat,
    )
}

const cmul = (a: Unit, b: Unit): [number, number] => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

// the roots of l^2 - t l + p, t = a + b + (a - 1)(b - 1) mu, p = a b
export function jordanRoots(
  a: Unit,
  b: Unit,
  mu: number,
): [[number, number], [number, number]] {
  const am: Unit = [a[0] - 1, a[1]]
  const bm: Unit = [b[0] - 1, b[1]]
  const ab = cmul(am, bm)
  const t: [number, number] = [
    a[0] + b[0] + ab[0] * mu,
    a[1] + b[1] + ab[1] * mu,
  ]
  const p = cmul(a, b)
  // disc = t^2 - 4 p, sqrt by the principal branch
  const t2 = cmul(t, t)
  const dr = t2[0] - 4 * p[0]
  const di = t2[1] - 4 * p[1]
  const r = Math.sqrt(Math.hypot(dr, di))
  const h = Math.atan2(di, dr) / 2
  const sq: [number, number] = [r * Math.cos(h), r * Math.sin(h)]

  return [
    [(t[0] + sq[0]) / 2, (t[1] + sq[1]) / 2],
    [(t[0] - sq[0]) / 2, (t[1] - sq[1]) / 2],
  ]
}

// the largest distance from each measured eigenvalue to the nearest predicted one, and each predicted one's count
// among the measured (to `tol`)
export function matchEigenvalues(
  measured: readonly (readonly [number, number])[],
  predicted: readonly (readonly [number, number])[],
  tol: number,
): { worst: number; counts: number[] } {
  let worst = 0

  const counts = predicted.map(() => 0)

  for (const m of measured) {
    let best = Number.POSITIVE_INFINITY
    let at = -1

    predicted.forEach((p, k) => {
      const g = Math.hypot(m[0] - p[0], m[1] - p[1])

      if (g < best) {
        best = g
        at = k
      }
    })

    worst = Math.max(worst, best)

    if (best <= tol) {
      counts[at]!++
    }
  }

  return { worst, counts }
}

// ---- the schedules ----

export const conjUnit = (u: Unit): Unit => [u[0], -u[1]]

const S = (plus: Unit, minus: Unit): PieceSpec => ({ sector: 'S', plus, minus })
// the D piece carries the conjugate unit (E-SPN-0160's schedule): D(a, b) puts conj(a) on half + and conj(b) on half -
const D = (plus: Unit, minus: Unit): PieceSpec => ({
  sector: 'D',
  plus: conjUnit(plus),
  minus: conjUnit(minus),
})

export type ChiralSchedules = {
  // E-SPN-0160's piece, one unit on both halves
  achiral: PieceSpec[][]
  // E-FRC-0258's chiral mass, written in labels
  label: PieceSpec[][]
  // E-FRC-0272's orientation-reading mass: class 0 (e = +1) as the label rule, class 1 with the halves' units traded
  geometric: PieceSpec[][]
  // the orientation-weighted identity: the achiral unit u where e = +1 and conj(u) where e = -1
  weighted: PieceSpec[][]
  // what the orientation-reading rule is on the class that starts on e = +1 docks, and on the class that starts on
  // e = -1 docks: rules written in labels (one class per dock)
  geometricEven: PieceSpec[][]
  geometricOdd: PieceSpec[][]
  weightedEven: PieceSpec[][]
  weightedOdd: PieceSpec[][]
}

export function chiralSchedules(plus: Unit, minus: Unit): ChiralSchedules {
  const bar = conjUnit(plus)

  return {
    achiral: [[S(plus, plus)], [D(plus, plus)]],
    label: [[S(plus, minus)], [D(plus, minus)]],
    geometric: [
      [S(plus, minus), S(minus, plus)],
      [D(plus, minus), D(minus, plus)],
    ],
    weighted: [
      [S(plus, plus), S(bar, bar)],
      [D(plus, plus), D(bar, bar)],
    ],
    // beat 1 on e = +1 docks (class 0), beat 2 on e = -1 docks (class 1)
    geometricEven: [[S(plus, minus)], [D(minus, plus)]],
    geometricOdd: [[S(minus, plus)], [D(plus, minus)]],
    weightedEven: [[S(plus, plus)], [D(bar, bar)]],
    weightedOdd: [[S(bar, bar)], [D(plus, plus)]],
  }
}
