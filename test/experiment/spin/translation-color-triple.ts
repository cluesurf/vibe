// Color from the translations, spin from the turns: the triple that can be a spin one half.
//
// E-SPN-0051 proved that a knot, a state every frame change of Sigma(648) fixes up to a phase, is a boson,
// because the 2 pi turn -P lies in the commutator subgroup. Its control found that gauging only the nine
// translations leaves spinorial states on three roles. This file takes that fork seriously: the COLOR frame is
// the Heisenberg group H = {omega^c D(v)} of 27 (the translations the relational links carry, E-FRC-0174), and
// the SPIN is the turn group SL(2, 3) = 2T acting on every role at once, which normalizes H and so acts on the
// color-neutral states. A lepton-like triple is three loves (love - fear = 3, Q = 1: the charge is the vibes',
// put in, not derived), each carrying a role.
//
// PREDICTIONS, written before any run.
// P1 On n roles and m antiroles (D and conj D), the H-invariant space has rank 3^(n + m - 2) when n = m mod 3 and
//    0 otherwise, and its spinorial part, the -1 space of the whole's 2 pi turn (-P)^(x n) (x) (-P-bar)^(x m), has
//    dimension (rank - (-1)^(n + m)) / 2. Reason: Tr(D(v) P) = Tr A(2v) = 1 for every v, so the sign trace is
//    (-1)^(n + m). So a role and an antirole (the meson) have 1 neutral state and it is a boson, and three roles
//    have 3 with 2 spinorial: the quark-model pattern, q q-bar a boson and q q q able to be a fermion.
// P2 The three neutral states of a triple are psi_k = sum_x |x, x + k, x + 2k>, k = 0, 1, 2. The spinorial pair is
//    span(psi_0, psi_1 + psi_2), totally symmetric in the three roles; the boson is psi_1 - psi_2, totally
//    antisymmetric (an epsilon state).
// P3 The pair carries an irreducible spinorial representation of 2T (sum |chi|^2 = 24, chi(-I) = -2), the same in
//    all three lifts (they differ by a character of order 3, which cubes away); a 120 degree turn cubed is -1 on
//    it for every order-6 element.
// P4 Gauging the full Sigma(648) leaves one neutral state, psi_1 - psi_2, the boson (E-SPN-0051's knot).
// P5 The fear beat two loves feel, the swap phase P_sym + omega P_anti, keeps the neutral space on every pair and,
//    by Schur and P2, acts as exactly 1 on the spinorial pair and as omega on the boson. So the like-vibe fear beat
//    cannot touch the spin one half: no meeting inside the triple makes or spends magic on it. Control: the
//    singlet phase (a love meeting a fear) on one pair leaks out of the neutral space.
//
// Gates, fixed before the first run:
// G1 P1 on every (n, m) with n + m <= 6, rank and spinorial dimension exact to 1e-9
// G2 the neutral triple projector has rank 3; its spinorial part overlaps span(psi_0, psi_1 + psi_2) with trace
//    2 and its bosonic part psi_1 - psi_2 with trace 1, to 1e-12
// G3 P3: norm 24, chi(-I) = -2, characters of the three lifts agree to 1e-12, h^3 = -1 on the pair for all 8
//    order-6 elements to 1e-12, and the boson has chi(-I) = +1
// G4 P4 to 1e-12
// G5 P5: leak below 1e-12 for all 3 pairs, the swap phase is 1 on the pair and omega on the boson to 1e-12, and
//    the singlet phase leaks more than 0.1
//
// Depth L1: exact representation theory on the model's operators. It gives the internal content a charged
// spin one half triple can have if color is the translation frame. It does NOT bind the triple: no triple of
// three loves travels as one object on any knit tried (E-FRC-0171, E-SPN-0052), and this file adds no dynamics.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { singletPhase, swapPhase } from '@/code/rule/fear-weave'
import {
  closeGroup,
  conjugateMatrix,
  daggerMatrix,
  displacementMatrix,
  gridOrder,
  kronecker,
  liftOf,
  matrixDistance,
  parityMatrix,
  scaleMatrix,
  traceOf,
  unitPhase,
  weilLifts,
} from '@/code/algebra/weil-representation'

const EXACT = 1e-12
const LOOSE = 1e-9
const OMEGA_ANGLE = (2 * Math.PI) / 3

type Complex = [number, number]

const cmul = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cconj = (a: Complex): Complex => [a[0], -a[1]]
const cpow = (a: Complex, n: number): Complex => {
  let out: Complex = [1, 0]

  for (let k = 0; k < n; k++) {
    out = cmul(out, a)
  }

  return out
}

// the Heisenberg group of 27: omega^c D(a, b)
function heisenberg(): ComplexMatrix[] {
  const out: ComplexMatrix[] = []

  for (let c = 0; c < 3; c++) {
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        out.push(scaleMatrix(displacementMatrix(3, a, b), unitPhase(c / 3)))
      }
    }
  }

  return out
}

const triple = (m: ComplexMatrix): ComplexMatrix => kronecker(kronecker(m, m), m)

function average(list: readonly ComplexMatrix[]): ComplexMatrix {
  const n = list[0]?.n ?? 1
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (const g of list) {
    for (let i = 0; i < n * n; i++) {
      re[i] = (re[i] ?? 0) + (g.re[i] ?? 0) / list.length
      im[i] = (im[i] ?? 0) + (g.im[i] ?? 0) / list.length
    }
  }

  return { re, im, n }
}

const combine = (a: ComplexMatrix, s: number, b: ComplexMatrix, t: number): ComplexMatrix => ({
  re: a.re.map((x, i) => s * x + t * (b.re[i] ?? 0)),
  im: a.im.map((x, i) => s * x + t * (b.im[i] ?? 0)),
  n: a.n,
})

// the projector onto the span of real vectors (orthonormalized here)
function spanProjector(vectors: readonly number[][]): ComplexMatrix {
  const n = vectors[0]?.length ?? 0
  const basis: number[][] = []

  for (const v of vectors) {
    const w = [...v]

    for (const b of basis) {
      const dot = w.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)

      b.forEach((x, i) => {
        w[i] = (w[i] ?? 0) - dot * x
      })
    }

    const norm = Math.hypot(...w)

    basis.push(w.map(x => x / norm))
  }

  const re = new Float64Array(n * n)

  for (const b of basis) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        re[i * n + j] = (re[i * n + j] ?? 0) + (b[i] ?? 0) * (b[j] ?? 0)
      }
    }
  }

  return { re, im: new Float64Array(n * n), n }
}

// psi_k = sum_x |x, x + k, x + 2k>, index 9 a + 3 b + c
function psi(k: number): number[] {
  const v = new Array<number>(27).fill(0)

  for (let x = 0; x < 3; x++) {
    v[9 * x + 3 * ((x + k) % 3) + ((x + 2 * k) % 3)] = 1
  }

  return v
}

// a two-role operator on roles i < j of three, as a 27 x 27 matrix
function onPair(op: ComplexMatrix, i: number, j: number): ComplexMatrix {
  const re = new Float64Array(27 * 27)
  const im = new Float64Array(27 * 27)
  const digits = (s: number): number[] => [Math.floor(s / 9), Math.floor(s / 3) % 3, s % 3]

  for (let row = 0; row < 27; row++) {
    for (let col = 0; col < 27; col++) {
      const r = digits(row)
      const c = digits(col)
      const other = [0, 1, 2].find(k => k !== i && k !== j) ?? 0

      if (r[other] !== c[other]) {
        continue
      }

      const at = (3 * (r[i] ?? 0) + (r[j] ?? 0)) * 9 + (3 * (c[i] ?? 0) + (c[j] ?? 0))

      re[row * 27 + col] = op.re[at] ?? 0
      im[row * 27 + col] = op.im[at] ?? 0
    }
  }

  return { re, im, n: 27 }
}

export default experiment({
  id: 'spin/translation-color-triple',
  code: 'E-SPN-0055',
  title:
    'color from the translations, spin from the turns: the translation-neutral states of n roles and m antiroles number 3^(n+m-2) when n = m mod 3 with (rank - (-1)^(n+m))/2 spinorial, so the meson is a boson and the triple holds a totally symmetric spinorial doublet of 2T beside an antisymmetric boson; the doublet is a piece of spin 3/2, not spin 1/2 (the uuu, Delta-like case), and the fear beat two loves feel acts on it as exactly 1; the smallest neutral cluster with a natural spin one half is four roles and one antirole',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const group = heisenberg()
    const parity = parityMatrix(3)
    const minusP = scaleMatrix(parity, [-1, 0])

    // G1 by traces of the actual matrices: the rep is h^(x n) (x) conj(h)^(x m)
    const counts: { n: number; m: number; rank: number; spinorial: number; predictedRank: number; predictedSpinorial: number }[] = []

    for (let total = 1; total <= 6; total++) {
      for (let n = total; n >= 0; n--) {
        const m = total - n
        let rank: Complex = [0, 0]
        let sign: Complex = [0, 0]

        for (const h of group) {
          const t = traceOf(h) as Complex
          const ts = traceOf(complexMultiply(h, minusP)) as Complex
          const r = cmul(cpow(t, n), cpow(cconj(t), m))
          const s = cmul(cpow(ts, n), cpow(cconj(ts), m))

          rank = [rank[0] + r[0] / group.length, rank[1] + r[1] / group.length]
          sign = [sign[0] + s[0] / group.length, sign[1] + s[1] / group.length]
        }

        const predictedRank = (n - m) % 3 === 0 ? 3 ** (total - 2) : 0
        const predictedSpinorial = predictedRank > 0 ? (predictedRank - (-1) ** total) / 2 : 0

        counts.push({ n, m, rank: rank[0], spinorial: (rank[0] - sign[0]) / 2, predictedRank, predictedSpinorial })
      }
    }

    const g1 = counts.every(c => Math.abs(c.rank - c.predictedRank) < LOOSE && Math.abs(c.spinorial - c.predictedSpinorial) < LOOSE)

    // G2 the explicit triple
    const neutral = average(group.map(triple))
    const turn = triple(minusP)
    const identity27 = complexIdentity(27)
    const spinorProjector = complexMultiply(neutral, scaleMatrix(combine(identity27, 1, turn, -1), [0.5, 0]))
    const bosonProjector = complexMultiply(neutral, scaleMatrix(combine(identity27, 1, turn, 1), [0.5, 0]))
    const predictedPair = spanProjector([psi(0), psi(1).map((x, i) => x + (psi(2)[i] ?? 0))])
    const predictedBoson = spanProjector([psi(1).map((x, i) => x - (psi(2)[i] ?? 0))])
    const neutralRank = traceOf(neutral)[0]
    const pairOverlap = traceOf(complexMultiply(spinorProjector, predictedPair))[0]
    const bosonOverlap = traceOf(complexMultiply(bosonProjector, predictedBoson))[0]
    const g2 =
      Math.abs(neutralRank - 3) < EXACT &&
      Math.abs(traceOf(spinorProjector)[0] - 2) < EXACT &&
      Math.abs(pairOverlap - 2) < EXACT &&
      Math.abs(bosonOverlap - 1) < EXACT

    // G3 the spin: every lift of SL(2, 3), acting on all three roles
    const lifts = weilLifts(3)
    const characters = lifts.map(lift => {
      const byGrid = new Map<string, Complex>()
      let normSquared = 0
      let bosonMinusOne = 0
      let loopGap = 0

      for (const e of lift.elements) {
        const r = triple(e.unitary)
        const chi = traceOf(complexMultiply(spinorProjector, r)) as Complex

        byGrid.set(e.grid.join(','), chi)
        normSquared += chi[0] * chi[0] + chi[1] * chi[1]

        if (e.grid.join(',') === '2,0,0,2') {
          bosonMinusOne = traceOf(complexMultiply(bosonProjector, r))[0]
        }

        if (gridOrder(3, e.grid) === 6) {
          const cube = complexMultiply(complexMultiply(r, r), r)

          loopGap = Math.max(loopGap, matrixDistance(complexMultiply(cube, spinorProjector), scaleMatrix(spinorProjector, [-1, 0])))
        }
      }

      return { byGrid, normSquared, bosonMinusOne, loopGap }
    })
    const reference = characters[0]?.byGrid ?? new Map<string, Complex>()
    let liftAgreement = 0

    for (const c of characters) {
      for (const [grid, chi] of c.byGrid) {
        const ref = reference.get(grid) ?? [99, 99]

        liftAgreement = Math.max(liftAgreement, Math.hypot(chi[0] - ref[0], chi[1] - ref[1]))
      }
    }

    const chiMinusOne = reference.get('2,0,0,2') ?? [0, 0]
    // which 2T character: the natural one by element order, or a twist of it by a character of order 3
    const SPIN_HALF: Record<number, number> = { 1: 2, 2: -2, 3: -1, 4: 0, 6: 1 }
    const liftZero = lifts[0]
    const natural = liftZero
      ? liftZero.elements.every(e => {
          const chi = reference.get(e.grid.join(',')) ?? [99, 99]

          return Math.abs(chi[0] - (SPIN_HALF[gridOrder(3, e.grid)] ?? 99)) < LOOSE && Math.abs(chi[1]) < LOOSE
        })
      : false
    const g3 =
      characters.length === 3 &&
      characters.every(c => Math.abs(c.normSquared - 24) < LOOSE && c.loopGap < EXACT && Math.abs(c.bosonMinusOne - 1) < EXACT) &&
      Math.abs(chiMinusOne[0] + 2) < EXACT &&
      Math.abs(chiMinusOne[1]) < EXACT &&
      liftAgreement < EXACT

    // G4 the full frame: Sigma(648) acting on all three roles
    const s = liftZero ? liftOf(liftZero, [0, 2, 1, 0]) ?? complexIdentity(3) : complexIdentity(3)
    const t = liftZero ? liftOf(liftZero, [1, 1, 0, 1]) ?? complexIdentity(3) : complexIdentity(3)
    const sigma = closeGroup([s, t, displacementMatrix(3, 1, 0), displacementMatrix(3, 0, 1)], 5000) ?? []
    const fullKnot = average(sigma.map(triple))
    const fullRank = traceOf(fullKnot)[0]
    const fullOnBoson = traceOf(complexMultiply(fullKnot, predictedBoson))[0]
    const g4 = sigma.length === 648 && Math.abs(fullRank - 1) < EXACT && Math.abs(fullOnBoson - 1) < EXACT

    // REPORTED, added after the first run (not gated): is the epsilon boson a knot in E-SPN-0051's sense, a common
    // eigenvector of every generator of Sigma(648) up to a phase, and with which phases?
    const epsilon = psi(1).map((x, i) => (x - (psi(2)[i] ?? 0)) / Math.sqrt(6))
    const knotPhases = [s, t, displacementMatrix(3, 1, 0), displacementMatrix(3, 0, 1)].map(g => {
      const r = triple(g)
      const image = { re: new Float64Array(27), im: new Float64Array(27) }

      for (let i = 0; i < 27; i++) {
        for (let j = 0; j < 27; j++) {
          image.re[i] = (image.re[i] ?? 0) + (r.re[i * 27 + j] ?? 0) * (epsilon[j] ?? 0)
          image.im[i] = (image.im[i] ?? 0) + (r.im[i * 27 + j] ?? 0) * (epsilon[j] ?? 0)
        }
      }

      // lambda = <epsilon | image>, then the residual |image - lambda epsilon|
      const lambda: Complex = [0, 0]

      for (let i = 0; i < 27; i++) {
        lambda[0] += (epsilon[i] ?? 0) * (image.re[i] ?? 0)
        lambda[1] += (epsilon[i] ?? 0) * (image.im[i] ?? 0)
      }

      let residual = 0

      for (let i = 0; i < 27; i++) {
        residual += ((image.re[i] ?? 0) - lambda[0] * (epsilon[i] ?? 0)) ** 2 + ((image.im[i] ?? 0) - lambda[1] * (epsilon[i] ?? 0)) ** 2
      }

      return { angle: Math.atan2(lambda[1], lambda[0]) / ((2 * Math.PI) / 3), residual: Math.sqrt(residual) }
    })

    // REPORTED, added after the first run (not gated): which SU(2) spin the doublet is a piece of. A spin j of
    // SU(2) restricted to 2T has a character fixed by each element's order (rotation angle 0, 2 pi, pi, 4 pi / 3,
    // 2 pi / 3 for orders 1, 2, 4, 3, 6); the multiplicity of the doublet in it is the inner product over 24.
    const spinCharacter = (twoJ: number, order: number): number => {
      const half = ({ 1: 0, 2: Math.PI, 4: Math.PI / 2, 3: (2 * Math.PI) / 3, 6: Math.PI / 3 } as Record<number, number>)[order] ?? 0

      return Math.abs(Math.sin(half)) < 1e-12 ? (twoJ + 1) * Math.cos(half) ** twoJ : Math.sin((twoJ + 1) * half) / Math.sin(half)
    }
    const spinMultiplicity = (twoJ: number): number => {
      let sum = 0

      for (const e of liftZero?.elements ?? []) {
        const chi = reference.get(e.grid.join(',')) ?? [0, 0]

        sum += chi[0] * spinCharacter(twoJ, gridOrder(3, e.grid))
      }

      return sum / 24
    }
    const inSpinHalf = spinMultiplicity(1)
    const inSpinThreeHalves = spinMultiplicity(3)
    // REPORTED, added after the second run (not gated): which neutral clusters carry the NATURAL spin one half. The
    // character of the turn g on the neutral space of (n, m) is (1/27) sum_h Tr(h g)^n conj(Tr(h g))^m, from 3 x 3
    // traces alone; its multiplicity against spin j is the inner product over the 24 turns.
    const naturalHalf = counts
      .filter(c => c.predictedRank > 0)
      .map(c => {
        let half = 0
        let threeHalves = 0

        for (const e of liftZero?.elements ?? []) {
          let chi: Complex = [0, 0]

          for (const h of group) {
            const tr = traceOf(complexMultiply(h, e.unitary)) as Complex
            const term = cmul(cpow(tr, c.n), cpow(cconj(tr), c.m))

            chi = [chi[0] + term[0] / group.length, chi[1] + term[1] / group.length]
          }

          const order = gridOrder(3, e.grid)

          half += (chi[0] * spinCharacter(1, order)) / 24
          threeHalves += (chi[0] * spinCharacter(3, order)) / 24
        }

        return { n: c.n, m: c.m, half: Math.round(half * 1e9) / 1e9 + 0, threeHalves: Math.round(threeHalves * 1e9) / 1e9 + 0 }
      })
    const orderSixValues =[...new Set((liftZero?.elements ?? []).filter(e => gridOrder(3, e.grid) === 6).map(e => {
      const chi = reference.get(e.grid.join(',')) ?? [0, 0]

      return `${chi[0].toFixed(3)}${chi[1] >= 0 ? '+' : '-'}${Math.abs(chi[1]).toFixed(3)}i`
    }))]

    // G5 the fear beat
    const swap = swapPhase(OMEGA_ANGLE) as ComplexMatrix
    const singlet = singletPhase(OMEGA_ANGLE) as ComplexMatrix
    const pairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [0, 2],
    ]
    const omega = unitPhase(1 / 3)
    let swapLeak = 0
    let swapOnPair = 0
    let swapOnBoson = 0

    for (const [i, j] of pairs) {
      const u = onPair(swap, i, j)
      const moved = complexMultiply(u, neutral)

      swapLeak = Math.max(swapLeak, matrixDistance(complexMultiply(neutral, moved), moved))
      swapOnPair = Math.max(swapOnPair, matrixDistance(complexMultiply(u, spinorProjector), spinorProjector))
      swapOnBoson = Math.max(swapOnBoson, matrixDistance(complexMultiply(u, bosonProjector), scaleMatrix(bosonProjector, omega)))
    }

    const singletMoved = complexMultiply(onPair(singlet, 0, 1), neutral)
    const singletLeak = matrixDistance(complexMultiply(neutral, singletMoved), singletMoved)
    const g5 = swapLeak < EXACT && swapOnPair < EXACT && swapOnBoson < EXACT && singletLeak > 0.1

    const ok = g1 && g2 && g3 && g4 && g5
    const row = (c: (typeof counts)[number]): string => `(${c.n}, ${c.m}) ${c.rank.toFixed(0)}/${c.spinorial.toFixed(0)}`

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `translation-neutral rank / spinorial dimension on (roles, antiroles): ${counts.filter(c => c.predictedRank > 0).map(row).join(', ')}, zero elsewhere, all as predicted (${g1}); the triple's neutral space is ${neutralRank.toFixed(0)}-dimensional, its spinorial pair the totally symmetric span(psi_0, psi_1 + psi_2) (overlap ${pairOverlap.toFixed(12)}) carrying an irreducible 2T character (norm ${characters[0]?.normSquared.toFixed(6)}, chi(-I) = ${chiMinusOne[0].toFixed(6)}, ${natural ? 'the natural spin one half' : 'a twist of the natural spin one half by an order-3 character'}, alike in all 3 lifts to ${liftAgreement.toExponential(1)}), a 120 degree turn cubed -1 on it; its multiplicity in SU(2) spin 1/2 is ${inSpinHalf.toFixed(6)} and in spin 3/2 ${inSpinThreeHalves.toFixed(6)} (order-6 values ${orderSixValues.join(', ')}); natural spin 1/2 multiplicity in the neutral space of (roles, antiroles): ${naturalHalf.map(c => `(${c.n}, ${c.m}) ${c.half}`).join(', ')}; its boson the antisymmetric psi_1 - psi_2; the states strictly invariant under the full Sigma(${sigma.length}) have rank ${fullRank.toFixed(6)} (G4 predicted 1, and fails), while the boson is a common eigenvector of its generators up to phase (residual ${Math.max(...knotPhases.map(k => k.residual)).toExponential(1)}); the swap phase keeps the neutral space on all 3 pairs (leak ${swapLeak.toExponential(1)}) and is exactly 1 on the doublet (gap ${swapOnPair.toExponential(1)}) and omega on the boson (gap ${swapOnBoson.toExponential(1)}), while the singlet phase leaks ${singletLeak.toFixed(3)}`,
      metrics: {
        ...Object.fromEntries(counts.flatMap(c => [[`rank_${c.n}_${c.m}`, Number(c.rank.toFixed(9))], [`spinorial_${c.n}_${c.m}`, Number(c.spinorial.toFixed(9))]])),
        tripleNeutralRank: neutralRank,
        tripleSpinorialOverlapWithSymmetricPair: pairOverlap,
        tripleBosonOverlapWithEpsilon: bosonOverlap,
        doubletCharacterNormSquared: characters[0]?.normSquared ?? -1,
        doubletCharacterAtMinusOne: chiMinusOne[0],
        doubletIsNaturalSpinHalf: natural ? 1 : 0,
        liftCharacterAgreement: liftAgreement,
        doubletLoopGap: Math.max(...characters.map(c => c.loopGap)),
        bosonAtMinusOne: characters[0]?.bosonMinusOne ?? 0,
        fullFrameKnotRank: fullRank,
        fullFrameKnotOnBoson: fullOnBoson,
        swapPhaseLeak: swapLeak,
        swapPhaseOnDoubletGap: swapOnPair,
        swapPhaseOnBosonGap: swapOnBoson,
        doubletInSpinOneHalf: Number(inSpinHalf.toFixed(9)),
        doubletInSpinThreeHalves: Number(inSpinThreeHalves.toFixed(9)),
        ...Object.fromEntries(naturalHalf.flatMap(c => [[`spinHalfIn_${c.n}_${c.m}`, c.half], [`spinThreeHalvesIn_${c.n}_${c.m}`, c.threeHalves]])),
        epsilonKnotResidualMax:Math.max(...knotPhases.map(k => k.residual)),
        ...Object.fromEntries(knotPhases.map((k, i) => [`epsilonPhaseInThirds_${['S', 'T', 'X', 'Z'][i]}`, Number(k.angle.toFixed(9)) + 0])),
      },
      control: {
        singletPhaseLeak: singletLeak,
        fullFrameGroupOrder: sigma.length,
      },
      notes:
        'L1, exact. A STAND-IN for the charge: three loves give love - fear = 3, Q = 1, by the E-FRC-0170 algebra, and nothing here derives that the three loves are the ones that meet. FIRST RUN, DISCLOSED: G1, G2, G3 and G5 held exactly as predicted; G4 failed because the prediction was wrong, not the algebra: averaging over all of Sigma(648) (strict invariance) leaves rank 0, since the epsilon boson carries a nontrivial one-dimensional character of the group, and E-SPN-0051\'s knot is invariance UP TO A PHASE. The reported epsilon-phase metrics, added after the run, confirm the boson is that knot. The spin 1/2 and spin 3/2 multiplicities were also added after the run, when the doublet\'s character came out twisted by an order-3 character; the title changed from "spin one half doublet" to "a piece of spin 3/2" for that reason. Gates not moved; status is fail on G4. What the file settles is the fork E-SPN-0051 left: if color is the translation frame and spin is the turn, the role alone forces the quark-model statistics (a role and an antirole: one neutral state, a boson; three roles: a spinorial doublet and a boson), with no spin put in anywhere. But the doublet is NOT spin one half. Its character is independent of the lift (the lifts differ by an order-3 character, which cubes away) and twisted, taking a cube root of unity on the order-6 turns where spin 1/2 takes 1. No automorphism of 2T carries a twisted doublet to the natural one (the natural one is the only faithful doublet with a rational character), so under any identification of the role grid\'s SL(2, 3) with the husk\'s 2T it sits inside spin 3/2 (which restricts to the two twisted doublets) and outside spin 1/2. That is exactly the quark model\'s lesson for three identical quarks: with color antisymmetric the rest is symmetric, and uuu exists only as the spin 3/2 Delta. The role algebra does not see the vibes, so this holds for EVERY translation-neutral triple of roles, three loves or not: no triple of roles is a spin one half in this reading. The natural spin one half multiplicities (reported, added after the second run) say where it first appears: 0 in (1, 1), (3, 0) and (2, 2), and 2 doublets in (4, 1). Reading a love as a role and a fear as an antirole (the singlet phase fixes Phi = sum |j j>, which is invariant under M (x) conj M, so a fear\'s role turns conjugate), neutrality n = m mod 3 is exactly the integer-charge lock Q = (love - fear) / 3 of E-FRC-0170, now forced by the Heisenberg center rather than imposed, and the smallest charged cluster that holds a natural spin one half is four loves and one fear: Q = 1, five members. That is a prediction about the electron\'s content in this reading, not an electron: it is an internal-space count, and five vibes binding into one travelling object is further from anything measured than three. The doublet is totally symmetric in the three roles, which is why the like-vibe fear beat cannot touch it: the swap phase is 1 on symmetric pairs. So inside the triple the doublet makes and spends no magic, while the antisymmetric boson takes omega at every meeting. What is missing is everything dynamical: the triple does not travel as one object on the committed knit, the triality weave or the aligned weave (E-FRC-0171, E-SPN-0052), so Gauss\'s law around it, its stability, its dispersion and its g cannot be measured on it. And the fork has a cost: the committed knit\'s links draw from all 216 grid moves, which gauges the turns too and leaves only the boson; the translation-only reading is the relational link of E-FRC-0174, where the turns are not link data.',
    })
  },
})
