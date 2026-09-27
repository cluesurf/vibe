// State-independent contextuality and the model: does any proof that holds for every state live in the
// model's own readings, and what does the fear beat have to do with it?
//
// Peres (1990) and Mermin (1990) gave a square of nine two-qubit Pauli products whose rows multiply to +1 and
// whose columns multiply to +1, +1, -1, so no assignment of +-1 values exists: contextual for every state. The
// sign comes from anticommuting Paulis (XZ = -ZX). For odd dimension the displacements obey
// D(u) D(v) = omega^(c [u, v]) D(u + v) (c = 1 in this file's convention, read off the operators; the header
// said c = 2 before the first run, see the notes), so COMMUTING displacements multiply with no phase, and the phase
// point x gives every displacement of any number of roles the value omega^[x, v], consistent on every commuting
// set. The prediction, derived before the run: no Peres-Mermin square and no Kochen-Specker set exists among the
// model's Clifford readings of any number of roles, and E-QTM-0149 shows that for two roles the phase points
// are the only such assignments. State-independent contextuality therefore needs measurements outside the
// stabilizer ones. Yu and Oh (2012) give one for a single qutrit: 13 rays with an inequality whose
// noncontextual bound is 8 and whose quantum value is 25/3 for EVERY state (Kleinmann, Budroni, Larsson, Guhne
// and Cabello 2012 for its optimality). Since its value does not depend on the state, it cannot see fear: a
// fear-free role violates it as much as the most magic one. Only 4 of its 13 rays are stabilizer states (the
// three basis states and (1, 1, 1)).
//
// So the textbook holds, and says where: state-independent contextuality is a property of the MEASUREMENTS,
// none of which the model's links make, while the state-dependent contextuality that equals magic (E-QTM-0149)
// is a property of the knot, made only by the fear beat.
//
// Gates, fixed before the first run (G1 to G3 as first written are kept in the notes, with why they failed):
// G1 the one-role product rule D(u) D(v) = omega^(c [u, v]) D(u + v) on all 81 pairs (1e-12), with one c for
//    every pair, so the phase points are consistent assignments of every displacement of any number of roles
// G2 Peres-Mermin squares: over every choice of the four corner vectors (81^4 for two qutrits, 16^4 for two
//    qubits), the squares whose three rows and three columns each commute and close are counted, and those
//    whose nine entries do NOT all commute (a genuine square, more than one context). Qutrits: 0 genuine,
//    because the rows and columns force [p, t] = [q, s] and [p, t] = -[q, s], so 2 [p, t] = 0 and the square
//    is one context. Qubits: genuine squares exist, and the textbook one has 0 consistent +-1 assignments of
//    512 (its signs computed from the Pauli matrices, not typed)
// G3 Yu-Oh: the 13 rays have 24 orthogonal pairs, the operator sum_k A_k - (1/4) sum_(k, l) Gamma_kl A_k A_l
//    (A_k = 1 - 2 P_k, the sum over ordered pairs, each orthogonal pair twice) equals 25/3 times the identity
//    (1e-12), and its largest value over the 8,192 +-1 assignments is 8
// G4 every reduced role state the knit reaches (color law, fear on and off, vacuum, 120 beats, dock 0, three
//    starts) reads 25/3 (1e-12), those with fear and those without alike
// G5 exactly 4 of the 13 rays have a non-negative Wigner function (1e-12)
//
// Depth L1: known theorems, checked in the model's conventions and on its reached states.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeColorWeave } from '@/code/rule/color-weave'
import { fearKernels, physicalWhole } from '@/code/rule/fear-weave'
import { classicalRecords, meetingPairs, pairRecords, productWhole, runWhole, vacuumBackground, type RoleState } from '@/code/measure/knit-magic'
import { assignmentSpace, marginalOf, phaseSpace } from '@/code/measure/stabilizer-contexts'
import { displacementOperators, operatorFrom3, operatorFromWigner } from '@/code/measure/qutrit-clifford'
import { multiplyOperators, operator, tensorOperators, type Operator } from '@/code/measure/grid-weights'
import { phasePoint, wignerFunction } from '@/code/measure/qutrit-phase-space'

const OMEGA = (2 * Math.PI) / 3
const BEATS = 120
const STARTS: readonly (readonly [RoleState, RoleState])[] = [
  ['basis0', 'basis1'],
  ['strange', 'basis0'],
  ['strange', 'strange'],
]

const cube = (k: number): [number, number] => [Math.cos((OMEGA * k) % (2 * Math.PI)), Math.sin((OMEGA * k) % (2 * Math.PI))]

// the largest entry-wise distance between a and phase times b
function distance(a: Operator, b: Operator, phase: [number, number]): number {
  let error = 0

  for (let i = 0; i < a.n * a.n; i++) {
    const br = (b.re[i] ?? 0) * phase[0] - (b.im[i] ?? 0) * phase[1]
    const bi = (b.re[i] ?? 0) * phase[1] + (b.im[i] ?? 0) * phase[0]

    error = Math.max(error, Math.abs((a.re[i] ?? 0) - br), Math.abs((a.im[i] ?? 0) - bi))
  }

  return error
}

// the scalar c with a = c 1, read from the trace, and how far a is from it
function asScalar(a: Operator): { re: number; im: number; error: number } {
  let re = 0
  let im = 0

  for (let i = 0; i < a.n; i++) {
    re += a.re[i * a.n + i] ?? 0
    im += a.im[i * a.n + i] ?? 0
  }

  re /= a.n
  im /= a.n

  let error = 0

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      error = Math.max(error, Math.abs((a.re[i * a.n + j] ?? 0) - (i === j ? re : 0)), Math.abs((a.im[i * a.n + j] ?? 0) - (i === j ? im : 0)))
    }
  }

  return { re, im, error }
}

export default experiment({
  id: 'quantum/state-independent-contextuality',
  code: 'E-QTM-0150',
  title:
    'state-independent contextuality lives in the measurements, not in the knot: commuting displacements of odd dimension multiply with no phase, so the phase points assign every Clifford reading of any number of roles consistently and no Peres-Mermin square or Kochen-Specker set exists among the model\'s readings (the qubit square has 0 of 512), while Yu-Oh\'s 13 rays, 9 of them outside the stabilizer states, read 25/3 against 8 on every reduced role state the knit reaches, with fear or without',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // G1 the product rule on one role
    const one = phaseSpace(1)
    const d1 = displacementOperators(1)
    // c read from X Z = D(1, 0) D(0, 1), whose form is 1, then held for every pair
    const productC = [0, 1, 2].find(c => distance(multiplyOperators(d1[3]!, d1[1]!), d1[4]!, cube(c)) < 1e-12) ?? -1
    let productError = 0

    for (let u = 0; u < 9; u++) {
      for (let v = 0; v < 9; v++) {
        const f = one.form[u * 9 + v] ?? 0

        productError = Math.max(productError, distance(multiplyOperators(d1[u]!, d1[v]!), d1[one.add[u * 9 + v] ?? 0]!, cube(productC * f)))
      }
    }

    const two = phaseSpace(2)
    const twoAssignments = assignmentSpace(two)

    // G2 the qubit square, with signs from the matrices
    const pauli = (k: number): Operator => {
      const o = operator(2)

      if (k === 0) {
        o.re[0] = 1
        o.re[3] = 1
      } else if (k === 1) {
        o.re[1] = 1
        o.re[2] = 1
      } else if (k === 2) {
        o.im[1] = -1
        o.im[2] = 1
      } else {
        o.re[0] = 1
        o.re[3] = -1
      }

      return o
    }

    const [I, X, Y, Z] = [0, 1, 2, 3].map(pauli) as [Operator, Operator, Operator, Operator]
    const square: Operator[][] = [
      [tensorOperators(X, I), tensorOperators(I, X), tensorOperators(X, X)],
      [tensorOperators(I, Z), tensorOperators(Z, I), tensorOperators(Z, Z)],
      [tensorOperators(X, Z), tensorOperators(Z, X), tensorOperators(Y, Y)],
    ]
    const qubitSigns: number[] = []
    let qubitScalarError = 0

    for (let r = 0; r < 3; r++) {
      const s = asScalar(multiplyOperators(multiplyOperators(square[r]![0]!, square[r]![1]!), square[r]![2]!))

      qubitSigns.push(Math.sign(s.re))
      qubitScalarError = Math.max(qubitScalarError, s.error)
    }

    for (let c = 0; c < 3; c++) {
      const s = asScalar(multiplyOperators(multiplyOperators(square[0]![c]!, square[1]![c]!), square[2]![c]!))

      qubitSigns.push(Math.sign(s.re))
      qubitScalarError = Math.max(qubitScalarError, s.error)
    }

    let qubitConsistent = 0

    for (let mask = 0; mask < 512; mask++) {
      const value = (r: number, c: number): number => ((mask >> (3 * r + c)) & 1 ? -1 : 1)
      let ok = true

      for (let r = 0; r < 3; r++) {
        ok = ok && value(r, 0) * value(r, 1) * value(r, 2) === qubitSigns[r]
      }

      for (let c = 0; c < 3; c++) {
        ok = ok && value(0, c) * value(1, c) * value(2, c) === qubitSigns[3 + c]
      }

      qubitConsistent += ok ? 1 : 0
    }

    // every square from its four corners p, q, s, t: rows (p, q, -p - q), (s, t, -s - t), (-p - s, -q - t,
    // p + q + s + t), each row and column closing to 0. Rows and columns commute when [p, q], [s, t], [p, s],
    // [q, t], [p + s, q + t] and [p + q, s + t] vanish; the square is genuine when the nine entries do not all
    // commute, which with those is [p, t] != 0 or [q, s] != 0
    const countSquares = (points: number, form: Int8Array, add: Int32Array): { valid: number; genuine: number } => {
      let valid = 0
      let genuine = 0

      for (let p = 0; p < points; p++) {
        for (let q = 0; q < points; q++) {
          if (form[p * points + q] !== 0) {
            continue
          }

          for (let s = 0; s < points; s++) {
            if (form[p * points + s] !== 0) {
              continue
            }

            const ps = add[p * points + s] ?? 0

            for (let t = 0; t < points; t++) {
              if (form[s * points + t] !== 0 || form[q * points + t] !== 0) {
                continue
              }

              const qt = add[q * points + t] ?? 0
              const pq = add[p * points + q] ?? 0
              const st = add[s * points + t] ?? 0

              if (form[ps * points + qt] !== 0 || form[pq * points + st] !== 0) {
                continue
              }

              valid++
              genuine += form[p * points + t] !== 0 || form[q * points + s] !== 0 ? 1 : 0
            }
          }
        }
      }

      return { valid, genuine }
    }
    const qutritSquares = countSquares(81, two.form, two.add)
    // two qubits: points (x1, z1, x2, z2) as 4 bits, addition by XOR, the form mod 2
    const qubitForm = new Int8Array(256)
    const qubitAdd = new Int32Array(256)

    for (let u = 0; u < 16; u++) {
      for (let v = 0; v < 16; v++) {
        const bit = (w: number, k: number): number => (w >> k) & 1

        qubitForm[u * 16 + v] = (bit(u, 3) * bit(v, 2) + bit(u, 2) * bit(v, 3) + bit(u, 1) * bit(v, 0) + bit(u, 0) * bit(v, 1)) % 2
        qubitAdd[u * 16 + v] = u ^ v
      }
    }

    const qubitSquares = countSquares(16, qubitForm, qubitAdd)

    // G3 Yu-Oh
    const rays = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 1, -1],
      [1, 0, -1],
      [1, -1, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
      [-1, 1, 1],
      [1, -1, 1],
      [1, 1, -1],
      [1, 1, 1],
    ]
    const projectors = rays.map(r => {
      const norm = r.reduce((s, x) => s + x * x, 0)
      const p = operator(3)

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          p.re[i * 3 + j] = ((r[i] ?? 0) * (r[j] ?? 0)) / norm
        }
      }

      return p
    })
    const edges: [number, number][] = []

    rays.forEach((a, i) => {
      rays.forEach((b, j) => {
        if (i < j && a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0) === 0) {
          edges.push([i, j])
        }
      })
    })

    const yuOh = operator(3)
    const observable = (p: Operator): Operator => {
      const a = operator(3)

      for (let k = 0; k < 9; k++) {
        a.re[k] = (k % 4 === 0 ? 1 : 0) - 2 * (p.re[k] ?? 0)
        a.im[k] = -2 * (p.im[k] ?? 0)
      }

      return a
    }
    const observables = projectors.map(observable)

    observables.forEach(a => {
      for (let k = 0; k < 9; k++) {
        yuOh.re[k] = (yuOh.re[k] ?? 0) + (a.re[k] ?? 0)
      }
    })

    // the sum over ordered pairs: each orthogonal pair twice
    for (const [i, j] of edges) {
      for (const [k1, k2] of [
        [i, j],
        [j, i],
      ] as const) {
        const product = multiplyOperators(observables[k1]!, observables[k2]!)

        for (let k = 0; k < 9; k++) {
          yuOh.re[k] = (yuOh.re[k] ?? 0) - (product.re[k] ?? 0) / 4
          yuOh.im[k] = (yuOh.im[k] ?? 0) - (product.im[k] ?? 0) / 4
        }
      }
    }

    const yuOhScalar = asScalar(yuOh)
    let classicalBound = Number.NEGATIVE_INFINITY

    for (let mask = 0; mask < 1 << 13; mask++) {
      const a = (k: number): number => ((mask >> k) & 1 ? -1 : 1)
      let value = 0

      for (let k = 0; k < 13; k++) {
        value += a(k)
      }

      for (const [i, j] of edges) {
        value -= (a(i) * a(j)) / 2
      }

      classicalBound = Math.max(classicalBound, value)
    }

    // G5 which rays are stabilizer states
    let stabilizerRays = 0

    for (const r of rays) {
      const norm = Math.sqrt(r.reduce((s, x) => s + x * x, 0))
      const w = wignerFunction({ re: r.map(x => x / norm), im: [0, 0, 0] })

      stabilizerRays += Math.min(...w) > -1e-12 ? 1 : 0
    }

    // G4 the knit's reduced role states
    const onePoints = [0, 1, 2].flatMap(a => [0, 1, 2].map(b => operatorFrom3(phasePoint(a, b))))
    const weave = makeColorWeave({ side: 3, table: 'pair' })
    const slots = weave.mesh.cellCount * 24
    const records = classicalRecords({ weave, links: weave.links, background: vacuumBackground(slots), open: Array.from({ length: 24 }, (_, d) => d), beats: BEATS })
    const laws = [fearKernels({ like: OMEGA, unlike: OMEGA }), fearKernels({ like: Math.PI, unlike: 0 })]
    let reduced = 0
    let reducedWithFear = 0
    let yuOhDeviation = 0
    let fearFreeAt25Over3 = 0
    let fearAt25Over3 = 0

    for (const { a, b } of meetingPairs(records)) {
      const mine = pairRecords(records, a, b)

      for (const start of STARTS) {
        for (const color of laws) {
          const whole = productWhole([a, b], start)
          const steps = [whole, ...runWhole({ weave, start: whole, records: mine, kernel4: [], color: color ?? undefined }).map(s => s.whole)]

          for (const step of steps) {
            const weight = physicalWhole(step).weight

            for (const keep of [0, 1]) {
              const m = marginalOf(weight, 2, [keep])
              const n = Number(m.reduce((x, y) => x + y, 0n))
              const fear = m.some(w => w < 0n)
              const rho = operatorFromWigner(m.map(w => Number(w) / n), onePoints)
              let value = 0

              for (let i = 0; i < 3; i++) {
                for (let k = 0; k < 3; k++) {
                  value += (rho.re[i * 3 + k] ?? 0) * (yuOh.re[k * 3 + i] ?? 0) - (rho.im[i * 3 + k] ?? 0) * (yuOh.im[k * 3 + i] ?? 0)
                }
              }

              const deviation = Math.abs(value - 25 / 3)

              reduced++
              reducedWithFear += fear ? 1 : 0
              yuOhDeviation = Math.max(yuOhDeviation, deviation)
              fearAt25Over3 += fear && deviation < 1e-12 ? 1 : 0
              fearFreeAt25Over3 += !fear && deviation < 1e-12 ? 1 : 0
            }
          }
        }
      }
    }

    const g1 = productError < 1e-12 && productC >= 0 && twoAssignments.dimension === 4
    const g2 = qubitConsistent === 0 && qubitScalarError < 1e-12 && qutritSquares.genuine === 0 && qutritSquares.valid > 0 && qubitSquares.genuine > 0
    const g3 = edges.length === 24 && yuOhScalar.error < 1e-12 && Math.abs(yuOhScalar.re - 25 / 3) < 1e-12 && classicalBound === 8
    const g4 = yuOhDeviation < 1e-12 && reducedWithFear > 0 && reduced > reducedWithFear
    const g5 = stabilizerRays === 4

    return verdict({
      status: g1 && g2 && g3 && g4 && g5 ? 'pass' : 'fail',
      claim:
        'commuting displacements of odd dimension multiply with no phase, so the phase points assign every Clifford reading of any number of roles consistently: no Peres-Mermin square or Kochen-Specker set exists among the model\'s readings, where the qubit square has 0 of 512 assignments; Yu-Oh\'s rays, 9 of 13 outside the stabilizer states, read 25/3 against the bound 8 on every reduced role state the knit reaches, fear or no fear, so state-independent contextuality is in the measurement and blind to magic',
      metrics: {
        gateProductRule: g1 ? 1 : 0,
        gatePeresMermin: g2 ? 1 : 0,
        gateYuOhOperator: g3 ? 1 : 0,
        gateYuOhOnKnits: g4 ? 1 : 0,
        gateStabilizerRays: g5 ? 1 : 0,
        oneRoleProductRuleError: productError,
        productRuleC: productC,
        twoRoleAssignmentDimension: twoAssignments.dimension,
        qubitSquareConsistentAssignments: qubitConsistent,
        qubitSquareColumnThirdSign: qubitSigns[5] ?? 0,
        qutritSquaresValid: qutritSquares.valid,
        qutritSquaresGenuine: qutritSquares.genuine,
        qubitSquaresValid: qubitSquares.valid,
        qubitSquaresGenuine: qubitSquares.genuine,
        yuOhOrthogonalPairs: edges.length,
        yuOhOperatorScalar: yuOhScalar.re,
        yuOhOperatorScalarError: yuOhScalar.error,
        yuOhClassicalBound: classicalBound,
        reducedRoleStates: reduced,
        reducedRoleStatesWithFear: reducedWithFear,
        fearFreeStatesAt25Over3: fearFreeAt25Over3,
        fearStatesAt25Over3: fearAt25Over3,
        yuOhLargestDeviationOnKnits: yuOhDeviation,
        stabilizerRaysOf13: stabilizerRays,
      },
      control: {
        qubitSquareScalarError: qubitScalarError,
      },
      notes:
        'FIRST RUN 2026-09-26 FAILED G1 to G4 on three errors of mine, none in the model: (1) G1 fixed the product phase as omega^(2 [u, v]); the operators give omega^([u, v]) (error 1.73 with c = 2), so G1 now reads c off X Z and holds it for all 81 pairs, a convention and not a threshold; (2) G2 assumed the qubit square\'s pattern, built from qutrit displacements X1, X2, Z2, Z1, has commuting rows and columns; its third column does not ([X1 + X2, Z1 + Z2] = 2), and the enumeration now in G2 shows why no qutrit pattern can: the rows and columns force 2 [p, t] = 0, so every closing square is a single context. G2 was restated after the run as that enumeration, disclosed here; (3) G3 transcribed the Yu-Oh sum over unordered pairs, which gives 19/3 on every state and a classical bound of 7; the published form sums over ordered pairs (each orthogonal pair twice), which gives 25/3 and 8. G4 failed only through (3): every reduced state read 19/3 exactly, the same state independence. G5 passed. ' +
        'L1. The Yu-Oh value is state-independent by construction once the operator identity holds (G3), so G4 is a check of the instrument on the knit\'s states and a statement of what the inequality cannot see, not evidence about the rule. The model\'s own readings are stabilizer measurements (lines and Lagrangian cosets); E-QTM-0149 shows their contextuality is state-dependent and equals fear. The 9 non-stabilizer Yu-Oh rays need a reading after a fear beat (with a second role) to be made at all, which this file does not attempt.',
    })
  },
})
