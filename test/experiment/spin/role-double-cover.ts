// Is the double cover already in the role? And can a knot carry it?
//
// E-SPN-0044 found the committed knit carries no spinor sign: its turn lifts to (-1, +1) and the palindrome
// nets +1, and the slot directions are a 2T torsor whose 2 pi turn is the point inversion. E-MTH-0009 proved the
// role grid's turn group SL(2, 3) IS 2T. This asks the role, not the lattice.
//
// THE QUESTION. The role grid is a qutrit's phase space (E-FRC-0104, E-FRC-0120). A turn M in SL(2, 3) moves grid
// points, and moves the qutrit's amplitudes only up to a phase. Choosing the phases so the unitaries multiply as
// the turns do (a LIFT, code/algebra/weil-representation, found by exhaustive search over the 4 x 3 phase
// pairs) either can or cannot send the central turn -I, the 2 pi turn of 2T, to -1 on some states. If it does,
// the double cover is in the role and nothing needs to be added to find it.
//
// PREDICTION, written before any run. The Weil representation's value on -I is (-1 / p) P, the Legendre symbol
// times the parity P |x> = |-x>. For p = 3, (-1 / 3) = -1, so the 2 pi turn is -P: -1 on the two-dimensional
// parity-even subspace (a spin one half doublet) and +1 on the parity-odd state (|1> - |2>) / sqrt 2, the
// strange state, the most fearful qutrit state (W(0) = -1/3). The sign is forced for every lift, because -I lies
// in the commutator subgroup Q8 of SL(2, 3), where every phase choice cancels. The Legendre law is tested at
// p = 5, 7, 11, 13, where it predicts +, -, -, +: a law that could fail.
//
// THE FEAR IDENTITY. The phase-point operator of the model's signed weight is A(x) = D(x) P D(x)^dagger
// (code/measure/qutrit-phase-space). If the lift of -I is -P, the 2 pi turn ABOUT the grid point x,
// R_x = D(x) lift(-I) D(x)^dagger, is exactly -A(x), so every weight is W(x) = -<R_x> / 3: a love at x is a
// state the 2 pi turn about x sends toward -1, a fear at x one it sends toward +1. The double cover and the
// signed weight are one operator.
//
// THE HUSK. The husk is the three-dimensional shadow of the D4 bulk along the depth e4 (code/measure/photon-husk).
// Moving the depth to the real quaternion axis (y = x k-bar), the maps x -> q x q-bar, q a Hurwitz unit, are the
// bulk symmetries that fix the depth: each must permute the 24 D4 roots, fix e4 and act on the husk as a cube
// rotation. Twelve distinct rotations, with q and -q giving the same one, is the double cover 2T -> T of the
// husk's tetrahedral turns. A 120 degree husk turn applied three times is the identity on the husk and lifts to
// -1 in 2T. Control: left multiplication, the slot torsor's action of E-SPN-0044, fixes the depth only for q = 1,
// so the slots carry no husk turn at all.
//
// THE KNOT. A knot is a set no change of role frame can tell apart: every frame change (the 216 moves, turns and
// translations, lifted) multiplies it by at most a phase. Such states are exactly the ones fixed by the
// commutator subgroup [G, G], and if lift(-I) lies in [G, G] (up to a scalar), every knot has 2 pi sign +1: a
// knot cannot be a spinor. Measured on three roles (the lepton-like triple) and on a role and an antirole (the
// meson). Control: gauging only the nine translations, the triple's invariant states include spinors, so the
// test can say no.
//
// Gates, fixed before the first run:
// G1 lifts exist: 3 for p = 3 (one per character of SL(2, 3) onto Z3), 1 for p = 5, 7, 11, 13 (perfect groups)
// G2 every lift sends -I to c P with c = (-1 / p) to 1e-9
// G3 p = 3: the parity-even subspace is 2-dimensional with 2 pi sign -1; its character is irreducible in every
//    lift (sum of |chi|^2 = 24) and equals the natural spin one half character of 2T in exactly 1 of the 3 lifts;
//    the parity-odd state has W(0) = -1/3
// G4 every order-6 turn h: lift(h)^3 = -P and lift(h)^6 = I, in every lift
// G5 D(x) lift(-I) D(x)^dagger = -A(x) at all 9 points to 1e-12, and W(x) = -<R_x>/3 on 64 Weyl-sequence states
//    to 1e-12
// G6 a two-arm interferometer with a 2 pi turn in one arm: bright chance 0 on 64 doublet states, 1 on the strange
//    state, and 1/3 on the unpolarized role read from its weights (1 - 3 W(0)) / 2, all to 1e-12
// G7 the 24 depth-fixing conjugations permute the D4 roots, fix e4, give 12 distinct husk rotations (signed
//    permutations, determinant +1), kernel {1, -1}; order-6 units give order-3 husk turns; left multiplication
//    fixes the depth for exactly 1 unit
// G8 lift(-I) lies in the commutator subgroup up to a scalar; on three roles and on role (x) antirole the knot
//    space is nonzero and every knot has 2 pi sign +1; control: the translation-only triple has invariant rank 3
//    with 2 spinorial dimensions; spinorial dimensions 2 of 3 for one role and 14 of 27 for three
//
// Depth L1: known mathematics (the Weil representation, Royer's displaced parity, the double cover of the
// tetrahedral group) placed on the model's own role grid and husk. It proves where a spinor CAN live, not that
// the knit makes one.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weyl, GOLDEN, SILVER } from '@/code/tool/weyl'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { binaryTetrahedralGroup, quaternionConjugate, quaternionMultiply, type Quaternion } from '@/code/algebra/binary-tetrahedral'
import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { phasePoint, wignerFunction, PHASE_POINTS } from '@/code/measure/qutrit-phase-space'
import {
  centralScalar,
  closeGroup,
  conjugateMatrix,
  daggerMatrix,
  displacementMatrix,
  gridOrder,
  kronecker,
  legendre,
  liftOf,
  matrixDistance,
  parityMatrix,
  scaleMatrix,
  traceOf,
  unitPhase,
  weilLifts,
  type WeilLift,
} from '@/code/algebra/weil-representation'

const PRIMES = [3, 5, 7, 11, 13]
const STATES = 64
const EXACT = 1e-12
const LOOSE = 1e-9

// the natural (spin one half) character of 2T = SL(2, 3), by element order
const SPIN_HALF: Record<number, number> = { 1: 2, 2: -2, 3: -1, 4: 0, 6: 1 }

type State = { re: number[]; im: number[] }

function weylState(n: number): State {
  const re = [0, 1, 2].map(j => weyl(3 * n + j + 1, GOLDEN) - 0.5)
  const im = [0, 1, 2].map(j => weyl(3 * n + j + 1, SILVER) - 0.5)
  const norm = Math.hypot(...re, ...im)

  return { re: re.map(x => x / norm), im: im.map(x => x / norm) }
}

// <psi| M |psi>
function expectation(m: ComplexMatrix, psi: State): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < m.n; i++) {
    for (let j = 0; j < m.n; j++) {
      const ar = m.re[i * m.n + j] ?? 0
      const ai = m.im[i * m.n + j] ?? 0
      // conj(psi_i) M_ij psi_j
      const pr = (psi.re[i] ?? 0) * (psi.re[j] ?? 0) + (psi.im[i] ?? 0) * (psi.im[j] ?? 0)
      const pi = (psi.re[i] ?? 0) * (psi.im[j] ?? 0) - (psi.im[i] ?? 0) * (psi.re[j] ?? 0)

      re += ar * pr - ai * pi
      im += ar * pi + ai * pr
    }
  }

  return [re, im]
}

// the model's phase-point operator (code/measure/qutrit-phase-space) as a ComplexMatrix
function modelPhasePoint(a: number, b: number): ComplexMatrix {
  const m = phasePoint(a, b)
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let k = 0; k < 9; k++) {
    re[k] = m[2 * k] ?? 0
    im[k] = m[2 * k + 1] ?? 0
  }

  return { re, im, n: 3 }
}

const power = (m: ComplexMatrix, n: number): ComplexMatrix => {
  let out = complexIdentity(m.n)

  for (let k = 0; k < n; k++) {
    out = complexMultiply(out, m)
  }

  return out
}

// the projector onto the vectors every element of a group fixes, as the group average
function averageOf(group: readonly ComplexMatrix[]): ComplexMatrix {
  const n = group[0]?.n ?? 1
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (const g of group) {
    for (let i = 0; i < n * n; i++) {
      re[i] = (re[i] ?? 0) + (g.re[i] ?? 0) / group.length
      im[i] = (im[i] ?? 0) + (g.im[i] ?? 0) / group.length
    }
  }

  return { re, im, n }
}

// rank and 2 pi sign on the range of a projector: [trace, trace of projector times the turn]
function knotReading(projector: ComplexMatrix, turn: ComplexMatrix): { rank: number; signTrace: number } {
  return { rank: traceOf(projector)[0], signTrace: traceOf(complexMultiply(projector, turn))[0] }
}

function huskReading(): {
  permuteRoots: number
  fixDepth: number
  distinctRotations: number
  kernel: number
  orderSixToOrderThree: number
  properRotations: number
  leftFixesDepth: number
} {
  const roots = rootsD4()
  const units = binaryTetrahedralGroup()
  const k: Quaternion = [0, 0, 0, 1]
  const kBar = quaternionConjugate(k)
  const rootKey = (v: readonly number[]): string => v.map(x => Math.round(x)).join(',')
  const rootSet = new Set(roots.map(rootKey))
  // x -> q (x k-bar) q-bar k: the conjugation by q with the depth e4 moved to the real axis and back
  const act = (q: Quaternion, x: Quaternion): Quaternion =>
    quaternionMultiply(quaternionMultiply(quaternionMultiply(q, quaternionMultiply(x, kBar)), quaternionConjugate(q)), k)
  const restriction = (q: Quaternion): number[] =>
    [0, 1, 2].flatMap(j => {
      const e: Quaternion = [0, 0, 0, 0]

      e[j] = 1

      return act(q, e).slice(0, 3).map(x => Math.round(x * 1e9) / 1e9 + 0)
    })
  const det3 = (m: readonly number[]): number =>
    (m[0] ?? 0) * ((m[4] ?? 0) * (m[8] ?? 0) - (m[5] ?? 0) * (m[7] ?? 0)) -
    (m[1] ?? 0) * ((m[3] ?? 0) * (m[8] ?? 0) - (m[5] ?? 0) * (m[6] ?? 0)) +
    (m[2] ?? 0) * ((m[3] ?? 0) * (m[7] ?? 0) - (m[4] ?? 0) * (m[6] ?? 0))
  const identityKey = [1, 0, 0, 0, 1, 0, 0, 0, 1].join(',')
  let permuteRoots = 0
  let fixDepth = 0
  let properRotations = 0
  let orderSixToOrderThree = 0
  let kernel = 0
  const rotations = new Set<string>()

  for (const q of units) {
    const images = roots.map(r => rootKey(act(q, r as Quaternion)))

    permuteRoots += new Set(images).size === 24 && images.every(i => rootSet.has(i)) ? 1 : 0

    const depth = act(q, [0, 0, 0, 1])

    fixDepth += Math.hypot(depth[0], depth[1], depth[2], depth[3] - 1) < LOOSE ? 1 : 0

    const m = restriction(q)
    // a signed permutation: every row one entry of size 1
    const signed = [0, 1, 2].every(i => [0, 1, 2].filter(j => Math.abs(m[3 * j + i] ?? 0) > 0.5).length === 1 && [0, 1, 2].every(j => [0, 1].includes(Math.abs(m[3 * j + i] ?? 0))))

    properRotations += signed && Math.abs(det3(m) - 1) < LOOSE ? 1 : 0
    rotations.add(m.join(','))
    kernel += m.join(',') === identityKey ? 1 : 0

    // order of the unit
    let p: Quaternion = [...q]
    let order = 1

    while (Math.hypot(p[0] - 1, p[1], p[2], p[3]) > LOOSE) {
      p = quaternionMultiply(p, q)
      order++
    }

    if (order === 6) {
      let r = m
      let rotationOrder = 1

      while (r.join(',') !== identityKey && rotationOrder < 12) {
        const next: number[] = []

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            next.push(Math.round([0, 1, 2].reduce((s, l) => s + (r[3 * i + l] ?? 0) * (m[3 * l + j] ?? 0), 0)))
          }
        }

        r = next.map(x => x + 0)
        rotationOrder++
      }

      orderSixToOrderThree += rotationOrder === 3 ? 1 : 0
    }
  }

  const leftFixesDepth = units.filter(q => {
    const image = quaternionMultiply(q, [0, 0, 0, 1])

    return Math.hypot(image[0], image[1], image[2], image[3] - 1) < LOOSE
  }).length

  return { permuteRoots, fixDepth, distinctRotations: rotations.size, kernel, orderSixToOrderThree, properRotations, leftFixesDepth }
}

export default experiment({
  id: 'spin/role-double-cover',
  code: 'E-SPN-0051',
  title:
    'the double cover is already in the role: every linear lift of the role grid\'s SL(2,3) sends the 2 pi turn to -P, -1 on a parity-even doublet, with the Legendre law (-1/p) P confirmed at five primes; the 2 pi turn about each grid point is minus the model\'s phase-point operator, so every signed weight is W(x) = -<R_x>/3; the husk\'s tetrahedral turns lift to it through the depth-fixing conjugations; and no knot can carry it, because the 2 pi turn lies in the commutator subgroup',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // G1, G2: every lift at five primes
    const byPrime = PRIMES.map(p => {
      const lifts = weilLifts(p)
      const scalars = lifts.map(centralScalar)
      const expected = legendre(-1, p)
      const agree = scalars.filter(c => c !== undefined && Math.abs(c[0] - expected) < LOOSE && Math.abs(c[1]) < LOOSE).length

      return { p, lifts, count: lifts.length, expected, agree }
    })
    const g1 = byPrime.every(b => b.count === (b.p === 3 ? 3 : 1))
    const g2 = byPrime.every(b => b.agree === b.count && b.count > 0)

    // G3, G4 on p = 3
    const lifts3: readonly WeilLift[] = byPrime[0]?.lifts ?? []
    const parity = parityMatrix(3)
    const identity = complexIdentity(3)
    const even: ComplexMatrix = scaleMatrix({ re: identity.re.map((x, i) => x + (parity.re[i] ?? 0)), im: new Float64Array(9), n: 3 }, [0.5, 0])
    const odd: ComplexMatrix = scaleMatrix({ re: identity.re.map((x, i) => x - (parity.re[i] ?? 0)), im: new Float64Array(9), n: 3 }, [0.5, 0])
    const minusP = scaleMatrix(parity, [-1, 0])
    const evenDimension = traceOf(even)[0]
    const evenSign = traceOf(complexMultiply(minusP, even))[0] / evenDimension
    const characterRows = lifts3.map(lift => {
      let normSquared = 0
      let natural = true

      for (const e of lift.elements) {
        const [cr, ci] = traceOf(complexMultiply(e.unitary, even))

        normSquared += cr * cr + ci * ci
        natural = natural && Math.abs(cr - (SPIN_HALF[gridOrder(3, e.grid)] ?? 99)) < LOOSE && Math.abs(ci) < LOOSE
      }

      return { normSquared, natural }
    })
    const strange: State = { re: [0, Math.SQRT1_2, -Math.SQRT1_2], im: [0, 0, 0] }
    const strangeWeightAtOrigin = wignerFunction(strange)[0] ?? 0
    const g3 =
      Math.abs(evenDimension - 2) < LOOSE &&
      Math.abs(evenSign + 1) < LOOSE &&
      characterRows.every(r => Math.abs(r.normSquared - 24) < LOOSE) &&
      characterRows.filter(r => r.natural).length === 1 &&
      Math.abs(strangeWeightAtOrigin + 1 / 3) < EXACT

    let orderSix = 0
    let loopGap = 0

    for (const lift of lifts3) {
      for (const e of lift.elements) {
        if (gridOrder(3, e.grid) !== 6) {
          continue
        }

        orderSix++
        loopGap = Math.max(loopGap, matrixDistance(power(e.unitary, 3), minusP), matrixDistance(power(e.unitary, 6), identity))
      }
    }

    const g4 = orderSix === 8 * lifts3.length && loopGap < LOOSE

    // G5: the fear identity
    const lift = lifts3[0]
    const turn = lift ? liftOf(lift, [2, 0, 0, 2]) ?? identity : identity
    let pointGap = 0
    const turnsAbout = PHASE_POINTS.map(([a, b]) => {
      const d = displacementMatrix(3, a, b)
      const about = complexMultiply(complexMultiply(d, turn), daggerMatrix(d))

      pointGap = Math.max(pointGap, matrixDistance(about, scaleMatrix(modelPhasePoint(a, b), [-1, 0])))

      return about
    })
    let weightGap = 0

    for (let n = 0; n < STATES; n++) {
      const psi = weylState(n)
      const w = wignerFunction(psi)

      turnsAbout.forEach((r, x) => {
        weightGap = Math.max(weightGap, Math.abs((w[x] ?? 0) + expectation(r, psi)[0] / 3), Math.abs(expectation(r, psi)[1]))
      })
    }

    const g5 = pointGap < EXACT * 10 && weightGap < EXACT

    // G6: the interferometer, bright chance (1 + Re <psi| lift(h)^3 |psi>) / 2 with h of order 6
    const orderSixElement = lift?.elements.find(e => gridOrder(3, e.grid) === 6)?.unitary ?? identity
    const loop = power(orderSixElement, 3)
    let doubletBright = 0

    for (let n = 0; n < STATES; n++) {
      const psi = weylState(n)
      // project onto the even doublet: (psi + P psi) / 2, then normalize
      const re = [psi.re[0] ?? 0, ((psi.re[1] ?? 0) + (psi.re[2] ?? 0)) / 2, ((psi.re[1] ?? 0) + (psi.re[2] ?? 0)) / 2]
      const im = [psi.im[0] ?? 0, ((psi.im[1] ?? 0) + (psi.im[2] ?? 0)) / 2, ((psi.im[1] ?? 0) + (psi.im[2] ?? 0)) / 2]
      const norm = Math.hypot(...re, ...im)
      const doublet = { re: re.map(x => x / norm), im: im.map(x => x / norm) }

      doubletBright = Math.max(doubletBright, Math.abs((1 + expectation(loop, doublet)[0]) / 2))
    }

    const strangeBright = (1 + expectation(loop, strange)[0]) / 2
    // the unpolarized role: weight 1/9 on every point, so the bright chance from the weights is (1 - 3/9) / 2
    const mixedWeightAtOrigin = traceOf(scaleMatrix(modelPhasePoint(0, 0), [1 / 9, 0]))[0]
    const mixedBrightFromWeights = (1 - 3 * mixedWeightAtOrigin) / 2
    const mixedBrightDirect = (1 + traceOf(loop)[0] / 3) / 2
    const g6 = doubletBright < EXACT && Math.abs(strangeBright - 1) < EXACT && Math.abs(mixedBrightFromWeights - mixedBrightDirect) < EXACT && Math.abs(mixedBrightDirect - 1 / 3) < EXACT

    // G7: the husk
    const husk = huskReading()
    const g7 =
      husk.permuteRoots === 24 &&
      husk.fixDepth === 24 &&
      husk.properRotations === 24 &&
      husk.distinctRotations === 12 &&
      husk.kernel === 2 &&
      husk.orderSixToOrderThree === 8 &&
      husk.leftFixesDepth === 1

    // G8: knots. The lifted single-role Clifford group (turns and translations, with its scalars)
    const liftS = lift ? liftOf(lift, [0, 2, 1, 0]) ?? identity : identity
    const liftT = lift ? liftOf(lift, [1, 1, 0, 1]) ?? identity : identity
    const x = displacementMatrix(3, 1, 0)
    const z = displacementMatrix(3, 0, 1)
    const clifford = closeGroup([liftS, liftT, x, z], 5000) ?? []
    const commutators = new Map<string, ComplexMatrix>()

    for (const g of clifford) {
      const gDagger = daggerMatrix(g)

      for (const h of clifford) {
        const c = complexMultiply(complexMultiply(g, h), complexMultiply(gDagger, daggerMatrix(h)))

        commutators.set(keyOf(c), c)
      }
    }

    const derived = closeGroup([...commutators.values()], 5000) ?? []
    const turnInDerived = derived.some(h => [0, 1, 2].some(k => matrixDistance(h, scaleMatrix(minusP, unitPhase(k / 3))) < LOOSE))
    const triple = (m: ComplexMatrix): ComplexMatrix => kronecker(kronecker(m, m), m)
    const tripleTurn = triple(minusP)
    const tripleKnots = knotReading(averageOf(derived.map(triple)), tripleTurn)
    const mesonTurn = kronecker(minusP, conjugateMatrix(minusP))
    const mesonKnots = knotReading(averageOf(derived.map(h => kronecker(h, conjugateMatrix(h)))), mesonTurn)
    const translations = closeGroup([x, z], 5000) ?? []
    const translationKnots = knotReading(averageOf(translations.map(triple)), tripleTurn)
    const translationSpinors = (translationKnots.rank - translationKnots.signTrace) / 2
    const singleSpinors = (3 - traceOf(minusP)[0]) / 2
    const tripleSpinors = (27 - traceOf(tripleTurn)[0]) / 2
    const g8 =
      clifford.length === 648 &&
      turnInDerived &&
      tripleKnots.rank > 0.5 &&
      Math.abs(tripleKnots.signTrace - tripleKnots.rank) < LOOSE &&
      mesonKnots.rank > 0.5 &&
      Math.abs(mesonKnots.signTrace - mesonKnots.rank) < LOOSE &&
      Math.abs(translationKnots.rank - 3) < LOOSE &&
      Math.abs(translationSpinors - 2) < LOOSE &&
      Math.abs(singleSpinors - 2) < LOOSE &&
      Math.abs(tripleSpinors - 14) < LOOSE

    const ok = g1 && g2 && g3 && g4 && g5 && g6 && g7 && g8

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `lifts ${byPrime.map(b => `${b.count} at p = ${b.p}`).join(', ')}, each sending the 2 pi turn to (-1/p) P (${byPrime.map(b => `${b.agree} of ${b.count}`).join(', ')} agree); at p = 3 the turn is -1 on a ${evenDimension}-dimensional even doublet, natural spin one half in ${characterRows.filter(r => r.natural).length} of 3 lifts, a 120 degree turn cubed is -P on all ${orderSix} order-6 elements, the 2 pi turn about each point is minus the model's phase-point operator (gap ${pointGap.toExponential(1)}) so W(x) = -<R_x>/3 (gap ${weightGap.toExponential(1)}), an interferometer with a 2 pi arm is dark for every doublet state and bright for the strange (fear) state; the 24 depth-fixing conjugations give ${husk.distinctRotations} husk cube rotations with kernel ${husk.kernel}; and the 2 pi turn lies in the commutator subgroup (${turnInDerived}), so every knot of three roles (rank ${tripleKnots.rank.toFixed(0)}) and of a role and antirole (rank ${mesonKnots.rank.toFixed(0)}) has sign +1, while translations alone leave ${translationSpinors.toFixed(0)} spinorial knots of ${translationKnots.rank.toFixed(0)}`,
      metrics: {
        ...Object.fromEntries(byPrime.flatMap(b => [[`liftsAtP${b.p}`, b.count], [`centralScalarAgreesLegendreAtP${b.p}`, b.agree], [`legendreMinusOneAtP${b.p}`, b.expected]])),
        evenDoubletDimension: evenDimension,
        evenDoubletTwoPiSign: evenSign,
        liftsWithNaturalSpinHalfDoublet: characterRows.filter(r => r.natural).length,
        doubletCharacterNormSquared: characterRows[0]?.normSquared ?? -1,
        strangeStateWeightAtOrigin: strangeWeightAtOrigin,
        orderSixElementsChecked: orderSix,
        turnLoopGap: loopGap,
        phasePointIdentityGap: pointGap,
        weightIdentityGap: weightGap,
        doubletBrightChanceMax: doubletBright,
        strangeBrightChance: strangeBright,
        unpolarizedBrightChance: mixedBrightDirect,
        huskConjugationsPermutingRoots: husk.permuteRoots,
        huskConjugationsFixingDepth: husk.fixDepth,
        huskDistinctRotations: husk.distinctRotations,
        huskKernel: husk.kernel,
        huskOrderSixToOrderThree: husk.orderSixToOrderThree,
        liftedCliffordOrder: clifford.length,
        derivedOrder: derived.length,
        twoPiTurnInDerived: turnInDerived ? 1 : 0,
        tripleKnotRank: Number(tripleKnots.rank.toFixed(9)),
        tripleKnotTwoPiTrace: Number(tripleKnots.signTrace.toFixed(9)),
        mesonKnotRank: Number(mesonKnots.rank.toFixed(9)),
        mesonKnotTwoPiTrace: Number(mesonKnots.signTrace.toFixed(9)),
        singleRoleSpinorialDimensions: singleSpinors,
        tripleRoleSpinorialDimensions: tripleSpinors,
      },
      control: {
        slotLeftMultiplicationsFixingDepth: husk.leftFixesDepth,
        translationOnlyTripleKnotRank: Number(translationKnots.rank.toFixed(9)),
        translationOnlyTripleSpinorialKnots: Number(translationSpinors.toFixed(9)),
      },
      notes:
        'L1. The Weil representation is standard (Weil 1964; for the qutrit Clifford group, Gross 2006, Appleby 2005), and the displaced parity as the Wigner operator is Royer 1977; what is new here is only where they sit in the model: the role grid\'s own turn group is the double cover, its 2 pi turn is forced to -P by the commutator argument, and that operator is minus the phase-point operator the fear weight is defined by. Consequences, stated as structure and not as a derivation of the electron: (1) a spinor in this model can only be a ROLE degree of freedom, because the husk\'s turns reach the slots only through conjugation, where -1 acts trivially, and left multiplication (the slot torsor of E-SPN-0044) does not fix the depth; (2) the spinor is the parity-even doublet of one role, and the parity-odd singlet is the strange state, the maximal fear at its point, so the fear and the spin sign are one operator read at one point; (3) a knot is invariant under every frame change up to a phase, the 2 pi turn is a product of commutators, so every knot is a boson. If the role is both the color and the spin, a color-neutral knot (a lepton-like triple of three loves on a grid line, or a meson) cannot be spin one half. A charged spin one half lepton therefore needs color and spin to be different threes, for example color from the arrangement three of E-FRC-0170 with the spin in the roles, or a colored object that is not a knot. This is a fork for the model, not a result of the knit, which moves roles only as classical grid points and runs no amplitudes (E-FND-0080).',
    })
  },
})

// a key equal for numerically equal matrices
function keyOf(m: ComplexMatrix): string {
  return Array.from(m.re, (v, i) => `${(Math.round(v * 1e6) / 1e6 + 0).toFixed(6)}:${(Math.round((m.im[i] ?? 0) * 1e6) / 1e6 + 0).toFixed(6)}`).join(',')
}
