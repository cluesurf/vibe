// Is the role's 2 pi sign a conserved fermion number? The parity P in the link group and the fear beat.
//
// E-SPN-0051 found the 2 pi turn of the role grid's SL(2, 3) = 2T lifts to -P, P |x> = |-x>: -1 on the
// parity-even doublet (|0>, |1> + |2>) and +1 on the parity-odd strange state (|1> - |2>) / sqrt 2. Spin and
// statistics need more than a sign: the dynamics must never mix the two sectors, or a fermion could turn into a
// boson. This asks the model's own operators, exactly, on 3 x 3 and 9 x 9 matrices.
//
// THE QUESTIONS.
// 1. Which elements of Sigma(648), the lifted link group (E-QTM-0117), lie over the grid move -I, and is one of
//    them P up to a global phase?
// 2. Does Sigma(648) hold a central element of order 2, a global (-1)^F that every link commutes with?
// 3. Which link moves commute with P? A translation D(v) carries P to D(2v) P, the parity about another point.
// 4. Is every link covariant: U A(x) U^dagger = A(g x) for every element U over the affine grid move g, with
//    A(x) = D(x) P D(x)^dagger the phase-point operator, minus the 2 pi turn about x (E-SPN-0051)?
// 5. Does the fear beat (E-QTM-0118: the swap phase two like vibes feel, U = P_sym + omega P_anti, and the
//    singlet phase a love and a fear feel, V = 1 + (omega - 1) |Phi><Phi|) keep the parity of each role, or only
//    the product P (x) P, the whole's 2 pi turn?
//
// PREDICTIONS, written before any run.
// - Over -I: exactly 3 elements, omega^k (-P), k = 0, 1, 2, of orders 2, 6, 6. P itself has determinant -1 and is
//   NOT in Sigma(648). So the lift of -I is P up to phase, and the phase that makes it an order-2 element of the
//   determinant-1 group is -1: the even doublet takes -1, the odd line +1.
// - The center of Sigma(648) is the 3 scalars, with no element of order 2: there is no global fermion parity in
//   the link group (3 is odd, and -1 on C^3 has determinant -1).
// - Exactly 72 elements (3 phases x the 24 point-fixing turns) commute with P; the other 576, over the 192 moves
//   with a nonzero translation, do not.
// - Covariance holds for all 648 elements at all 9 points to 1e-12: a link never breaks the 2 pi sign about a
//   point, it carries it to the moved point.
// - Both fear-beat forms commute with P (x) P. U commutes with A(x) (x) A(y) for exactly the 9 pairs y = x (it is
//   a function of SWAP); V for exactly the 9 pairs y = x-bar, the point with A(x-bar) = conj A(x) (V fixes the
//   maximally entangled Phi, and M (x) conj M fixes Phi). Neither commutes with P (x) 1: the fear beat conserves
//   the whole's sign, and trades the sign between the two roles.
// - On n roles the whole's 2 pi turn (-P)^(x n) has trace (-1)^n, so (3^n - (-1)^n) / 2 of the 3^n dimensions are
//   spinorial: 2, 4, 14, 40 for n = 1 to 4.
// - A classical role point p, the operator A(p) / 3 the knit's grid point stands for, has 2 pi sign -1 about its
//   own point (Tr(-A(p) A(p)) / 3 = -1) and 0 about every other point, and it is not a state (eigenvalues 1/3,
//   1/3, -1/3, read from Tr A = 1 and Tr A^2 = 3).
//
// Gates, fixed before the first run:
// G1 over -I exactly 3 elements, each omega^k (-P) to 1e-12, orders {2, 6, 6}; distance from P to Sigma(648) > 0.5
// G2 exactly 3 central elements, all scalars, 0 of order 2
// G3 exactly 72 elements commute with P, covering exactly 24 grid moves, all with zero translation
// G4 every one of the 648 x 9 images U A(x) U^dagger is some A(y) to 1e-12, and y = M x + t with M the element's
//    linear grid action, on all 648
// G5 U and V commute with P (x) P to 1e-12; U commutes with A(x) (x) A(y) on exactly the 9 diagonal pairs, V on
//    exactly 9 pairs, each y = x-bar; both miss P (x) 1 by more than 0.1
// G6 spinorial dimensions 2, 4, 14, 40 for n = 1..4 from the traces; the classical point reads -1 about itself
//    and 0 elsewhere to 1e-12 on all 9 points
//
// Depth L1: exact finite algebra on the model's own link group and fear beat. It says what a conserved fermion
// number would require of the knit, not that the knit has one.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { singletPhase, swapPhase } from '@/code/rule/fear-weave'
import { wignerFunction } from '@/code/measure/qutrit-phase-space'
import {
  closeGroup,
  conjugateMatrix,
  daggerMatrix,
  displacementMatrix,
  gridActionOf,
  kronecker,
  liftOf,
  matrixDistance,
  parityMatrix,
  phasePointMatrix,
  scaleMatrix,
  traceOf,
  unitPhase,
  weilLifts,
} from '@/code/algebra/weil-representation'

const EXACT = 1e-12
const LOOSE = 1e-9
const OMEGA_ANGLE = (2 * Math.PI) / 3
const POINTS: readonly [number, number][] = Array.from({ length: 9 }, (_, k) => [Math.floor(k / 3), k % 3])

const commutatorGap = (a: ComplexMatrix, b: ComplexMatrix): number => matrixDistance(complexMultiply(a, b), complexMultiply(b, a))
const conjugateBy = (u: ComplexMatrix, m: ComplexMatrix): ComplexMatrix => complexMultiply(complexMultiply(u, m), daggerMatrix(u))

function orderOf(u: ComplexMatrix, limit: number): number {
  const identity = complexIdentity(u.n)
  let power = u

  for (let k = 1; k <= limit; k++) {
    if (matrixDistance(power, identity) < LOOSE) {
      return k
    }

    power = complexMultiply(power, u)
  }

  return -1
}

export default experiment({
  id: 'spin/role-parity-in-the-dynamics',
  code: 'E-SPN-0054',
  title:
    'the role parity in the dynamics: the lift of the 2 pi turn in the link group Sigma(648) is -P, the group has no central -1, only the 24 point-fixing turns keep P while every translation carries it to the parity about the moved point, all 648 links are exactly covariant, and both fear-beat forms keep only the whole\'s sign P (x) P, trading it between the roles',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const lift = weilLifts(3)[0]
    const identity = complexIdentity(3)
    const s = lift ? liftOf(lift, [0, 2, 1, 0]) ?? identity : identity
    const t = lift ? liftOf(lift, [1, 1, 0, 1]) ?? identity : identity
    const x = displacementMatrix(3, 1, 0)
    const z = displacementMatrix(3, 0, 1)
    const generators = [s, t, x, z]
    const sigma = closeGroup(generators, 5000) ?? []
    const parity = parityMatrix(3)
    const minusP = scaleMatrix(parity, [-1, 0])
    const phasePoints = POINTS.map(([a, b]) => phasePointMatrix(3, a, b))

    // the affine grid move of every element: linear part from its action on displacements, the point map from
    // its action on the phase-point operators
    let covarianceGap = 0
    let unmatchedImages = 0
    let affineFailures = 0
    const moves = sigma.map(u => {
      const linear = gridActionOf(u, 3)
      const images = phasePoints.map(a => {
        const moved = conjugateBy(u, a)
        let best = -1
        let bestGap = Infinity

        phasePoints.forEach((b, y) => {
          const gap = matrixDistance(moved, b)

          if (gap < bestGap) {
            bestGap = gap
            best = y
          }
        })

        covarianceGap = Math.max(covarianceGap, bestGap)
        unmatchedImages += bestGap < LOOSE ? 0 : 1

        return best
      })
      const origin = POINTS[images[0] ?? 0] ?? [0, 0]

      if (!linear) {
        affineFailures++
      } else {
        POINTS.forEach(([a, b], k) => {
          const expected = [(linear[0] * a + linear[1] * b + origin[0]) % 3, (linear[2] * a + linear[3] * b + origin[1]) % 3]
          const got = POINTS[images[k] ?? 0] ?? [-1, -1]

          affineFailures += expected[0] === got[0] && expected[1] === got[1] ? 0 : 1
        })
      }

      return { u, linear, translation: origin, key: `${(linear ?? []).join(',')}|${origin.join(',')}` }
    })
    const g4 = sigma.length === 648 && covarianceGap < EXACT && unmatchedImages === 0 && affineFailures === 0

    // G1: over -I
    const overMinusOne = moves.filter(m => m.linear && m.linear.join(',') === '2,0,0,2' && m.translation[0] === 0 && m.translation[1] === 0)
    const minusOneGaps = overMinusOne.map(m => Math.min(...[0, 1, 2].map(k => matrixDistance(m.u, scaleMatrix(minusP, unitPhase(k / 3))))))
    const minusOneOrders = overMinusOne.map(m => orderOf(m.u, 12)).sort((a, b) => a - b)
    const parityDistance = Math.min(...sigma.map(u => matrixDistance(u, parity)))
    const g1 = overMinusOne.length === 3 && minusOneGaps.every(g => g < EXACT) && minusOneOrders.join(',') === '2,6,6' && parityDistance > 0.5

    // G2: the center
    const central = sigma.filter(u => generators.every(g => commutatorGap(u, g) < LOOSE))
    const centralScalars = central.filter(u => [0, 1, 2].some(k => matrixDistance(u, scaleMatrix(identity, unitPhase(k / 3))) < LOOSE)).length
    const centralOrderTwo = central.filter(u => orderOf(u, 12) === 2).length
    const g2 = central.length === 3 && centralScalars === 3 && centralOrderTwo === 0

    // G3: which elements keep P
    const keepP = moves.filter(m => commutatorGap(m.u, parity) < LOOSE)
    const keepPMoves = new Set(keepP.map(m => m.key))
    const keepPTranslated = keepP.filter(m => m.translation[0] !== 0 || m.translation[1] !== 0).length
    const allMoves = new Set(moves.map(m => m.key)).size
    const g3 = keepP.length === 72 && keepPMoves.size === 24 && keepPTranslated === 0 && allMoves === 216

    // G5: the fear beat
    const swap = swapPhase(OMEGA_ANGLE) as ComplexMatrix
    const singlet = singletPhase(OMEGA_ANGLE) as ComplexMatrix
    const pp = kronecker(parity, parity)
    const p1 = kronecker(parity, identity)
    const swapPP = commutatorGap(swap, pp)
    const singletPP = commutatorGap(singlet, pp)
    const swapP1 = commutatorGap(swap, p1)
    const singletP1 = commutatorGap(singlet, p1)
    // x-bar: the point whose phase-point operator is the complex conjugate of A(x)
    const bar = phasePoints.map(a => {
      const c = conjugateMatrix(a)

      return phasePoints.findIndex(b => matrixDistance(b, c) < LOOSE)
    })
    const swapPairs: number[][] = []
    const singletPairs: number[][] = []

    phasePoints.forEach((a, i) => {
      phasePoints.forEach((b, j) => {
        const ab = kronecker(a, b)

        if (commutatorGap(swap, ab) < LOOSE) {
          swapPairs.push([i, j])
        }

        if (commutatorGap(singlet, ab) < LOOSE) {
          singletPairs.push([i, j])
        }
      })
    })

    const g5 =
      swapPP < EXACT &&
      singletPP < EXACT &&
      swapPairs.length === 9 &&
      swapPairs.every(([i, j]) => i === j) &&
      singletPairs.length === 9 &&
      singletPairs.every(([i, j]) => j === bar[i ?? 0]) &&
      swapP1 > 0.1 &&
      singletP1 > 0.1

    // G6: spinorial dimensions and the classical point
    const spinorial = [1, 2, 3, 4].map(n => {
      let turn: ComplexMatrix = minusP

      for (let k = 1; k < n; k++) {
        turn = kronecker(turn, minusP)
      }

      return (3 ** n - traceOf(turn)[0]) / 2
    })
    let selfSignGap = 0
    let otherSignGap = 0
    let classicalMinEigenBound = 0

    phasePoints.forEach((a, i) => {
      phasePoints.forEach((b, j) => {
        // <R_j> on rho = A(i) / 3, with R_j = -A(j)
        const sign = -traceOf(complexMultiply(b, a))[0] / 3

        if (i === j) {
          selfSignGap = Math.max(selfSignGap, Math.abs(sign + 1))
        } else {
          otherSignGap = Math.max(otherSignGap, Math.abs(sign))
        }
      })

      // Tr A and Tr A^2 fix the spectrum of a Hermitian unitary: (1, 1, -1)
      const trace = traceOf(a)[0]
      const traceSquare = traceOf(complexMultiply(a, a))[0]

      classicalMinEigenBound = Math.max(classicalMinEigenBound, Math.abs(trace - 1), Math.abs(traceSquare - 3))
    })

    const g6 = spinorial.join(',') === '2,4,14,40' && selfSignGap < EXACT && otherSignGap < EXACT && classicalMinEigenBound < EXACT

    const ok = g1 && g2 && g3 && g4 && g5 && g6

    // REPORTED, added after G1 to G6 had run (not gated, status unchanged): are exchange -1, a 2 pi sign -1 and
    // magic one subspace? Predictions written before this section ran: on the antisymmetric two-role space (dim 3)
    // the whole's 2 pi turn P (x) P has eigenvalues +1, -1, -1 (trace -1), on the symmetric space (dim 6) trace 2,
    // so antisymmetric is not a definite 2 pi sign; each role of |12> - |21> has parity expectation 0; Strange x
    // Strange is exchange-symmetric with 2 pi sign +1 on each role; the parity-even doublet holds the stabilizer
    // state |0> (no negative weight), so magic does not pick a parity sector either.
    const swapOnly = swapPhase(Math.PI) as ComplexMatrix
    const identity9 = complexIdentity(9)
    const antisymmetric = scaleMatrix({ re: identity9.re.map((v, i) => v - (swapOnly.re[i] ?? 0)), im: identity9.im.map((v, i) => v - (swapOnly.im[i] ?? 0)), n: 9 }, [0.5, 0])
    const symmetric = scaleMatrix({ re: identity9.re.map((v, i) => v + (swapOnly.re[i] ?? 0)), im: identity9.im.map((v, i) => v + (swapOnly.im[i] ?? 0)), n: 9 }, [0.5, 0])
    const antisymmetricDimension = traceOf(antisymmetric)[0]
    const antisymmetricTwoPiTrace = traceOf(complexMultiply(antisymmetric, pp))[0]
    const symmetricTwoPiTrace = traceOf(complexMultiply(symmetric, pp))[0]
    const antisymmetricSpinorial = (antisymmetricDimension - antisymmetricTwoPiTrace) / 2
    // |12> - |21>: the parity of role 1 in its reduced state, <P (x) 1>
    const a12 = new Float64Array(9)

    a12[3 * 1 + 2] = Math.SQRT1_2
    a12[3 * 2 + 1] = -Math.SQRT1_2

    let roleParity = 0

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        roleParity += (a12[i] ?? 0) * (p1.re[i * 9 + j] ?? 0) * (a12[j] ?? 0)
      }
    }

    // Strange x Strange: exchange and 2 pi sign
    const strange = [0, Math.SQRT1_2, -Math.SQRT1_2]
    const strangePair = new Float64Array(9)

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        strangePair[3 * i + j] = (strange[i] ?? 0) * (strange[j] ?? 0)
      }
    }

    const expect9 = (m: ComplexMatrix, v: Float64Array): number => {
      let sum = 0

      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          sum += (v[i] ?? 0) * (m.re[i * 9 + j] ?? 0) * (v[j] ?? 0)
        }
      }

      return sum
    }
    const strangePairExchange = expect9(swapOnly, strangePair)
    const strangePairTwoPi = expect9(pp, strangePair)
    const strangeTwoPi = -(strange.reduce((s, v, i) => s + v * (strange[(3 - i) % 3] ?? 0), 0))
    // the least weight of |0> (even, a stabilizer state) and of the strange state (odd)
    const leastWeight = (v: readonly number[]): number => Math.min(...wignerFunction({ re: [...v], im: [0, 0, 0] }))
    const zeroStateLeast = leastWeight([1, 0, 0])
    const evenMagicLeast = leastWeight([0, Math.SQRT1_2, Math.SQRT1_2])
    const strangeLeast = leastWeight(strange)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `over the 2 pi turn -I the link group Sigma(${sigma.length}) holds ${overMinusOne.length} elements, omega^k (-P) (gap ${Math.max(...minusOneGaps).toExponential(1)}) of orders ${minusOneOrders.join(', ')}, and P itself lies ${parityDistance.toFixed(3)} from the group; its center is ${central.length} scalars with ${centralOrderTwo} of order 2, so no global fermion parity; ${keepP.length} elements over ${keepPMoves.size} point-fixing turns commute with P, none with a translation, while all ${sigma.length} are covariant, U A(x) U^dagger = A(g x) (gap ${covarianceGap.toExponential(1)}, ${affineFailures} affine failures); the swap phase and the singlet phase commute with P (x) P (gaps ${swapPP.toExponential(1)}, ${singletPP.toExponential(1)}) and with A(x) (x) A(y) on ${swapPairs.length} diagonal and ${singletPairs.length} conjugate pairs, and miss P (x) 1 by ${swapP1.toFixed(3)} and ${singletP1.toFixed(3)}; spinorial dimensions ${spinorial.join(', ')} on 1 to 4 roles; a classical role point has 2 pi sign -1 about itself and 0 elsewhere; and exchange, 2 pi sign and magic are not one subspace (P (x) P has trace ${antisymmetricTwoPiTrace.toFixed(3)} on the ${antisymmetricDimension.toFixed(0)}-dimensional antisymmetric space, and Strange x Strange has exchange ${strangePairExchange.toFixed(3)} and 2 pi sign ${strangePairTwoPi.toFixed(3)})`,
      metrics: {
        linkGroupOrder: sigma.length,
        elementsOverMinusOne: overMinusOne.length,
        minusOneLiftGap: Math.max(...minusOneGaps),
        minusOneLiftOrderTwo: minusOneOrders.filter(o => o === 2).length,
        parityDistanceFromGroup: parityDistance,
        centralElements: central.length,
        centralScalars,
        centralOrderTwo,
        elementsKeepingParity: keepP.length,
        gridMovesKeepingParity: keepPMoves.size,
        translatedMovesKeepingParity: keepPTranslated,
        gridMoves: allMoves,
        covarianceGap,
        unmatchedImages,
        affineFailures,
        swapPhaseParityProductGap: swapPP,
        singletPhaseParityProductGap: singletPP,
        swapPhaseSingleParityGap: swapP1,
        singletPhaseSingleParityGap: singletP1,
        swapPhaseCommutingPairs: swapPairs.length,
        singletPhaseCommutingPairs: singletPairs.length,
        spinorialOneRole: spinorial[0] ?? -1,
        spinorialTwoRoles: spinorial[1] ?? -1,
        spinorialThreeRoles: spinorial[2] ?? -1,
        spinorialFourRoles: spinorial[3] ?? -1,
        classicalSelfSignGap: selfSignGap,
        classicalOtherSignGap: otherSignGap,
        antisymmetricDimension,
        antisymmetricTwoPiTrace,
        antisymmetricSpinorial,
        symmetricTwoPiTrace,
        antisymmetricRoleParity: roleParity + 0,
        strangePairExchange,
        strangePairTwoPiSign: strangePairTwoPi,
        strangeTwoPiSign: strangeTwoPi,
        zeroStateLeastWeight: zeroStateLeast,
        evenPairStateLeastWeight: evenMagicLeast,
        strangeLeastWeight: strangeLeast,
      },
      control: {
        translationsKeepingParity: moves.filter(m => (m.translation[0] !== 0 || m.translation[1] !== 0) && commutatorGap(m.u, parity) < LOOSE).length,
        conjugatePointOfOrigin: bar[0] ?? -1,
      },
      notes:
        'L1, exact. Answers the parity lead: the lift of the 2 pi turn is P up to a global phase, and the determinant-1 group fixes that phase to -1 on the order-2 lift, so the even doublet takes -1 and the odd strange state +1 (the sign the lead guessed is inverted: the spinor is the even pair, not the odd line). As a conserved fermion number it fails in the link sector as built: (a) Sigma(648) has no central -1, so no operator every link commutes with can serve as (-1)^F; (b) only the 24 point-fixing turns keep the parity about a fixed point, and each of the 192 grid moves with a translation carries it to the parity about the translated point, which is the displaced parity A(x) = -R_x. What holds exactly is covariance: every link carries the 2 pi turn about x to the 2 pi turn about g x. So the sign is conserved only relative to a point the object carries with it, which is what a located particle would supply and a role, as a phase-space point, does not by itself. The fear beat keeps the whole\'s sign P (x) P exactly and trades it between the roles, the pattern of a conserved total fermion parity; but with the translations on the links the gate set is universal on SU(9) (E-QTM-0118), whose commutant is the scalars, so no two-role Z2 survives the full knit. A conserved fermion number from the role therefore needs either links without translations (the relational links of E-FRC-0174 are pure translations, so that knit is the opposite case) or a particle whose own point the parity is measured about. The classical reading gives the second for free and uselessly: a knit role at grid point p stands for A(p)/3, which reads -1 about its own point on every role, so it distinguishes nothing, and A(p)/3 is not a state. ADDED AFTER G1 TO G6 HAD RUN, reported and not gated, predictions written before the section ran and all met: are exchange -1, a 2 pi sign -1 and magic one subspace? No, on three counts. (1) The whole\'s 2 pi turn P (x) P is not definite on the antisymmetric two-role space: trace -1 on 3 dimensions, so 2 spinorial and 1 not, and the symmetric space holds 2 spinorial dimensions of 6. Exchange sign and 2 pi sign are independent. (2) In |12> - |21> each role has parity expectation 0, so an exchange -1 does not put either role in a definite parity sector. (3) Magic does not pick a sector: the odd line is the Strange state (least weight -1/3), but its 2 pi sign is +1, a boson; the even doublet holds the stabilizer state |0> (least weight 0) and magic states such as (|1> + |2>)/sqrt 2 (least weight -1/6). Strange x Strange, the only start that reaches the 8/25 fear-share ceiling (E-QTM-0121), is exchange-symmetric (+1) with 2 pi sign +1 on each role and on the pair. So on this role grid the most magic two-role state is a pair of bosons, and the three signs are three different things. The E-SPN-0047/0049 exchange -1 from the slot therefore cannot be tied to the knit through the role\'s parity. A spin-statistics link would have to come from the dynamics, for example a knit whose exchange of two tokens is itself a 2 pi turn of one, which no knit here has shown.',
    })
  },
})
