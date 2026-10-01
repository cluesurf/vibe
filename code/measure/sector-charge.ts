// IS THE SECTOR IMBALANCE A CHARGE? (E-FND-0167). E-FND-0159's ledger grows with the box through the sector string's
// direct term on n_S - n_D, E-GRV-0147's gravity piece is two fields (S with S in beat 1, D with D in beat 2), and
// E-FRC-0273's join takes an S pair to a D pair. One guess would unify them: n_S - n_D is a conserved charge the model
// treats as long-range without gauging it. This module holds the one-member readings that decide whether it is
// conserved at all, and what the pieces do to it.
//
//   blochCycle        one member's pieces at Bloch momentum K, 192 x 192: the mixers M1 = 1 + (u - 1) Q_S and
//                     M2 = 1 + (conj u - 1) Q_D, the swap coin with the stream V = S(K) X (an involution), beat 1
//                     B1 = V M1 and the cycle U = V M2 V M1 (code/measure/swap-cone cycleMatrix's convention)
//   chargeReading     at one K: the two-frame charge the ledger counts, O2 = Q_S - B1^dag Q_D B1 (n_S read at the start
//                     of beat 1, n_D at the start of beat 2), and the one-frame charge O1 = Q_S - Q_D (integer
//                     spectrum); their commutators with U and with each piece; O2's minimal polynomial; the hop
//                     C = Q_D V Q_S and V's leak out of S + D; the Z_n gaps; and the commutator of the two counts a
//                     one-field source would need at one stage, [Q_D, V Q_S V]
//   blochChargeSeries the two-frame charge of one member started as S_a at the origin of the side-L torus, per cycle,
//                     summed over the torus momenta (the Bloch prediction of a real-space run)
//   holeChargeSeries  the same read by running the member in real space (code/measure/register-count oneBeat)
//
// DETERMINISM: no random numbers. EXACT: the projectors are integer matrices over 24 and 48, the coin a permutation;
// the products and norms are floats, as measurement.

import { type CMatrix } from '@/code/measure/dock-mixer'
import { cycleMatrix } from '@/code/measure/swap-cone'
import {
  MODES,
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  newOne,
  oneBeat,
  sectorCount,
  singletStart,
  type OneState,
  type OneTorus,
} from '@/code/measure/register-count'

const N = MODES
const REG = 8

// ---- dense complex helpers, n = 192 ----

export function cmul(a: CMatrix, b: CMatrix): CMatrix {
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let k = 0; k < N; k++) {
      const ar = a.re[i * N + k]!
      const ai = a.im[i * N + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < N; j++) {
        const br = b.re[k * N + j]!
        const bi = b.im[k * N + j]!

        re[i * N + j]! += ar * br - ai * bi
        im[i * N + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

export function dag(a: CMatrix): CMatrix {
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      re[j * N + i] = a.re[i * N + j]!
      im[j * N + i] = -a.im[i * N + j]!
    }
  }

  return { re, im }
}

// x a + y b for complex scalars x, y
function comb(
  a: CMatrix,
  x: readonly [number, number],
  b: CMatrix,
  y: readonly [number, number],
): CMatrix {
  const re = new Float64Array(N * N)
  const im = new Float64Array(N * N)

  for (let i = 0; i < N * N; i++) {
    re[i] = x[0] * a.re[i]! - x[1] * a.im[i]! + y[0] * b.re[i]! - y[1] * b.im[i]!
    im[i] = x[0] * a.im[i]! + x[1] * a.re[i]! + y[0] * b.im[i]! + y[1] * b.re[i]!
  }

  return { re, im }
}

const minus = (a: CMatrix, b: CMatrix): CMatrix => comb(a, [1, 0], b, [-1, 0])

export function frobenius(a: CMatrix): number {
  let s = 0

  for (let i = 0; i < N * N; i++) {
    s += a.re[i]! ** 2 + a.im[i]! ** 2
  }

  return Math.sqrt(s)
}

// || A B - B A ||_F
export const commutator = (a: CMatrix, b: CMatrix): number =>
  frobenius(minus(cmul(a, b), cmul(b, a)))

const real = (q: Float64Array): CMatrix => ({
  re: Float64Array.from(q),
  im: new Float64Array(N * N),
})

function identity(): CMatrix {
  const re = new Float64Array(N * N)

  for (let i = 0; i < N; i++) {
    re[i * N + i] = 1
  }

  return { re, im: new Float64Array(N * N) }
}

// 1 + (w - 1) Q for a real projector Q
function phaseOn(q: Float64Array, w: readonly [number, number]): CMatrix {
  const out = identity()

  for (let i = 0; i < N * N; i++) {
    out.re[i]! += (w[0] - 1) * q[i]!
    out.im[i]! += w[1] * q[i]!
  }

  return out
}

// ---- the pieces ----

export type BlochCycle = {
  QS: CMatrix
  QD: CMatrix
  M1: CMatrix
  M2: CMatrix
  V: CMatrix
  B1: CMatrix
  U: CMatrix
}

export function projectors(): { qS: Float64Array; qD: Float64Array } {
  return {
    qS: scaled(singletProjector24(), 24),
    qD: scaled(partnerProjector48(), 48),
  }
}

export function blochCycle(theta: number, K: readonly number[]): BlochCycle {
  const { qS, qD } = projectors()
  const u: [number, number] = [Math.cos(theta), Math.sin(theta)]
  const uc: [number, number] = [u[0], -u[1]]
  const P1 = registerPiece(qS, u)
  const P2 = registerPiece(qD, uc)

  return {
    QS: real(qS),
    QD: real(qD),
    M1: phaseOn(qS, u),
    M2: phaseOn(qD, uc),
    // with the unit 1 the piece is the coin alone, whatever its projector
    V: cycleMatrix([registerPiece(qS, [1, 0])], REGISTER_ROOTS, K),
    B1: cycleMatrix([P1], REGISTER_ROOTS, K),
    U: cycleMatrix([P1, P2], REGISTER_ROOTS, K),
  }
}

// ---- the readings at one K ----

export type ChargeReading = {
  // ||Q_S Q_D||_F (0: the two sectors are orthogonal, so O1 has spectrum {-1, 0, 1})
  sectorOverlap: number
  // ||V^2 - 1||_F (the coin with the stream is an involution) and ||B1 - V M1||_F (the piece order)
  involution: number
  order: number
  // the two-frame charge: ||[U, O2]||_F, ||O2^3 - (1 - g^2) O2||_F, ||O2^3 - O2||_F, Tr O2
  commO2: number
  cubic: number
  cubicInteger: number
  traceO2: number
  // the one-frame charge against the cycle and each piece
  commO1: number
  commM1: number
  commM2: number
  commV: number
  // the hop C = Q_D V Q_S (||C||_F^2), Q_S V Q_S (||.||_F^2), and V's leak out of S + D from S (||.||_F^2)
  hop2: number
  stay2: number
  leak2: number
  // ||R U R^dag - U||_F for R = e^(i alpha O1), alpha = 2 pi / n, n = 1 .. 12
  zGap: number[]
  // ||[Q_D, V Q_S V]||_F^2: the D count and the S count carried to beat 2, at one stage
  stageComm2: number
  // ||[P, Q_S]||_F with P = V Q_D V, the two projectors whose Jordan blocks make the band (for the record)
  jordanComm: number
}

export const Z_ORDERS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export function chargeReading(theta: number, K: readonly number[]): ChargeReading {
  const c = blochCycle(theta, K)
  const I = identity()
  const Vd = dag(c.V)
  const B1d = dag(c.B1)
  const O1 = minus(c.QS, c.QD)
  const O2 = minus(c.QS, cmul(B1d, cmul(c.QD, c.B1)))
  const O2sq = cmul(O2, O2)
  const O2cube = cmul(O2sq, O2)
  const VQSV = cmul(c.V, cmul(c.QS, c.V))
  const P = cmul(c.V, cmul(c.QD, c.V))
  const hop = cmul(c.QD, cmul(c.V, c.QS))
  const stay = cmul(c.QS, cmul(c.V, c.QS))
  const outside = minus(minus(I, c.QS), c.QD)
  const leak = cmul(outside, cmul(c.V, c.QS))
  const hop2 = frobenius(hop) ** 2
  const g2 = hop2 / 8

  let traceO2 = 0

  for (let i = 0; i < N; i++) {
    traceO2 += O2.re[i * N + i]!
  }

  const zGap = Z_ORDERS.map(n => {
    const a = (2 * Math.PI) / n
    const up = identity()
    const down = identity()

    for (let i = 0; i < N * N; i++) {
      up.re[i]! += (Math.cos(a) - 1) * c.QS.re[i]! + (Math.cos(a) - 1) * c.QD.re[i]!
      up.im[i]! += Math.sin(a) * c.QS.re[i]! - Math.sin(a) * c.QD.re[i]!
      down.re[i]! += (Math.cos(a) - 1) * c.QS.re[i]! + (Math.cos(a) - 1) * c.QD.re[i]!
      down.im[i]! += -Math.sin(a) * c.QS.re[i]! + Math.sin(a) * c.QD.re[i]!
    }

    return frobenius(minus(cmul(up, cmul(c.U, down)), c.U))
  })

  return {
    sectorOverlap: frobenius(cmul(c.QS, c.QD)),
    involution: frobenius(minus(cmul(c.V, c.V), I)),
    order: frobenius(minus(c.B1, cmul(c.V, c.M1))),
    commO2: commutator(c.U, O2),
    cubic: frobenius(comb(O2cube, [1, 0], O2, [-(1 - g2), 0])),
    cubicInteger: frobenius(minus(O2cube, O2)),
    traceO2,
    commO1: commutator(c.U, O1),
    commM1: commutator(c.M1, O1),
    commM2: commutator(c.M2, O1),
    commV: commutator(c.V, O1),
    hop2,
    stay2: frobenius(stay) ** 2,
    leak2: frobenius(leak) ** 2,
    zGap,
    stageComm2: commutator(c.QD, VQSV) ** 2,
    jordanComm: commutator(P, c.QS),
  }
}

// ---- the charge of one member over time ----

// the two-frame charge (n_S at the start of beat 1 minus n_D at the start of beat 2) of the member S_a at the origin,
// per cycle 0 .. cycles - 1, as the torus's Bloch sum (1 / N) sum_K <S_a| U^-t O2 U^t |S_a>; also n_S + n_D
export function blochChargeSeries(
  theta: number,
  momenta: readonly (readonly number[])[],
  a: number,
  cycles: number,
): { charge: number[]; number: number[] } {
  const charge = Array<number>(cycles).fill(0)
  const count = Array<number>(cycles).fill(0)

  for (const K of momenta) {
    const c = blochCycle(theta, K)
    // the S_a column of the sector basis: 1 / sqrt 24 on every slot's component a (register-count singletStart)
    let re = new Float64Array(N)
    let im = new Float64Array(N)

    for (let d = 0; d < 24; d++) {
      re[d * REG + a] = 1 / Math.sqrt(24)
    }

    for (let t = 0; t < cycles; t++) {
      const nS = quadratic(c.QS, re, im)
      const [br, bi] = apply(c.B1, re, im)
      const nD = quadratic(c.QD, br, bi)

      charge[t]! += (nS - nD) / momenta.length
      count[t]! += (nS + nD) / momenta.length
      ;[re, im] = apply(c.U, re, im)
    }
  }

  return { charge, number: count }
}

function apply(a: CMatrix, re: Float64Array, im: Float64Array): [Float64Array, Float64Array] {
  const or = new Float64Array(N)
  const oi = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    let sr = 0
    let si = 0

    for (let j = 0; j < N; j++) {
      const ar = a.re[i * N + j]!
      const ai = a.im[i * N + j]!

      sr += ar * re[j]! - ai * im[j]!
      si += ar * im[j]! + ai * re[j]!
    }

    or[i] = sr
    oi[i] = si
  }

  return [or, oi]
}

// <x| Q |x> for a real projector Q (as a CMatrix with im 0)
function quadratic(q: CMatrix, re: Float64Array, im: Float64Array): number {
  let s = 0

  for (let i = 0; i < N; i++) {
    let r = 0
    let m = 0

    for (let j = 0; j < N; j++) {
      const v = q.re[i * N + j]!

      if (v !== 0) {
        r += v * re[j]!
        m += v * im[j]!
      }
    }

    s += re[i]! * r + im[i]! * m
  }

  return s
}

// the same member run in real space on the torus (oneBeat: the mixer, then the coin and the stream), per cycle: the
// two-frame charge, n_S + n_D and the norm. `uniform` starts S_a on every dock (momentum 0) instead of the origin
export function holeChargeSeries(input: {
  o: OneTorus
  bases: { S: Float64Array; D: Float64Array }
  theta: number
  a: number
  cycles: number
  uniform: boolean
}): { charge: number[]; number: number[]; drift: number } {
  const { o, bases, theta, a, cycles, uniform } = input
  const u: [number, number] = [Math.cos(theta), Math.sin(theta)]
  const uc: [number, number] = [u[0], -u[1]]
  const charge: number[] = []
  const count: number[] = []
  const sum = (x: Float64Array): number => x.reduce((acc, v) => acc + v, 0)

  let s: OneState = uniform ? uniformStart(o, a) : singletStart(o, o.origin, a)
  let t = newOne(o)
  let drift = 0

  for (let c = 0; c < cycles; c++) {
    const nS = sum(sectorCount(o, bases.S, s))

    oneBeat(o, bases.S, u, s, t)
    ;[s, t] = [t, s]

    const nD = sum(sectorCount(o, bases.D, s))

    oneBeat(o, bases.D, uc, s, t)
    ;[s, t] = [t, s]

    charge.push(nS - nD)
    count.push(nS + nD)

    let n = 0

    for (let k = 0; k < s.re.length; k++) {
      n += s.re[k]! ** 2 + s.im[k]! ** 2
    }

    drift = Math.max(drift, Math.abs(n - 1))
  }

  return { charge, number: count, drift }
}

function uniformStart(o: OneTorus, a: number): OneState {
  const s = newOne(o)
  const v = 1 / Math.sqrt(24 * o.sites.length)

  for (let i = 0; i < o.sites.length; i++) {
    for (let d = 0; d < 24; d++) {
      s.re[i * N + d * REG + a] = v
    }
  }

  return s
}
