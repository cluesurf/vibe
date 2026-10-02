// IS PBR'S READING A CLIFFORD READING? (E-QTM-0170, route "the Clifford knit is psi-epistemic", PBR section). With the
// fear beat off the knit is Clifford, and for odd dimension stabilizer quantum mechanics is Spekkens' toy theory, an
// epistemic model with the discrete Wigner function as its ontic distribution (Gross 2006). PBR's theorem (Pusey, Barrett,
// Rudolph 2012) rules out such models for any theory that holds PBR's reading. So in the model PBR can bite only
// through a reading that is not Clifford. The route's kill: "PBR's reading is Clifford (impossible if both results are
// right, so a fault)". This file checks it exhaustively for two copies.
//
// WHAT IS COUNTED. A two-copy PBR reading for a pair of non-orthogonal states psi_0, psi_1 is an orthonormal basis of
// the two-system space in which every outcome has probability exactly 0 on at least one of the four preparations
// psi_x (x) psi_y. A reading that Clifford operations and a computational-basis readout implement is the joint
// eigenbasis of a maximal commuting set of Weyl (generalized Pauli) operators: one basis per Lagrangian plane of
// F_d^4, 15 for two qubits and 40 for two qutrits. Every non-orthogonal pair of single-system stabilizer states (12
// ordered-free pairs for qubits, 54 for qutrits) is tried against every such basis.
//
// DERIVED BEFORE THE GATE RUN. For qutrits Gross's theorem gives every stabilizer state, Clifford map and stabilizer
// reading a non-negative Wigner function, so a non-negative ontological model reproduces them all and PBR's conclusion
// cannot follow inside the stabilizer fragment: no qutrit stabilizer basis is a PBR reading. For qubits the theorem
// does not apply, so nothing was derived there.
//
// PROBE BEFORE THE GATES, DISCLOSED (tmp/pbr-probe1.ts, 26 s): 6 and 12 single stabilizer states, 15 and 40 bases, 12
//  and 54 pairs, and 0 PBR readings in both dimensions. The qubit zero was not predicted. So the gates below were
//  written after the probe; the control (PBR's own entangled qubit basis, which the probe did not run) is new.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: the enumeration finds exactly 15 (qubit) and 40 (qutrit) Lagrangian bases and 6 and 12 single
//     stabilizer states; every basis is orthonormal (Gram matrix within 1e-12 of I) and its probabilities on every
//     preparation sum to 1 within 1e-12; every probability is either below 1e-12 or above 1e-3 (a clean zero test).
//  C1 CONTROL (the test can say yes): PBR's basis for |0>, |+> (xi_1 = (|01> + |10>)/sqrt 2, xi_2 = (|0-> + |1+>)/sqrt 2,
//     xi_3 = (|+1> + |-0>)/sqrt 2, xi_4 = (|+-> + |-+>)/sqrt 2) is orthonormal and each xi_j has probability 0 on the
//     j-th preparation, read by the same code: it is a PBR reading.
//  H1 THE ROUTE'S KILL: some stabilizer basis is a PBR reading for some qutrit pair.
//  P1 (Gross): 0 of 40 x 54 qutrit (basis, pair) cases is a PBR reading.
//  R  READ (gating nothing): the qubit count, and whether PBR's qubit basis is among the 15 stabilizer bases.
// VERDICT, fixed before the run: PASS (the route's statement, PBR bites only through a non-Clifford reading) when I1,
//  C1 and P1 hold; FAIL when H1 holds (a fault in one of the two theorems or in the instrument); PARTIAL otherwise.
// WHAT THIS CAN AND CANNOT SHOW. Two copies only. A reading built from the fear beat (non-Clifford) is not searched
//  here; route "run PBR as stated" asks for one.
//
// FIRST RUN 2026-10-02 (tmp/pbr-qtm-run1.log, 0.3 s): PASS, every gate as registered. I1: 6 and 12 stabilizer states,
//  15 and 40 bases, Gram and sums at 1e-15, least nonzero probability 0.25 (qubit) and 0.111 (qutrit), a clean zero test.
//  P1: 0 of 2,160 qutrit (basis, pair) cases is a PBR reading. C1: PBR's entangled qubit basis is one (each xi_j has
//  probability 0 on preparation j), and it is not among the 15 stabilizer bases. R: 0 of 180 qubit cases.
//
// Depth L1: exhaustive enumeration, floats on exact Weyl matrices with a gated zero margin.
// DETERMINISM: fixed enumeration; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'

type C = [number, number]
type Mat = C[][]

const mul = (a: C, b: C): C => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]
const add = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]]
const conj = (a: C): C => [a[0], -a[1]]
const abs2 = (a: C): number => a[0] * a[0] + a[1] * a[1]

const identity = (n: number): Mat =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j): C => [i === j ? 1 : 0, 0]),
  )

function matMul(A: Mat, B: Mat): Mat {
  const n = A.length

  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      let s: C = [0, 0]

      for (let k = 0; k < n; k++) {
        s = add(s, mul(A[i]![k]!, B[k]![j]!))
      }

      return s
    }),
  )
}

function kron(A: Mat, B: Mat): Mat {
  const n = A.length
  const m = B.length

  return Array.from({ length: n * m }, (_, r) =>
    Array.from({ length: n * m }, (_, c) =>
      mul(A[Math.floor(r / m)]![Math.floor(c / m)]!, B[r % m]![c % m]!),
    ),
  )
}

const inner = (a: C[], b: C[]): C =>
  a.reduce((s, x, i) => add(s, mul(conj(x), b[i]!)), [0, 0] as C)

const root = (d: number, k: number): C => {
  const t = (2 * Math.PI * (((k % d) + d) % d)) / d

  return [Math.cos(t), Math.sin(t)]
}

// the single-site Weyl operator, Hermitian-phased for qubits (i^(ab)) and with w^(ab / 2) for odd d, so that every
// W has order d and commuting ones multiply as a representation
function weyl1(d: number, a: number, b: number): Mat {
  const M: Mat = Array.from({ length: d }, () =>
    Array.from({ length: d }, (): C => [0, 0]),
  )

  for (let j = 0; j < d; j++) {
    let phase = root(d, b * j)

    phase =
      d === 2
        ? a && b
          ? mul(phase, [0, 1])
          : phase
        : mul(phase, root(d, ((d + 1) / 2) * a * b))
    M[(j + a) % d]![j] = phase
  }

  return M
}

// the rank-one projector onto the eigenvalue w^k of an order-d unitary M: (1/d) sum_m w^(-km) M^m
function eigenProjector(M: Mat, d: number, k: number): Mat {
  const n = M.length

  let P = identity(n).map(r => r.map(x => [x[0] / d, x[1] / d] as C))
  let power = M

  for (let m = 1; m < d; m++) {
    const ph = root(d, -k * m)

    P = P.map((row, i) =>
      row.map((x, j) =>
        add(x, mul(ph, power[i]![j]!).map(y => y / d) as C),
      ),
    )
    power = matMul(power, M)
  }

  return P
}

// a unit vector spanning the image of a rank-one projector
function imageVector(P: Mat): C[] | undefined {
  let best = -1
  let norm = 0

  for (let j = 0; j < P.length; j++) {
    const s = P.reduce((t, r) => t + abs2(r[j]!), 0)

    if (s > norm + 1e-9) {
      norm = s
      best = j
    }
  }

  if (norm < 1e-9) {
    return undefined
  }

  const v = P.map(r => r[best]!)
  const l = Math.sqrt(v.reduce((t, x) => t + abs2(x), 0))

  return v.map(x => [x[0] / l, x[1] / l] as C)
}

function singleStates(d: number): C[][] {
  const out: C[][] = []

  for (let a = 0; a < d; a++) {
    for (let b = 0; b < d; b++) {
      if (!a && !b) {
        continue
      }

      for (let k = 0; k < d; k++) {
        const v = imageVector(eigenProjector(weyl1(d, a, b), d, k))

        if (v && !out.some(u => abs2(inner(u, v)) > 1 - 1e-9)) {
          out.push(v)
        }
      }
    }
  }

  return out
}

function lagrangianBases(d: number): C[][][] {
  const symplectic = (u: number[], v: number[]): number =>
    (((u[0]! * v[1]! - u[1]! * v[0]! + u[2]! * v[3]! - u[3]! * v[2]!) %
      d) +
      d) %
    d
  const vectors: number[][] = []

  for (let x = 1; x < d ** 4; x++) {
    vectors.push([0, 1, 2, 3].map(i => Math.floor(x / d ** i) % d))
  }

  const seen = new Set<string>()
  const bases: C[][][] = []
  const W = (u: number[]): Mat =>
    kron(weyl1(d, u[0]!, u[1]!), weyl1(d, u[2]!, u[3]!))

  for (const u of vectors) {
    for (const v of vectors) {
      if (symplectic(u, v)) {
        continue
      }

      const span = new Set<string>()

      for (let a = 0; a < d; a++) {
        for (let b = 0; b < d; b++) {
          span.add(
            [0, 1, 2, 3].map(i => (a * u[i]! + b * v[i]!) % d).join(''),
          )
        }
      }

      const key = [...span].sort().join('|')

      if (span.size !== d * d || seen.has(key)) {
        continue
      }

      seen.add(key)

      const g1 = W(u)
      const g2 = W(v)
      const basis: C[][] = []

      for (let k1 = 0; k1 < d; k1++) {
        for (let k2 = 0; k2 < d; k2++) {
          const vec = imageVector(
            matMul(
              eigenProjector(g1, d, k1),
              eigenProjector(g2, d, k2),
            ),
          )

          if (vec) {
            basis.push(vec)
          }
        }
      }

      bases.push(basis)
    }
  }

  return bases
}

const product = (a: C[], b: C[]): C[] =>
  a.flatMap(x => b.map(y => mul(x, y)))

type Read = {
  isReading: boolean
  gram: number
  sum: number
  margin: number
}

// is the basis a PBR reading for the four preparations; with the instrument's checks
function readBasis(basis: C[][], preps: C[][]): Read {
  let gram = 0
  let sum = 0
  let margin = Number.POSITIVE_INFINITY

  for (let i = 0; i < basis.length; i++) {
    for (let j = 0; j < basis.length; j++) {
      const g = inner(basis[i]!, basis[j]!)

      gram = Math.max(gram, Math.hypot(g[0] - (i === j ? 1 : 0), g[1]))
    }
  }

  const probs = basis.map(b => preps.map(p => abs2(inner(b, p))))

  for (let x = 0; x < preps.length; x++) {
    sum = Math.max(
      sum,
      Math.abs(probs.reduce((t, r) => t + r[x]!, 0) - 1),
    )
  }

  for (const row of probs) {
    for (const p of row) {
      if (p >= 1e-12) {
        margin = Math.min(margin, p)
      }
    }
  }

  return {
    isReading: probs.every(row => row.some(p => p < 1e-12)),
    gram,
    sum,
    margin,
  }
}

export function pbrStabilizerRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}
  const notes: string[] = []

  let i1 = true
  let qutritReadings = 0
  let qubitReadings = 0

  for (const d of [2, 3]) {
    const states = singleStates(d)
    const bases = lagrangianBases(d)

    i1 &&=
      states.length === (d === 2 ? 6 : 12) &&
      bases.length === (d === 2 ? 15 : 40)

    let pairs = 0
    let readings = 0
    let worstGram = 0
    let worstSum = 0
    let margin = Number.POSITIVE_INFINITY

    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        if (abs2(inner(states[i]!, states[j]!)) < 1e-9) {
          continue
        }

        pairs++

        const s = [states[i]!, states[j]!]
        const preps = [
          product(s[0]!, s[0]!),
          product(s[0]!, s[1]!),
          product(s[1]!, s[0]!),
          product(s[1]!, s[1]!),
        ]

        for (const basis of bases) {
          const r = readBasis(basis, preps)

          worstGram = Math.max(worstGram, r.gram)
          worstSum = Math.max(worstSum, r.sum)
          margin = Math.min(margin, r.margin)

          if (r.isReading) {
            readings++
          }
        }
      }
    }

    i1 &&= worstGram < 1e-12 && worstSum < 1e-12 && margin > 1e-3

    if (d === 2) {
      qubitReadings = readings
    } else {
      qutritReadings = readings
    }

    metrics[`d${d}_states`] = states.length
    metrics[`d${d}_bases`] = bases.length
    metrics[`d${d}_pairs`] = pairs
    metrics[`d${d}_readings`] = readings
    metrics[`d${d}_margin`] = margin
    notes.push(
      `d = ${d}: ${states.length} stabilizer states, ${bases.length} Lagrangian bases, ${pairs} non-orthogonal pairs, ${readings} PBR readings of ${pairs * bases.length} (basis, pair) cases; Gram ${worstGram.toExponential(1)}, sums ${worstSum.toExponential(1)}, least nonzero probability ${margin.toFixed(4)}`,
    )
  }

  // C1: PBR's own qubit basis for |0>, |+>
  const s = 1 / Math.SQRT2
  const zero: C[] = [
    [1, 0],
    [0, 0],
  ]
  const one: C[] = [
    [0, 0],
    [1, 0],
  ]
  const plus: C[] = [
    [s, 0],
    [s, 0],
  ]
  const minus: C[] = [
    [s, 0],
    [-s, 0],
  ]
  const sumOf = (a: C[], b: C[]): C[] =>
    a.map((x, i) => [(x[0] + b[i]![0]) * s, (x[1] + b[i]![1]) * s] as C)
  const xi = [
    sumOf(product(zero, one), product(one, zero)),
    sumOf(product(zero, minus), product(one, plus)),
    sumOf(product(plus, one), product(minus, zero)),
    sumOf(product(plus, minus), product(minus, plus)),
  ]
  const preps = [
    product(zero, zero),
    product(zero, plus),
    product(plus, zero),
    product(plus, plus),
  ]
  const control = readBasis(xi, preps)
  const diagonalZero = xi.every(
    (x, j) => abs2(inner(x, preps[j]!)) < 1e-12,
  )
  const c1 = control.isReading && diagonalZero && control.gram < 1e-12
  // R: is PBR's basis among the qubit stabilizer bases
  const qubitBases = lagrangianBases(2)
  const pbrIsStabilizer = qubitBases.some(b =>
    xi.every(x => b.some(v => abs2(inner(v, x)) > 1 - 1e-9)),
  )

  const p1 = qutritReadings === 0
  const h1 = qutritReadings > 0
  const status = h1 ? 'fail' : i1 && c1 && p1 ? 'pass' : 'partial'

  return verdict({
    status,
    claim: `${p1 ? 'no stabilizer reading is a two-copy PBR reading' : 'a stabilizer reading implements PBR'}: over every Lagrangian basis (Clifford map plus computational readout) and every non-orthogonal pair of stabilizer states, ${qutritReadings} of ${metrics.d3_pairs! * metrics.d3_bases!} qutrit cases and ${qubitReadings} of ${metrics.d2_pairs! * metrics.d2_bases!} qubit cases exclude a preparation with every outcome, while PBR's own entangled qubit basis does (${c1 ? 'read by the same code' : 'control failed'}) and is ${pbrIsStabilizer ? '' : 'not '}a stabilizer basis; so in the Clifford knit PBR can bite only through a non-Clifford reading, as Gross's non-negative Wigner model requires for qutrits, and for two qubits the stabilizer fragment holds no PBR reading either`,
    metrics: {
      gate_I1: i1 ? 1 : 0,
      gate_C1: c1 ? 1 : 0,
      gate_H1: h1 ? 1 : 0,
      gate_P1: p1 ? 1 : 0,
      pbrIsStabilizer: pbrIsStabilizer ? 1 : 0,
      ...metrics,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      pbrBasisIsReading: control.isReading ? 1 : 0,
      pbrBasisGram: control.gram,
    },
    notes: `L1. Gates I1 ${i1}, C1 ${c1}, H1 ${h1}, P1 ${p1}. ${notes.join('. ')}. PBR's qubit basis: reading ${control.isReading}, xi_j orthogonal to preparation j ${diagonalZero}, among the 15 stabilizer bases ${pbrIsStabilizer}. ${((Date.now() - started) / 1000).toFixed(1)} s.`,
  })
}

export default experiment({
  id: 'quantum/pbr-stabilizer-readings',
  code: 'E-QTM-0170',
  title:
    "PBR's reading is not a Clifford reading, pass: over every Lagrangian basis (a Clifford map and a computational readout) and every non-orthogonal pair of stabilizer states, 0 of 2,160 qutrit cases and 0 of 180 qubit cases exclude a preparation with every outcome, while PBR's own entangled qubit basis does and is not a stabilizer basis; so in the Clifford knit PBR can bite only through a non-Clifford reading, the fear beat, as Gross's non-negative Wigner model requires for qutrits",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return pbrStabilizerRun()
  },
})
