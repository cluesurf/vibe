// THE CHARGE OF A MEMBER, OF A WALL LEVEL AND OF THE JOIN CHANNEL (E-SPN-0189, OPEN-MAT-01, which blocks OPEN-MAT-02).
// Three routes of note/research/vibe/roadmap/routes/matter-forces-numbers.md ask the same reading, each in minutes:
//  - line 160, "the wall member is the electron": read E-SPN-0168's wall member's (love - fear)/3 charge and its turn
//    sign; killed if "charge 0 or fractional on every light wall level".
//  - line 163, "the register member alone": E-SPN-0160's member's charge and spin per half on the register rule; killed
//    if "charge not one in either half".
//  - line 573, "E-FRC-0273's channel as Fermi's contact": the charge of the S -> D channel's in and out pairs; killed if
//    "no channel changes charge, so it is a neutral current".
// Dropped, and why: line 161 (the census of gauge invariant states up to two members on the slab) is hours, not minutes,
// and is a composition; line 574 (a rishon rearrangement) and line 523 (a W-shaped two-body transition) need a new
// piece; lines 522 and 665 (the trace and the hypercharge table) belong to other open items. What this file finds for
// line 161 is read, not gated (READ below).
//
// WHAT IS RUN. The charge (love - fear)/3 is the vibe count in thirds (E-FRC-0243, code/measure/charge-count: love +1,
// fear -1, calm 0, Q = (love - fear)/3). On the register rule the tone is a species label, not a register component
// (E-FND-0160): the love field and the fear field each fill their own full sea, a hole of the love sea is a fear-tone
// member (one vibe, -1), a hole of the fear sea a love-tone member (+1), and every register piece acts as (x) 1 on the
// tone. So the one-body charge is q = 1 (x) diag(+1/3, -1/3) on (slot, register) (x) tone, and a member's charge
// relative to the sea is minus the charge of the mode it empties. This file lifts the rule's own one-body cycles to the
// two tones, diagonalizes the lifted cycle with the generic unitary solver (which mixes the tones inside each degenerate
// level arbitrarily), and reads the spectrum of q compressed to every light level: the charges a level can carry. It
// does the same for the join channel's in and out pairs, reads the exact Fock count, and reads every conserved one-body
// charge the register itself could carry (the commutant), against Furey's number operator (the route's prior art).
//
// DERIVED BEFORE THE GATE RUN.
// 1. A MEMBER IS ONE VIBE (L1). One hole of the full sea is the member (E-SPN-0163, Jacobi), and a hole removes one
//    mode, one vibe of one tone: Q = -1/3 for a love-sea hole, +1/3 for a fear-sea hole. The full seas carry 3Q = 8 - 8
//    = 0 per slot. Charge one needs |N_love - N_fear| = 3: at least three members of one tone. One member, or two, cannot
//    carry it (two give at most 2/3).
// 2. THE CHARGE IS REGISTER-BLIND (L1). q acts as 1 on the register, so it commutes with J and with every piece (24 Q_S,
//    48 Q_D, the chiral and Wilson pieces, the stream, the SU(2)+ field, the join): each half + and half - member carries
//    the same charge, and every eigenspace of a lifted cycle splits into a love-tone and a fear-tone copy of equal size,
//    so the compressed q has spectrum {-1/3, +1/3}, each with half the level's multiplicity, on every level.
// 3. THE WALL (L2 reading of an L1 fact). E-SPN-0168's slab is built of the same tone-blind pieces, so every light wall
//    level (8-fold at k = 0) carries charge -1/3 or +1/3, at every depth: fractional on every light wall level.
// 4. THE TURN SIGN (L1). The full turn lifts to L(e_01)^2 = -1 on the register (E-FRC-0267), commuting with J: -1 on
//    each half and on every wall level. Spin one half holds in both halves; it is the charge that fails.
// 5. THE JOIN IS A NEUTRAL CURRENT (L1). E-FRC-0273's S -> D channel moves two half + members to two half - members and
//    acts as 1 on their tones, so a pair of tones (t1, t2) leaves with the same tones: Q_in = Q_out for every tone pair
//    (-2/3 -> -2/3 for two love-sea holes). The species it changes is the half, which the charge does not see.
// 6. NO CONSERVED REGISTER CHARGE IS A FUREY NUMBER OPERATOR (L1). Every one-body piece is left-type on the register
//    (E-SPN-0163 point 4), so the conserved register charges are the commutant, the right multiplications R(Cl+(4)):
//    real dimension 8, M2(C) + M2(C) on the two halves' isospin index with the spin index a spectator. With the SU(2)+
//    field (2T on half + by right multiplication, irreducible on its isospin) half + keeps only its scalar: dimension 1 +
//    4 = 5. Every Hermitian element then has every eigenvalue at even multiplicity (the spin index doubles it), so no
//    conserved register charge has the multiplicities 1, 3, 3, 1 of Furey's Q = N/3 (arXiv 1603.04078), and none can give
//    one member charge one while its partners in the register carry other thirds.
//
// PROBES BEFORE THE GATES, DISCLOSED.
//  tmp/mc-probe1.log (75 s): E-SPN-0168's chiral slab, unlifted, half 0 at L = 4 .. 12: the light levels |eps| 0.11447,
//   0.07294, 0.02441, 0.00489, 0.00012 at k = 0 (8-fold each, E-SPN-0168's A2), next level at least 0.707; half 1 has no
//   level below 0.76 (no wall), so every light wall level is in half 0.
//  tmp/mc-probe2.log (5 s): the one-class slab (E-SPN-0160's member) of each half, lifted: the member levels +-0.38025
//   (k = 0) and +-0.45930 (k = (0.3, 0.1, 0.2, 0)), q compressed reads -1/3 and +1/3 on every level of both halves (to
//   6 printed places); with the tone-swapping lift U (x) sigma_x it reads 0 on every level. sectorSymmetries and
//   joinChannel in 5.4 s, scale 0.04340, Schur 9.0e-17, 3 source states.
//  tmp/mc-probe3.log (under 1 s): the exact commutant on the register. A first attempt used the rescaled projectors
//   (Q_S = 24 Q_S / 24 has entries 1/24) and rounded them to integers, which zeroed most blocks and gave dimension 32: a
//   flaw in the probe, fixed by using the integer pieces 24 Q_S and 48 Q_D. Then: 128 distinct nonzero 8 x 8 blocks,
//   commutant dimension 8, and 5 with the 24 elements of 2T on half +.
//  tmp/mc-smoke.log (24 s): every code path on the smoke plan (L = 4 and 6, k = 0), before the gates were fixed: H1, H2,
//   H3 false, every level -1/3 and +1/3 (worst 2.2e-16), commutant 8 and 5 with multiplicities 2,2,2,2 and 2,4,2, the
//   tone swap 7.9e-16; C3 missed only because its commutator was read as the largest entry of T times 4/3 (0.083), not
//   the operator norm (T is a partial isometry, norm 1): a flaw in the reading, fixed, and the 0.1 threshold kept.
//   tmp/mc-smoke2.log: the same after the fix.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: (a) the count 3Q = loves - fears equals E-FRC-0170's charge3 on all 27 triples (the positron +3, the
//     electron -3, the neutrino 0); (b) the pieces are integer (24 Q_S, 48 Q_D, 1 + J, and the Wilson products) and the
//     slab reductions leak at most 1e-12; (c) every lifted cycle's eigenvectors satisfy |U v - e^(i phi) v| <= 1e-10 and
//     every light level has even multiplicity.
//  C1 CONTROL, the reading can return another value: the tone-swapping lift U (x) sigma_x (a piece that turns love into
//     fear) compressed to every light level (register member and wall) reads 0 to 1e-12, not +-1/3.
//  C2 CONTROL, whole charge is readable: exact Fock count on one dock (8 register modes x 2 tones): the full seas 3Q = 0;
//     the 16 one-hole states 3Q = -1 (8) and +1 (8); the 56 states with three love-sea holes 3Q = -3 (Q = -1); no state
//     with fewer than three holes has |3Q| = 3.
//  C3 CONTROL, a charged contact is seen: the join with its tones turned, T (x) |fear fear><love love|, reads Q_in +2/3 and
//     Q_out -2/3 (Delta Q = -4/3) to 1e-12, and the operator norm of its commutator with the pair charge is above 0.1.
//  H1 ROUTE LINE 163 (the register member alone carries charge one in some half; predicted FALSE): on the one-class slab
//     (E-SPN-0160 at u = ringUnit(-1, 4)) of half 0 and half 1, at k = 0 and three Weyl momenta, some member level (|eps|
//     < pi/2) has a charge eigenvalue within 1e-9 of +-1. Read with it: L(e_01)^2 = -1 on each half, exactly.
//  H2 ROUTE LINE 160 (some light wall level carries charge one; predicted FALSE): on E-SPN-0168's chiral slab (heavy
//     unit ringUnit(-2, 5), Wilson on half 0, profile Wilson on the first L/2 classes), L = 4, 6, 8, 10, 12, at k = 0 and
//     k = (0.1, 0, 0, 0), every level with |eps| < M_H / 2 (0.380) of either half: some charge eigenvalue within 1e-9 of
//     +-1.
//  H3 ROUTE LINE 573 (the join changes charge; predicted FALSE): for E-FRC-0273's S -> D channel lifted to the tones,
//     some source state (a_k (x) tone pair, 3 x 4) has |Q_out - Q_in| above 1e-9, or the lifted channel's commutator with
//     the pair charge is above 1e-12.
//  P1 THE FALSIFIER (points 2 and 3): on every light level read under H1 and H2, the compressed charge has spectrum
//     exactly {-1/3, +1/3} to 1e-12 with equal multiplicities; the commutant on the register has dimension 8, and 5 with
//     the SU(2)+ field (exact, integer elimination); a generic Hermitian element of each (Weyl weights) has every
//     eigenvalue at even multiplicity (clusters at 1e-9). P1 failing would mean the derivation is wrong.
// VERDICT, fixed before the run: FAIL (as derived: all three routes killed) when H1, H2 and H3 are false and I1, C1, C2,
//  C3 and P1 hold; PASS when some route's hypothesis holds and I1 and the controls hold; PARTIAL otherwise.
// READ, gating nothing: the light levels' |eps| and multiplicities, the turn sign on the register, the members with
//  whole charge one under SU(2)+'s Gauss law (E-FRC-0273: N+ even), and the lowest member count that can carry it.
//
// WHAT THIS CAN AND CANNOT SHOW. It reads the charge the model defines, (love - fear)/3, on the rule's own pieces. A
// fail kills the three routes as written: no register member, no light wall level and no join pair carries or moves
// charge one. It cannot rule out a charge-one composite (three like-tone members, route 161's question beyond two
// members), a charge read some other way (a hypercharge built from T3 and the tone, line 665), or a new piece that
// changes tone (Harari's rearrangement, line 574). The wall's fractional charge here is one vibe, not the Jackiw-Rebbi
// e/2 of a half-filled Dirac sea: the rule's vacuum is the full sea of each tone, whose charge is 0 on every slot. The
// commutant reading is for one-body charges on one member's register only.
//
// DETERMINISM: no random numbers (Weyl momenta and Weyl weights). EXACT: the triple counts, the Fock counts, the
// commutant dimensions (BigInt elimination) and L(e_01)^2; the level charges are floats, as measurement, with residuals.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import {
  EVEN,
  matMul,
  partnerProjector48,
  rangeBasis,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  chirality2,
  sectorBasis,
  sectorBlock,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPieces } from '@/code/measure/chiral-flow'
import {
  slabReduced,
  unitaryEigen,
  wilsonSchedule,
  type Dense,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import {
  evenBlade,
  leftMultiplication,
} from '@/code/measure/register-symmetry'
import {
  joinChannel,
  registerGaugeHalf,
  sectorSymmetries,
} from '@/code/measure/register-join'
import { TRIPLES } from '@/code/measure/rishon-triples'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'

const HEAVY: readonly [number, number] = [-2, 5]
const MEMBER: readonly [number, number] = [-1, 4]
const THIRD = 1 / 3
const ONE_TOL = 1e-9
const THIRD_TOL = 1e-12
const VEC_TOL = 1e-10
const LEAK_TOL = 1e-12
const CLUSTER = 1e-7
const MULT_TOL = 1e-9
const N = 192
const R = 8

export type ChargePlan = {
  wallL: readonly number[]
  wallK: readonly (readonly number[])[]
  memberK: readonly (readonly number[])[]
}

export const GATE_PLAN: ChargePlan = {
  wallL: [4, 6, 8, 10, 12],
  wallK: [
    [0, 0, 0, 0],
    [0.1, 0, 0, 0],
  ],
  memberK: [
    [0, 0, 0, 0],
    ...[1, 2, 3].map(j => [
      0.6 * (weyl(j, GOLDEN) - 0.5),
      0.6 * (weyl(j, SILVER) - 0.5),
      0.6 * (weyl(j + 7, GOLDEN) - 0.5),
      0,
    ]),
  ],
}

export const SMOKE_PLAN: ChargePlan = {
  wallL: [4, 6],
  wallK: [[0, 0, 0, 0]],
  memberK: [[0, 0, 0, 0]],
}

export default experiment({
  id: 'spin/member-charge',
  code: 'E-SPN-0189',
  title:
    'the charge of a register member, of a light wall level and of the join channel: pending the gate run',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return memberChargeRun(GATE_PLAN)
  },
})

const unitValue = (kj: readonly [number, number]): [number, number] => {
  const t = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(t), Math.sin(t)]
}

// ---- the charge compressed to the levels of a cycle lifted to two tones ----

export type LevelCharge = {
  eps: number
  mult: number
  charges: number[]
}

export type LiftReading = {
  levels: LevelCharge[]
  residual: number
}

// U (x) 1 (tone-blind, the rule) or U (x) sigma_x (tone-swapping, control C1), index 2 i + t, t = 0 love, 1 fear; the
// eigenvectors from the generic unitary solver; levels clustered by eps; q = diag(+1/3, -1/3) on the tone compressed
// to each level kept by `keep`, and its eigenvalues
export function liftedLevelCharges(
  U: Dense,
  d: number,
  swap: boolean,
  keep: (eps: number) => boolean,
): LiftReading {
  const n = 2 * d
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      for (let t = 0; t < 2; t++) {
        for (let s = 0; s < 2; s++) {
          const on = swap ? t !== s : t === s

          if (on) {
            re[(2 * i + t) * n + 2 * j + s] = U.re[i * d + j]!
            im[(2 * i + t) * n + 2 * j + s] = U.im[i * d + j]!
          }
        }
      }
    }
  }

  const e = unitaryEigen({ re, im }, n)

  // the eigen residual |U v - e^(i phi) v| over every vector
  let residual = 0

  for (let k = 0; k < n; k++) {
    const c = Math.cos(e.phases[k]!)
    const s = Math.sin(e.phases[k]!)

    let r2 = 0

    for (let a = 0; a < n; a++) {
      let xr = 0
      let xi = 0

      for (let b = 0; b < n; b++) {
        const ur = re[a * n + b]!
        const ui = im[a * n + b]!
        const vr = e.vre[b * n + k]!
        const vi = e.vim[b * n + k]!

        xr += ur * vr - ui * vi
        xi += ur * vi + ui * vr
      }

      const vr = e.vre[a * n + k]!
      const vi = e.vim[a * n + k]!

      r2 +=
        (xr - (c * vr - s * vi)) ** 2 + (xi - (c * vi + s * vr)) ** 2
    }

    residual = Math.max(residual, Math.sqrt(r2))
  }

  const eps = e.phases.map(p => -wrap(p - Math.PI))
  const order = eps.map((_, i) => i).sort((a, b) => eps[a]! - eps[b]!)
  const clusters: number[][] = []

  for (const k of order) {
    const c = clusters[clusters.length - 1]

    if (c && Math.abs(eps[c[0]!]! - eps[k]!) < CLUSTER) {
      c.push(k)
    } else {
      clusters.push([k])
    }
  }

  const levels = clusters
    .filter(c => keep(eps[c[0]!]!))
    .map(c => {
      const m = c.length
      const M = makeComplexMatrix({ rows: m, cols: m })

      for (let a = 0; a < m; a++) {
        for (let b = 0; b < m; b++) {
          let xr = 0
          let xi = 0

          for (let x = 0; x < n; x++) {
            const q = x % 2 === 0 ? THIRD : -THIRD
            const ar = e.vre[x * n + c[a]!]!
            const ai = e.vim[x * n + c[a]!]!
            const br = e.vre[x * n + c[b]!]!
            const bi = e.vim[x * n + c[b]!]!

            xr += q * (ar * br + ai * bi)
            xi += q * (ar * bi - ai * br)
          }

          M.re[a * m + b] = xr
          M.im[a * m + b] = xi
        }
      }

      return {
        eps: eps[c[0]!]!,
        mult: m,
        charges: Array.from(eigHermitian({ matrix: M }).values),
      }
    })

  return { levels, residual }
}

// ---- the exact commutant of a set of integer 8 x 8 blocks (c B = B c), by BigInt elimination ----

type Row = bigint[]

const gcdBig = (a: bigint, b: bigint): bigint => {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y !== 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export class Echelon {
  rows: { piv: number; row: Row }[] = []

  constructor(readonly width: number) {}

  add(input: Row): void {
    let r = input.slice()

    for (const { piv, row } of this.rows) {
      const f = r[piv]!

      if (f !== 0n) {
        const g = row[piv]!

        r = r.map((x, i) => x * g - row[i]! * f)
      }
    }

    const p = r.findIndex(x => x !== 0n)

    if (p < 0) {
      return
    }

    let g = 0n

    for (const x of r) {
      g = gcdBig(g, x)
    }

    r = r.map(x => x / g)

    for (const B of this.rows) {
      const f = B.row[p]!

      if (f !== 0n) {
        const h = r[p]!

        B.row = B.row.map((x, i) => x * h - r[i]! * f)

        let k = 0n

        for (const x of B.row) {
          k = gcdBig(k, x)
        }

        B.row = B.row.map(x => x / k)
      }
    }

    this.rows.push({ piv: p, row: r })
  }

  // c B - B c = 0 for an integer block B, unknown c[i][j] at i * 8 + j
  commuteWith(B: readonly (readonly number[])[]): void {
    for (let a = 0; a < R; a++) {
      for (let cc = 0; cc < R; cc++) {
        const row: Row = Array.from({ length: R * R }, () => 0n)

        for (let k = 0; k < R; k++) {
          row[a * R + k] = row[a * R + k]! + BigInt(B[k]![cc]!)
          row[k * R + cc] = row[k * R + cc]! - BigInt(B[a]![k]!)
        }

        this.add(row)
      }
    }
  }

  get nullity(): number {
    return this.width - this.rows.length
  }

  // a basis of the null space, as float matrices
  nullBasis(): number[][][] {
    const pivots = new Set(this.rows.map(r => r.piv))
    const out: number[][][] = []

    for (let f = 0; f < this.width; f++) {
      if (pivots.has(f)) {
        continue
      }

      const x = new Array<number>(this.width).fill(0)

      x[f] = 1

      for (const { piv, row } of this.rows) {
        x[piv] = -Number(row[f]!) / Number(row[piv]!)
      }

      out.push(
        Array.from({ length: R }, (_, i) =>
          Array.from({ length: R }, (__, j) => x[i * R + j]!),
        ),
      )
    }

    return out
  }
}

// the eigenvalue multiplicities of a generic Hermitian element sum_k a_k (C_k + C_k^T) + i b_k (C_k - C_k^T)
function genericMultiplicities(basis: readonly number[][][]): {
  mults: number[]
} {
  const M = makeComplexMatrix({ rows: R, cols: R })

  basis.forEach((C, k) => {
    const a = weyl(k + 1, GOLDEN) - 0.5
    const b = weyl(k + 1, SILVER) - 0.5

    for (let i = 0; i < R; i++) {
      for (let j = 0; j < R; j++) {
        M.re[i * R + j]! += a * (C[i]![j]! + C[j]![i]!)
        M.im[i * R + j]! += b * (C[i]![j]! - C[j]![i]!)
      }
    }
  })

  const values = Array.from(eigHermitian({ matrix: M }).values)
  const mults: number[] = []

  values.forEach((v, i) => {
    if (i > 0 && Math.abs(v - values[i - 1]!) <= MULT_TOL) {
      mults[mults.length - 1]! += 1
    } else {
      mults.push(1)
    }
  })

  return { mults }
}

// the largest |[C^T, B]| entry over the blocks: the commutant closed under transpose (so Hermitian parts stay in it)
function transposeClosure(
  basis: readonly number[][][],
  blocks: readonly (readonly (readonly number[])[])[],
): number {
  let worst = 0

  for (const C of basis) {
    for (const B of blocks) {
      for (let i = 0; i < R; i++) {
        for (let j = 0; j < R; j++) {
          let x = 0

          for (let k = 0; k < R; k++) {
            x += C[k]![i]! * B[k]![j]! - B[i]![k]! * C[j]![k]!
          }

          worst = Math.max(worst, Math.abs(x))
        }
      }
    }
  }

  return worst
}

export function memberChargeRun(plan: ChargePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  // ---------------- I1 (a): the count against E-FRC-0170's triples ----------------
  let tripleMismatch = 0

  for (const t of TRIPLES) {
    const loves = t.vibes.filter(v => v === 1).length
    const fears = t.vibes.filter(v => v === -1).length

    if (loves - fears !== t.charge3) {
      tripleMismatch++
    }
  }

  const positron = TRIPLES.find(t => t.harari === 'positron')?.charge3
  const electron = TRIPLES.find(t => t.harari === 'electron')?.charge3
  const I1a =
    tripleMismatch === 0 &&
    TRIPLES.length === 27 &&
    positron === 3 &&
    electron === -3

  // ---------------- the pieces ----------------
  const qS24 = singletProjector24()
  const qD48 = partnerProjector48()
  const J = volumeRight()
  const onePlusJ = chirality2(J, 1)
  const intPieces = [
    qS24,
    qD48,
    onePlusJ,
    matMul(qS24, onePlusJ),
    matMul(qD48, onePlusJ),
  ]

  let nonInteger = 0

  const blocks = new Map<string, number[][]>()

  for (const P of intPieces) {
    for (let d = 0; d < 24; d++) {
      for (let e = 0; e < 24; e++) {
        const b = Array.from({ length: R }, (_, a) =>
          Array.from({ length: R }, (__, c) => {
            const x = P[(d * R + a) * N + e * R + c]!

            nonInteger = Math.max(
              nonInteger,
              Math.abs(x - Math.round(x)),
            )

            return Math.round(x)
          }),
        )

        if (b.some(r => r.some(x => x !== 0))) {
          blocks.set(b.map(r => r.join(',')).join(';'), b)
        }
      }
    }
  }

  const qS = scaled(qS24, 24)
  const qD = scaled(qD48, 48)
  const pPlus = scaled(onePlusJ, 2)
  const basis = sectorBasis(J)
  const ranges = (half: 0 | 1): { sR: number[][]; dR: number[][] } => ({
    sR: rangeBasis(
      sectorBlock(
        { re: qS, im: new Float64Array(qS.length) },
        basis,
        half,
      ).block.re,
      96,
    ),
    dR: rangeBasis(
      sectorBlock(
        { re: qD, im: new Float64Array(qD.length) },
        basis,
        half,
      ).block.re,
      96,
    ),
  })
  const rH = [ranges(0), ranges(1)] as const

  let leak = 0
  let residual = 0
  let oddMult = 0

  type Read = {
    where: string
    levels: LevelCharge[]
    control: LevelCharge[]
  }

  const readCycle = (
    where: string,
    s: Slab,
    sets: HalfSet[],
    half: 0 | 1,
    K: readonly number[],
    keep: (eps: number) => boolean,
  ): Read => {
    const red = slabReduced(
      s,
      sets,
      K,
      DOCK_ROOTS,
      rH[half].sR,
      rH[half].dR,
    )

    leak = Math.max(leak, red.leak)

    const blind = liftedLevelCharges(red.U, red.d, false, keep)
    const swapped = liftedLevelCharges(red.U, red.d, true, keep)

    residual = Math.max(residual, blind.residual, swapped.residual)
    oddMult += blind.levels.filter(l => l.mult % 2 !== 0).length

    return { where, levels: blind.levels, control: swapped.levels }
  }

  // ---------------- H1: the register member alone, per half ----------------
  const uM = unitValue(MEMBER)
  const plain = wilsonSchedule(qS, qD, uM, { wilson: false })
  const memberReads: Read[] = []

  for (const half of [0, 1] as const) {
    const sets: HalfSet[] = [
      { pieces: halfPieces(plain, basis, half).pieces },
    ]

    for (const K of plan.memberK) {
      memberReads.push(
        readCycle(
          `member half ${half} K ${K.map(x => x.toFixed(3)).join(',')}`,
          { L: 1, qa: 1, p: 0, profile: [0] },
          sets,
          half,
          K,
          eps => Math.abs(eps) < Math.PI / 2,
        ),
      )
    }
  }

  log('H1 member levels')

  // the turn sign: L(e_01)^2 = -1, commuting with J (so -1 on each half)
  const e01 = evenBlade(EVEN.findIndex(b => b.join(',') === '0,1'))
  const L01 = leftMultiplication(e01)
  const L01sq = L01.map(r =>
    r.map((_, j) => r.reduce((s, x, k) => s + x * L01[k]![j]!, 0)),
  )
  const turnMinusOne = L01sq.every((r, i) =>
    r.every((x, j) => x === (i === j ? -1 : 0)),
  )
  const turnKeepsHalves = L01.every((r, i) =>
    r.every(
      (_, j) =>
        r.reduce((s, x, k) => s + x * J[k]![j]!, 0) ===
        J[i]!.reduce((s, x, k) => s + x * L01[k]![j]!, 0),
    ),
  )

  // ---------------- H2: the light wall levels of E-SPN-0168's chiral slab ----------------
  const uH = unitValue(HEAVY)
  const MH = Math.abs(
    wrap(unitAngle(ringUnit(HEAVY[0], HEAVY[1])) - Math.PI),
  )
  const trivial = wilsonSchedule(qS, qD, uH, { wilson: false })
  const chiral = wilsonSchedule(qS, qD, uH, {
    wilson: true,
    half: pPlus,
  })
  const wallReads: Read[] = []

  for (const half of [0, 1] as const) {
    const sets: HalfSet[] = [
      { pieces: halfPieces(trivial, basis, half).pieces },
      { pieces: halfPieces(chiral, basis, half).pieces },
    ]

    for (const L of plan.wallL) {
      for (const K of plan.wallK) {
        wallReads.push(
          readCycle(
            `wall half ${half} L ${L} K ${K.join(',')}`,
            {
              L,
              qa: 1,
              p: 0,
              profile: Array.from({ length: L }, (_, c) =>
                c < L / 2 ? 1 : 0,
              ),
            },
            sets,
            half,
            K,
            eps => Math.abs(eps) < MH / 2,
          ),
        )
      }

      log(`H2 wall half ${half} L ${L}`)
    }
  }

  const levelsOf = (reads: Read[]): LevelCharge[] =>
    reads.flatMap(r => r.levels)
  const controlsOf = (reads: Read[]): LevelCharge[] =>
    reads.flatMap(r => r.control)
  const hasOne = (ls: LevelCharge[]): boolean =>
    ls.some(l =>
      l.charges.some(q => Math.abs(Math.abs(q) - 1) <= ONE_TOL),
    )
  const thirdGap = (ls: LevelCharge[]): number =>
    Math.max(
      0,
      ...ls.flatMap(l =>
        l.charges.map(q => Math.abs(Math.abs(q) - THIRD)),
      ),
    )
  const balanced = (ls: LevelCharge[]): boolean =>
    ls.every(
      l =>
        l.charges.filter(q => q < 0).length ===
        l.charges.filter(q => q > 0).length,
    )
  const memberLevels = levelsOf(memberReads)
  const wallLevels = levelsOf(wallReads)
  const memberLevelsPerHalf = [0, 1].map(
    h =>
      memberReads
        .filter(r => r.where.startsWith(`member half ${h}`))
        .flatMap(r => r.levels).length,
  )
  const wallLevelsPerHalf = [0, 1].map(
    h =>
      wallReads
        .filter(r => r.where.startsWith(`wall half ${h}`))
        .flatMap(r => r.levels).length,
  )
  const controlGap = Math.max(
    0,
    ...[...controlsOf(memberReads), ...controlsOf(wallReads)].flatMap(
      l => l.charges.map(q => Math.abs(q)),
    ),
  )
  const controlLevels =
    controlsOf(memberReads).length + controlsOf(wallReads).length

  // ---------------- H3: the join channel's in and out pairs ----------------
  const sym = sectorSymmetries()
  const ch = joinChannel(sym, 'S', 'D')
  const toneCharge = (t: number): number => (t === 0 ? THIRD : -THIRD)
  const pairCharge = (tau: number): number =>
    toneCharge(tau >> 1) + toneCharge(tau & 1)

  // a lifted pair operator acting as T on the register pair and as `tones` (4 x 4, [out][in]) on the tone pair
  const pairReading = (
    tones: readonly (readonly number[])[],
  ): {
    worstDelta: number
    inQ: number[]
    outQ: number[]
    commutator: number
  } => {
    let worstDelta = 0

    const inQ: number[] = []
    const outQ: number[] = []

    for (const a of ch.A) {
      const Ta = ch.T.map(r => r.reduce((s, x, j) => s + x * a[j]!, 0))
      const n2 = Ta.reduce((s, x) => s + x * x, 0)

      for (let tau = 0; tau < 4; tau++) {
        let w = 0
        let q = 0

        for (let o = 0; o < 4; o++) {
          const amp2 = tones[o]![tau]! ** 2 * n2

          w += amp2
          q += amp2 * pairCharge(o)
        }

        if (w > 0) {
          inQ.push(pairCharge(tau))
          outQ.push(q / w)
          worstDelta = Math.max(
            worstDelta,
            Math.abs(q / w - pairCharge(tau)),
          )
        }
      }
    }

    // [T (x) tones, 1 (x) Qp] = T (x) [tones, Qp]: its largest entry
    let tc = 0

    for (let o = 0; o < 4; o++) {
      for (let t = 0; t < 4; t++) {
        tc = Math.max(
          tc,
          Math.abs(tones[o]![t]! * (pairCharge(t) - pairCharge(o))),
        )
      }
    }

    // T is a partial isometry (T^dag T = Pi_A, Schur), so the operator norm of T (x) [tones, Qp] is |T a| times the
    // tone part's largest entry (the tone part here is a single entry or diagonal)
    const tNorm = Math.max(
      ...ch.A.map(a =>
        Math.hypot(
          ...ch.T.map(r => r.reduce((s, x, j) => s + x * a[j]!, 0)),
        ),
      ),
    )

    return { worstDelta, inQ, outQ, commutator: tc * tNorm }
  }

  const identity4 = [0, 1, 2, 3].map(o =>
    [0, 1, 2, 3].map(t => (o === t ? 1 : 0)),
  )
  // |fear fear><love love|: tone pair index 2 t1 + t2, love 0, fear 1
  const charged4 = [0, 1, 2, 3].map(o =>
    [0, 1, 2, 3].map(t => (o === 3 && t === 0 ? 1 : 0)),
  )
  const neutral = pairReading(identity4)
  const planted = pairReading(charged4)
  const holePairIn = -2 * THIRD
  const holePairOut =
    neutral.outQ[
      neutral.inQ.findIndex(q => Math.abs(q - holePairIn) < 1e-12)
    ]

  log('H3 join')

  // ---------------- C2: exact Fock count on one dock ----------------
  // 16 modes, mode 2 r + t: love-tone modes t = 0 (+1), fear-tone t = 1 (-1); a hole removes one
  let vacuum3Q = 0

  for (let m = 0; m < 16; m++) {
    vacuum3Q += m % 2 === 0 ? 1 : -1
  }

  let oneHoleMinus = 0
  let oneHolePlus = 0
  let threeLoveHoles = 0
  let threeLoveHolesWhole = 0
  let fewerThanThreeWhole = 0

  for (let holes = 0; holes < 1 << 16; holes++) {
    let count = 0
    let h3 = 0
    let loveHoles = 0

    for (let m = 0; m < 16; m++) {
      if ((holes >> m) & 1) {
        count++
        h3 -= m % 2 === 0 ? 1 : -1
        loveHoles += m % 2 === 0 ? 1 : 0
      }
    }

    const q3 = vacuum3Q + h3

    if (count === 1) {
      if (q3 === -1) {
        oneHoleMinus++
      } else if (q3 === 1) {
        oneHolePlus++
      }
    }

    if (count === 3 && loveHoles === 3) {
      threeLoveHoles++

      if (q3 === -3) {
        threeLoveHolesWhole++
      }
    }

    if (count < 3 && Math.abs(q3) === 3) {
      fewerThanThreeWhole++
    }
  }

  const C2 =
    vacuum3Q === 0 &&
    oneHoleMinus === 8 &&
    oneHolePlus === 8 &&
    threeLoveHoles === 56 &&
    threeLoveHolesWhole === 56 &&
    fewerThanThreeWhole === 0

  // ---------------- P1: the commutant on the register ----------------
  const blockList = [...blocks.values()]
  const ech = new Echelon(R * R)

  for (const B of blockList) {
    ech.commuteWith(B)
  }

  const dimRule = ech.nullity
  const ruleBasis = ech.nullBasis()
  const multRule = genericMultiplicities(ruleBasis)
  const closureRule = transposeClosure(ruleBasis, blockList)
  const gauge = registerGaugeHalf(1)

  for (const G of gauge.gamma4) {
    ech.commuteWith(G)
  }

  const dimGauge = ech.nullity
  const gaugeBasis = ech.nullBasis()
  const multGauge = genericMultiplicities(gaugeBasis)
  const closureGauge = transposeClosure(gaugeBasis, [
    ...blockList,
    ...gauge.gamma4,
  ])
  const allEven = [...multRule.mults, ...multGauge.mults].every(
    m => m % 2 === 0,
  )

  log('P1 commutant')

  // ---------------- gates ----------------
  const I1 =
    I1a &&
    nonInteger === 0 &&
    leak <= LEAK_TOL &&
    residual <= VEC_TOL &&
    oddMult === 0 &&
    gauge.homomorphism
  const C1 = controlLevels > 0 && controlGap <= THIRD_TOL
  const C3 =
    Math.abs(planted.worstDelta - 4 * THIRD) <= THIRD_TOL &&
    planted.inQ.every(q => Math.abs(q - 2 * THIRD) <= THIRD_TOL) &&
    planted.outQ.every(q => Math.abs(q + 2 * THIRD) <= THIRD_TOL) &&
    planted.commutator > 0.1
  const H1 = hasOne(memberLevels)
  const H2 = hasOne(wallLevels)
  const H3 =
    neutral.worstDelta > ONE_TOL || neutral.commutator > THIRD_TOL
  const P1 =
    memberLevels.length > 0 &&
    wallLevels.length > 0 &&
    thirdGap([...memberLevels, ...wallLevels]) <= THIRD_TOL &&
    balanced([...memberLevels, ...wallLevels]) &&
    dimRule === 8 &&
    dimGauge === 5 &&
    allEven &&
    closureRule <= 1e-12 &&
    closureGauge <= 1e-12
  const controlsHold = I1 && C1 && C2 && C3
  const status: Verdict['status'] =
    controlsHold && P1 && !H1 && !H2 && !H3
      ? 'fail'
      : controlsHold && (H1 || H2 || H3)
        ? 'pass'
        : 'partial'

  // ---------------- READ ----------------
  const wallSummary = wallReads
    .filter(r => r.levels.length > 0)
    .map(
      r =>
        `${r.where.replace('wall ', '')}: ${r.levels.map(l => `${l.eps.toFixed(6)} x${l.mult} q {${[...new Set(l.charges.map(q => q.toFixed(4)))].join(', ')}}`).join('; ')}`,
    )
    .join(' | ')
  const memberSummary = memberReads
    .map(
      r =>
        `${r.where.replace('member ', '')}: ${r.levels.map(l => `${l.eps.toFixed(5)} x${l.mult}`).join(', ')}`,
    )
    .join(' | ')
  // charge one under Gauss's law: three like-tone members with N+ even (E-FRC-0273)
  const gaussOptions = [0, 1, 2, 3].filter(np => np % 2 === 0)

  const flag = (b: boolean): number => (b ? 1 : 0)
  const seconds = (Date.now() - started) / 1000

  return verdict({
    status,
    claim: `routes 163, 160 and 573 read on the rule's own pieces: H1 (a register member of charge one in some half) ${H1}, H2 (a light wall level of charge one) ${H2}, H3 (the join changes charge) ${H3}; every one of ${memberLevels.length} member levels (${memberLevelsPerHalf.join(' and ')} in halves 0 and 1) and ${wallLevels.length} light wall levels (${wallLevelsPerHalf.join(' and ')}) carries charge -1/3 or +1/3 in equal numbers, worst |q| - 1/3 ${thirdGap([...memberLevels, ...wallLevels]).toExponential(1)}; the join takes every tone pair to itself (worst Delta Q ${neutral.worstDelta.toExponential(1)}, two love-sea holes ${holePairIn.toFixed(4)} -> ${holePairOut?.toFixed(4)}); the full turn is ${turnMinusOne ? '-1' : 'not -1'} on the register and keeps the halves ${turnKeepsHalves}; the register's conserved one-body charges span ${dimRule} (and ${dimGauge} with the SU(2)+ field), generic eigenvalue multiplicities ${multRule.mults.join(',')} and ${multGauge.mults.join(',')}; controls: tone swap reads ${controlGap.toExponential(1)} on ${controlLevels} levels, three love-sea holes read 3Q = -3 in ${threeLoveHolesWhole} of ${threeLoveHoles}, the planted charged contact Delta Q ${planted.worstDelta.toFixed(6)}`,
    metrics: {
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      P1: flag(P1),
      I1: flag(I1),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      memberLevels: memberLevels.length,
      wallLevels: wallLevels.length,
      wallLevelsHalf1: wallLevelsPerHalf[1]!,
      worstThirdGap: thirdGap([...memberLevels, ...wallLevels]),
      joinWorstDelta: neutral.worstDelta,
      joinCommutator: neutral.commutator,
      joinScale: ch.scale,
      joinSchur: ch.schurGap,
      commutantRule: dimRule,
      commutantGauge: dimGauge,
      closureRule,
      closureGauge,
      turnMinusOne: flag(turnMinusOne),
      turnKeepsHalves: flag(turnKeepsHalves),
      fockVacuum3Q: vacuum3Q,
      fockFewerThanThreeWhole: fewerThanThreeWhole,
      tripleMismatch,
      leak,
      eigenResidual: residual,
      gaussMinusMembers: 3,
      seconds,
    },
    control: {
      toneSwapWorst: controlGap,
      toneSwapLevels: controlLevels,
      plantedDelta: planted.worstDelta,
      plantedCommutator: planted.commutator,
      threeLoveHolesWhole,
      oneHoleMinus,
      oneHolePlus,
    },
    notes: `L1 (the counts, the commutant, the turn) and L2 (the level charges, floats). Member unit ringUnit(${MEMBER.join(', ')}), heavy unit ringUnit(${HEAVY.join(', ')}), M_H ${MH.toFixed(6)}, window |eps| < ${(MH / 2).toFixed(4)}. Member levels: ${memberSummary}. Light wall levels: ${wallSummary}. READ: charge one needs three like-tone members (|N_love - N_fear| = 3); under SU(2)+'s Gauss law N+ is even, so ${gaussOptions.map(np => `${np} half + and ${3 - np} half -`).join(' or ')}; no state of one or two members carries it. ${seconds.toFixed(0)} s.`,
  })
}
