// Exact Leggett-Garg correlators for two objects of the model. Built for E-QTM-0164.
//
// K3 = C12 + C23 - C13, each C_ij a TWO-time correlator: Q read at t_i, the state updated by the reading, Q read
// again at t_j, and C_ij = sum q q' P(q at t_i, q' at t_j) (Leggett and Garg 1985, Emary, Lambert, Nori 2014).
// Two update rules (Budroni and Emary 2014):
//   Luders       the reading projects onto Q's whole eigenspace (only the value is learned)
//   von Neumann  the reading projects onto one line of a finer basis, each line carrying a value of Q
// For a dichotomic Q, Luders gives K3 <= 3/2 in every dimension; the finer reading can exceed it when Q is
// degenerate.
//
// 1. THE LONE VIBE (code/rule/fear-walk): Q = which slot, +1 on the right-moving slot and -1 on the left-moving
//    one. The Luders reading keeps the position amplitudes and drops the other slot. Weights are Eisenstein
//    integers over 2^t, so every joint chance is a whole number over 4^t_j and K3 is an exact rational. The
//    finer reading also learns the cell.
// 2. THE ROLE (a qutrit, code/algebra/cyclotomic over Z[zeta_12]): Q = the sign of the 2 pi turn about a point,
//    -1 on the parity-even doublet and +1 on the odd line, so Q = -A(0), A the phase-point operator (parity).
//    The finer reading is the lock's slot basis (code/rule/doublet-locked-knit): the doublet's two eigenlines
//    of a pi turn q (eigenvalues +i and -i there, +1 on the odd line), and the odd line. Between readings the
//    role is moved by a link, a Clifford element g, so in the Heisenberg picture
//      K = R(Q_g) + g^dagger R(Q_h) g - R(Q_hg),   R(X) = sum_k q_k P_k X P_k,   Q_g = g^dagger Q g
//    and the largest K3 over every state is the top eigenvalue of K, a root of a cubic over Q(sqrt 3).

import {
  type WalkState,
  type Coin,
  type ChanceState,
  ZERO,
  norm,
  walkBeat,
  chanceBeat,
} from '@/code/rule/fear-walk'
import {
  cycAdd,
  cycAdjoint,
  cycCharPoly,
  cycIdentity,
  cycMul,
  cycReduce,
  cycTimesElement,
  cyclotomicRing,
  type Cyc,
  type CycMatrix,
} from '@/code/algebra/cyclotomic'
import { type Mat3 } from '@/code/measure/eisenstein-words'

// ---------------------------------------------------------------------------------------------------------
// 1. the lone vibe

export type Rational = { readonly num: bigint; readonly den: bigint }

function evolve(state: WalkState, coin: Coin, beats: number): WalkState {
  let s = state

  for (let k = 0; k < beats; k++) {
    s = walkBeat(s, () => coin)
  }

  return s
}

function keepSlot(state: WalkState, right: boolean): WalkState {
  return {
    right: right ? state.right : state.right.map(() => ZERO),
    left: right ? state.left.map(() => ZERO) : state.left,
    t: state.t,
  }
}

function slotCounts(state: WalkState): [bigint, bigint] {
  return [
    state.right.reduce((s, w) => s + norm(w), 0n),
    state.left.reduce((s, w) => s + norm(w), 0n),
  ]
}

// C_ij for the Luders slot reading: the joint chances are whole numbers over 4^t_j
export function walkCorrelator(
  start: WalkState,
  coin: Coin,
  ti: number,
  tj: number,
): Rational {
  const at = evolve(start, coin, ti)

  let num = 0n

  for (const right of [true, false]) {
    const [r, l] = slotCounts(evolve(keepSlot(at, right), coin, tj - ti))
    const q = right ? 1n : -1n

    num += q * (r - l)
  }

  return { num, den: 4n ** BigInt(tj) }
}

// C_ij for the finer reading that also learns the cell: each (cell, slot) line evolves on its own; on a ring
// with no wrap before t_j the walk is the same from every cell, so the conditional slot chances depend on the
// slot only
export function walkCorrelatorFine(
  start: WalkState,
  coin: Coin,
  ti: number,
  tj: number,
): Rational {
  const n = start.right.length
  const center = Math.floor(n / 2)
  const at = evolve(start, coin, ti)
  const [atRight, atLeft] = slotCounts(at)

  const fromSlot = (right: boolean): bigint => {
    const unit: WalkState = {
      right: Array.from({ length: n }, (_, x) =>
        x === center && right ? ([1n, 0n] as const) : ZERO,
      ),
      left: Array.from({ length: n }, (_, x) =>
        x === center && !right ? ([1n, 0n] as const) : ZERO,
      ),
      t: 0,
    }
    const [r, l] = slotCounts(evolve(unit, coin, tj - ti))

    return r - l
  }

  return {
    num: atRight * fromSlot(true) - atLeft * fromSlot(false),
    den: 4n ** BigInt(tj),
  }
}

// the dephased twin: the walk's own one-beat chances (keep 1/4, reverse 3/4) as a Markov chain on (cell, slot)
export function twinCorrelator(
  start: ChanceState,
  ti: number,
  tj: number,
): Rational {
  let at = start

  for (let k = 0; k < ti; k++) {
    at = chanceBeat(at, 1n, 3n)
  }

  let num = 0n

  for (const right of [true, false]) {
    let s: ChanceState = {
      right: right ? at.right : at.right.map(() => 0n),
      left: right ? at.left.map(() => 0n) : at.left,
    }

    for (let k = ti; k < tj; k++) {
      s = chanceBeat(s, 1n, 3n)
    }

    const r = s.right.reduce((a, b) => a + b, 0n)
    const l = s.left.reduce((a, b) => a + b, 0n)

    num += (right ? 1n : -1n) * (r - l)
  }

  return { num, den: 4n ** BigInt(tj) }
}

// the marginal of Q at t_j with and without a reading at t_i, as whole numbers over 4^t_j: the chance of the
// right slot either way (no signaling in time asks them equal)
export function walkMarginals(
  start: WalkState,
  coin: Coin,
  ti: number,
  tj: number,
): { read: bigint; unread: bigint } {
  const at = evolve(start, coin, ti)
  const unread = slotCounts(evolve(at, coin, tj - ti))[0]

  let read = 0n

  for (const right of [true, false]) {
    read += slotCounts(evolve(keepSlot(at, right), coin, tj - ti))[0]
  }

  return { read, unread }
}

export function k3(c12: Rational, c23: Rational, c13: Rational): Rational {
  const den = [c12.den, c23.den, c13.den].reduce((a, b) => (a > b ? a : b))

  return {
    num:
      (c12.num * den) / c12.den +
      (c23.num * den) / c23.den -
      (c13.num * den) / c13.den,
    den,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 2. the role, over Z[zeta_12]

export const RING12 = cyclotomicRing(12)

// a + b omega, omega = zeta_12^4
export function fromEisenstein(a: bigint, b: bigint): Cyc {
  return RING12.add(
    RING12.scale(RING12.one(), a),
    RING12.scale(RING12.root(4), b),
  )
}

export function fromMat3(m: Mat3): CycMatrix {
  return cycReduce({
    n: 3,
    entries: m.num.map(([a, b]) => fromEisenstein(BigInt(a), BigInt(b))),
    den: 3n ** BigInt(m.den3),
  })
}

// sqrt 3 = zeta + zeta^-1 = 2 zeta - zeta^3
export const SQRT3: Cyc = RING12.sub(
  RING12.scale(RING12.root(1), 2n),
  RING12.root(3),
)

// a real element as a + b sqrt 3 (it has no zeta^2 part and its zeta part is -2 times its zeta^3 part)
export function realParts(x: Cyc): { a: bigint; b: bigint } {
  const [c0 = 0n, c1 = 0n, c2 = 0n, c3 = 0n] = x

  if (c2 !== 0n || c1 !== -2n * c3) {
    throw new Error(`not a real element of Q(zeta_12): ${x.join(',')}`)
  }

  return { a: c0, b: -c3 }
}

// the exact sign of a + b sqrt 3
export function signSqrt3(a: bigint, b: bigint): number {
  const sa = a > 0n ? 1 : a < 0n ? -1 : 0
  const sb = b > 0n ? 1 : b < 0n ? -1 : 0

  if (sa >= 0 && sb >= 0) {
    return sa + sb > 0 ? 1 : 0
  }

  if (sa <= 0 && sb <= 0) {
    return -1
  }

  // opposite signs: compare a^2 with 3 b^2
  const d = a * a - 3n * b * b

  return d === 0n ? 0 : d > 0n ? sa : sb
}

export function parity(): CycMatrix {
  return {
    n: 3,
    entries: Array.from({ length: 9 }, (_, k) => {
      const i = Math.floor(k / 3)
      const j = k % 3

      return (3 - j) % 3 === i ? RING12.one() : RING12.zero()
    }),
    den: 1n,
  }
}

export type Reading = {
  readonly projectors: readonly CycMatrix[]
  readonly values: readonly bigint[]
}

// R(X) = sum q_k P_k X P_k
export function readOut(reading: Reading, x: CycMatrix): CycMatrix {
  let out: CycMatrix = {
    n: 3,
    entries: Array.from({ length: 9 }, () => RING12.zero()),
    den: 1n,
  }

  reading.projectors.forEach((p, k) => {
    const sandwich = cycMul(RING12, cycMul(RING12, p, x), p)

    out = cycAdd(
      RING12,
      out,
      cycTimesElement(
        RING12,
        sandwich,
        RING12.scale(RING12.one(), reading.values[k]!),
      ),
    )
  })

  return out
}

export function conjugateBy(g: CycMatrix, x: CycMatrix): CycMatrix {
  return cycMul(RING12, cycMul(RING12, cycAdjoint(RING12, g), x), g)
}

// is lambda_max(N / den) <= r, with r = (p + q sqrt 3) / s, s > 0? Exactly: r den - N, scaled by s, is
// positive semidefinite, which for a 3 x 3 Hermitian is every principal minor >= 0. `equal` when it is
// semidefinite and singular (r is then an eigenvalue, the largest)
export function topAtMost(
  k: CycMatrix,
  r: { p: bigint; q: bigint; s: bigint },
): { atMost: boolean; equal: boolean } {
  const shift = RING12.add(
    RING12.scale(RING12.one(), r.p * k.den),
    RING12.scale(SQRT3, r.q * k.den),
  )
  const b = k.entries.map((x, idx) => {
    const minus = RING12.scale(x, -r.s)

    return Math.floor(idx / 3) === idx % 3 ? RING12.add(minus, shift) : minus
  })
  const at = (i: number, j: number): Cyc => b[3 * i + j]!
  const minor2 = (i: number, j: number): Cyc =>
    RING12.sub(
      RING12.mul(at(i, i), at(j, j)),
      RING12.mul(at(i, j), at(j, i)),
    )
  const det = RING12.add(
    RING12.sub(
      RING12.mul(at(0, 0), minor2(1, 2)),
      RING12.mul(
        at(0, 1),
        RING12.sub(
          RING12.mul(at(1, 0), at(2, 2)),
          RING12.mul(at(1, 2), at(2, 0)),
        ),
      ),
    ),
    RING12.mul(
      at(0, 2),
      RING12.sub(
        RING12.mul(at(1, 0), at(2, 1)),
        RING12.mul(at(1, 1), at(2, 0)),
      ),
    ),
  )
  const minors = [
    at(0, 0),
    at(1, 1),
    at(2, 2),
    minor2(0, 1),
    minor2(0, 2),
    minor2(1, 2),
    det,
  ]
  const signs = minors.map(m => {
    const { a, b: bb } = realParts(m)

    return signSqrt3(a, bb)
  })
  const atMost = signs.every(x => x >= 0)

  return { atMost, equal: atMost && signs[6] === 0 }
}

// the top eigenvalue in floats, from the exact characteristic polynomial, by the trigonometric cubic
export function topEigenvalue(k: CycMatrix): number {
  const coeffs = cycCharPoly(RING12, k).map(
    c => RING12.toComplex(c)[0] / 1,
  )
  const den = Number(k.den)
  // x^3 + a x^2 + b x + c for the numerators; eigenvalues of k are roots / den
  const a = coeffs[2]!
  const b = coeffs[1]!
  const c = coeffs[0]!
  const p = b - (a * a) / 3
  const q = (2 * a * a * a) / 27 - (a * b) / 3 + c

  if (Math.abs(p) < 1e-14) {
    return (Math.cbrt(-q) - a / 3) / den
  }

  const m = 2 * Math.sqrt(-p / 3)
  const arg = Math.max(-1, Math.min(1, (3 * q) / (p * m)))
  const theta = Math.acos(arg) / 3
  const roots = [0, 1, 2].map(
    k2 => m * Math.cos(theta - (2 * Math.PI * k2) / 3) - a / 3,
  )

  return Math.max(...roots) / den
}

// <s|K|s> for a state given as a projector |s><s| (exact), as a + b sqrt 3 over a denominator
export function expectation(
  k: CycMatrix,
  state: CycMatrix,
): { a: bigint; b: bigint; den: bigint } {
  const product = cycMul(RING12, k, state)

  let trace = RING12.zero()

  for (let i = 0; i < 3; i++) {
    trace = RING12.add(trace, product.entries[4 * i]!)
  }

  const { a, b } = realParts(trace)

  return { a, b, den: product.den }
}

export const identity3 = (): CycMatrix => cycIdentity(RING12, 3)
